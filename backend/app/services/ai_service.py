import json
import re
from openai import OpenAI
from app.core.config import settings

def _fallback_analysis(text: str) -> dict:
    lower = text.lower()
    delay_hits = len(re.findall(r"delay|late|pending|backlog|dispatch", lower))
    inventory_hits = len(re.findall(r"stockout|shortage|inventory|low stock|out of stock", lower))
    bottleneck_hits = len(re.findall(r"bottleneck|slow|blocked|queue|capacity", lower))
    risk_score = min(95, 20 + delay_hits * 8 + inventory_hits * 7 + bottleneck_hits * 6)
    return {
        "risk_score": risk_score,
        "delay_probability": min(95, 15 + delay_hits * 12),
        "inventory_risk": min(95, 10 + inventory_hits * 15),
        "bottleneck_summary": "Potential bottlenecks detected." if bottleneck_hits else "No major bottlenecks detected.",
        "executive_summary": "Report analyzed for delays, inventory risks, and bottlenecks. Use as early signal.",
        "recommendations": "Validate high-risk rows manually, contact operations owner, track KPIs daily.",
    }

def analyze_operations(extracted_text: str) -> dict:
    if not settings.OPENAI_API_KEY:
        return _fallback_analysis(extracted_text)
    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    prompt = f"""You are OpsOracle AI, a practical vertical AI for logistics and manufacturing operations.
Analyze this operational data and return JSON only with:
risk_score 0-100, delay_probability 0-100, inventory_risk 0-100,
bottleneck_summary, executive_summary, recommendations.

DATA:
{extracted_text[:12000]}"""
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
        )
        content = response.choices[0].message.content or "{}"
        return json.loads(content)
    except Exception:
        return _fallback_analysis(extracted_text)
