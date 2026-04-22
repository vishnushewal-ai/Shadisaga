"""Seed data for Shaadi Saga vendors, sourced/inspired by the PDF categories + 2026 trends."""

CATEGORIES = [
    {"slug": "venues", "name": "Venues", "emoji_free_icon": "landmark", "image": "https://images.unsplash.com/photo-1519741497674-611481863552?w=800"},
    {"slug": "makeup", "name": "Makeup Artists", "emoji_free_icon": "sparkles", "image": "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800"},
    {"slug": "hotels", "name": "Hotels", "emoji_free_icon": "hotel", "image": "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800"},
    {"slug": "banquet-halls", "name": "Banquet Halls", "emoji_free_icon": "building-2", "image": "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800"},
    {"slug": "photographers", "name": "Photographers", "emoji_free_icon": "camera", "image": "https://images.unsplash.com/photo-1519741497674-611481863552?w=800"},
    {"slug": "planning-decor", "name": "Planning & Decor", "emoji_free_icon": "flower-2", "image": "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800"},
    {"slug": "mehendi", "name": "Mehendi Artists", "emoji_free_icon": "hand", "image": "https://images.unsplash.com/photo-1600101628742-4f4d1f48e0cb?w=800"},
    {"slug": "music-dance", "name": "Music & Dance", "emoji_free_icon": "music", "image": "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800"},
    {"slug": "food", "name": "Food & Catering", "emoji_free_icon": "utensils", "image": "https://images.unsplash.com/photo-1555244162-803834f70033?w=800"},
    {"slug": "invites-gifts", "name": "Invites & Gifts", "emoji_free_icon": "mail", "image": "https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=800"},
    {"slug": "bridal-grooming", "name": "Bridal Grooming", "emoji_free_icon": "scissors", "image": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800"},
    {"slug": "pre-wedding", "name": "Pre-Wedding Shoot", "emoji_free_icon": "heart", "image": "https://images.unsplash.com/photo-1529636798458-92182e662485?w=800"},
    {"slug": "pandits", "name": "Pandits", "emoji_free_icon": "flame", "image": "https://images.unsplash.com/photo-1604608672516-f1b9b1d1cbf4?w=800"},
    {"slug": "bridal-wear", "name": "Bridal Wear", "emoji_free_icon": "shirt", "image": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800"},
    {"slug": "groom-wear", "name": "Groom Wear", "emoji_free_icon": "shirt", "image": "https://images.unsplash.com/photo-1617922001439-4a2e6562f328?w=800"},
    {"slug": "jewellery", "name": "Jewellery & Accessories", "emoji_free_icon": "gem", "image": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800"},
    # 2026 hot categories
    {"slug": "content-creators", "name": "Wedding Content Creators", "emoji_free_icon": "film", "image": "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800"},
    {"slug": "drone-cinematography", "name": "Drone Cinematographers", "emoji_free_icon": "plane", "image": "https://images.unsplash.com/photo-1508614999368-9260051292e5?w=800"},
    {"slug": "eco-vendors", "name": "Eco-Friendly Vendors", "emoji_free_icon": "leaf", "image": "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=800"},
]

VENDORS = [
    # Venues
    {"name": "The Leela Palace", "category": "venues", "city": "New Delhi", "starting_price": 850000, "rating": 4.8, "reviews": 412, "verified": True, "tags": ["Royal", "Luxury", "Destination"], "images": ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900", "https://images.unsplash.com/photo-1519741497674-611481863552?w=900"], "description": "Regal palace setting with manicured Mughal gardens, perfect for grand 500+ guest receptions and intimate micro-weddings alike."},
    {"name": "Taj Chandigarh", "category": "venues", "city": "Chandigarh", "starting_price": 650000, "rating": 4.7, "reviews": 289, "verified": True, "tags": ["Royal", "Classic"], "images": ["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900"], "description": "Heritage-meets-modern luxury with panoramic terraces for haldi & mehendi ceremonies."},
    {"name": "Jaypee Greens Resort", "category": "venues", "city": "Greater Noida", "starting_price": 420000, "rating": 4.5, "reviews": 178, "verified": True, "tags": ["Outdoor", "Poolside"], "images": ["https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=900"], "description": "Sprawling greens ideal for boho-chic and outdoor Indian weddings."},
    {"name": "Roseate House Aerocity", "category": "venues", "city": "New Delhi", "starting_price": 550000, "rating": 4.6, "reviews": 203, "verified": True, "tags": ["Modern", "City"], "images": ["https://images.unsplash.com/photo-1582719508461-905c673771fd?w=900"], "description": "Contemporary luxury hotel with airport proximity, perfect for destination guests."},
    {"name": "Heritage Village Manesar", "category": "venues", "city": "Gurugram", "starting_price": 300000, "rating": 4.3, "reviews": 156, "verified": False, "tags": ["Rustic", "Outdoor"], "images": ["https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=900"], "description": "Traditional village-inspired resort for authentic Indian shaadi experiences."},

    # Makeup Artists
    {"name": "Namrata Soni Artistry", "category": "makeup", "city": "Mumbai", "starting_price": 85000, "rating": 4.9, "reviews": 324, "verified": True, "tags": ["Bollywood", "Bridal", "HD"], "images": ["https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=900"], "description": "Celebrity MUA with 15+ years experience in dewy, editorial bridal looks."},
    {"name": "Aashmeen Munjaal Studio", "category": "makeup", "city": "New Delhi", "starting_price": 45000, "rating": 4.7, "reviews": 412, "verified": True, "tags": ["Airbrush", "Traditional"], "images": ["https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=900"], "description": "Award-winning academy-trained artists specializing in heavy traditional bridal makeup."},
    {"name": "Glow by Priya", "category": "makeup", "city": "Jaipur", "starting_price": 28000, "rating": 4.5, "reviews": 89, "verified": False, "tags": ["Minimal", "Dewy"], "images": ["https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=900"], "description": "Minimalist luxury bridal looks for modern brides who prefer natural glam."},

    # Mehendi (explicitly asked for)
    {"name": "Shalini Mehendi Art", "category": "mehendi", "city": "New Delhi", "starting_price": 12000, "rating": 4.9, "reviews": 520, "verified": True, "tags": ["Fusion", "Minimalist", "Traditional"], "images": ["https://images.unsplash.com/photo-1600101628742-4f4d1f48e0cb?w=900", "https://images.unsplash.com/photo-1610030469668-9abbb7b2b6fc?w=900"], "description": "Two decades of intricate Rajasthani and Arabic mehendi, now offering 2026's most-requested fusion minimalist style."},
    {"name": "Veena Nagda Henna", "category": "mehendi", "city": "Mumbai", "starting_price": 25000, "rating": 4.9, "reviews": 678, "verified": True, "tags": ["Celebrity", "Bridal", "Indo-Arabic"], "images": ["https://images.unsplash.com/photo-1611242320536-f12d3541249b?w=900"], "description": "Celebrity mehendi artist to Bollywood stars. Signature indo-arabic bridal designs with hidden initials."},
    {"name": "Ash Kumar Henna", "category": "mehendi", "city": "New Delhi", "starting_price": 18000, "rating": 4.8, "reviews": 342, "verified": True, "tags": ["Fusion", "Modern"], "images": ["https://images.unsplash.com/photo-1583223802920-0f78c33e1bd6?w=900"], "description": "Globally known for modernist fusion henna — geometric, minimalist, architectural designs for 2026 brides."},
    {"name": "Henna by Nupur", "category": "mehendi", "city": "Bengaluru", "starting_price": 8000, "rating": 4.6, "reviews": 134, "verified": True, "tags": ["Minimalist", "Budget-friendly"], "images": ["https://images.unsplash.com/photo-1623874514711-0f321325f318?w=900"], "description": "Contemporary minimalist henna — perfect for intimate micro-weddings and court marriages."},
    {"name": "Mehendi by Divya", "category": "mehendi", "city": "Jaipur", "starting_price": 6000, "rating": 4.4, "reviews": 78, "verified": False, "tags": ["Traditional", "Rajasthani"], "images": ["https://images.unsplash.com/photo-1600101628742-4f4d1f48e0cb?w=900"], "description": "Authentic Rajasthani dulhan mehendi with traditional motifs and peacock patterns."},

    # Photographers
    {"name": "The Wedding Story", "category": "photographers", "city": "Mumbai", "starting_price": 180000, "rating": 4.8, "reviews": 256, "verified": True, "tags": ["Candid", "Cinematic"], "images": ["https://images.unsplash.com/photo-1519741497674-611481863552?w=900"], "description": "Award-winning candid photography with cinematic storytelling across destination weddings."},
    {"name": "Stories by Joseph Radhik", "category": "photographers", "city": "Bengaluru", "starting_price": 250000, "rating": 4.9, "reviews": 198, "verified": True, "tags": ["Premium", "Editorial"], "images": ["https://images.unsplash.com/photo-1529636798458-92182e662485?w=900"], "description": "India's most sought-after celebrity wedding photographer, editorial style."},
    {"name": "Lens of Love Studio", "category": "photographers", "city": "Chandigarh", "starting_price": 95000, "rating": 4.5, "reviews": 112, "verified": False, "tags": ["Traditional", "Budget"], "images": ["https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=900"], "description": "Full-day coverage with traditional posed portraits and candid moments."},

    # Content creators (2026 hot)
    {"name": "ReelIt Right", "category": "content-creators", "city": "Mumbai", "starting_price": 65000, "rating": 4.8, "reviews": 94, "verified": True, "tags": ["Same-Day-Edit", "Reels", "Vertical"], "images": ["https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=900"], "description": "Same-day Instagram Reels & vertical TikTok content delivered before your vidaai."},
    {"name": "Shaadi Stories Co.", "category": "content-creators", "city": "New Delhi", "starting_price": 45000, "rating": 4.7, "reviews": 67, "verified": True, "tags": ["Social Media", "Viral"], "images": ["https://images.unsplash.com/photo-1517732306149-e8f829eb588a?w=900"], "description": "Trend-savvy creators who make your wedding go viral on reels."},

    # Drone cinematography (2026 hot)
    {"name": "SkyFrames Aerial", "category": "drone-cinematography", "city": "Udaipur", "starting_price": 55000, "rating": 4.8, "reviews": 78, "verified": True, "tags": ["360-degree", "4K", "Destination"], "images": ["https://images.unsplash.com/photo-1508614999368-9260051292e5?w=900"], "description": "FAA-certified pilots capturing 360° ceremony coverage across destination venues."},
    {"name": "DroneDulha", "category": "drone-cinematography", "city": "Jaipur", "starting_price": 35000, "rating": 4.6, "reviews": 54, "verified": True, "tags": ["4K", "Heritage"], "images": ["https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=900"], "description": "Specialists in heritage-palace aerial cinematography."},

    # Eco-vendors (2026 hot)
    {"name": "Green Vows Decor", "category": "eco-vendors", "city": "Bengaluru", "starting_price": 120000, "rating": 4.7, "reviews": 62, "verified": True, "tags": ["Sustainable", "Zero-waste", "Locally-sourced"], "images": ["https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=900"], "description": "Zero-waste floral decor using locally-sourced, compostable materials."},
    {"name": "Digital Invites Co.", "category": "eco-vendors", "city": "Online", "starting_price": 3500, "rating": 4.8, "reviews": 412, "verified": True, "tags": ["E-invite", "Digital", "RSVP"], "images": ["https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=900"], "description": "Paperless digital invites with built-in RSVP tracking — save 400+ trees per wedding."},

    # Planning & Decor
    {"name": "Dreamaker Events", "category": "planning-decor", "city": "New Delhi", "starting_price": 350000, "rating": 4.7, "reviews": 189, "verified": True, "tags": ["Luxury", "Full-service"], "images": ["https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=900"], "description": "Full-service wedding design & planning for 200-2000 guest celebrations."},
    {"name": "Boho Bliss Decor", "category": "planning-decor", "city": "Goa", "starting_price": 180000, "rating": 4.6, "reviews": 98, "verified": True, "tags": ["Boho-Chic", "Beach"], "images": ["https://images.unsplash.com/photo-1519741497674-611481863552?w=900"], "description": "Dreamy boho-chic beach weddings with pampas grass and macrame installations."},

    # Food
    {"name": "Saffron Catering Co.", "category": "food", "city": "New Delhi", "starting_price": 1200, "rating": 4.7, "reviews": 234, "verified": True, "tags": ["Multi-cuisine", "Live-counters"], "images": ["https://images.unsplash.com/photo-1555244162-803834f70033?w=900"], "description": "Per plate pricing. North-Indian, Mughlai, Continental, Italian & live chaat counters."},
    {"name": "Dakshin Flavours", "category": "food", "city": "Chennai", "starting_price": 900, "rating": 4.6, "reviews": 156, "verified": True, "tags": ["South-Indian", "Vegetarian"], "images": ["https://images.unsplash.com/photo-1517244683847-7456b63c5969?w=900"], "description": "Authentic South Indian wedding sadhya — banana leaf service for 500+ guests."},

    # Music & Dance
    {"name": "Sufi Nights by Arjun", "category": "music-dance", "city": "New Delhi", "starting_price": 95000, "rating": 4.8, "reviews": 87, "verified": True, "tags": ["Sufi", "Live-band"], "images": ["https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=900"], "description": "Live sufi qawwali and Bollywood unplugged for sangeet & reception."},
    {"name": "DJ Nitin", "category": "music-dance", "city": "Mumbai", "starting_price": 65000, "rating": 4.5, "reviews": 142, "verified": False, "tags": ["DJ", "Bollywood"], "images": ["https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=900"], "description": "Celebrity DJ with 10,000W sound system, LED dance floors & SFX."},

    # Bridal wear
    {"name": "Sabyasachi", "category": "bridal-wear", "city": "Mumbai", "starting_price": 650000, "rating": 4.9, "reviews": 212, "verified": True, "tags": ["Couture", "Luxury"], "images": ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900"], "description": "India's most celebrated bridal couturier. Heritage-rich lehengas & red Banarasis."},
    {"name": "Manish Malhotra", "category": "bridal-wear", "city": "New Delhi", "starting_price": 450000, "rating": 4.8, "reviews": 178, "verified": True, "tags": ["Bollywood", "Glam"], "images": ["https://images.unsplash.com/photo-1614252358100-9b9f4d3c3e52?w=900"], "description": "Glam bollywood-inspired sharara sets, lehengas & shaadi gowns."},
    {"name": "Frontier Raas", "category": "bridal-wear", "city": "New Delhi", "starting_price": 85000, "rating": 4.5, "reviews": 134, "verified": True, "tags": ["Trendy", "Mid-range"], "images": ["https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=900"], "description": "Trendy silhouettes at accessible pricing — perfect for sangeet & mehendi."},

    # Groom wear
    {"name": "Shantanu & Nikhil", "category": "groom-wear", "city": "New Delhi", "starting_price": 120000, "rating": 4.8, "reviews": 98, "verified": True, "tags": ["Sherwani", "Bandhgala"], "images": ["https://images.unsplash.com/photo-1617922001439-4a2e6562f328?w=900"], "description": "Contemporary sherwanis with architectural silhouettes."},
    {"name": "Tarun Tahiliani Men", "category": "groom-wear", "city": "Mumbai", "starting_price": 180000, "rating": 4.7, "reviews": 76, "verified": True, "tags": ["Couture", "Regal"], "images": ["https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=900"], "description": "Regal couture sherwanis & achkans in rich velvets."},

    # Jewellery
    {"name": "Tanishq Bridal", "category": "jewellery", "city": "Across India", "starting_price": 250000, "rating": 4.7, "reviews": 456, "verified": True, "tags": ["Gold", "Diamond", "Temple"], "images": ["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=900"], "description": "Pan-India trusted bridal jewellery — polki, kundan, temple, diamond."},
    {"name": "Amrapali Jaipur", "category": "jewellery", "city": "Jaipur", "starting_price": 150000, "rating": 4.8, "reviews": 167, "verified": True, "tags": ["Silver", "Heritage", "Polki"], "images": ["https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=900"], "description": "Heritage Rajasthani polki & silver artisanal jewellery."},

    # Pandits
    {"name": "Pandit Shastri Ji", "category": "pandits", "city": "New Delhi", "starting_price": 15000, "rating": 4.7, "reviews": 234, "verified": True, "tags": ["Vedic", "Multilingual"], "images": ["https://images.unsplash.com/photo-1604608672516-f1b9b1d1cbf4?w=900"], "description": "35+ years officiating vedic hindu weddings. Available in Hindi, Sanskrit, English."},

    # Pre-wedding
    {"name": "Pixel Stories Pre-Wedding", "category": "pre-wedding", "city": "Goa", "starting_price": 75000, "rating": 4.6, "reviews": 112, "verified": True, "tags": ["Destination", "Cinematic"], "images": ["https://images.unsplash.com/photo-1529636798458-92182e662485?w=900"], "description": "Destination pre-wedding shoots in Goa, Udaipur, Santorini & Bali."},

    # Hotels
    {"name": "The Oberoi Udaivilas", "category": "hotels", "city": "Udaipur", "starting_price": 950000, "rating": 4.9, "reviews": 289, "verified": True, "tags": ["Palace", "Destination", "Lake-view"], "images": ["https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=900"], "description": "Lake Pichola palace-on-water — India's most iconic destination wedding hotel."},

    # Banquet halls
    {"name": "Vivanta Dwarka Banquet", "category": "banquet-halls", "city": "New Delhi", "starting_price": 180000, "rating": 4.4, "reviews": 156, "verified": True, "tags": ["Indoor", "500-guests"], "images": ["https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=900"], "description": "Pillar-less banquet hall accommodating 500 guests, in-house catering."},

    # Bridal grooming
    {"name": "Lakmé Salon Bridal", "category": "bridal-grooming", "city": "Across India", "starting_price": 25000, "rating": 4.5, "reviews": 567, "verified": True, "tags": ["Pre-bridal", "Packages"], "images": ["https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=900"], "description": "30-day pre-bridal grooming packages across 300+ salons."},

    # Invites & gifts
    {"name": "Wedding Wrap Co.", "category": "invites-gifts", "city": "Mumbai", "starting_price": 850, "rating": 4.6, "reviews": 234, "verified": True, "tags": ["Trousseau", "Return-gifts"], "images": ["https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=900"], "description": "Curated return-gift hampers and trousseau packaging."},
]

REAL_WEDDINGS = [
    {"title": "Almeida & Jaime's Goa Beach Shaadi", "location": "Goa", "theme": "Boho-Beach", "image": "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200", "story": "An intimate 80-guest sunset shaadi on Ashwem Beach with pampas grass mandap and live qawwali. Featured on @shaadisagaindia."},
    {"title": "Priya & Arjun's Udaipur Palace", "location": "Udaipur", "theme": "Royal", "image": "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200", "story": "Lake Pichola ceremony with 300 guests, drone cinematography, and a Sabyasachi bride. Planned with Shaadi Saga India."},
    {"title": "Neha & Rohit's Delhi Farmhouse", "location": "New Delhi", "theme": "Minimalist Luxe", "image": "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200", "story": "Micro-wedding of 50 with editorial photography, zero-waste florals and pastel mehendi. Go-to vendors via Shaadi Saga."},
    {"title": "Sara & Dev's Bengaluru Garden", "location": "Bengaluru", "theme": "Eco-Boho", "image": "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=1200", "story": "All-vegetarian eco-friendly wedding with digital invites and live tabla. Matched by our AI Matchmaker."},
    {"title": "Isha & Karan's Jaipur Haveli", "location": "Jaipur", "theme": "Rajwada", "image": "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200", "story": "A 3-day royal haveli shaadi with authentic Rajasthani mehendi, baithak dinners, and a pearl-themed reception."},
    {"title": "Anaya & Vihaan's Mumbai Rooftop", "location": "Mumbai", "theme": "Modern Glam", "image": "https://images.unsplash.com/photo-1529636798458-92182e662485?w=1200", "story": "Sky-high Bandra rooftop nikaah with fireworks, live Sufi band, and a Manish Malhotra bride. 150 guests."},
]


# Contact info + extended gallery enrichment
import hashlib as _h
GALLERY_POOL = [
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=900",
    "https://images.unsplash.com/photo-1529636798458-92182e662485?w=900",
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=900",
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=900",
    "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=900",
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900",
    "https://images.unsplash.com/photo-1555244162-803834f70033?w=900",
    "https://images.unsplash.com/photo-1600101628742-4f4d1f48e0cb?w=900",
    "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=900",
    "https://images.unsplash.com/photo-1508614999368-9260051292e5?w=900",
    "https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=900",
    "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=900",
    "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=900",
    "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=900",
    "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=900",
    "https://images.unsplash.com/photo-1617922001439-4a2e6562f328?w=900",
]

def _slugify(name: str) -> str:
    return "".join(c.lower() if c.isalnum() else "" for c in name)[:20] or "vendor"

for _v in VENDORS:
    # deterministic gallery: pick 5-6 unique images from pool
    seed = int(_h.md5(_v["name"].encode()).hexdigest(), 16)
    pool = list(GALLERY_POOL)
    picked = []
    for _ in range(6):
        idx = seed % len(pool)
        picked.append(pool.pop(idx))
        seed //= 7 or 1
        if not pool: break
    # keep original first image + append more
    _v["images"] = [_v["images"][0]] + [p for p in picked if p not in _v["images"]]
    # contact info
    slug = _slugify(_v["name"])
    _v["contact_phone"] = _v.get("contact_phone") or f"+91 98{(seed%90)+10}{seed%100:02d} {(seed//10)%90000:05d}"
    _v["contact_email"] = _v.get("contact_email") or f"hello@{slug}.in"
    _v["contact_instagram"] = _v.get("contact_instagram") or f"https://instagram.com/{slug}"
    if _v["category"] in {"venues", "hotels", "banquet-halls"}:
        _v["contact_website"] = _v.get("contact_website") or f"https://{slug}.com"
