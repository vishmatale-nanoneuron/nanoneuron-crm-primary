"""Shared pytest configuration and fixtures."""
import time
import pytest
import httpx

BACKEND_URL = "https://opsoracle-backend-c6rhcbepsa-el.a.run.app"
_RUN_ID = str(int(time.time()))

_LOGISTICS_CSV = b"""Shipment ID,Origin,Destination,Carrier,Status,Cost_INR
SH-001,Mumbai,Delhi,BlueDart,Delayed,4200
SH-002,Chennai,Bangalore,DTDC,Delivered,1800
SH-003,Mumbai,Delhi,BlueDart,Delayed,4800
SH-004,Mumbai,Delhi,BlueDart,Pending,3900
SH-005,Hyderabad,Chennai,DTDC,Delayed,2200"""


@pytest.fixture(scope="session")
def test_credentials():
    return {
        "email": f"pytest_{_RUN_ID}@mailinator.com",
        "password": "TestPass123!",
        "company_name": f"Pytest Run {_RUN_ID}",
    }


@pytest.fixture(scope="session")
def auth_token(test_credentials):
    r = httpx.post(f"{BACKEND_URL}/auth/register", json=test_credentials, timeout=30)
    assert r.status_code == 200, f"Register failed: {r.text}"
    return r.json()["access_token"]


@pytest.fixture(scope="session")
def authed(auth_token):
    return {"Authorization": f"Bearer {auth_token}"}


@pytest.fixture(scope="session")
def demos(authed):
    """Run demo analysis once per industry — shared across all tests to save API credits.
    Timeout 180s: Claude analysis + grounding audit = 2 API calls, allow ~90s each."""
    results = {}
    for industry in ("manufacturing", "logistics", "warehouse"):
        r = httpx.get(
            f"{BACKEND_URL}/reports/demo",
            params={"industry": industry},
            headers=authed,
            timeout=180,
        )
        assert r.status_code == 200, f"Demo failed for {industry}: {r.text}"
        results[industry] = r.json()
    return results


@pytest.fixture(scope="session")
def upload_result(authed):
    """Single real upload shared across all upload-property tests to stay within burst limit."""
    r = httpx.post(
        f"{BACKEND_URL}/reports/upload",
        files={"file": ("logistics.csv", _LOGISTICS_CSV, "text/csv")},
        headers=authed,
        timeout=180,
    )
    assert r.status_code == 200, f"Upload fixture failed: {r.text}"
    return r.json()
