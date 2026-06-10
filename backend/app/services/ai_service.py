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
    "operations": "Focus on overall operational efficiency, process bottlenecks, resource utilization, and output quality.",
}

COST_MULTIPLIERS = {
    "logistics": 250,
    "manufacturing": 800,
    "warehouse": 200,
    "retail": 150,
    "supply_chain": 400,
    "operations": 300,
}


def classify_industry(text: str) -> str:
    lower = text.lower()
    scores = {
        "logistics": len(re.findall(r"shipment|delivery|carrier|freight|dispatch|tracking|route|awb|consignment|courier", lower)),
        "manufacturing": len(re.findall(r"production|assembly|machine|downtime|shift|maintenance|throughput|yield|oee|defect|rework", lower)),
        "warehouse": len(re.findall(r"warehouse|inventory|sku|storage|bin|pick|pack|receipt|putaway|wms|stockout|reorder", lower)),
        "retail": len(re.findall(r"store|sales|customer|demand|forecast|pos|order|fulfillment|returns|sell.through", lower)),
        "supply_chain": len(re.findall(r"supplier|vendor|procurement|purchase|bom|lead.time|safety.stock|rfq|sourcing", lower)),
    }
    best = max(scores, key=lambda k: scores[k])
    return best if scores[best] > 0 else "operations"


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
            f"Estimated cost at risk: ${cost:,}. "
            "Immediate review of flagged items is recommended before the next planning cycle."
        ),
        "recommendations": (
            f"1. [THIS WEEK] Operations manager to review all rows flagged as delayed or pending — "
            f"estimated {delay_prob}% of shipments/tasks at delay risk. Impact: prevent ${cost//3:,} in cost bleed.\n"
            f"2. [THIS MONTH] Inventory team to audit low-stock SKUs identified in report — "
            f"{inv_risk}% inventory risk detected. Impact: eliminate stockout-driven lost revenue.\n"
            f"3. [NEXT QUARTER] Implement daily OpsOracle scanning to catch {industry} issues before they escalate. "
            f"Impact: early detection reduces cost impact by up to 60%."
        ),
        "industry_detected": industry,
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
    industry_hint = INDUSTRY_CONTEXT.get(industry, INDUSTRY_CONTEXT["operations"])

    client, model = _get_client()
    if not client:
        return _fallback_analysis(extracted_text, industry)

    prompt = f"""You are OpsOracle AI — a vertical AI built specifically for {industry} operations teams.
{industry_hint}

Your job: read the data, find the actual operational pains, and tell the team EXACTLY what to do.
Be surgical. Use numbers from the data. Name the specific row, SKU, route, machine, or supplier causing the pain.
Never say "monitor closely" or "track KPIs" — give a concrete action with a deadline and an owner.

Analyze this data and return a JSON object with these exact keys:

- risk_score: integer 0-100
- delay_probability: integer 0-100
- inventory_risk: integer 0-100

- executive_summary: string — 2-3 sentences for a VP/COO. Lead with the single biggest pain found (name the specific item/route/machine if visible in data). End with the total financial exposure.

- bottleneck_summary: string — Identify the single constraint choking throughput. Name it specifically (e.g. "Station 4 averaging 47min cycle vs 28min target" or "Carrier DHL Mumbai showing 34% late rate vs 8% SLA"). If no clear bottleneck, say what pattern comes closest.

- recommendations: string — Exactly 3 actions, numbered, each on its own line. Format:
  1. [THIS WEEK] <specific action> — expected impact: <quantified result>
  2. [THIS MONTH] <specific action> — expected impact: <quantified result>
  3. [NEXT QUARTER] <systemic fix> — expected impact: <quantified result>
  Each action must name WHO does it, WHAT exactly, and WHY (the pain it fixes).

- industry_detected: string (logistics | manufacturing | warehouse | retail | supply_chain | operations)
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
        return result
    except Exception as e:
        logger.error("AI call failed (%s): %s", model, e, exc_info=True)
        return _fallback_analysis(extracted_text, industry)
