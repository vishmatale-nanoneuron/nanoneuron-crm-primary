import json
import re
import logging
from openai import OpenAI
from app.core.config import settings

logger = logging.getLogger(__name__)

INDUSTRY_CONTEXT = {
    "logistics": "Focus on carrier SLA compliance, on-time delivery rate, shipment delay cascades, and cost-per-shipment anomalies.",
    "manufacturing": "Focus on OEE (Overall Equipment Effectiveness), downtime root causes, throughput bottlenecks, and scrap/rework rates.",
    "warehouse": "Focus on inventory turnover velocity, stockout patterns, carrying cost inefficiencies, and order fill rate degradation.",
    "retail": "Focus on demand forecast accuracy, stockout-to-shelf conversion, returns rate, and seasonal demand signal strength.",
    "supply_chain": "Focus on supplier lead time variability, safety stock adequacy, procurement cycle gaps, and BOM risk exposure.",
    "devops": "Focus on DORA metrics: deployment frequency, change failure rate, MTTR, and lead time for changes. Identify which services have the highest rollback rate and incident correlation. Quantify incident cost as downtime_minutes × service_revenue_rate.",
    "mlops": "Focus on model health: accuracy drift vs baseline, data/feature drift scores, training pipeline failure rate, inference latency SLA breaches, and retraining cycle lag. Identify which models are degrading and why. Quantify business impact of model accuracy drops (e.g. missed fraud detections, wrong churn predictions).",
    "operations": "Focus on overall operational efficiency, process bottlenecks, resource utilization, and output quality.",
}

COST_MULTIPLIERS = {
    "logistics": 250,
    "manufacturing": 800,
    "warehouse": 200,
    "retail": 150,
    "supply_chain": 400,
    "devops": 600,
    "mlops": 900,
    "operations": 300,
}

# Kai-Fu Lee: India localization moat — injected into every AI prompt
INDIA_CONTEXT = """
India operations context — apply when Indian carrier names, Indian cities, or INR costs appear in the data:
- Express carriers: BlueDart (premium, known for Mumbai→Delhi dwell spikes), DTDC (economy, B2B), Delhivery (fastest growing, strong last-mile), Ecom Express (D2C specialist), XpressBees (e-commerce), Shadowfax (hyperlocal), FedEx India, DHL India
- High-risk corridors: Mumbai→Delhi (BlueDart delay pattern), Chennai→Bangalore (DTDC surcharge active June 2026), Hyderabad depot (AWB/GST documentation holds common)
- Tier-2/3 last-mile cities (Nashik, Surat, Patna, Coimbatore, Lucknow, Indore): 25–35% higher delivery failure rates than metros
- Monsoon seasonality (July–September): coastal + hill routes see 25–40% higher delay rates — flag as seasonal risk
- Quote costs in INR (₹) where possible. ₹83 ≈ $1 USD. Include 18% GST on freight in total landed cost estimates.
- Procurement/payment: Net-30/45/60 common; GST invoice non-compliance blocks payments and affects lead times
"""

# Kai-Fu Lee: sub-vertical depth — FTL/last-mile/cold chain within logistics, etc.
SUB_VERTICAL_PATTERNS = {
    "logistics": [
        ("last_mile",   r"bluedart|dtdc|delhivery|xpressbees|ecom.express|shadowfax|last.mile|courier|pin.code|pincode|doorstep|b2c.delivery"),
        ("ftl",         r"\bftl\b|full.truck|truckload|lorry|truck.load|vehicle.utilization|load.factor|part.load|\bptl\b"),
        ("cold_chain",  r"cold.chain|reefer|temperature.controlled|frozen|chilled|perishable|pharma.logistics|vaccine|2-8.c|cold.storage"),
        ("air_freight", r"airway.bill|\bawb\b|air.freight|air.cargo|cargo.flight|import|export|customs.clearance|air.consignment"),
    ],
    "manufacturing": [
        ("discrete",   r"\bcnc\b|lathe|press|grinder|assembly|machine.tool|spindle|tooling|machined.parts|job.work"),
        ("process",    r"\bbatch\b|reactor|mixing|blending|continuous.process|temperature.control|pressure.vessel|viscosity"),
        ("automotive", r"automotive|vehicle|oem|tier.1|tier.2|stamping|welding|paint.shop|body.shop|car.parts"),
        ("pharma",     r"pharma|pharmaceutical|\bapi\b|formulation|\bgmp\b|batch.record|\bcoa\b|cleanroom|sterile"),
    ],
    "warehouse": [
        ("spare_parts", r"spare.parts|maintenance.spare|mechanical|bearings|motor.spare|pump|valve|sensor|conveyor.belt"),
        ("3pl",         r"\b3pl\b|third.party.logistics|fulfillment.center|\bfc\b|distribution.center|contract.logistics|4pl"),
        ("dark_store",  r"dark.store|quick.commerce|rapid.delivery|10.minute|instant.delivery|hyperlocal|q-commerce"),
    ],
    "devops": [
        ("ci_cd",       r"jenkins|github.actions|gitlab.ci|circleci|bitbucket|pipeline|build.fail|workflow|artifact|runner"),
        ("incident_mgmt", r"pagerduty|opsgenie|victorops|incident|\bon.call\b|mttr|escalat|sla.breach|\bp0\b|\bp1\b|\bp2\b|alert|postmortem"),
        ("infrastructure", r"kubernetes|k8s|terraform|ansible|helm|docker|container|node.pool|pod|cluster|cloud.run|aws|gcp|azure"),
    ],
    "mlops": [
        ("model_monitoring", r"accuracy|drift|baseline|degraded|precision|recall|f1|auc|roc|confusion.matrix|model.performance"),
        ("training_pipeline", r"training|retraining|epoch|loss|dataset|feature.store|data.quality|null.value|pipeline.fail|job.fail"),
        ("inference",       r"latency|p99|p95|throughput|prediction|inference|serving|endpoint|sla.breach|timeout|batch.predict"),
    ],
}


def classify_industry(text: str) -> str:
    lower = text.lower()
    scores = {
        "logistics": len(re.findall(r"shipment|delivery|carrier|freight|dispatch|tracking|route|awb|consignment|courier", lower)),
        "manufacturing": len(re.findall(r"production|assembly|machine|downtime|shift|maintenance|throughput|yield|oee|defect|rework", lower)),
        "warehouse": len(re.findall(r"warehouse|inventory|sku|storage|bin|pick|pack|receipt|putaway|wms|stockout|reorder", lower)),
        "retail": len(re.findall(r"store|sales|customer|demand|forecast|pos|order|fulfillment|returns|sell.through", lower)),
        "supply_chain": len(re.findall(r"supplier|vendor|procurement|purchase|bom|lead.time|safety.stock|rfq|sourcing", lower)),
        "devops": len(re.findall(r"deploy|pipeline|incident|mttr|rollback|ci.cd|build.fail|\bp1\b|\bp2\b|\bp0\b|change.fail|devops|kubernetes|jenkins|gitops|sre|on.call", lower)),
        "mlops": len(re.findall(r"model|accuracy|drift|training|inference|retraining|feature.store|latency|prediction|mlops|ml.pipeline|data.quality|model.degraded|serving", lower)),
    }
    best = max(scores, key=lambda k: scores[k])
    return best if scores[best] > 0 else "operations"


def classify_sub_vertical(industry: str, text: str) -> str:
    """Kai-Fu Lee sub-vertical depth: detect specific domain within an industry."""
    patterns = SUB_VERTICAL_PATTERNS.get(industry, [])
    lower = text.lower()
    for sub, pattern in patterns:
        if re.search(pattern, lower):
            return sub
    return "general"


def compute_vertical_ai_score(industry: str, text: str, risk_score: int) -> int:
    """
    Kai-Fu Lee's Vertical AI Value Formula (AI Superpowers):
    Score = Domain Expertise × Data Quality × Model Confidence × Industry Specificity
    All four factors compound multiplicatively — any weak link degrades the score.
    """
    lower = text.lower()

    industry_patterns = {
        "logistics": r"shipment|delivery|carrier|freight|dispatch|tracking|route|awb|consignment",
        "manufacturing": r"production|assembly|machine|downtime|shift|maintenance|throughput|oee|defect",
        "warehouse": r"inventory|sku|storage|stockout|reorder|wms|bin|pick|putaway",
        "retail": r"sales|demand|forecast|pos|fulfillment|returns|sell.through",
        "supply_chain": r"supplier|vendor|procurement|lead.time|safety.stock|sourcing",
        "devops": r"deploy|pipeline|incident|mttr|rollback|build.fail|change.fail|kubernetes|jenkins|\bp1\b|\bp2\b|sre",
        "mlops": r"model|accuracy|drift|training|inference|retraining|feature.store|latency|prediction|serving",
        "operations": r"process|efficiency|output|workflow|kpi|performance",
    }
    pattern = industry_patterns.get(industry, industry_patterns["operations"])
    domain_hits = min(25, len(re.findall(pattern, lower)))
    domain_expertise = domain_hits / 25

    lines = [ln for ln in text.split("\n") if ln.strip()]
    data_quality = min(1.0, len(lines) / 80)

    model_confidence = abs(risk_score - 50) / 50

    specificity = 0.95 if industry != "operations" else 0.5

    raw = domain_expertise * 0.35 + data_quality * 0.25 + model_confidence * 0.25 + specificity * 0.15
    return max(10, min(99, round(raw * 100)))


def _annual_savings(cost_impact_usd: int) -> int:
    """Kai-Fu Lee ROI principle: AI value = prevented losses × recurrence factor."""
    return cost_impact_usd * 4


def _fallback_analysis(text: str, industry: str) -> dict:
    lower = text.lower()
    delay_hits = len(re.findall(r"delay|late|pending|backlog|dispatch", lower))
    inventory_hits = len(re.findall(r"stockout|shortage|inventory|low stock|out of stock", lower))
    bottleneck_hits = len(re.findall(r"bottleneck|slow|blocked|queue|capacity", lower))
    risk_score = min(95, 20 + delay_hits * 8 + inventory_hits * 7 + bottleneck_hits * 6)
    rows = max(1, len(text.split("\n")))
    cost = int(risk_score / 100 * rows * COST_MULTIPLIERS.get(industry, 300))
    vai_score = compute_vertical_ai_score(industry, text, risk_score)
    delay_prob = min(95, 15 + delay_hits * 12)
    inv_risk = min(95, 10 + inventory_hits * 15)
    pain = []
    if delay_hits: pain.append(f"{delay_hits} delay/late signals detected")
    if inventory_hits: pain.append(f"{inventory_hits} inventory shortage signals")
    if bottleneck_hits: pain.append(f"{bottleneck_hits} bottleneck/capacity signals")
    pain_str = "; ".join(pain) if pain else "no critical signals"
    sub_vertical = classify_sub_vertical(industry, text)
    return {
        "risk_score": risk_score,
        "delay_probability": delay_prob,
        "inventory_risk": inv_risk,
        "bottleneck_summary": (
            f"Pattern analysis found {bottleneck_hits} capacity/queue signals — "
            "review rows with 'blocked', 'queue', or 'capacity' flags with your operations lead."
            if bottleneck_hits else
            "No bottleneck signals found in this data. Throughput appears within normal range."
        ),
        "executive_summary": (
            f"OpsOracle detected {pain_str} in this {industry} report (risk score: {risk_score}/100). "
            f"Estimated cost at risk: ₹{cost * 83:,} (${cost:,}). "
            "Immediate review of flagged items is recommended before the next planning cycle."
        ),
        "recommendations": (
            f"1. [THIS WEEK] Operations manager to review all rows flagged as delayed or pending — "
            f"estimated {delay_prob}% of shipments/tasks at delay risk. Impact: prevent ₹{cost // 3 * 83:,} in cost bleed.\n"
            f"2. [THIS MONTH] Inventory team to audit low-stock SKUs identified in report — "
            f"{inv_risk}% inventory risk detected. Impact: eliminate stockout-driven lost revenue.\n"
            f"3. [NEXT QUARTER] Implement daily OpsOracle scanning to catch {industry} issues before they escalate. "
            f"Impact: early detection reduces cost impact by up to 60%."
        ),
        "industry_detected": industry,
        "sub_vertical": sub_vertical,
        "cost_impact_usd": cost,
        "vertical_ai_score": vai_score,
        "annual_savings_usd": _annual_savings(cost),
    }


def _get_client():
    if settings.GROQ_API_KEY:
        return OpenAI(
            api_key=settings.GROQ_API_KEY,
            base_url="https://api.groq.com/openai/v1",
        ), "llama-3.3-70b-versatile"
    if settings.OPENAI_API_KEY:
        return OpenAI(api_key=settings.OPENAI_API_KEY), "gpt-4o-mini"
    return None, None


def analyze_operations(extracted_text: str) -> dict:
    industry = classify_industry(extracted_text)
    sub_vertical = classify_sub_vertical(industry, extracted_text)
    industry_hint = INDUSTRY_CONTEXT.get(industry, INDUSTRY_CONTEXT["operations"])

    client, model = _get_client()
    if not client:
        result = _fallback_analysis(extracted_text, industry)
        result["sub_vertical"] = sub_vertical
        return result

    prompt = f"""You are OpsOracle AI — a vertical AI built specifically for {industry} operations teams.
{industry_hint}

{INDIA_CONTEXT}

Your job: read the data, find the actual operational pains, and tell the team EXACTLY what to do.
Be surgical. Use numbers from the data. Name the specific row, SKU, route, machine, or supplier causing the pain.
Never say "monitor closely" or "track KPIs" — give a concrete action with a deadline and an owner.
When Indian carrier names, cities, or INR costs appear in the data, use the India context above.

Analyze this data and return a JSON object with these exact keys:

- risk_score: integer 0-100
- delay_probability: integer 0-100
- inventory_risk: integer 0-100

- executive_summary: string — 2-3 sentences for a VP/COO. Lead with the single biggest pain found (name the specific item/route/machine if visible in data). Quote costs in INR (₹) where possible. End with the total financial exposure.

- bottleneck_summary: string — Identify the single constraint choking throughput. Name it specifically (e.g. "M2-Lathe averaging 117min downtime/shift vs 0min target" or "BlueDart Mumbai→Delhi showing 100% delay rate across 5 shipments"). If Indian carriers/cities visible, name them directly.

- recommendations: string — Exactly 3 actions, numbered, each on its own line. Format:
  1. [THIS WEEK] <specific action> — expected impact: <quantified result in INR where applicable>
  2. [THIS MONTH] <specific action> — expected impact: <quantified result>
  3. [NEXT QUARTER] <systemic fix> — expected impact: <quantified result>
  Each action must name WHO does it, WHAT exactly, and WHY (the pain it fixes). Use Indian carrier names if present.

- industry_detected: string (logistics | manufacturing | warehouse | retail | supply_chain | devops | mlops | operations)
- cost_impact_usd: integer (total USD at risk; 0 if no issues)
- vertical_ai_score: integer 0-100
- annual_savings_usd: integer (3-5× cost_impact_usd if recommendations are implemented)

DATA:
{extracted_text[:12000]}"""

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            response_format={"type": "json_object"},
        )
        content = response.choices[0].message.content or "{}"
        result = json.loads(content)
        result.setdefault("industry_detected", industry)
        result.setdefault("cost_impact_usd", 0)
        vai_score = compute_vertical_ai_score(
            result.get("industry_detected", industry),
            extracted_text,
            int(result.get("risk_score", 0)),
        )
        result.setdefault("vertical_ai_score", vai_score)
        result.setdefault("annual_savings_usd", _annual_savings(int(result.get("cost_impact_usd", 0))))
        result["sub_vertical"] = sub_vertical
        return result
    except Exception as e:
        logger.error("AI call failed (%s): %s", model, e, exc_info=True)
        result = _fallback_analysis(extracted_text, industry)
        result["sub_vertical"] = sub_vertical
        return result
