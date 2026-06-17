"""
Unit tests for ai_service.py pure functions.
No LLM calls, no DB — fast, deterministic.
"""
import json
import sys
import os
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.services.ai_service import (
    classify_industry,
    classify_sub_vertical,
    _assess_data_quality,
    _fallback_analysis,
    _smart_sample,
)

# ── Sample data ───────────────────────────────────────────────────────────────

LOGISTICS_CSV = """Shipment ID,Origin,Destination,Carrier,Status,Cost_INR
SH-001,Mumbai,Delhi,BlueDart,Delayed,4200
SH-002,Chennai,Bangalore,DTDC,Delivered,1800
SH-003,Mumbai,Delhi,Delhivery,Pending,3100
SH-004,Mumbai,Delhi,BlueDart,Delayed,4800
SH-005,Hyderabad,Chennai,DTDC,Delayed,2200"""

MANUFACTURING_CSV = """Machine,Shift,Planned,Actual,Downtime_mins,Defects,Reason
M2-Lathe,Morning,300,190,95,22,Breakdown
M3-Weld,Afternoon,400,388,9,5,None
M2-Lathe,Night,300,80,155,40,Breakdown
M1-Press,Morning,500,460,18,12,Material wait"""

WAREHOUSE_CSV = """SKU,Product,Current_Stock,Reorder_Point,Daily_Demand,Lead_Time
SKU-101,Bearings 6204,45,100,18,7
SKU-103,Motor 0.5HP,3,15,2,14
SKU-105,Conveyor Belt,0,5,1,21
SKU-102,Safety Gloves,320,50,12,3"""

DEVOPS_CSV = """Date,Service,Type,Status,MTTR_Mins,Root_Cause
2026-06-02,auth-service,incident,P1,150,Failed deploy v1.8.0
2026-06-03,api-gateway,incident,P1,100,502 errors 100pct traffic
2026-06-05,payment-service,incident,P1,105,Deploy regression"""

MLOPS_CSV = """Date,Model,Status,Accuracy_Pct,Data_Drift_Score,Issue
2026-06-02,churn-predictor,FAILED,,0.51,Training data 38pct null values
2026-06-03,fraud-detector,DEGRADED,87.1,0.34,Accuracy dropped below threshold
2026-06-05,pricing-model,DEGRADED,79.3,0.61,P99 latency SLA breach"""

SUPPLY_CHAIN_CSV = """Supplier,Part,Lead_Time_Days,OTD_Pct,Current_Stock,Safety_Stock,Risk
TechComp,PCB-A1,21,62,120,200,HIGH
ChemSupply,Adhesive-C3,35,44,8,50,CRITICAL
ImportComp,Sensor-F6,45,38,2,20,CRITICAL"""


# ── classify_industry ─────────────────────────────────────────────────────────

def test_classify_logistics():
    assert classify_industry(LOGISTICS_CSV) == "logistics"

def test_classify_manufacturing():
    assert classify_industry(MANUFACTURING_CSV) == "manufacturing"

def test_classify_warehouse():
    assert classify_industry(WAREHOUSE_CSV) == "warehouse"

def test_classify_devops():
    assert classify_industry(DEVOPS_CSV) == "devops"

def test_classify_mlops():
    assert classify_industry(MLOPS_CSV) == "mlops"

def test_classify_supply_chain():
    assert classify_industry(SUPPLY_CHAIN_CSV) == "supply_chain"

def test_classify_returns_string():
    result = classify_industry("some,random,data\n1,2,3")
    assert isinstance(result, str)
    assert len(result) > 0


# ── classify_sub_vertical ─────────────────────────────────────────────────────

def test_sub_vertical_last_mile_from_bluedart():
    assert classify_sub_vertical("logistics", "BlueDart courier last mile delivery pincode") == "last_mile"

def test_sub_vertical_cold_chain():
    assert classify_sub_vertical("logistics", "cold chain reefer temperature controlled vaccine") == "cold_chain"

def test_sub_vertical_ftl():
    assert classify_sub_vertical("logistics", "FTL full truck truckload vehicle utilization") == "ftl"

def test_sub_vertical_discrete_manufacturing():
    assert classify_sub_vertical("manufacturing", "CNC lathe spindle tooling machined parts") == "discrete"

def test_sub_vertical_pharma_manufacturing():
    # "batch" hits the process pattern first; use keywords that are pharma-only
    assert classify_sub_vertical("manufacturing", "pharmaceutical cleanroom sterile coa GMP") == "pharma"

def test_sub_vertical_spare_parts_warehouse():
    assert classify_sub_vertical("warehouse", "spare parts bearings motor pump valve sensor") == "spare_parts"

def test_sub_vertical_unknown_returns_general():
    assert classify_sub_vertical("logistics", "no keywords here at all") == "general"

def test_sub_vertical_unknown_industry_returns_general():
    assert classify_sub_vertical("operations", "some random text") == "general"


# ── _assess_data_quality ──────────────────────────────────────────────────────

def test_data_quality_insufficient_for_2_data_rows():
    text = "col1,col2\nval1,val2\nval3,val4"
    assert _assess_data_quality(text, "logistics") == "insufficient_data"

def test_data_quality_insufficient_for_empty():
    assert _assess_data_quality("", "logistics") == "insufficient_data"

def test_data_quality_returns_valid_level():
    result = _assess_data_quality(LOGISTICS_CSV, "logistics")
    assert result in ("high", "medium", "low", "insufficient_data")

def test_data_quality_not_insufficient_for_5_rows():
    result = _assess_data_quality(LOGISTICS_CSV, "logistics")
    assert result != "insufficient_data"  # 5 rows → low/medium/high, never insufficient

def test_data_quality_not_insufficient_for_manufacturing():
    result = _assess_data_quality(MANUFACTURING_CSV, "manufacturing")
    assert result != "insufficient_data"  # 4 rows with signals → low, never insufficient


# ── _fallback_analysis ────────────────────────────────────────────────────────

REQUIRED_FIELDS = [
    "risk_score", "delay_probability", "inventory_risk",
    "executive_summary", "bottleneck_summary", "recommendations",
    "recommendations_json", "evidence", "confidence_level",
    "data_quality_issues", "agi_reasoning", "causal_chain",
    "industry_detected", "cost_impact_usd", "annual_savings_usd",
    "analysis_method", "sub_vertical",
]

@pytest.mark.parametrize("csv,industry", [
    (LOGISTICS_CSV, "logistics"),
    (MANUFACTURING_CSV, "manufacturing"),
    (WAREHOUSE_CSV, "warehouse"),
    (DEVOPS_CSV, "devops"),
])
def test_fallback_has_all_required_fields(csv, industry):
    result = _fallback_analysis(csv, industry)
    for field in REQUIRED_FIELDS:
        assert field in result, f"[{industry}] missing field: {field}"

def test_fallback_analysis_method_is_regex():
    result = _fallback_analysis(LOGISTICS_CSV, "logistics")
    assert result["analysis_method"] == "fallback_regex"

def test_fallback_risk_scores_in_range():
    result = _fallback_analysis(MANUFACTURING_CSV, "manufacturing")
    assert 0 <= result["risk_score"] <= 100
    assert 0 <= result["delay_probability"] <= 100
    assert 0 <= result["inventory_risk"] <= 100

def test_fallback_cost_impact_nonnegative():
    result = _fallback_analysis(LOGISTICS_CSV, "logistics")
    assert result["cost_impact_usd"] >= 0
    assert result["annual_savings_usd"] >= 0

def test_fallback_agi_reasoning_is_5_steps():
    result = _fallback_analysis(MANUFACTURING_CSV, "manufacturing")
    steps = json.loads(result["agi_reasoning"])
    assert isinstance(steps, list), "agi_reasoning must be a JSON array"
    assert len(steps) == 5, f"expected 5 steps, got {len(steps)}"

def test_fallback_causal_chain_valid_json():
    result = _fallback_analysis(LOGISTICS_CSV, "logistics")
    chain = json.loads(result["causal_chain"])
    assert isinstance(chain, dict)

def test_fallback_causal_chain_has_required_keys():
    result = _fallback_analysis(LOGISTICS_CSV, "logistics")
    chain = json.loads(result["causal_chain"])
    for key in ("root_cause", "trigger", "cascade", "intervention_window", "if_ignored"):
        assert key in chain, f"causal_chain missing key: {key}"
    assert isinstance(chain["cascade"], list)

def test_fallback_recommendations_json_has_3_cards():
    result = _fallback_analysis(WAREHOUSE_CSV, "warehouse")
    cards = json.loads(result["recommendations_json"])
    assert isinstance(cards, list)
    assert len(cards) == 3
    for card in cards:
        for key in ("timeframe", "action", "owner", "impact", "urgency"):
            assert key in card, f"action card missing key: {key}"

def test_fallback_evidence_is_nonempty_array():
    result = _fallback_analysis(LOGISTICS_CSV, "logistics")
    evidence = json.loads(result["evidence"])
    assert isinstance(evidence, list)
    assert len(evidence) > 0

def test_fallback_data_quality_issues_is_array():
    result = _fallback_analysis(MANUFACTURING_CSV, "manufacturing")
    issues = json.loads(result["data_quality_issues"])
    assert isinstance(issues, list)

def test_fallback_industry_detected_matches_input():
    result = _fallback_analysis(LOGISTICS_CSV, "logistics")
    assert result["industry_detected"] == "logistics"

def test_fallback_high_risk_for_many_signals():
    # Many delay keywords → high risk
    heavy = "\n".join(["delayed,late,overdue,failed,breakdown"] * 20)
    result = _fallback_analysis(heavy, "logistics")
    assert result["risk_score"] >= 50

def test_fallback_low_risk_for_clean_data():
    clean = """Shipment,Status,Carrier
SH-001,Delivered,BlueDart
SH-002,Delivered,DTDC
SH-003,Delivered,FedEx
SH-004,Delivered,Delhivery"""
    result = _fallback_analysis(clean, "logistics")
    assert result["risk_score"] <= 40


# ── _smart_sample ─────────────────────────────────────────────────────────────

def test_smart_sample_passthrough_for_30_rows():
    header = "Machine,Shift,Downtime_mins"
    rows = "\n".join([f"M{i},Morning,{i * 5}" for i in range(30)])
    text = f"{header}\n{rows}"
    assert _smart_sample(text) == text

def test_smart_sample_passthrough_for_1_row():
    text = "col1,col2\nval1,val2"
    assert _smart_sample(text) == text

def test_smart_sample_reduces_large_file():
    header = "Machine,Shift,Status"
    rows = [f"M{i},Morning,{'Delayed' if i % 5 == 0 else 'OK'}" for i in range(50)]
    text = header + "\n" + "\n".join(rows)
    result = _smart_sample(text)
    result_lines = result.strip().split("\n")
    assert result_lines[0] == header
    assert len(result_lines) <= 21  # header + up to 20 data rows

def test_smart_sample_prioritises_critical_rows():
    header = "ID,Status"
    critical = [f"SH-{i},Delayed" for i in range(15)]
    clean = [f"SH-{i + 100},Delivered" for i in range(20)]
    text = header + "\n" + "\n".join(clean + critical)
    result = _smart_sample(text)
    assert "Delayed" in result  # critical rows must be included


# ── _strip_json_codeblock ────────────────────────────────────────────────────

from app.services.ai_service import _strip_json_codeblock

def test_strip_json_codeblock_no_fences():
    raw = '{"a": 1}'
    assert _strip_json_codeblock(raw) == '{"a": 1}'

def test_strip_json_codeblock_json_fence():
    raw = '```json\n{"a": 1}\n```'
    result = _strip_json_codeblock(raw)
    assert result == '{"a": 1}'

def test_strip_json_codeblock_plain_fence():
    raw = '```\n{"x": 2}\n```'
    assert _strip_json_codeblock(raw) == '{"x": 2}'

def test_strip_json_codeblock_with_whitespace():
    raw = '  ```json\n  {"b": 3}\n  ```  '
    result = _strip_json_codeblock(raw)
    assert '{"b": 3}' in result

def test_strip_json_codeblock_multiline():
    raw = '```json\n{"a": 1,\n"b": 2}\n```'
    result = _strip_json_codeblock(raw)
    assert result.startswith('{"a": 1,')


# ── _get_claude_client ───────────────────────────────────────────────────────

from app.services.ai_service import _get_claude_client

def test_get_claude_client_returns_none_when_no_key(monkeypatch):
    monkeypatch.setattr("app.services.ai_service._CLAUDE_CLIENT_CACHE", None)
    from app.core.config import settings
    original = settings.ANTHROPIC_API_KEY
    settings.ANTHROPIC_API_KEY = ""
    try:
        result = _get_claude_client()
        assert result is None
    finally:
        settings.ANTHROPIC_API_KEY = original
        import app.services.ai_service as svc
        svc._CLAUDE_CLIENT_CACHE = None
