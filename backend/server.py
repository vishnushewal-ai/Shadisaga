from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import json
import logging
import uuid
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone

from seed_data import CATEGORIES, VENDORS, REAL_WEDDINGS

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Shaadi Saga India API")
api_router = APIRouter(prefix="/api")


# -------------------- Models --------------------
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
    slug: str
    name: str
    icon: str
    image: str
    count: int = 0


class RealWedding(BaseModel):
    id: str
    title: str
    location: str
    theme: str
    image: str
    story: str


class MatchmakerRequest(BaseModel):
    budget: int
    theme: str
    city: str
    category: Optional[str] = None


class MatchmakerResponse(BaseModel):
    reasoning: str
    recommendations: List[Vendor]


# -------------------- Seeding --------------------
@api_router.post("/seed")
async def seed_db():
    """Idempotent seed."""
    await db.vendors.delete_many({})
    await db.real_weddings.delete_many({})

    for v in VENDORS:
        doc = {**v, "id": str(uuid.uuid4())}
        await db.vendors.insert_one(doc)

    for w in REAL_WEDDINGS:
        doc = {**w, "id": str(uuid.uuid4())}
        await db.real_weddings.insert_one(doc)

    return {"vendors": len(VENDORS), "real_weddings": len(REAL_WEDDINGS)}


# -------------------- Categories --------------------
@api_router.get("/categories", response_model=List[Category])
async def get_categories():
    result = []
    for c in CATEGORIES:
        count = await db.vendors.count_documents({"category": c["slug"]})
        result.append(Category(
            slug=c["slug"],
            name=c["name"],
            icon=c["emoji_free_icon"],
            image=c["image"],
            count=count,
        ))
    return result


# -------------------- Vendors --------------------
@api_router.get("/vendors", response_model=List[Vendor])
async def list_vendors(
    category: Optional[str] = None,
    city: Optional[str] = None,
    min_budget: Optional[int] = None,
    max_budget: Optional[int] = None,
    verified_only: bool = False,
    min_rating: Optional[float] = None,
    q: Optional[str] = None,
    limit: int = Query(100, le=200),
):
    query = {}
    if category:
        query["category"] = category
    if city:
        query["city"] = {"$regex": city, "$options": "i"}
    if verified_only:
        query["verified"] = True
    if min_rating is not None:
        query["rating"] = {"$gte": min_rating}

    price_query = {}
    if min_budget is not None:
        price_query["$gte"] = min_budget
    if max_budget is not None:
        price_query["$lte"] = max_budget
    if price_query:
        query["starting_price"] = price_query

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
    if not doc:
        raise HTTPException(404, "Vendor not found")
    return doc


# -------------------- Real weddings --------------------
@api_router.get("/real-weddings", response_model=List[RealWedding])
async def get_real_weddings():
    docs = await db.real_weddings.find({}, {"_id": 0}).to_list(100)
    return docs


# -------------------- AI Matchmaker --------------------
@api_router.post("/matchmaker", response_model=MatchmakerResponse)
async def matchmaker(req: MatchmakerRequest):
    # Pre-filter candidates from DB
    query = {
        "starting_price": {"$lte": max(req.budget, 1)},
    }
    if req.category:
        query["category"] = req.category
    if req.city and req.city.lower() not in ["any", "anywhere", ""]:
        query["city"] = {"$regex": req.city, "$options": "i"}

    candidates = await db.vendors.find(query, {"_id": 0}).sort("rating", -1).to_list(30)

    if not candidates:
        # relax city filter
        query.pop("city", None)
        candidates = await db.vendors.find(query, {"_id": 0}).sort("rating", -1).to_list(30)

    if not candidates:
        return MatchmakerResponse(
            reasoning="We couldn't find vendors matching your exact budget. Try increasing your budget or broadening location.",
            recommendations=[],
        )

    # Build compact prompt
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
    except ImportError:
        # Fallback — top 3 by rating
        return MatchmakerResponse(
            reasoning=f"Top {min(3,len(candidates))} vendors by rating within your budget of ₹{req.budget:,} for a {req.theme} {req.category or 'wedding'} in {req.city}.",
            recommendations=candidates[:3],
        )

    compact = [
        {"id": c["id"], "name": c["name"], "category": c["category"], "city": c["city"],
         "price": c["starting_price"], "rating": c["rating"], "tags": c["tags"],
         "desc": c["description"][:140]}
        for c in candidates[:20]
    ]

    system = (
        "You are an expert Indian wedding planner AI matchmaker for a marketplace called Shaadi Saga India. "
        "Given a bride's preferences and a shortlist of real vendors, pick the BEST 3 vendors that match the vibe/theme, budget, and city. "
        "Return ONLY a JSON object with keys: reasoning (2-3 sentence warm explanation in English with occasional Hindi wedding words like 'shaadi', 'dulhan'), "
        "and ids (an array of exactly 3 vendor id strings from the provided list). No markdown, no extra keys."
    )

    user_text = (
        f"Bride's preferences:\n"
        f"- Budget: ₹{req.budget:,}\n"
        f"- Theme/Vibe: {req.theme}\n"
        f"- City: {req.city}\n"
        f"- Category: {req.category or 'any'}\n\n"
        f"Vendors (shortlist):\n{json.dumps(compact)}\n\n"
        f"Respond with JSON only."
    )

    try:
        chat = LlmChat(
            api_key=os.environ["EMERGENT_LLM_KEY"],
            session_id=f"matchmaker-{uuid.uuid4()}",
            system_message=system,
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")
        reply = await chat.send_message(UserMessage(text=user_text))
        # parse
        text = reply.strip()
        if text.startswith("```"):
            text = text.strip("`").split("\n", 1)[1] if "\n" in text else text
            if text.endswith("```"):
                text = text[:-3]
        # remove leading json marker
        if text.lstrip().startswith("json"):
            text = text.lstrip()[4:]
        parsed = json.loads(text.strip())
        ids = parsed.get("ids", [])[:3]
        reasoning = parsed.get("reasoning", "Here are your top 3 matches.")
        recs = [c for c in candidates if c["id"] in ids]
        # preserve order from LLM
        recs_sorted = sorted(recs, key=lambda r: ids.index(r["id"]) if r["id"] in ids else 99)
        if len(recs_sorted) < 3:
            # pad with top-rated remaining
            remaining = [c for c in candidates if c["id"] not in ids][: 3 - len(recs_sorted)]
            recs_sorted.extend(remaining)
        return MatchmakerResponse(reasoning=reasoning, recommendations=recs_sorted[:3])
    except Exception as e:
        logger.exception("Matchmaker LLM failed")
        return MatchmakerResponse(
            reasoning=f"Top {min(3,len(candidates))} vendors matching ₹{req.budget:,} budget for {req.theme} vibe in {req.city}.",
            recommendations=candidates[:3],
        )


@api_router.get("/")
async def root():
    return {"message": "Shaadi Saga India API", "version": "1.0"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def startup_seed():
    count = await db.vendors.count_documents({})
    if count == 0:
        logger.info("Seeding database...")
        for v in VENDORS:
            await db.vendors.insert_one({**v, "id": str(uuid.uuid4())})
        for w in REAL_WEDDINGS:
            await db.real_weddings.insert_one({**w, "id": str(uuid.uuid4())})
        logger.info("Seed complete.")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
