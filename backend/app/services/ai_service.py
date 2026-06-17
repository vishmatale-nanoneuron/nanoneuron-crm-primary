"""
OpsOracle AI — vertical analysis engine.
Design principles: evidence-first, honest confidence, never fabricate.
LLM: Claude claude-sonnet-4-6 (sole AI engine). Regex fallback when key absent.
"""
import json
import re
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

INDUSTRY_CONTEXT = {
    "logistics": "Focus on carrier SLA compliance, on-time delivery rate, shipment delay cascades, and cost-per-shipment anomalies.",
    "manufacturing": "Focus on OEE (Overall Equipment Effectiveness), downtime root causes, throughput bottlenecks, and scrap/rework rates.",
    "warehouse": "Focus on inventory turnover velocity, stockout patterns, carrying cost inefficiencies, and order fill rate degradation.",
    "retail": "Focus on demand forecast accuracy, stockout-to-shelf conversion, returns rate, and seasonal demand signal strength.",
    "supply_chain": "Focus on supplier lead time variability, safety stock adequacy, procurement cycle gaps, and BOM risk exposure.",
    "devops": "Focus on DORA metrics: deployment frequency, change failure rate, MTTR, and lead time for changes.",
    "mlops": "Focus on model health: accuracy drift vs baseline, data/feature drift scores, training pipeline failure rate, inference latency SLA breaches.",
    "operations": "Focus on overall operational efficiency, process bottlenecks, resource utilization, and output quality.",
}

INDUSTRY_KPI_DEFINITIONS = {
    "logistics": {
        "otif_pct": "On-Time In-Full %",
        "delay_rate_pct": "Delay Rate %",
        "avg_delay_days": "Avg Delay Days",
        "carrier_failure_rate_pct": "Worst Carrier Failure Rate %",
    },
    "manufacturing": {
        "oee_pct": "Overall Equipment Effectiveness %",
        "downtime_pct": "Downtime %",
        "defect_rate_pct": "Defect Rate %",
        "machine_availability_pct": "Machine Availability %",
    },
    "warehouse": {
        "stockout_rate_pct": "Stockout Rate %",
        "fill_rate_pct": "Fill Rate %",
        "critical_items_pct": "Critical Stock Items %",
        "avg_days_of_supply": "Avg Days of Supply",
    },
    "retail": {
        "sell_through_pct": "Sell-Through Rate %",
        "stockout_pct": "Lines Stocked Out %",
        "return_rate_pct": "Return Rate %",
        "avg_days_until_stockout": "Avg Days Until Stockout",
    },
    "supply_chain": {
        "otd_pct": "Supplier On-Time Delivery %",
        "critical_supplier_pct": "Critical Risk Suppliers %",
        "avg_lead_variance_pct": "Lead Time Variance %",
        "high_risk_pct": "High+Critical Risk Suppliers %",
    },
    "devops": {
        "deploy_success_rate_pct": "Deploy Success Rate %",
        "mttr_mins": "Mean Time to Recovery (mins)",
        "change_failure_rate_pct": "Change Failure Rate %",
        "p1_incident_rate": "P1 Incidents per 10 Deploys",
    },
    "mlops": {
        "avg_model_accuracy_pct": "Avg Model Accuracy %",
        "p99_latency_ms": "P99 Latency (ms)",
        "avg_data_drift_score": "Avg Data Drift Score",
        "retraining_rate_pct": "Models Needing Retraining %",
    },
    "operations": {
        "on_time_rate_pct": "On-Time Rate %",
        "failure_rate_pct": "Failure Rate %",
        "issue_density": "Issues per 10 Records",
    },
}

INDUSTRY_KPI_PROMPT = {
    "logistics": (
        '{"otif_pct": <pct shipments with Actual Date <= Scheduled Date or Status=Delivered>, '
        '"delay_rate_pct": <pct rows where Status=Delayed>, '
        '"avg_delay_days": <mean(Actual Date - Scheduled Date) for delayed rows, float>, '
        '"carrier_failure_rate_pct": <pct failures for the worst-performing carrier>}'
    ),
    "manufacturing": (
        '{"oee_pct": <Actual Output / Planned Output × 100 avg across all rows>, '
        '"downtime_pct": <sum(Downtime_mins) / (total rows × 480 mins per shift) × 100>, '
        '"defect_rate_pct": <sum(Defects) / sum(Actual Output) × 100>, '
        '"machine_availability_pct": <pct rows where Downtime_mins < 30>}'
    ),
    "warehouse": (
        '{"stockout_rate_pct": <pct SKUs where Current_Stock = 0>, '
        '"fill_rate_pct": <pct SKUs where Current_Stock > Reorder_Point>, '
        '"critical_items_pct": <pct SKUs where Current_Stock <= Reorder_Point>, '
        '"avg_days_of_supply": <mean(Current_Stock / Daily_Demand) where Daily_Demand > 0>}'
    ),
    "retail": (
        '{"sell_through_pct": <mean Sell_Through_Pct across all rows>, '
        '"stockout_pct": <pct rows where Days_Until_Stockout = 0>, '
        '"return_rate_pct": <mean(Returns / Weekly_Sales) × 100 where Weekly_Sales > 0>, '
        '"avg_days_until_stockout": <mean Days_Until_Stockout across all rows>}'
    ),
    "supply_chain": (
        '{"otd_pct": <mean OTD_Pct across all suppliers>, '
        '"critical_supplier_pct": <pct suppliers where Risk = CRITICAL>, '
        '"avg_lead_variance_pct": <mean |Lead_Time_Days - Promised_Lead_Days| / Promised_Lead_Days × 100>, '
        '"high_risk_pct": <pct suppliers where Risk in [HIGH, CRITICAL]>}'
    ),
    "devops": (
        '{"deploy_success_rate_pct": <pct deploy rows where Status = SUCCESS>, '
        '"mttr_mins": <mean MTTR_Mins for incident rows where MTTR_Mins > 0>, '
        '"change_failure_rate_pct": <pct of deploys that have a corresponding incident>, '
        '"p1_incident_rate": <count P1 incidents / count deploys × 10>}'
    ),
    "mlops": (
        '{"avg_model_accuracy_pct": <mean Accuracy_Pct for HEALTHY/SUCCESS rows>, '
        '"p99_latency_ms": <max Latency_P99_Ms across rows with status not FAILED>, '
        '"avg_data_drift_score": <mean Data_Drift_Score across all rows>, '
        '"retraining_rate_pct": <pct rows where Retraining_Required = YES>}'
    ),
    "operations": (
        '{"on_time_rate_pct": <% records without delay/fail signals>, '
        '"failure_rate_pct": <% records with failure/error signals>, '
        '"issue_density": <count issues / count records × 10>}'
    ),
}

COST_MULTIPLIERS = {
    "logistics": 250, "manufacturing": 800, "warehouse": 200,
    "retail": 150, "supply_chain": 400, "devops": 600, "mlops": 900, "operations": 300,
}

ANNUAL_SAVINGS_MULTIPLIERS = {
    "logistics": 3.2, "manufacturing": 4.8, "warehouse": 2.8,
    "retail": 3.5, "supply_chain": 4.2, "devops": 5.5, "mlops": 6.5, "operations": 3.0,
}

INDIA_CONTEXT = """
India operations context — apply when Indian carrier names, cities, or INR costs appear:
- Carriers: BlueDart (premium, Mumbai→Delhi dwell spikes), DTDC (economy), Delhivery (fast last-mile), Ecom Express (D2C), XpressBees, Shadowfax (hyperlocal), FedEx India, DHL India
- High-risk corridors: Mumbai→Delhi (BlueDart delay pattern), Chennai→Bangalore (DTDC surcharge), Hyderabad (AWB/GST holds common)
- Tier-2/3 cities (Nashik, Surat, Patna, Coimbatore, Lucknow, Indore): 25-35% higher failure rates
- Monsoon (July–September): coastal/hill routes 25–40% higher delays — flag as seasonal risk
- Quote in INR (₹) where possible. ₹83 ≈ $1. Include 18% GST on freight in landed cost estimates.
"""

SUB_VERTICAL_PATTERNS = {
    "logistics": [
        ("last_mile",   r"bluedart|dtdc|delhivery|xpressbees|ecom.express|shadowfax|last.mile|courier|pin.code|pincode"),
        ("ftl",         r"\bftl\b|full.truck|truckload|lorry|truck.load|vehicle.utilization|part.load|\bptl\b"),
        ("cold_chain",  r"cold.chain|reefer|temperature.controlled|frozen|chilled|perishable|pharma.logistics|vaccine"),
        ("air_freight", r"airway.bill|\bawb\b|air.freight|air.cargo|customs.clearance"),
    ],
    "manufacturing": [
        ("discrete",   r"\bcnc\b|lathe|press|grinder|assembly|machine.tool|spindle|tooling|machined.parts"),
        ("process",    r"\bbatch\b|reactor|mixing|blending|continuous.process|temperature.control|viscosity"),
        ("automotive", r"automotive|vehicle|oem|tier.1|tier.2|stamping|welding|paint.shop"),
        ("pharma",     r"pharma|pharmaceutical|\bgmp\b|batch.record|\bcoa\b|cleanroom|sterile"),
    ],
    "warehouse": [
        ("spare_parts", r"spare.parts|maintenance.spare|mechanical|bearings|motor.spare|pump|valve|sensor|conveyor.belt"),
        ("3pl",         r"\b3pl\b|third.party.logistics|fulfillment.center|\bfc\b|distribution.center"),
        ("dark_store",  r"dark.store|quick.commerce|rapid.delivery|10.minute|instant.delivery|hyperlocal"),
    ],
    "devops": [
        ("ci_cd",          r"jenkins|github.actions|gitlab.ci|circleci|pipeline|build.fail|workflow|runner"),
        ("incident_mgmt",  r"pagerduty|opsgenie|incident|\bon.call\b|mttr|escalat|\bp0\b|\bp1\b|\bp2\b|postmortem"),
        ("infrastructure", r"kubernetes|k8s|terraform|ansible|helm|docker|container|cloud.run|aws|gcp|azure"),
    ],
    "mlops": [
        ("model_monitoring",  r"accuracy|drift|baseline|degraded|precision|recall|f1|auc|confusion.matrix"),
        ("training_pipeline", r"training|retraining|epoch|loss|dataset|feature.store|data.quality|null.value|pipeline.fail"),
        ("inference",         r"latency|p99|p95|throughput|prediction|inference|serving|endpoint|sla.breach|timeout"),
    ],
}

_CRITICAL_ROW_RE = re.compile(
    r"delay|fail|broken|late|error|stockout|incident|drift|overdue|critical|breach|backlog|downtime|rejected|return",
    re.IGNORECASE,
)


def classify_industry(text: str) -> str:
    lower = text.lower()
    scores = {
        "logistics":     len(re.findall(r"shipment|delivery|carrier|freight|dispatch|tracking|route|awb|consignment|courier", lower)),
        "manufacturing": len(re.findall(r"production|assembly|machine|downtime|shift|maintenance|throughput|yield|oee|defect|rework", lower)),
        "warehouse":     len(re.findall(r"warehouse|inventory|sku|storage|bin|pick|pack|receipt|putaway|wms|stockout|reorder", lower)),
        "retail":        len(re.findall(r"store|sales|customer|demand|forecast|pos|order|fulfillment|returns|sell.through", lower)),
        "supply_chain":  len(re.findall(r"supplier|vendor|procurement|purchase|bom|lead.time|safety.stock|rfq|sourcing", lower)),
        "devops":        len(re.findall(r"deploy|pipeline|incident|mttr|rollback|ci.cd|build.fail|\bp1\b|\bp2\b|\bp0\b|devops|kubernetes|jenkins|sre", lower)),
        "mlops":         len(re.findall(r"model|accuracy|drift|training|inference|retraining|feature.store|latency|prediction|mlops|data.quality", lower)),
    }
    best = max(scores, key=lambda k: scores[k])
    return best if scores[best] > 0 else "operations"


def classify_sub_vertical(industry: str, text: str) -> str:
    lower = text.lower()
    for sub, pattern in SUB_VERTICAL_PATTERNS.get(industry, []):
        if re.search(pattern, lower):
            return sub
    return "general"


def _assess_data_quality(text: str, industry: str) -> str:
    """Real confidence: based on actual data quantity and domain signal strength."""
    lines = [l for l in text.strip().split("\n") if l.strip()]
    data_rows = max(0, len(lines) - 1)
    lower = text.lower()
    signal_count = len(re.findall(
        r"delay|fail|broken|stockout|incident|drift|error|late|pending|overdue|critical|breach|backlog|downtime",
        lower
    ))
    if data_rows < 3:
        return "insufficient_data"
    if data_rows >= 20 and signal_count >= 5:
        return "high"
    if data_rows >= 8 and signal_count >= 2:
        return "medium"
    return "low"


def _fallback_annual_savings(industry: str, cost_impact_usd: int) -> int:
    return int(cost_impact_usd * ANNUAL_SAVINGS_MULTIPLIERS.get(industry, 3.0))


def _smart_sample(text: str) -> str:
    """For files > 30 data rows: keep first 5 rows (baseline) + top 15 critical rows by keyword score.
    Pure regex — no LLM call needed."""
    lines = text.strip().split("\n")
    if len(lines) - 1 <= 30:
        return text
    header = lines[0]
    data_lines = lines[1:]
    scored = sorted(enumerate(data_lines), key=lambda x: -len(_CRITICAL_ROW_RE.findall(x[1])))
    critical_idx = {i for i, _ in scored[:15]}
    baseline_idx = set(range(min(5, len(data_lines))))
    selected = [data_lines[i] for i in sorted(critical_idx | baseline_idx)]
    logger.info("Smart sample: %d rows selected from %d total", len(selected), len(data_lines))
    return header + "\n" + "\n".join(selected)


def _fallback_analysis(text: str, industry: str) -> dict:
    """Regex fallback — fires only when Claude is unavailable.
    Honest about its limitations: keyword counts only, no entity extraction."""
    lower = text.lower()
    delay_hits  = len(re.findall(r"delay|late|pending|backlog|dispatch", lower))
    inv_hits    = len(re.findall(r"stockout|shortage|inventory|low stock|out of stock", lower))
    bottle_hits = len(re.findall(r"bottleneck|slow|blocked|queue|capacity", lower))
    risk_score  = min(95, 20 + delay_hits * 8 + inv_hits * 7 + bottle_hits * 6)
    rows        = max(1, len(text.split("\n")))
    cost        = int(risk_score / 100 * rows * COST_MULTIPLIERS.get(industry, 300))
    delay_prob  = min(95, 15 + delay_hits * 12)
    inv_risk    = min(95, 10 + inv_hits * 15)
    sub_vertical = classify_sub_vertical(industry, text)
    confidence  = _assess_data_quality(text, industry)
    annual      = _fallback_annual_savings(industry, cost)
    pain_parts  = []
    if delay_hits:  pain_parts.append(f"{delay_hits} delay/late signals")
    if inv_hits:    pain_parts.append(f"{inv_hits} inventory shortage signals")
    if bottle_hits: pain_parts.append(f"{bottle_hits} bottleneck signals")
    pain_str = "; ".join(pain_parts) if pain_parts else "no critical signals detected"
    logger.warning("AI fallback fired for industry=%s — Claude unavailable, using regex", industry)
    return {
        "risk_score": risk_score,
        "delay_probability": delay_prob,
        "inventory_risk": inv_risk,
        "executive_summary": (
            f"Pattern analysis detected {pain_str} in this {industry} report "
            f"(risk score: {risk_score}/100). Estimated cost at risk: ₹{cost * 83:,} (${cost:,}). "
            "Note: AI engine unavailable — these findings are keyword-pattern estimates, not AI analysis."
        ),
        "bottleneck_summary": (
            f"{bottle_hits} capacity/queue signals detected — review 'blocked', 'queue', 'capacity' rows."
            if bottle_hits else
            "No bottleneck signals in this data. Throughput appears within normal range."
        ),
        "recommendations": (
            f"1. [THIS WEEK] Review all delayed/pending rows — {delay_prob}% delay risk estimated.\n"
            f"2. [THIS MONTH] Audit low-stock items — {inv_risk}% inventory risk detected.\n"
            f"3. [NEXT QUARTER] Implement daily OpsOracle scanning for early detection."
        ),
        "recommendations_json": json.dumps([
            {"timeframe": "THIS WEEK", "action": f"Review all delayed/pending rows — {delay_prob}% delay risk estimated", "owner": "Operations Manager", "impact": f"Prevent ₹{cost // 3 * 83:,} in cost bleed", "urgency": "critical" if risk_score >= 70 else "important"},
            {"timeframe": "THIS MONTH", "action": f"Audit low-stock items — {inv_risk}% inventory risk detected", "owner": "Inventory Team", "impact": "Eliminate stockout-driven lost revenue", "urgency": "important"},
            {"timeframe": "NEXT QUARTER", "action": "Implement daily OpsOracle scanning for early detection", "owner": "Operations Lead", "impact": "Early detection reduces cost impact by up to 60%", "urgency": "strategic"},
        ]),
        "evidence": json.dumps([f"Keyword scan found {delay_hits} delay signals, {inv_hits} inventory signals, {bottle_hits} bottleneck signals across {rows} rows. Specific row citations require AI analysis."]),
        "confidence_level": confidence,
        "data_quality_issues": json.dumps(["AI engine unavailable — specific item names and row-level evidence not available. Counts are keyword frequency estimates."]),
        "agi_reasoning": json.dumps([
            f"Step 1: Classified as {industry}/{sub_vertical} using keyword pattern matching (AI unavailable)",
            f"Step 2: Keyword scan found {delay_hits} delay signals, {inv_hits} inventory signals, {bottle_hits} bottleneck signals across {rows} rows",
            "Step 3: Pattern analysis only — specific row IDs and cross-column correlation require AI analysis",
            f"Step 4: Estimated cost exposure: {rows} rows × industry multiplier = ₹{cost * 83:,} at risk",
            "Step 5: Regex fallback cannot determine root cause — AI engine required for causal reasoning",
        ]),
        "causal_chain": json.dumps({
            "root_cause": f"Keyword signals detected in {rows} rows — specific root cause requires AI analysis",
            "trigger": f"{delay_hits} delay + {bottle_hits} bottleneck signals exceeded normal thresholds",
            "cascade": ["Operational risk elevated — specific downstream effects require AI analysis"],
            "intervention_window": "Review all flagged rows — AI engine required for specific intervention recommendations",
            "if_ignored": "Detected signals may compound — specific trajectory requires AI analysis",
        }),
        "industry_detected": industry,
        "sub_vertical": sub_vertical,
        "cost_impact_usd": cost,
        "annual_savings_usd": annual,
        "analysis_method": "fallback_regex",
    }


_CLAUDE_CLIENT_CACHE = None


def _get_claude_client():
    global _CLAUDE_CLIENT_CACHE
    if _CLAUDE_CLIENT_CACHE is not None:
        return _CLAUDE_CLIENT_CACHE
    if not settings.ANTHROPIC_API_KEY:
        return None
    try:
        import anthropic  # type: ignore
        _CLAUDE_CLIENT_CACHE = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        return _CLAUDE_CLIENT_CACHE
    except ImportError:
        logger.warning("anthropic package not installed — Claude unavailable")
        return None


def _strip_json_codeblock(raw: str) -> str:
    raw = raw.strip()
    if raw.startswith("```"):
        raw = re.sub(r'^```(?:json)?\s*', '', raw)
        raw = re.sub(r'\s*```$', '', raw.rstrip())
    return raw.strip()


def _call_claude(claude_client, system: str, user: str, max_tokens: int = 3500) -> str:
    msg = claude_client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=max_tokens,
        temperature=0.2,
        system=system,
        messages=[{"role": "user", "content": user}],
    )
    return msg.content[0].text


def _critique_grounding(result: dict, claude_client) -> dict:
    """Grounding audit: verify that specific factual claims in summaries trace to evidence.
    Only softens unsupported claims — never adds new information."""
    evidence_items: list = []
    try:
        evidence_items = json.loads(result.get("evidence") or "[]")
    except Exception:
        pass

    executive_summary = result.get("executive_summary", "")
    bottleneck_summary = result.get("bottleneck_summary", "")

    if not evidence_items or not executive_summary:
        return {"grounding_ok": True, "executive_summary": executive_summary,
                "bottleneck_summary": bottleneck_summary, "notes": "No evidence to cross-check"}

    evidence_text = "\n".join(f"- {item}" for item in evidence_items[:8])

    prompt = f"""You are a grounding auditor for an AI operations analysis system.
Your ONLY job: check whether specific factual claims in the summaries are supported by the evidence items below.

EVIDENCE FROM DATA:
{evidence_text}

EXECUTIVE SUMMARY:
{executive_summary}

BOTTLENECK SUMMARY:
{bottleneck_summary}

RULES:
1. A claim is grounded if the specific item name, number, or pattern it asserts appears in at least one evidence item.
2. If a claim cites a specific number or name NOT in the evidence, soften it (e.g. "exactly 3 breakdowns" → "repeated breakdowns").
3. NEVER add new information, names, numbers, or claims not already in the summaries.
4. If all claims are grounded, return both summaries UNCHANGED with grounding_ok=true.
5. Keep the same approximate length and structure.

Return JSON only:
{{"grounding_ok": true, "executive_summary": "...", "bottleneck_summary": "...", "notes": "..."}}"""

    try:
        raw = _call_claude(claude_client, "You are a grounding auditor. Return ONLY valid JSON.", prompt, max_tokens=700)
        audit = json.loads(_strip_json_codeblock(raw))
        return {
            "grounding_ok": bool(audit.get("grounding_ok", True)),
            "executive_summary": audit.get("executive_summary") or executive_summary,
            "bottleneck_summary": audit.get("bottleneck_summary") or bottleneck_summary,
            "notes": audit.get("notes") or "",
        }
    except Exception as exc:
        logger.warning("Grounding audit skipped: %s", exc)
        return {"grounding_ok": True, "executive_summary": executive_summary,
                "bottleneck_summary": bottleneck_summary, "notes": "Audit skipped"}


def generate_cross_vertical_brief(verticals: list) -> dict:
    """Synthesize insights across multiple verticals — finds hidden causal chains
    that siloed per-vertical analysis misses. Requires ≥2 verticals."""
    if len(verticals) < 2:
        return {"available": False}

    claude_client = _get_claude_client()
    if not claude_client:
        return {"available": False}

    verticals_text = "\n\n".join([
        f"VERTICAL: {v['industry'].upper().replace('_', ' ')}\n"
        f"Risk Score: {v['risk_score']}/100\n"
        f"Bottleneck: {v.get('bottleneck_summary', 'N/A')}\n"
        f"Summary: {v.get('executive_summary', 'N/A')[:300]}\n"
        f"Top Recommendation: {v.get('top_recommendation', 'N/A')}"
        for v in verticals
    ])

    prompt = f"""You are an elite cross-domain operations intelligence system analyzing {len(verticals)} operational verticals for the SAME company.

VERTICAL ANALYSES:
{verticals_text}

Synthesize across ALL verticals to find what siloed analysis misses.

Return ONLY valid JSON:
{{
  "cross_pattern": "The hidden causal connection linking 2+ verticals (1-2 sentences). Name the specific link — not generic advice.",
  "leverage_point": "The single action that reduces risk across the most verticals simultaneously (1 sentence, specific).",
  "priority_vertical": "The one vertical to fix FIRST — lowercase with underscores e.g. logistics",
  "why_first": "Why this vertical is the highest-leverage starting point (1 sentence).",
  "action_sequence": ["vertical_name: one-line reason", "..."],
  "connected_findings": "The non-obvious insight that only emerges when seeing all verticals together (1-2 sentences)."
}}"""

    try:
        raw = _call_claude(
            claude_client,
            "You are an elite cross-domain operations intelligence advisor. Return ONLY valid JSON.",
            prompt,
            max_tokens=600,
        )
        result = json.loads(_strip_json_codeblock(raw))
        result["available"] = True
        result["vertical_count"] = len(verticals)
        return result
    except Exception as exc:
        logger.error("Cross-vertical brief failed: %s", exc)
        return {"available": False}


def analyze_operations(extracted_text: str) -> dict:
    industry     = classify_industry(extracted_text)
    sub_vertical = classify_sub_vertical(industry, extracted_text)
    industry_hint = INDUSTRY_CONTEXT.get(industry, INDUSTRY_CONTEXT["operations"])
    confidence   = _assess_data_quality(extracted_text, industry)

    claude_client = _get_claude_client()
    if not claude_client:
        result = _fallback_analysis(extracted_text, industry)
        result["sub_vertical"] = sub_vertical
        return result

    focused_text = _smart_sample(extracted_text)
    kpi_template = INDUSTRY_KPI_PROMPT.get(industry, INDUSTRY_KPI_PROMPT["operations"])

    system_instruction = (
        "You are OpsOracle AI — the world's best operations intelligence advisor. "
        "Your job: find what is actually broken in the client's data, name it precisely, "
        "and tell them exactly what to do about it. "
        "Return ONLY valid JSON — no markdown, no explanation, no code fences. "
        "Never fabricate data. Speak like a brilliant senior ops consultant: direct, specific, no empty hedging."
    )

    prompt = f"""You are OpsOracle AI — a vertical AI for {industry} operations teams.
{industry_hint}

{INDIA_CONTEXT}

CORE RULES — these are non-negotiable:
1. Name the specific item. Never say "a carrier" — say "BlueDart Mumbai→Delhi". Never say "a machine" — say "M2-Lathe Line 3". Use exact IDs, SKUs, routes, services from the data.
2. Show your evidence. Every finding must cite the actual rows or patterns that justify it.
3. Be honest about what you cannot determine. If a metric cannot be computed from this data, say so explicitly in data_quality_issues.
4. Never invent numbers not grounded in the data.
5. Actions must name WHO (exact role), WHAT (exact step with vendor/route/machine named), and the quantified ₹ impact.
6. Speak like a brilliant senior consultant. Strong evidence → direct declarative sentences: "Your BlueDart route has a 100% failure rate this week — ₹2.8L at risk." Sparse data → equally direct about the gap: "Only 3 rows — insufficient. Upload 30 days of history for a reliable analysis." Never hedge strong findings; never fabricate for weak ones.

Return a JSON object with EXACTLY these keys:

risk_score: integer 0-100

delay_probability: integer 0-100

inventory_risk: integer 0-100

executive_summary: 2-3 sentences for a VP/COO. Lead with the single biggest pain (name it specifically), quote ₹ cost, end with total ₹ exposure. When data is sparse, be direct about that instead.

bottleneck_summary: The single constraint choking throughput. Name it with exact data: "M2-Lathe: 3 breakdowns this week, 360 downtime minutes, ₹1,94,000 lost" or "BlueDart Mumbai→Delhi: 5/5 shipments delayed, 100% failure rate." If no clear bottleneck: "No dominant bottleneck in this data — {industry} metrics within normal variance."

evidence: JSON array of strings — cite SPECIFIC data points (row values, IDs, patterns) that drove your findings. Each string = one concrete observation. Max 8 items. No newlines inside strings.

confidence_level: one of: "high" | "medium" | "low" | "insufficient_data" — be honest.

data_quality_issues: JSON array of strings — what you CANNOT assess from this data and why. Empty array [] if data is complete. No newlines inside strings.

recommendations_json: JSON array of EXACTLY 3 objects. No newlines inside string values. The "action" field must name the exact vendor/carrier/machine/SKU and tell the specific role precisely what to do — e.g. "Logistics Manager: call BlueDart account team today, cite SH-1001 to SH-1005 delays, demand SLA credit for ₹45,000 and reroute next 3 Mumbai→Delhi shipments to Delhivery Express." Never write "review carrier performance." Write the exact next step.
[
  {{"timeframe": "THIS WEEK", "action": "exact WHO does WHAT to WHICH named entity", "owner": "role", "impact": "quantified ₹ or %", "urgency": "critical"}},
  {{"timeframe": "THIS MONTH", "action": "...", "owner": "...", "impact": "...", "urgency": "important"}},
  {{"timeframe": "NEXT QUARTER", "action": "...", "owner": "...", "impact": "...", "urgency": "strategic"}}
]

recommendations: same 3 actions as plain text, one per line, numbered.

agi_reasoning: JSON array of EXACTLY 5 strings — your step-by-step reasoning. Show your work. Each string = ONE sentence. No newlines inside strings.
["Step 1: Classified as <industry>/<sub_vertical> because <specific evidence>",
 "Step 2: Identified <N> critical items: <specific IDs, routes, machines, SKUs>",
 "Step 3: Cross-signal pattern: <what makes this systemic, not random>",
 "Step 4: Financial exposure: <calculation — N items × avg value = total ₹>",
 "Step 5: Root cause and intervention: <causal reasoning for top recommendation>"]

causal_chain: JSON object — grounded in THIS DATA ONLY.
{{"root_cause": "underlying condition — named specifically with evidence from data",
  "trigger": "specific event this period that crossed a failure threshold — cite data",
  "cascade": ["downstream effect 1 visible in data", "effect 2 if evidenced — max 3 items"],
  "intervention_window": "WHO (role) does WHAT (exact named step) by WHEN. E.g. 'Ops Manager must call BlueDart Carrier Relations within 24 hours before Thursday delivery window closes.'",
  "if_ignored": "honest trajectory from current data patterns — qualitative direction only"}}

industry_detected: one of: logistics | manufacturing | warehouse | retail | supply_chain | devops | mlops | operations

industry_kpis: JSON object — compute ONLY KPIs derivable from actual column values. Use null for any KPI you cannot compute. Template ({industry}):
{kpi_template}

cost_impact_usd: integer — total USD at risk this period. Store as USD (₹83 ≈ $1). 0 if no issues. Ground in actual data.

annual_savings_usd: integer — realistic annual savings if all 3 recommendations are fully implemented. Be conservative. Typical 2-8× cost_impact. Do NOT use a fixed multiplier.

DATA TO ANALYZE:
{focused_text[:12000]}"""

    try:
        raw = _call_claude(claude_client, system_instruction, prompt)
        result = json.loads(_strip_json_codeblock(raw))
    except Exception as exc:
        logger.error("Claude analysis failed: %s", exc, exc_info=True)
        result = _fallback_analysis(extracted_text, industry)
        result["sub_vertical"] = sub_vertical
        result["cai_revised"] = False
        result["cai_critique_notes"] = None
        return result

    # Validate and coerce critical fields
    result.setdefault("industry_detected", industry)
    result.setdefault("cost_impact_usd", 0)
    result.setdefault("confidence_level", confidence)

    for field in ("evidence", "data_quality_issues"):
        val = result.get(field)
        if isinstance(val, list):
            result[field] = json.dumps(val)
        elif not isinstance(val, str):
            result[field] = json.dumps([])

    recs = result.get("recommendations")
    if isinstance(recs, list):
        result["recommendations"] = "\n".join(str(r) for r in recs)
    elif not isinstance(recs, str):
        result["recommendations"] = ""

    rj = result.get("recommendations_json")
    if isinstance(rj, list):
        result["recommendations_json"] = json.dumps(rj)
    elif not isinstance(rj, str):
        result["recommendations_json"] = json.dumps([])

    ar = result.get("agi_reasoning")
    if isinstance(ar, list):
        result["agi_reasoning"] = json.dumps(ar)
    elif not isinstance(ar, str):
        result["agi_reasoning"] = json.dumps([])

    cc = result.get("causal_chain")
    if isinstance(cc, dict):
        result["causal_chain"] = json.dumps(cc)
    elif not isinstance(cc, str):
        result["causal_chain"] = json.dumps({})

    kpis = result.get("industry_kpis")
    if isinstance(kpis, dict):
        clean = {k: v for k, v in kpis.items() if v is not None}
        result["industry_kpis"] = json.dumps(clean) if clean else None
    else:
        result["industry_kpis"] = None

    if not result.get("annual_savings_usd"):
        result["annual_savings_usd"] = _fallback_annual_savings(
            result.get("industry_detected", industry),
            int(result.get("cost_impact_usd", 0)),
        )

    result["sub_vertical"]    = sub_vertical
    result["analysis_method"] = "llm_claude"

    # Grounding audit: softens any unsupported specific claims
    audit = _critique_grounding(result, claude_client)
    result["executive_summary"]  = audit["executive_summary"]
    result["bottleneck_summary"] = audit["bottleneck_summary"]
    result["cai_revised"]        = not audit["grounding_ok"]
    result["cai_critique_notes"] = audit["notes"]

    return result
