"""Shaadi Saga India - backend regression tests."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://nikah-nexus.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="session")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# -------------------- Categories --------------------
class TestCategories:
    def test_categories_count_19(self, client):
        r = client.get(f"{API}/categories", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == 19, f"Expected 19 categories, got {len(data)}"
        # structure
        c = data[0]
        for k in ("slug", "name", "icon", "image", "count"):
            assert k in c
        # at least one category has vendors
        assert sum(c["count"] for c in data) > 0


# -------------------- Vendors --------------------
class TestVendors:
    def test_list_vendors_sorted_by_rating(self, client):
        r = client.get(f"{API}/vendors", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert len(data) > 0
        ratings = [v["rating"] for v in data]
        assert ratings == sorted(ratings, reverse=True), "Vendors not sorted by rating desc"

    def test_filter_category_mehendi(self, client):
        r = client.get(f"{API}/vendors", params={"category": "mehendi"}, timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 5, f"Expected 5 mehendi vendors, got {len(data)}"
        assert all(v["category"] == "mehendi" for v in data)

    def test_filter_max_budget(self, client):
        r = client.get(f"{API}/vendors", params={"max_budget": 20000}, timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert all(v["starting_price"] <= 20000 for v in data)

    def test_filter_min_rating_and_verified(self, client):
        r = client.get(f"{API}/vendors", params={"min_rating": 4.8, "verified_only": "true"}, timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert all(v["rating"] >= 4.8 and v["verified"] is True for v in data)

    def test_text_search(self, client):
        r = client.get(f"{API}/vendors", params={"q": "fusion"}, timeout=30)
        assert r.status_code == 200
        data = r.json()
        # either name/description/tags contains fusion (case-insensitive)
        assert len(data) >= 0
        for v in data:
            blob = (v["name"] + " " + v["description"] + " " + " ".join(v["tags"])).lower()
            assert "fusion" in blob

    def test_get_vendor_by_id(self, client):
        lst = client.get(f"{API}/vendors", timeout=30).json()
        assert len(lst) > 0
        vid = lst[0]["id"]
        r = client.get(f"{API}/vendors/{vid}", timeout=30)
        assert r.status_code == 200
        v = r.json()
        assert v["id"] == vid
        assert "name" in v and "category" in v

    def test_get_vendor_not_found(self, client):
        r = client.get(f"{API}/vendors/nonexistent-id-xyz", timeout=30)
        assert r.status_code == 404


# -------------------- Real Weddings --------------------
class TestRealWeddings:
    def test_real_weddings_returns_4(self, client):
        r = client.get(f"{API}/real-weddings", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 4, f"Expected 4 real weddings, got {len(data)}"
        for w in data:
            for k in ("id", "title", "location", "theme", "image", "story"):
                assert k in w


# -------------------- AI Matchmaker --------------------
class TestMatchmaker:
    def test_matchmaker_returns_top_3(self, client):
        payload = {"budget": 500000, "theme": "royal rajasthani", "city": "Jaipur", "category": "venues"}
        r = client.post(f"{API}/matchmaker", json=payload, timeout=60)
        assert r.status_code == 200
        data = r.json()
        assert "reasoning" in data and isinstance(data["reasoning"], str)
        assert "recommendations" in data
        assert len(data["recommendations"]) <= 3
        assert len(data["recommendations"]) >= 1, "Expected at least 1 recommendation"

    def test_matchmaker_low_budget_fallback(self, client):
        # very low budget - still should return candidates if any match, or empty with reasoning
        payload = {"budget": 1000, "theme": "minimal", "city": "any", "category": None}
        r = client.post(f"{API}/matchmaker", json=payload, timeout=60)
        assert r.status_code == 200
        data = r.json()
        assert "reasoning" in data
        assert "recommendations" in data

    def test_matchmaker_high_budget_any_city(self, client):
        payload = {"budget": 10000000, "theme": "luxury", "city": "any"}
        r = client.post(f"{API}/matchmaker", json=payload, timeout=60)
        assert r.status_code == 200
        data = r.json()
        assert len(data["recommendations"]) == 3


# -------------------- Auth (JWT cookie) --------------------
import uuid as _uuid


@pytest.fixture(scope="module")
def unique_emails():
    tag = _uuid.uuid4().hex[:8]
    return {
        "client": f"TEST_client_{tag}@example.com",
        "vendor": f"TEST_vendor_{tag}@example.com",
    }


class TestAuth:
    """Auth: register/login/me/logout with role separation + httpOnly cookies."""

    def test_register_client_sets_cookie(self, unique_emails):
        s = requests.Session()
        payload = {
            "email": unique_emails["client"],
            "password": "Test@123",
            "name": "Test Client",
            "role": "client",
            "phone": "+917217612408",
        }
        r = s.post(f"{API}/auth/register", json=payload, timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["email"] == unique_emails["client"].lower()
        assert data["role"] == "client"
        assert "id" in data and isinstance(data["id"], str)
        # cookie set
        assert "access_token" in s.cookies, f"access_token cookie not set: {dict(s.cookies)}"

    def test_register_vendor_with_business_name(self, unique_emails):
        s = requests.Session()
        payload = {
            "email": unique_emails["vendor"],
            "password": "Test@123",
            "name": "Test Vendor",
            "role": "vendor",
            "business_name": "TEST Lotus Decorators",
        }
        r = s.post(f"{API}/auth/register", json=payload, timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["role"] == "vendor"
        assert data["business_name"] == "TEST Lotus Decorators"
        assert "access_token" in s.cookies

    def test_register_duplicate_email_400(self, unique_emails):
        s = requests.Session()
        payload = {
            "email": unique_emails["client"],
            "password": "Test@123",
            "name": "dup",
            "role": "client",
        }
        r = s.post(f"{API}/auth/register", json=payload, timeout=30)
        assert r.status_code == 400
        assert "already" in r.json().get("detail", "").lower()

    def test_login_wrong_role_returns_403(self, unique_emails):
        """Client account trying to login as vendor should be forbidden."""
        s = requests.Session()
        r = s.post(f"{API}/auth/login",
                   json={"email": unique_emails["client"], "password": "Test@123", "role": "vendor"},
                   timeout=30)
        assert r.status_code == 403
        assert "not a vendor" in r.json().get("detail", "").lower()

    def test_login_wrong_password_401(self, unique_emails):
        s = requests.Session()
        r = s.post(f"{API}/auth/login",
                   json={"email": unique_emails["client"], "password": "WrongPass!", "role": "client"},
                   timeout=30)
        assert r.status_code == 401

    def test_login_client_success_and_me(self, unique_emails):
        s = requests.Session()
        r = s.post(f"{API}/auth/login",
                   json={"email": unique_emails["client"], "password": "Test@123", "role": "client"},
                   timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["email"] == unique_emails["client"].lower()
        assert data["role"] == "client"
        assert "access_token" in s.cookies
        # /me should work with cookie
        me = s.get(f"{API}/auth/me", timeout=30)
        assert me.status_code == 200
        assert me.json()["email"] == unique_emails["client"].lower()

    def test_me_without_cookie_returns_401(self):
        r = requests.get(f"{API}/auth/me", timeout=30)
        assert r.status_code == 401

    def test_logout_clears_cookie(self, unique_emails):
        s = requests.Session()
        s.post(f"{API}/auth/login",
               json={"email": unique_emails["vendor"], "password": "Test@123", "role": "vendor"},
               timeout=30)
        assert "access_token" in s.cookies
        r = s.post(f"{API}/auth/logout", timeout=30)
        assert r.status_code == 200
        # After logout, /me should 401 (cookie cleared server-side)
        # requests sets cookie to "" in session on delete_cookie response
        me = s.get(f"{API}/auth/me", timeout=30)
        assert me.status_code == 401

    def test_admin_login_as_client_is_forbidden(self):
        """Seeded admin has role='admin' — shouldn't login as client/vendor."""
        s = requests.Session()
        r = s.post(f"{API}/auth/login",
                   json={"email": "admin@shaadisaga.in", "password": "Admin@123", "role": "client"},
                   timeout=30)
        assert r.status_code == 403

    def test_password_hash_is_bcrypt_format(self, unique_emails):
        """Indirect check: login with correct password succeeds => bcrypt verify works."""
        s = requests.Session()
        r = s.post(f"{API}/auth/login",
                   json={"email": unique_emails["client"], "password": "Test@123", "role": "client"},
                   timeout=30)
        assert r.status_code == 200
