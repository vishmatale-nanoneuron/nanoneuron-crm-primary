"""
Integration tests against the live Cloud Run backend.
Runs once — uses session-scoped fixtures so demo analysis fires 3 times total
(not once per test assertion) to minimise Groq API credit usage.

Run:  cd backend && pytest tests/test_api_integration.py -v
"""
import json
import pytest
import httpx

from tests.conftest import BACKEND_URL


# ── Health ────────────────────────────────────────────────────────────────────

class TestHealth:
    def test_returns_200(self):
        r = httpx.get(f"{BACKEND_URL}/health", timeout=180)
        assert r.status_code == 200

    def test_product_name(self):
        d = httpx.get(f"{BACKEND_URL}/health", timeout=180).json()
        assert d["product"] == "OpsOracle AI"

    def test_version_format(self):
        d = httpx.get(f"{BACKEND_URL}/health", timeout=180).json()
        assert "." in d["version"]

    def test_status_ok(self):
        d = httpx.get(f"{BACKEND_URL}/health", timeout=180).json()
        assert d["status"] == "ok"


class TestHealthReady:
    def test_ready_returns_200(self):
        r = httpx.get(f"{BACKEND_URL}/health/ready", timeout=180)
        assert r.status_code == 200

    def test_ready_status_field(self):
        d = httpx.get(f"{BACKEND_URL}/health/ready", timeout=180).json()
        assert d["status"] == "ready"


# ── Auth ──────────────────────────────────────────────────────────────────────

class TestAuth:
    def test_register_returns_token(self, auth_token):
        assert auth_token and len(auth_token) > 20

    def test_register_duplicate_email_fails(self, test_credentials):
        r = httpx.post(f"{BACKEND_URL}/auth/register", json=test_credentials, timeout=15)
        assert r.status_code == 400
        assert "already registered" in r.json()["detail"].lower()

    def test_login_success(self, test_credentials):
        r = httpx.post(f"{BACKEND_URL}/auth/login", json={
            "email": test_credentials["email"],
            "password": test_credentials["password"],
        }, timeout=15)
        assert r.status_code == 200
        assert "access_token" in r.json()

    def test_login_wrong_password_returns_401(self, test_credentials):
        r = httpx.post(f"{BACKEND_URL}/auth/login", json={
            "email": test_credentials["email"],
            "password": "WrongPassword999!",
        }, timeout=15)
        assert r.status_code == 401

    def test_login_unknown_email_returns_401(self):
        r = httpx.post(f"{BACKEND_URL}/auth/login", json={
            "email": "nobody_xyzxyz@mailinator.com",
            "password": "any",
        }, timeout=15)
        assert r.status_code == 401

    def test_me_returns_correct_email(self, authed, test_credentials):
        r = httpx.get(f"{BACKEND_URL}/auth/me", headers=authed, timeout=15)
        assert r.status_code == 200
        assert r.json()["email"] == test_credentials["email"]

    def test_me_without_token_returns_401(self):
        r = httpx.get(f"{BACKEND_URL}/auth/me", timeout=15)
        assert r.status_code in (401, 403)

    def test_me_with_bad_token_returns_401(self):
        r = httpx.get(f"{BACKEND_URL}/auth/me", headers={"Authorization": "Bearer bad.token.here"}, timeout=15)
        assert r.status_code in (401, 403)


# ── Trial / Plan ──────────────────────────────────────────────────────────────

class TestPlan:
    def test_new_user_is_on_trial(self, authed):
        r = httpx.get(f"{BACKEND_URL}/payments/my-plan", headers=authed, timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["is_trial"] is True

    def test_new_user_plan_tier_is_pro(self, authed):
        d = httpx.get(f"{BACKEND_URL}/payments/my-plan", headers=authed, timeout=15).json()
        assert d["plan_tier"] == "pro"

    def test_new_user_has_14_days_remaining(self, authed):
        d = httpx.get(f"{BACKEND_URL}/payments/my-plan", headers=authed, timeout=15).json()
        assert d["days_remaining"] is not None
        assert 13 <= d["days_remaining"] <= 14

    def test_plan_has_features_list(self, authed):
        d = httpx.get(f"{BACKEND_URL}/payments/my-plan", headers=authed, timeout=15).json()
        assert isinstance(d["features"], list)
        assert len(d["features"]) > 0

    def test_no_auth_returns_401(self):
        r = httpx.get(f"{BACKEND_URL}/payments/my-plan", timeout=15)
        assert r.status_code in (401, 403)


# ── Demo analysis — structural correctness ────────────────────────────────────

class TestDemoAnalysis:
    """All assertions read from the session-scoped `demos` fixture — zero extra LLM calls."""

    VALID_METHODS = {"llm_claude", "fallback_regex"}

    @pytest.mark.parametrize("industry", ["manufacturing", "logistics", "warehouse"])
    def test_analysis_method_is_valid(self, demos, industry):
        method = demos[industry]["analysis_method"]
        assert method in self.VALID_METHODS, \
            f"{industry}: unexpected analysis_method: {method}"

    # risk scores in range
    @pytest.mark.parametrize("industry", ["manufacturing", "logistics", "warehouse"])
    def test_risk_scores_in_range(self, demos, industry):
        d = demos[industry]
        assert 0 <= d["risk_score"] <= 100
        assert 0 <= d["delay_probability"] <= 100
        assert 0 <= d["inventory_risk"] <= 100

    # confidence level valid
    @pytest.mark.parametrize("industry", ["manufacturing", "logistics", "warehouse"])
    def test_confidence_level_valid(self, demos, industry):
        level = demos[industry]["confidence_level"]
        assert level in ("high", "medium", "low", "insufficient_data"), \
            f"{industry}: unexpected confidence_level: {level}"

    # sub_vertical detected
    @pytest.mark.parametrize("industry", ["manufacturing", "logistics", "warehouse"])
    def test_sub_vertical_is_set(self, demos, industry):
        sv = demos[industry].get("sub_vertical")
        assert sv and len(sv) > 0, f"{industry}: sub_vertical is empty"

    # AGI reasoning chain
    @pytest.mark.parametrize("industry", ["manufacturing", "logistics", "warehouse"])
    def test_agi_reasoning_has_5_steps(self, demos, industry):
        steps = json.loads(demos[industry].get("agi_reasoning") or "[]")
        assert len(steps) == 5, f"{industry}: expected 5 agi_reasoning steps, got {len(steps)}"

    # Evidence
    @pytest.mark.parametrize("industry", ["manufacturing", "logistics", "warehouse"])
    def test_evidence_is_nonempty(self, demos, industry):
        evidence = json.loads(demos[industry].get("evidence") or "[]")
        assert len(evidence) > 0, f"{industry}: evidence array is empty"

    # Action cards
    @pytest.mark.parametrize("industry", ["manufacturing", "logistics", "warehouse"])
    def test_action_cards_count_is_3(self, demos, industry):
        cards = json.loads(demos[industry].get("recommendations_json") or "[]")
        assert len(cards) == 3, f"{industry}: expected 3 action cards, got {len(cards)}"

    @pytest.mark.parametrize("industry", ["manufacturing", "logistics", "warehouse"])
    def test_action_cards_have_required_fields(self, demos, industry):
        cards = json.loads(demos[industry].get("recommendations_json") or "[]")
        for card in cards:
            for field in ("timeframe", "action", "owner", "impact", "urgency"):
                assert field in card, f"{industry} action card missing: {field}"

    @pytest.mark.parametrize("industry", ["manufacturing", "logistics", "warehouse"])
    def test_action_cards_timeframes_correct(self, demos, industry):
        cards = json.loads(demos[industry].get("recommendations_json") or "[]")
        timeframes = [c["timeframe"] for c in cards]
        assert "THIS WEEK" in timeframes, f"{industry}: no THIS WEEK card"
        assert "NEXT QUARTER" in timeframes, f"{industry}: no NEXT QUARTER card"

    # Causal chain
    @pytest.mark.parametrize("industry", ["manufacturing", "logistics", "warehouse"])
    def test_causal_chain_is_present(self, demos, industry):
        assert demos[industry].get("causal_chain"), f"{industry}: causal_chain is empty/null"

    @pytest.mark.parametrize("industry", ["manufacturing", "logistics", "warehouse"])
    def test_causal_chain_has_required_keys(self, demos, industry):
        chain = json.loads(demos[industry]["causal_chain"])
        for key in ("root_cause", "trigger", "cascade", "intervention_window", "if_ignored"):
            assert key in chain, f"{industry} causal_chain missing: {key}"

    @pytest.mark.parametrize("industry", ["manufacturing", "logistics", "warehouse"])
    def test_causal_chain_cascade_is_list(self, demos, industry):
        chain = json.loads(demos[industry]["causal_chain"])
        assert isinstance(chain["cascade"], list), f"{industry}: cascade must be a list"
        assert len(chain["cascade"]) > 0, f"{industry}: cascade list is empty"

    @pytest.mark.parametrize("industry", ["manufacturing", "logistics", "warehouse"])
    def test_causal_chain_fields_are_nonempty_strings(self, demos, industry):
        chain = json.loads(demos[industry]["causal_chain"])
        for key in ("root_cause", "trigger", "intervention_window", "if_ignored"):
            assert isinstance(chain[key], str) and len(chain[key]) > 5, \
                f"{industry} causal_chain.{key} is empty or too short"

    # Data quality issues
    @pytest.mark.parametrize("industry", ["manufacturing", "logistics", "warehouse"])
    def test_data_quality_issues_is_array(self, demos, industry):
        issues = json.loads(demos[industry].get("data_quality_issues") or "[]")
        assert isinstance(issues, list)

    # Cost / savings
    @pytest.mark.parametrize("industry", ["manufacturing", "logistics", "warehouse"])
    def test_cost_impact_nonnegative(self, demos, industry):
        assert (demos[industry].get("cost_impact_usd") or 0) >= 0

    @pytest.mark.parametrize("industry", ["manufacturing", "logistics", "warehouse"])
    def test_annual_savings_nonnegative(self, demos, industry):
        assert (demos[industry].get("annual_savings_usd") or 0) >= 0

    # Manufacturing-specific: M2-Lathe named (LLM only — regex fallback skipped)
    def test_manufacturing_names_m2_lathe(self, demos):
        d = demos["manufacturing"]
        if d.get("analysis_method") == "fallback_regex":
            pytest.skip("LLM unavailable — regex fallback does not extract entity names")
        text = " ".join([
            d.get("bottleneck_summary") or "",
            d.get("executive_summary") or "",
            json.loads(d.get("evidence") or "[]")[0] if json.loads(d.get("evidence") or "[]") else "",
        ]).lower()
        assert "m2" in text or "lathe" in text, \
            "Manufacturing demo should name M2-Lathe specifically"

    # Logistics-specific: BlueDart named (LLM only — regex fallback skipped)
    def test_logistics_names_bluedart_or_route(self, demos):
        d = demos["logistics"]
        if d.get("analysis_method") == "fallback_regex":
            pytest.skip("LLM unavailable — regex fallback does not extract entity names")
        text = " ".join([
            d.get("bottleneck_summary") or "",
            d.get("executive_summary") or "",
        ]).lower()
        assert "bluedart" in text or "mumbai" in text or "delhi" in text, \
            "Logistics demo should name BlueDart or Mumbai→Delhi route"


# ── CSV upload ────────────────────────────────────────────────────────────────

class TestUpload:
    """Tests use the session-scoped upload_result fixture so only 1 real upload
    is made for property checks, keeping us well under the 2/min burst limit."""

    def test_upload_csv_returns_200(self, upload_result):
        assert upload_result.get("industry_detected") is not None

    def test_upload_detects_logistics_industry(self, upload_result):
        assert upload_result["industry_detected"] == "logistics"

    def test_upload_has_causal_chain(self, upload_result):
        assert upload_result.get("causal_chain"), "upload should populate causal_chain"
        chain = json.loads(upload_result["causal_chain"])
        assert "root_cause" in chain

    def test_upload_without_auth_returns_401(self):
        r = httpx.post(
            f"{BACKEND_URL}/reports/upload",
            files={"file": ("test.csv", b"col1,col2\nv1,v2", "text/csv")},
            timeout=15,
        )
        assert r.status_code in (401, 403)

    def test_upload_unsupported_file_type_returns_400(self, authed):
        # Extension check happens before burst limit — safe to call without prior upload
        r = httpx.post(
            f"{BACKEND_URL}/reports/upload",
            files={"file": ("test.exe", b"\x00\x01\x02", "application/octet-stream")},
            headers=authed,
            timeout=15,
        )
        assert r.status_code == 400

    def test_upload_result_has_confidence_level(self, upload_result):
        assert upload_result.get("confidence_level") in ("high", "medium", "low", "insufficient_data", None)

    def test_burst_rate_limit_blocks_third_upload_in_window(self, authed, upload_result):
        """After 2 uploads in the 5-minute window, a 3rd must return 429 immediately.
        upload_result fixture = upload #1. We add upload #2 here, then assert #3 is blocked.
        The 429 check uses a 10s timeout since the burst check fires before Claude runs."""
        tiny_csv = b"Carrier,Status\nBlueDart,Delayed\nDTDC,Delivered"
        # upload #2 — succeeds (takes ~90s with Claude analysis)
        r2 = httpx.post(
            f"{BACKEND_URL}/reports/upload",
            files={"file": ("tiny.csv", tiny_csv, "text/csv")},
            headers=authed,
            timeout=180,
        )
        assert r2.status_code == 200, f"Upload #2 expected 200, got {r2.status_code}: {r2.text}"
        # upload #3 — burst limit fires before Claude, so returns 429 instantly
        r3 = httpx.post(
            f"{BACKEND_URL}/reports/upload",
            files={"file": ("tiny.csv", tiny_csv, "text/csv")},
            headers=authed,
            timeout=10,
        )
        assert r3.status_code == 429, f"Expected 429 on 3rd upload, got {r3.status_code}"


# ── Shared reports ────────────────────────────────────────────────────────────

class TestSharedReports:
    def test_invalid_token_returns_404(self):
        r = httpx.get(f"{BACKEND_URL}/reports/shared/INVALID_TOKEN_XXXXX", timeout=15)
        assert r.status_code == 404

    def test_random_string_returns_404(self):
        r = httpx.get(f"{BACKEND_URL}/reports/shared/abc123def456", timeout=15)
        assert r.status_code == 404


# ── Public demo (no auth) ─────────────────────────────────────────────────────

class TestPublicDemo:
    def test_logistics_no_auth(self):
        r = httpx.get(f"{BACKEND_URL}/reports/public-demo", params={"industry": "logistics"}, timeout=180)
        assert r.status_code == 200

    def test_public_demo_has_basic_fields(self):
        d = httpx.get(f"{BACKEND_URL}/reports/public-demo", params={"industry": "manufacturing"}, timeout=180).json()
        assert d["risk_score"] >= 0
        assert d["industry_detected"] is not None
        assert d["executive_summary"]

    def test_unknown_industry_defaults_to_logistics(self):
        d = httpx.get(f"{BACKEND_URL}/reports/public-demo", params={"industry": "invalid_xyz"}, timeout=180).json()
        assert d["industry_detected"] is not None


# ── Reports list ──────────────────────────────────────────────────────────────

class TestReportsList:
    def test_list_requires_auth(self):
        r = httpx.get(f"{BACKEND_URL}/reports", timeout=15)
        assert r.status_code in (401, 403)

    def test_list_returns_array_for_authed_user(self, authed):
        r = httpx.get(f"{BACKEND_URL}/reports", headers=authed, timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_usage_endpoint_works(self, authed):
        r = httpx.get(f"{BACKEND_URL}/reports/usage", headers=authed, timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert "plan_tier" in d
        assert "used" in d


# ── Delete account (isolated user — runs last) ────────────────────────────────

class TestDeleteAccount:
    """Uses a separate throw-away user so other session-scoped fixtures aren't affected."""

    def test_delete_account_removes_user(self):
        import time
        ts = str(int(time.time()))[-6:]
        creds = {
            "email": f"del_test_{ts}@mailtest.nanoneuron.ai",
            "password": "DeleteMe123!",
            "company_name": "Delete Test",
        }
        reg = httpx.post(f"{BACKEND_URL}/auth/register", json=creds, timeout=20)
        assert reg.status_code == 200, f"register: {reg.text}"
        token = reg.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Confirm me works before deletion
        me = httpx.get(f"{BACKEND_URL}/auth/me", headers=headers, timeout=10)
        assert me.status_code == 200

        # Delete
        r = httpx.delete(f"{BACKEND_URL}/auth/account", headers=headers, timeout=20)
        assert r.status_code == 200
        assert r.json()["status"] == "deleted"

        # Token must no longer work
        me_after = httpx.get(f"{BACKEND_URL}/auth/me", headers=headers, timeout=10)
        assert me_after.status_code in (401, 403, 404)

    def test_delete_without_auth_returns_401(self):
        r = httpx.delete(f"{BACKEND_URL}/auth/account", timeout=10)
        assert r.status_code in (401, 403)
