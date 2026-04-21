from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, APIRouter, HTTPException, Query, Request, Response, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import json
import logging
import uuid
import bcrypt
import jwt as pyjwt
from pathlib import Path
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Literal
from datetime import datetime, timezone, timedelta

from seed_data import CATEGORIES, VENDORS, REAL_WEDDINGS

ROOT_DIR = Path(__file__).parent

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_ALGO = "HS256"
def jwt_secret(): return os.environ["JWT_SECRET"]

app = FastAPI(title="Shaadi Saga India API")
api_router = APIRouter(prefix="/api")
logger = logging.getLogger("shaadisaga")

# ============ Models ============
class Vendor(BaseModel):
    id: str
    name: str
    category: str
    city: str
    starting_price: int
    rating: float
    reviews: int
    verified: bool
    tags: List[str] = []
    images: List[str] = []
    description: str

class Category(BaseModel):
    slug: str; name: str; icon: str; image: str; count: int = 0

class RealWedding(BaseModel):
    id: str; title: str; location: str; theme: str; image: str; story: str

class MatchmakerRequest(BaseModel):
    budget: int; theme: str; city: str; category: Optional[str] = None

class MatchmakerResponse(BaseModel):
    reasoning: str; recommendations: List[Vendor]

# Auth
class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(min_length=1)
    role: Literal["client", "vendor"]
    phone: Optional[str] = None
    business_name: Optional[str] = None  # vendor only

class LoginIn(BaseModel):
    email: EmailStr
    password: str
    role: Literal["client", "vendor", "admin"]

class UserOut(BaseModel):
    id: str
    email: str
    name: str
    role: str
    phone: Optional[str] = None
    business_name: Optional[str] = None

# ============ Auth helpers ============
def hash_pw(p: str) -> str:
    return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()

def verify_pw(plain: str, hashed: str) -> bool:
    try: return bcrypt.checkpw(plain.encode(), hashed.encode())
    except Exception: return False

def make_access_token(uid: str, email: str, role: str) -> str:
    return pyjwt.encode({
        "sub": uid, "email": email, "role": role, "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
    }, jwt_secret(), algorithm=JWT_ALGO)

def set_auth_cookie(resp: Response, token: str):
    resp.set_cookie("access_token", token, httponly=True, secure=True, samesite="none", max_age=7*24*3600, path="/")

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        ah = request.headers.get("Authorization", "")
        if ah.startswith("Bearer "): token = ah[7:]
    if not token:
        raise HTTPException(401, "Not authenticated")
    try:
        payload = pyjwt.decode(token, jwt_secret(), algorithms=[JWT_ALGO])
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except pyjwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
    if not user: raise HTTPException(401, "User not found")
    return user

# ============ Auth endpoints ============
@api_router.post("/auth/register", response_model=UserOut)
async def register(body: RegisterIn, response: Response):
    email = body.email.lower().strip()
    if await db.users.find_one({"email": email}):
        raise HTTPException(400, "Email already registered")
    uid = str(uuid.uuid4())
    doc = {
        "id": uid, "email": email, "name": body.name.strip(),
        "password_hash": hash_pw(body.password),
        "role": body.role,
        "phone": body.phone, "business_name": body.business_name,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(doc)
    token = make_access_token(uid, email, body.role)
    set_auth_cookie(response, token)
    return UserOut(id=uid, email=email, name=body.name, role=body.role,
                   phone=body.phone, business_name=body.business_name)

@api_router.post("/auth/login", response_model=UserOut)
async def login(body: LoginIn, response: Response):
    email = body.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_pw(body.password, user["password_hash"]):
        raise HTTPException(401, "Invalid email or password")
    if user.get("role") != body.role:
        raise HTTPException(403, f"This account is not a {body.role} account")
    token = make_access_token(user["id"], email, user["role"])
    set_auth_cookie(response, token)
    return UserOut(id=user["id"], email=user["email"], name=user["name"], role=user["role"],
                   phone=user.get("phone"), business_name=user.get("business_name"))

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}

@api_router.get("/auth/me", response_model=UserOut)
async def me(user: dict = Depends(get_current_user)):
    return UserOut(id=user["id"], email=user["email"], name=user["name"], role=user["role"],
                   phone=user.get("phone"), business_name=user.get("business_name"))

# ============ Contact / Query ============
class QueryIn(BaseModel):
    name: str = Field(min_length=1)
    email: EmailStr
    phone: Optional[str] = None
    city: Optional[str] = None
    subject: str = Field(min_length=1)
    message: str = Field(min_length=5)

class QueryOut(BaseModel):
    id: str
    created_at: str

@api_router.post("/query", response_model=QueryOut)
async def submit_query(body: QueryIn):
    doc = {
        "id": str(uuid.uuid4()),
        "name": body.name.strip(),
        "email": body.email.lower().strip(),
        "phone": body.phone,
        "city": body.city,
        "subject": body.subject.strip(),
        "message": body.message.strip(),
        "status": "new",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.queries.insert_one(doc)
    logger.info(f"New query from {doc['email']}: {doc['subject']}")
    return QueryOut(id=doc["id"], created_at=doc["created_at"])

@api_router.get("/queries")
async def list_queries(user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(403, "Admin only")
    docs = await db.queries.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return docs

# ============ Favourites ============
class FavToggle(BaseModel):
    vendor_id: str

@api_router.post("/favourites/toggle")
async def toggle_favourite(body: FavToggle, user: dict = Depends(get_current_user)):
    if user.get("role") != "client":
        raise HTTPException(403, "Only clients can favourite vendors")
    existing = await db.favourites.find_one({"user_id": user["id"], "vendor_id": body.vendor_id})
    if existing:
        await db.favourites.delete_one({"user_id": user["id"], "vendor_id": body.vendor_id})
        return {"favourited": False}
    await db.favourites.insert_one({
        "user_id": user["id"], "vendor_id": body.vendor_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"favourited": True}

@api_router.get("/favourites")
async def list_favourites(user: dict = Depends(get_current_user)):
    favs = await db.favourites.find({"user_id": user["id"]}, {"_id": 0}).to_list(500)
    ids = [f["vendor_id"] for f in favs]
    if not ids: return {"vendor_ids": [], "vendors": []}
    vendors = await db.vendors.find({"id": {"$in": ids}}, {"_id": 0}).to_list(500)
    return {"vendor_ids": ids, "vendors": vendors}

# ============ Admin Query status ============
class QueryStatusUpdate(BaseModel):
    status: Literal["new", "read", "replied", "closed"]

@api_router.patch("/queries/{query_id}")
async def update_query_status(query_id: str, body: QueryStatusUpdate, user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(403, "Admin only")
    result = await db.queries.update_one({"id": query_id}, {"$set": {"status": body.status}})
    if result.matched_count == 0:
        raise HTTPException(404, "Query not found")
    return {"ok": True, "status": body.status}

@api_router.get("/queries/stats")
async def query_stats(user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(403, "Admin only")
    new = await db.queries.count_documents({"status": "new"})
    total = await db.queries.count_documents({})
    return {"new": new, "total": total}

# ============ Seeding ============
@api_router.post("/seed")
async def seed_db():
    await db.vendors.delete_many({})
    await db.real_weddings.delete_many({})
    for v in VENDORS: await db.vendors.insert_one({**v, "id": str(uuid.uuid4())})
    for w in REAL_WEDDINGS: await db.real_weddings.insert_one({**w, "id": str(uuid.uuid4())})
    return {"vendors": len(VENDORS), "real_weddings": len(REAL_WEDDINGS)}

# ============ Categories ============
@api_router.get("/categories", response_model=List[Category])
async def get_categories():
    result = []
    for c in CATEGORIES:
        count = await db.vendors.count_documents({"category": c["slug"]})
        result.append(Category(slug=c["slug"], name=c["name"], icon=c["emoji_free_icon"], image=c["image"], count=count))
    return result

# ============ Vendors ============
@api_router.get("/vendors", response_model=List[Vendor])
async def list_vendors(
    category: Optional[str] = None, city: Optional[str] = None,
    min_budget: Optional[int] = None, max_budget: Optional[int] = None,
    verified_only: bool = False, min_rating: Optional[float] = None,
    q: Optional[str] = None, limit: int = Query(100, le=200),
):
    query = {}
    if category: query["category"] = category
    if city: query["city"] = {"$regex": city, "$options": "i"}
    if verified_only: query["verified"] = True
    if min_rating is not None: query["rating"] = {"$gte": min_rating}
    price_query = {}
    if min_budget is not None: price_query["$gte"] = min_budget
    if max_budget is not None: price_query["$lte"] = max_budget
    if price_query: query["starting_price"] = price_query
    if q:
        query["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
            {"tags": {"$regex": q, "$options": "i"}},
        ]
    docs = await db.vendors.find(query, {"_id": 0}).sort("rating", -1).to_list(limit)
    return docs

@api_router.get("/vendors/{vendor_id}", response_model=Vendor)
async def get_vendor(vendor_id: str):
    doc = await db.vendors.find_one({"id": vendor_id}, {"_id": 0})
    if not doc: raise HTTPException(404, "Vendor not found")
    return doc

# ============ Real weddings ============
@api_router.get("/real-weddings", response_model=List[RealWedding])
async def get_real_weddings():
    return await db.real_weddings.find({}, {"_id": 0}).to_list(100)

# ============ AI Matchmaker ============
@api_router.post("/matchmaker", response_model=MatchmakerResponse)
async def matchmaker(req: MatchmakerRequest):
    query = {"starting_price": {"$lte": max(req.budget, 1)}}
    if req.category: query["category"] = req.category
    if req.city and req.city.lower() not in ["any", "anywhere", ""]:
        query["city"] = {"$regex": req.city, "$options": "i"}
    candidates = await db.vendors.find(query, {"_id": 0}).sort("rating", -1).to_list(30)
    if not candidates:
        query.pop("city", None)
        candidates = await db.vendors.find(query, {"_id": 0}).sort("rating", -1).to_list(30)
    if not candidates:
        return MatchmakerResponse(
            reasoning="We couldn't find vendors matching your exact budget. Try increasing your budget or broadening location.",
            recommendations=[],
        )
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
    except ImportError:
        return MatchmakerResponse(
            reasoning=f"Top vendors by rating within your budget of ₹{req.budget:,} for a {req.theme} {req.category or 'wedding'} in {req.city}.",
            recommendations=candidates[:3],
        )
    compact = [{"id": c["id"], "name": c["name"], "category": c["category"], "city": c["city"],
                "price": c["starting_price"], "rating": c["rating"], "tags": c["tags"],
                "desc": c["description"][:140]} for c in candidates[:20]]
    system = (
        "You are an expert Indian wedding planner AI matchmaker for a marketplace called ShaadiSagaIndia. "
        "Given a bride's preferences and a shortlist of real vendors, pick the BEST 3 vendors that match the vibe/theme, budget, and city. "
        "Return ONLY a JSON object with keys: reasoning (2-3 sentence warm explanation in English with occasional Hindi wedding words like 'shaadi', 'dulhan'), "
        "and ids (an array of exactly 3 vendor id strings from the provided list). No markdown, no extra keys."
    )
    user_text = (f"Bride's preferences:\n- Budget: ₹{req.budget:,}\n- Theme/Vibe: {req.theme}\n- City: {req.city}\n- Category: {req.category or 'any'}\n\n"
                 f"Vendors (shortlist):\n{json.dumps(compact)}\n\nRespond with JSON only.")
    try:
        chat = LlmChat(api_key=os.environ["EMERGENT_LLM_KEY"],
                       session_id=f"matchmaker-{uuid.uuid4()}", system_message=system
                       ).with_model("anthropic", "claude-sonnet-4-5-20250929")
        reply = await chat.send_message(UserMessage(text=user_text))
        text = reply.strip()
        if text.startswith("```"):
            text = text.strip("`").split("\n", 1)[1] if "\n" in text else text
            if text.endswith("```"): text = text[:-3]
        if text.lstrip().startswith("json"): text = text.lstrip()[4:]
        parsed = json.loads(text.strip())
        ids = parsed.get("ids", [])[:3]
        reasoning = parsed.get("reasoning", "Here are your top 3 matches.")
        recs = [c for c in candidates if c["id"] in ids]
        recs_sorted = sorted(recs, key=lambda r: ids.index(r["id"]) if r["id"] in ids else 99)
        if len(recs_sorted) < 3:
            remaining = [c for c in candidates if c["id"] not in ids][: 3 - len(recs_sorted)]
            recs_sorted.extend(remaining)
        return MatchmakerResponse(reasoning=reasoning, recommendations=recs_sorted[:3])
    except Exception:
        logger.exception("Matchmaker LLM failed")
        return MatchmakerResponse(
            reasoning=f"Top vendors matching ₹{req.budget:,} budget for {req.theme} vibe in {req.city}.",
            recommendations=candidates[:3],
        )

@api_router.get("/")
async def root(): return {"message": "Shaadi Saga India API", "version": "1.1"}

app.include_router(api_router)

# CORS — credentials require explicit origin
frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

@app.on_event("startup")
async def startup():
    # Indexes
    await db.users.create_index("email", unique=True)
    # Seed vendors
    if await db.vendors.count_documents({}) == 0:
        logger.info("Seeding vendors...")
        for v in VENDORS: await db.vendors.insert_one({**v, "id": str(uuid.uuid4())})
        for w in REAL_WEDDINGS: await db.real_weddings.insert_one({**w, "id": str(uuid.uuid4())})
        logger.info("Seed complete.")
    # Seed admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@shaadisaga.in").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "Admin@123")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()), "email": admin_email, "name": "Admin",
            "password_hash": hash_pw(admin_password), "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info(f"Admin seeded: {admin_email}")
    elif not verify_pw(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email},
                                  {"$set": {"password_hash": hash_pw(admin_password)}})

@app.on_event("shutdown")
async def shutdown(): client.close()
