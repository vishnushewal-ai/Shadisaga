"""Iteration 3 backend tests: favourites, queries (public), admin query inbox."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://nikah-nexus.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN = {"email": "admin@shaadisaga.in", "password": "Admin@123", "role": "admin"}
CLIENT = {"email": "client@test.com", "password": "Test@123", "role": "client"}
VENDOR = {"email": "vendor@test.com", "password": "Test@123", "role": "vendor"}


def _login(creds):
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json=creds, timeout=30)
    assert r.status_code == 200, f"Login failed for {creds['email']}: {r.status_code} {r.text}"
    return s


@pytest.fixture(scope="module")
def admin_session():
    return _login(ADMIN)


@pytest.fixture(scope="module")
def client_session():
    return _login(CLIENT)


@pytest.fixture(scope="module")
def vendor_session():
    return _login(VENDOR)


@pytest.fixture(scope="module")
def sample_vendor_id():
    r = requests.get(f"{API}/vendors", timeout=30)
    assert r.status_code == 200
    vendors = r.json()
    assert len(vendors) > 0
    return vendors[0]["id"]


# -------------------- Favourites --------------------
class TestFavourites:
    def test_toggle_requires_auth(self, sample_vendor_id):
        r = requests.post(f"{API}/favourites/toggle", json={"vendor_id": sample_vendor_id}, timeout=30)
        assert r.status_code == 401

    def test_toggle_rejects_vendor_role_403(self, vendor_session, sample_vendor_id):
        r = vendor_session.post(f"{API}/favourites/toggle", json={"vendor_id": sample_vendor_id}, timeout=30)
        assert r.status_code == 403

    def test_toggle_rejects_admin_role_403(self, admin_session, sample_vendor_id):
        r = admin_session.post(f"{API}/favourites/toggle", json={"vendor_id": sample_vendor_id}, timeout=30)
        assert r.status_code == 403

    def test_client_toggle_on_off(self, client_session, sample_vendor_id):
        # Normalise state first: get current favourites
        init = client_session.get(f"{API}/favourites", timeout=30).json()
        already = sample_vendor_id in init.get("vendor_ids", [])
        # Toggle once
        r1 = client_session.post(f"{API}/favourites/toggle", json={"vendor_id": sample_vendor_id}, timeout=30)
        assert r1.status_code == 200
        d1 = r1.json()
        assert "favourited" in d1
        assert d1["favourited"] == (not already)
        # Toggle again - should flip back
        r2 = client_session.post(f"{API}/favourites/toggle", json={"vendor_id": sample_vendor_id}, timeout=30)
        assert r2.status_code == 200
        assert r2.json()["favourited"] == already

    def test_favourites_list_shape(self, client_session):
        r = client_session.get(f"{API}/favourites", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert "vendor_ids" in data and isinstance(data["vendor_ids"], list)
        assert "vendors" in data and isinstance(data["vendors"], list)
        # id consistency
        if data["vendor_ids"]:
            assert all("id" in v for v in data["vendors"])

    def test_favourites_list_requires_auth(self):
        r = requests.get(f"{API}/favourites", timeout=30)
        assert r.status_code == 401

    def test_toggle_persists_and_reflects_in_list(self, client_session, sample_vendor_id):
        # Ensure clean slate - make sure NOT favourited
        init = client_session.get(f"{API}/favourites", timeout=30).json()
        if sample_vendor_id in init["vendor_ids"]:
            client_session.post(f"{API}/favourites/toggle", json={"vendor_id": sample_vendor_id}, timeout=30)
        # Now favourite
        r = client_session.post(f"{API}/favourites/toggle", json={"vendor_id": sample_vendor_id}, timeout=30)
        assert r.json()["favourited"] is True
        # list should contain it
        lst = client_session.get(f"{API}/favourites", timeout=30).json()
        assert sample_vendor_id in lst["vendor_ids"]
        assert any(v["id"] == sample_vendor_id for v in lst["vendors"])
        # cleanup
        client_session.post(f"{API}/favourites/toggle", json={"vendor_id": sample_vendor_id}, timeout=30)


# -------------------- Query (public form) --------------------
class TestPublicQuery:
    def test_submit_query_public(self):
        payload = {
            "name": "TEST Priya",
            "email": f"TEST_query_{uuid.uuid4().hex[:6]}@example.com",
            "phone": "+917217612408",
            "city": "Jaipur",
            "subject": "Need venue recommendation",
            "message": "Looking for royal palace venue in Jaipur for 500 guests.",
        }
        r = requests.post(f"{API}/query", json=payload, timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "id" in data and isinstance(data["id"], str)
        assert "created_at" in data

    def test_submit_query_invalid_email(self):
        r = requests.post(f"{API}/query", json={
            "name": "x", "email": "not-an-email", "subject": "hi", "message": "hello there",
        }, timeout=30)
        assert r.status_code == 422

    def test_submit_query_short_message(self):
        r = requests.post(f"{API}/query", json={
            "name": "x", "email": "a@b.com", "subject": "hi", "message": "hi",
        }, timeout=30)
        assert r.status_code == 422


# -------------------- Admin Query Inbox --------------------
class TestAdminInbox:
    def test_list_queries_requires_auth(self):
        r = requests.get(f"{API}/queries", timeout=30)
        assert r.status_code == 401

    def test_list_queries_client_forbidden(self, client_session):
        r = client_session.get(f"{API}/queries", timeout=30)
        assert r.status_code == 403

    def test_list_queries_vendor_forbidden(self, vendor_session):
        r = vendor_session.get(f"{API}/queries", timeout=30)
        assert r.status_code == 403

    def test_stats_requires_auth(self):
        r = requests.get(f"{API}/queries/stats", timeout=30)
        assert r.status_code == 401

    def test_stats_client_forbidden(self, client_session):
        r = client_session.get(f"{API}/queries/stats", timeout=30)
        assert r.status_code == 403

    def test_admin_stats_shape(self, admin_session):
        r = admin_session.get(f"{API}/queries/stats", timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert "new" in d and "total" in d
        assert isinstance(d["new"], int) and isinstance(d["total"], int)
        assert d["new"] <= d["total"]

    def test_admin_list_queries_sorted_desc(self, admin_session):
        # Submit two queries to guarantee at least 2 exist
        for i in range(2):
            requests.post(f"{API}/query", json={
                "name": f"TEST sort {i}",
                "email": f"TEST_sort_{uuid.uuid4().hex[:6]}@example.com",
                "subject": f"subj {i}",
                "message": f"Looking for something nice, round {i}",
            }, timeout=30)
        r = admin_session.get(f"{API}/queries", timeout=30)
        assert r.status_code == 200
        docs = r.json()
        assert isinstance(docs, list)
        assert len(docs) >= 2
        created = [d["created_at"] for d in docs]
        assert created == sorted(created, reverse=True), "queries not sorted by created_at desc"
        # ensure no _id leaked
        assert all("_id" not in d for d in docs)

    def test_patch_status_admin_and_persists(self, admin_session):
        # create a query first
        payload = {
            "name": "TEST Patch", "email": f"TEST_patch_{uuid.uuid4().hex[:6]}@example.com",
            "subject": "status test", "message": "please update my status",
        }
        cr = requests.post(f"{API}/query", json=payload, timeout=30)
        qid = cr.json()["id"]
        # change status to replied
        r = admin_session.patch(f"{API}/queries/{qid}", json={"status": "replied"}, timeout=30)
        assert r.status_code == 200
        assert r.json().get("status") == "replied"
        # verify persisted via list
        docs = admin_session.get(f"{API}/queries", timeout=30).json()
        match = next((d for d in docs if d["id"] == qid), None)
        assert match is not None
        assert match["status"] == "replied"

    def test_patch_status_client_forbidden(self, client_session):
        # Need a valid id — grab one via admin, or try a random id (still 403 before not-found because role check first)
        r = client_session.patch(f"{API}/queries/some-random-id", json={"status": "read"}, timeout=30)
        assert r.status_code == 403

    def test_patch_invalid_status_422(self, admin_session):
        r = admin_session.patch(f"{API}/queries/any", json={"status": "bogus"}, timeout=30)
        assert r.status_code == 422

    def test_patch_unknown_id_404(self, admin_session):
        r = admin_session.patch(f"{API}/queries/does-not-exist-xyz", json={"status": "closed"}, timeout=30)
        assert r.status_code == 404


# -------------------- Admin login --------------------
class TestAdminLogin:
    def test_admin_can_login(self):
        s = requests.Session()
        r = s.post(f"{API}/auth/login", json=ADMIN, timeout=30)
        assert r.status_code == 200
        assert r.json()["role"] == "admin"
        assert "access_token" in s.cookies
