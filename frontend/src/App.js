import { useEffect, useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  Search, MapPin, Star, Shield, ArrowRight, Sparkles, Menu, X, Phone,
  Heart, Camera, Flame, Gem, Music, Utensils, Mail, Scissors, Hand, Leaf,
  Plane, Film, Landmark, Building2, Flower2, ChevronRight, Check, Filter
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ICONS = {
  landmark: Landmark, sparkles: Sparkles, hotel: Building2, "building-2": Building2,
  camera: Camera, "flower-2": Flower2, hand: Hand, music: Music, utensils: Utensils,
  mail: Mail, scissors: Scissors, heart: Heart, flame: Flame, shirt: Sparkles,
  gem: Gem, film: Film, plane: Plane, leaf: Leaf,
};

const formatINR = (n) => {
  if (n >= 10000000) return `₹${(n/10000000).toFixed(1)} Cr`;
  if (n >= 100000) return `₹${(n/100000).toFixed(1)} L`;
  if (n >= 1000) return `₹${(n/1000).toFixed(0)}K`;
  return `₹${n}`;
};

// ======================== NAVBAR ========================
function Navbar() {
  const [open, setOpen] = useState(false);
  const links = [
    { to: "/vendors", label: "Venues" },
    { to: "/vendors?category=photographers", label: "Photos" },
    { to: "/vendors", label: "Vendors" },
    { to: "/real-weddings", label: "Real Weddings" },
    { to: "/vendors?category=eco-vendors", label: "E-Invites" },
  ];
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[var(--ivory)]/85 border-b border-[var(--border-warm)]" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between h-20">
        <Link to="/" data-testid="nav-logo" className="flex flex-col leading-none">
          <span className="font-display text-2xl lg:text-3xl font-800 text-[var(--maroon-deep)] tracking-tight">
            Shaadi<span className="text-[var(--gold)]"> Saga</span>
          </span>
          <span className="text-[10px] tracking-[0.3em] uppercase text-[var(--maroon)]/70 mt-0.5">India · Est. 2026</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-10">
          <button className="flex items-center gap-1.5 text-sm font-semibold text-[var(--maroon-deep)]">
            <MapPin size={14} /> DELHI NCR
          </button>
          {links.map(l => (
            <Link key={l.label} to={l.to} data-testid={`nav-${l.label.toLowerCase().replace(/\s/g,'-')}`} className="text-[13px] font-semibold uppercase tracking-widest text-[var(--ink)] hover:text-[var(--maroon)] transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden lg:flex items-center gap-4">
          <Link to="/matchmaker" data-testid="nav-matchmaker" className="btn-gold !py-2.5 !px-5 text-sm">
            <Sparkles size={16} /> AI Matchmaker
          </Link>
        </div>
        <button onClick={() => setOpen(!open)} className="lg:hidden text-[var(--maroon-deep)]" data-testid="nav-mobile-toggle">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden border-t border-[var(--border-warm)] bg-[var(--ivory)] px-6 py-4 space-y-3">
          {links.map(l => (
            <Link key={l.label} to={l.to} onClick={() => setOpen(false)} className="block text-sm font-semibold uppercase tracking-widest text-[var(--ink)]">{l.label}</Link>
          ))}
          <Link to="/matchmaker" onClick={() => setOpen(false)} className="btn-gold !w-full justify-center !py-3 text-sm"><Sparkles size={16}/> AI Matchmaker</Link>
        </div>
      )}
    </header>
  );
}

// ======================== FOOTER ========================
function Footer() {
  return (
    <footer className="bg-[var(--maroon-ink)] text-[var(--ivory)]/80 mt-24" data-testid="footer">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 grid md:grid-cols-4 gap-10">
        <div>
          <div className="font-display text-3xl text-[var(--ivory)]">Shaadi <span className="text-[var(--gold)]">Saga</span></div>
          <p className="text-sm mt-3 leading-relaxed">Bringing you the best of Indian weddings with a twist of tradition &amp; swag — since 2026.</p>
        </div>
        <div>
          <h4 className="text-[var(--gold)] uppercase text-xs tracking-widest mb-4">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/vendors">All Vendors</Link></li>
            <li><Link to="/vendors?category=venues">Venues</Link></li>
            <li><Link to="/vendors?category=mehendi">Mehendi Artists</Link></li>
            <li><Link to="/real-weddings">Real Weddings</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[var(--gold)] uppercase text-xs tracking-widest mb-4">2026 New</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/matchmaker">AI Matchmaker</Link></li>
            <li><Link to="/vendors?category=content-creators">Content Creators</Link></li>
            <li><Link to="/vendors?category=drone-cinematography">Drone Cinema</Link></li>
            <li><Link to="/vendors?category=eco-vendors">Eco Vendors</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[var(--gold)] uppercase text-xs tracking-widest mb-4">Contact</h4>
          <p className="text-sm flex items-center gap-2"><Phone size={14}/> +91 98765 43210</p>
          <p className="text-sm flex items-center gap-2 mt-2"><Mail size={14}/> hello@shaadisaga.in</p>
        </div>
      </div>
      <div className="border-t border-[var(--ivory)]/10 py-5 text-center text-xs text-[var(--ivory)]/50">© 2026 Shaadi Saga India · All shaadi, no drama.</div>
    </footer>
  );
}

// ======================== HOME ========================
function Home() {
  const [categories, setCategories] = useState([]);
  const [realWeddings, setRealWeddings] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [search, setSearch] = useState({ city: "", category: "", budget: 500000 });
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API}/categories`).then(r => setCategories(r.data)).catch(()=>{});
    axios.get(`${API}/real-weddings`).then(r => setRealWeddings(r.data)).catch(()=>{});
    axios.get(`${API}/vendors?limit=6&verified_only=true`).then(r => setFeatured(r.data)).catch(()=>{});
  }, []);

  const popularSearches = [
    "Wedding Venues in Delhi NCR", "Bridal Makeup Mumbai", "Mehendi Artists Jaipur",
    "Destination Udaipur", "Content Creators", "Boho Decor", "Drone Cinematography"
  ];

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search.category) params.set("category", search.category);
    if (search.city) params.set("city", search.city);
    if (search.budget) params.set("max_budget", search.budget);
    navigate(`/vendors?${params.toString()}`);
  };

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section className="relative overflow-hidden grain" data-testid="home-hero">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1519741497674-611481863552?w=2000&q=80" alt="" className="w-full h-full object-cover"/>
          <div className="absolute inset-0 hero-fade"/>
        </div>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-20 pb-28 lg:pt-28 lg:pb-36">
          <div className="max-w-3xl fade-up">
            <div className="ornament !text-[var(--gold-soft)] mb-6 !justify-start"><span>Est. 2026 · Delhi NCR</span></div>
            <h1 className="font-display text-5xl md:text-7xl lg:text-[92px] leading-[0.95] text-[var(--ivory)] font-500 tracking-tight">
              The best of <br/>
              <em className="italic text-[var(--gold-soft)] font-600">Indian weddings</em>, <br/>
              with a twist of <span className="underline decoration-[var(--gold)] decoration-4 underline-offset-[10px]">swag</span>.
            </h1>
            <p className="text-[var(--ivory)]/85 text-lg md:text-xl mt-7 max-w-xl leading-relaxed">
              Verified vendors. Transparent prices. A matchmaker powered by AI.
              From dulhan's mehendi to the grand mandap — plan your shaadi, your way.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative mt-14 fade-up delay-2">
            <div className="bg-[var(--ivory)] rounded-3xl p-3 md:p-5 shadow-2xl border border-[var(--gold)]/30 grid md:grid-cols-[1.3fr_1.3fr_2fr_auto] gap-3 items-end">
              <div className="px-3">
                <label className="text-[10px] uppercase tracking-widest text-[var(--maroon)] font-bold">City</label>
                <input data-testid="hero-search-city" value={search.city} onChange={e=>setSearch({...search, city:e.target.value})} placeholder="Delhi, Mumbai, Udaipur…" className="w-full bg-transparent outline-none text-[var(--ink)] placeholder:text-[var(--ink)]/40 text-base py-1.5"/>
              </div>
              <div className="px-3 md:border-l md:border-[var(--border-warm)]">
                <label className="text-[10px] uppercase tracking-widest text-[var(--maroon)] font-bold">Category</label>
                <select data-testid="hero-search-category" value={search.category} onChange={e=>setSearch({...search, category:e.target.value})} className="w-full bg-transparent outline-none text-[var(--ink)] text-base py-1.5">
                  <option value="">Any category</option>
                  {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                </select>
              </div>
              <div className="px-3 md:border-l md:border-[var(--border-warm)]">
                <label className="text-[10px] uppercase tracking-widest text-[var(--maroon)] font-bold flex justify-between">
                  <span>Budget (up to)</span>
                  <span className="text-[var(--maroon-deep)] font-display font-700 not-italic">{formatINR(search.budget)}</span>
                </label>
                <input data-testid="hero-search-budget" type="range" min="10000" max="10000000" step="10000" value={search.budget} onChange={e=>setSearch({...search, budget:parseInt(e.target.value)})} className="shaadi-range mt-2"/>
              </div>
              <button data-testid="hero-search-submit" onClick={handleSearch} className="btn-primary !py-4 justify-center">
                <Search size={18}/> Search
              </button>
            </div>
          </div>

          {/* Popular searches */}
          <div className="mt-10 fade-up delay-3">
            <p className="text-[var(--ivory)]/70 text-xs uppercase tracking-[0.25em] mb-3">Popular searches</p>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map(p => (
                <Link key={p} to="/vendors" data-testid={`popular-${p.toLowerCase().replace(/\s/g,'-')}`} className="chip hover:bg-[var(--gold)] hover:text-[var(--maroon-deep)] transition-colors">{p}</Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="bg-[var(--maroon-deep)] text-[var(--ivory)] py-4 overflow-hidden">
        <div className="marquee text-sm">
          {[...Array(2)].map((_,i) => (
            <div key={i} className="flex gap-12 items-center">
              <span className="flex items-center gap-2"><Shield size={14} className="text-[var(--gold)]"/> 100% Verified Vendors</span>
              <span className="font-display italic text-[var(--gold)]">·</span>
              <span className="flex items-center gap-2"><Star size={14} className="text-[var(--gold)]"/> Real Reviews Only</span>
              <span className="font-display italic text-[var(--gold)]">·</span>
              <span className="flex items-center gap-2"><Sparkles size={14} className="text-[var(--gold)]"/> Transparent Starting Prices</span>
              <span className="font-display italic text-[var(--gold)]">·</span>
              <span className="flex items-center gap-2"><Heart size={14} className="text-[var(--gold)]"/> AI-Powered Matchmaking</span>
              <span className="font-display italic text-[var(--gold)]">·</span>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-24 mandala-bg" data-testid="home-categories">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
          <div>
            <div className="ornament !justify-start mb-3"><span>Plan every ceremony</span></div>
            <h2 className="font-display text-4xl md:text-5xl text-[var(--maroon-ink)] font-500 leading-tight">Wedding <em className="italic text-[var(--maroon)]">Categories</em></h2>
          </div>
          <Link to="/vendors" className="link-u text-sm">Browse all vendors <ArrowRight size={14} className="inline"/></Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.map((c, i) => {
            const Icon = ICONS[c.icon] || Sparkles;
            return (
              <Link key={c.slug} to={`/vendors?category=${c.slug}`} data-testid={`category-${c.slug}`} className="card-warm group fade-up" style={{animationDelay: `${i*40}ms`}}>
                <div className="relative h-36 overflow-hidden">
                  <img src={c.image} alt={c.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--maroon-ink)]/70 via-transparent to-transparent"/>
                  <div className="absolute top-3 left-3 w-9 h-9 rounded-full bg-[var(--ivory)] flex items-center justify-center text-[var(--maroon)]">
                    <Icon size={16}/>
                  </div>
                </div>
                <div className="p-4">
                  <div className="font-display text-lg font-600 text-[var(--maroon-ink)] leading-tight">{c.name}</div>
                  <div className="text-xs text-[var(--ink)]/60 mt-1">{c.count} vendors</div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* AI MATCHMAKER CTA */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16" data-testid="home-matchmaker-cta">
        <div className="relative rounded-[32px] overflow-hidden bg-gradient-to-br from-[var(--maroon-deep)] via-[var(--maroon)] to-[var(--maroon-ink)] p-10 md:p-16 text-[var(--ivory)]">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--gold)]/15 rounded-full blur-3xl -mr-20 -mt-20"/>
          <div className="relative grid md:grid-cols-[1.3fr_1fr] gap-10 items-center">
            <div>
              <div className="chip !bg-[var(--gold)]/20 !text-[var(--gold-soft)] !border-[var(--gold)]/40 mb-5"><Sparkles size={12}/> New · 2026</div>
              <h2 className="font-display text-4xl md:text-6xl font-500 leading-[1.05]">Let our <em className="italic text-[var(--gold-soft)]">AI Matchmaker</em> find your vendors.</h2>
              <p className="text-[var(--ivory)]/80 mt-5 text-lg max-w-xl">Tell us your budget, vibe &amp; city — we'll hand-pick 3 vendors that match your shaadi's soul.</p>
              <Link to="/matchmaker" className="btn-gold mt-7" data-testid="home-matchmaker-btn"><Sparkles size={16}/> Try Matchmaker <ArrowRight size={14}/></Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {["Budget","Theme","City"].map((t,i) => (
                <div key={t} className="bg-[var(--ivory)]/5 border border-[var(--ivory)]/15 rounded-2xl p-4 backdrop-blur-sm">
                  <div className="text-[var(--gold-soft)] font-display text-3xl font-700">0{i+1}</div>
                  <div className="text-sm mt-2">{t}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED VENDORS */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16" data-testid="home-featured">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
            <div>
              <div className="ornament !justify-start mb-3"><span>Handpicked · Verified</span></div>
              <h2 className="font-display text-4xl md:text-5xl text-[var(--maroon-ink)] font-500">Featured <em className="italic text-[var(--maroon)]">Vendors</em></h2>
            </div>
            <Link to="/vendors" className="link-u text-sm">View all <ArrowRight size={14} className="inline"/></Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map(v => <VendorCard key={v.id} vendor={v}/>)}
          </div>
        </section>
      )}

      {/* REAL WEDDINGS */}
      {realWeddings.length > 0 && (
        <section className="bg-[var(--ivory-2)] py-20" data-testid="home-real-weddings">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
              <div>
                <div className="ornament !justify-start mb-3"><span>Love in action</span></div>
                <h2 className="font-display text-4xl md:text-5xl text-[var(--maroon-ink)] font-500">Real <em className="italic text-[var(--maroon)]">Shaadi</em> Stories</h2>
              </div>
              <Link to="/real-weddings" className="link-u text-sm">All stories <ArrowRight size={14} className="inline"/></Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {realWeddings.map((w, i) => (
                <div key={w.id} className="card-warm group fade-up" style={{animationDelay: `${i*60}ms`}} data-testid={`realwedding-${i}`}>
                  <div className="relative h-64 overflow-hidden">
                    <img src={w.image} alt={w.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"/>
                    <div className="absolute top-3 right-3 chip !bg-[var(--ivory)]/90 !text-[var(--maroon)]">{w.theme}</div>
                  </div>
                  <div className="p-5">
                    <div className="text-xs text-[var(--maroon)] font-bold uppercase tracking-widest">{w.location}</div>
                    <div className="font-display text-lg font-600 mt-2 text-[var(--maroon-ink)] leading-snug">{w.title}</div>
                    <p className="text-sm text-[var(--ink)]/70 mt-2 leading-relaxed line-clamp-3">{w.story}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SSI INHOUSE / WHY CHOOSE */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-24" data-testid="home-why">
        <div className="text-center mb-14">
          <div className="ornament mb-4"><span>Why Shaadi Saga</span></div>
          <h2 className="font-display text-4xl md:text-5xl text-[var(--maroon-ink)] font-500">Built for the <em className="italic text-[var(--maroon)]">2026 couple</em>.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {icon: Shield, title: "Verified vendors only", desc: "Every vendor's GST &amp; 3 client references checked before the badge."},
            {icon: Sparkles, title: "AI Matchmaker", desc: "Describe your vibe. We match you with vendors who get it — in seconds."},
            {icon: Heart, title: "Direct chat & prices", desc: "No 'contact for pricing'. Real starting prices, real-time chat — no middlemen."},
          ].map(b => (
            <div key={b.title} className="card-warm p-8">
              <div className="w-12 h-12 rounded-full bg-[var(--maroon)] text-[var(--gold-soft)] flex items-center justify-center mb-5"><b.icon size={22}/></div>
              <h3 className="font-display text-2xl font-600 text-[var(--maroon-ink)]">{b.title}</h3>
              <p className="text-[var(--ink)]/70 mt-3 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ======================== VENDOR CARD ========================
function VendorCard({ vendor }) {
  return (
    <Link to={`/vendor/${vendor.id}`} className="card-warm group block fade-up" data-testid={`vendor-card-${vendor.id}`}>
      <div className="relative h-60 overflow-hidden">
        <img src={vendor.images[0]} alt={vendor.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" onError={(e)=>{e.target.src="https://images.unsplash.com/photo-1519741497674-611481863552?w=900";}}/>
        {vendor.verified && <div className="verified-badge absolute top-3 left-3"><Shield size={10}/> Verified</div>}
        <div className="absolute top-3 right-3 chip !bg-[var(--ivory)]/95 !border-[var(--gold)]/40">
          <Star size={12} className="fill-[var(--gold)] text-[var(--gold)]"/> {vendor.rating} <span className="text-[var(--ink)]/50 font-normal">({vendor.reviews})</span>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-1.5 text-xs text-[var(--maroon)] font-bold uppercase tracking-widest"><MapPin size={11}/> {vendor.city}</div>
        <h3 className="font-display text-xl font-600 mt-2 text-[var(--maroon-ink)] leading-snug group-hover:text-[var(--maroon)] transition-colors">{vendor.name}</h3>
        <p className="text-sm text-[var(--ink)]/70 mt-2 line-clamp-2 leading-relaxed">{vendor.description}</p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {vendor.tags.slice(0,3).map(t => <span key={t} className="text-[10px] font-semibold px-2 py-1 rounded-full bg-[var(--ivory-2)] text-[var(--maroon-deep)]">{t}</span>)}
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--border-warm)]">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-[var(--ink)]/50">Starting at</div>
            <div className="font-display text-2xl font-700 text-[var(--maroon-ink)]">{formatINR(vendor.starting_price)}</div>
          </div>
          <div className="flex items-center gap-1 text-[var(--maroon)] font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
            View <ArrowRight size={14}/>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ======================== VENDORS LISTING ========================
function Vendors() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [vendors, setVendors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    city: searchParams.get("city") || "",
    max_budget: parseInt(searchParams.get("max_budget") || "10000000"),
    min_budget: 0,
    verified_only: false,
    min_rating: 0,
    q: "",
  });

  useEffect(() => {
    axios.get(`${API}/categories`).then(r => setCategories(r.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (filters.category) params.category = filters.category;
    if (filters.city) params.city = filters.city;
    if (filters.max_budget < 10000000) params.max_budget = filters.max_budget;
    if (filters.min_budget > 0) params.min_budget = filters.min_budget;
    if (filters.verified_only) params.verified_only = true;
    if (filters.min_rating > 0) params.min_rating = filters.min_rating;
    if (filters.q) params.q = filters.q;

    axios.get(`${API}/vendors`, { params })
      .then(r => { setVendors(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [filters]);

  const updateFilter = (k, v) => setFilters({ ...filters, [k]: v });

  const activeCat = categories.find(c => c.slug === filters.category);

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12" data-testid="vendors-page">
      <div className="mb-10 fade-up">
        <div className="ornament !justify-start mb-3"><span>Browse &amp; book</span></div>
        <h1 className="font-display text-5xl md:text-6xl font-500 text-[var(--maroon-ink)]">
          {activeCat ? <><em className="italic text-[var(--maroon)]">{activeCat.name}</em></> : <>All <em className="italic text-[var(--maroon)]">Vendors</em></>}
        </h1>
        <p className="text-[var(--ink)]/60 mt-3 max-w-2xl">{vendors.length} vendors match your filters. Transparent starting prices — no "contact for quote" nonsense.</p>
      </div>

      <div className="grid lg:grid-cols-[300px_1fr] gap-10">
        {/* Filters */}
        <aside className="bg-[#FFFDF7] border border-[var(--border-warm)] rounded-3xl p-6 h-fit lg:sticky lg:top-28" data-testid="vendors-filters">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-xl font-600 text-[var(--maroon-ink)] flex items-center gap-2"><Filter size={16}/> Filters</h3>
            <button onClick={() => setFilters({category:"", city:"", max_budget:10000000, min_budget:0, verified_only:false, min_rating:0, q:""})} className="text-xs text-[var(--maroon)] font-semibold underline" data-testid="filter-clear">Clear</button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--maroon)]">Search</label>
              <input data-testid="filter-q" value={filters.q} onChange={e=>updateFilter('q',e.target.value)} placeholder="Name, tag…" className="w-full mt-2 px-3 py-2.5 rounded-lg border border-[var(--border-warm)] bg-[var(--ivory)] text-sm outline-none focus:border-[var(--maroon)]"/>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--maroon)]">Category</label>
              <select data-testid="filter-category" value={filters.category} onChange={e=>updateFilter('category',e.target.value)} className="w-full mt-2 px-3 py-2.5 rounded-lg border border-[var(--border-warm)] bg-[var(--ivory)] text-sm outline-none focus:border-[var(--maroon)]">
                <option value="">All categories</option>
                {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--maroon)]">City</label>
              <input data-testid="filter-city" value={filters.city} onChange={e=>updateFilter('city',e.target.value)} placeholder="e.g. Delhi" className="w-full mt-2 px-3 py-2.5 rounded-lg border border-[var(--border-warm)] bg-[var(--ivory)] text-sm outline-none focus:border-[var(--maroon)]"/>
            </div>

            <div>
              <div className="flex justify-between">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--maroon)]">Max Budget</label>
                <span className="text-xs font-display font-700 text-[var(--maroon-ink)]">{formatINR(filters.max_budget)}</span>
              </div>
              <input data-testid="filter-max-budget" type="range" min="5000" max="10000000" step="5000" value={filters.max_budget} onChange={e=>updateFilter('max_budget',parseInt(e.target.value))} className="shaadi-range mt-3"/>
              <div className="flex justify-between text-[10px] text-[var(--ink)]/50 mt-1">
                <span>₹5K</span><span>₹1 Cr+</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--maroon)]">Min Rating</label>
              <div className="flex gap-2 mt-2">
                {[0, 4, 4.5, 4.8].map(r => (
                  <button key={r} onClick={()=>updateFilter('min_rating',r)} data-testid={`filter-rating-${r}`} className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${filters.min_rating===r ? 'bg-[var(--maroon)] text-[var(--ivory)]' : 'bg-[var(--ivory-2)] text-[var(--maroon-deep)]'}`}>
                    {r === 0 ? 'Any' : `${r}+`}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer" data-testid="filter-verified-label">
              <input type="checkbox" checked={filters.verified_only} onChange={e=>updateFilter('verified_only',e.target.checked)} data-testid="filter-verified" className="w-5 h-5 accent-[var(--maroon)]"/>
              <span className="text-sm font-semibold text-[var(--maroon-ink)] flex items-center gap-1.5"><Shield size={14} className="text-[var(--maroon)]"/> Verified only</span>
            </label>
          </div>
        </aside>

        {/* Results */}
        <div>
          {loading ? (
            <div className="text-center py-20 text-[var(--ink)]/50" data-testid="vendors-loading">Loading...</div>
          ) : vendors.length === 0 ? (
            <div className="text-center py-20 card-warm p-10" data-testid="vendors-empty">
              <Sparkles size={28} className="text-[var(--gold)] mx-auto"/>
              <h3 className="font-display text-2xl text-[var(--maroon-ink)] mt-3">No vendors match those filters</h3>
              <p className="text-[var(--ink)]/60 mt-2">Try widening your budget or clearing filters.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {vendors.map(v => <VendorCard key={v.id} vendor={v}/>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ======================== VENDOR DETAIL ========================
function VendorDetail() {
  const { id } = useParams();
  const [vendor, setVendor] = useState(null);
  const [related, setRelated] = useState([]);
  useEffect(() => {
    axios.get(`${API}/vendors/${id}`).then(r => {
      setVendor(r.data);
      axios.get(`${API}/vendors?category=${r.data.category}&limit=4`).then(rr => setRelated(rr.data.filter(x=>x.id!==id).slice(0,3)));
    });
  }, [id]);

  if (!vendor) return <div className="text-center py-20">Loading...</div>;

  return (
    <div data-testid="vendor-detail-page">
      <div className="relative h-[55vh] overflow-hidden grain">
        <img src={vendor.images[0]} alt={vendor.name} className="w-full h-full object-cover"/>
        <div className="absolute inset-0 hero-fade"/>
        <div className="absolute inset-x-0 bottom-0 max-w-7xl mx-auto px-6 lg:px-10 pb-10 text-[var(--ivory)]">
          <Link to="/vendors" className="text-[var(--gold-soft)] text-sm font-semibold">← Back to vendors</Link>
          <div className="flex items-center gap-3 mt-4">
            {vendor.verified && <div className="verified-badge"><Shield size={10}/> Verified</div>}
            <div className="chip !bg-[var(--ivory)]/95 !text-[var(--maroon)]"><Star size={12} className="fill-[var(--gold)] text-[var(--gold)]"/> {vendor.rating} ({vendor.reviews} reviews)</div>
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-500 mt-4 leading-none" data-testid="vendor-name">{vendor.name}</h1>
          <div className="flex items-center gap-4 mt-3 text-[var(--ivory)]/85">
            <span className="flex items-center gap-1.5"><MapPin size={14}/> {vendor.city}</span>
            <span className="chip !bg-[var(--gold)] !text-[var(--maroon-ink)]">Starting at {formatINR(vendor.starting_price)}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 grid lg:grid-cols-[2fr_1fr] gap-12">
        <div>
          <div className="ornament !justify-start mb-4"><span>About</span></div>
          <p className="font-display text-2xl md:text-3xl leading-relaxed text-[var(--maroon-ink)] font-400" data-testid="vendor-description">{vendor.description}</p>

          <div className="mt-10">
            <h3 className="text-xs uppercase tracking-widest text-[var(--maroon)] font-bold mb-4">Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {vendor.tags.map(t => <span key={t} className="chip !bg-[var(--maroon)] !text-[var(--ivory)] !border-[var(--maroon-deep)]">{t}</span>)}
            </div>
          </div>

          {vendor.images.length > 1 && (
            <div className="mt-12">
              <h3 className="text-xs uppercase tracking-widest text-[var(--maroon)] font-bold mb-4">Gallery</h3>
              <div className="grid grid-cols-2 gap-4">
                {vendor.images.map((img,i) => (
                  <img key={i} src={img} alt="" className="w-full h-64 object-cover rounded-2xl"/>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="card-warm p-8 h-fit lg:sticky lg:top-28" data-testid="vendor-booking-card">
          <div className="text-xs uppercase tracking-widest text-[var(--ink)]/50">Starting at</div>
          <div className="font-display text-5xl font-700 text-[var(--maroon-ink)] mt-1">{formatINR(vendor.starting_price)}</div>
          <div className="text-xs text-[var(--ink)]/60 mt-1">Final price varies by package</div>

          <div className="mt-6 space-y-3">
            {[
              "Instant availability calendar",
              "Direct chat — no forms",
              "Transparent pricing",
              "Verified by Shaadi Saga",
            ].map(f => (
              <div key={f} className="flex items-center gap-2 text-sm text-[var(--maroon-ink)]">
                <Check size={16} className="text-[var(--gold)]"/> {f}
              </div>
            ))}
          </div>

          <button className="btn-primary w-full justify-center mt-7" data-testid="vendor-chat-btn"><Heart size={16}/> Start chat</button>
          <button className="btn-outline w-full justify-center mt-3" data-testid="vendor-availability-btn">Check availability</button>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-20">
          <h2 className="font-display text-3xl font-500 text-[var(--maroon-ink)] mb-6">Similar vendors</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {related.map(v => <VendorCard key={v.id} vendor={v}/>)}
          </div>
        </section>
      )}
    </div>
  );
}

// ======================== MATCHMAKER ========================
function Matchmaker() {
  const [form, setForm] = useState({ budget: 500000, theme: "Boho-Chic", city: "Delhi", category: "" });
  const [categories, setCategories] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(`${API}/categories`).then(r => setCategories(r.data));
  }, []);

  const themes = ["Boho-Chic", "Royal Regal", "Minimalist Luxe", "Destination Beach", "Traditional", "Eco-Friendly", "Bollywood Glam"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const r = await axios.post(`${API}/matchmaker`, form);
      setResult(r.data);
    } catch(err) {
      setResult({ reasoning: "Something went wrong. Please try again.", recommendations: [] });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-10 py-16" data-testid="matchmaker-page">
      <div className="text-center mb-12 fade-up">
        <div className="ornament mb-4"><span>AI-powered · 2026</span></div>
        <h1 className="font-display text-5xl md:text-7xl font-500 text-[var(--maroon-ink)] leading-tight">The <em className="italic text-[var(--maroon)]">Matchmaker</em></h1>
        <p className="text-[var(--ink)]/70 mt-5 max-w-xl mx-auto text-lg leading-relaxed">Tell us your vibe. We'll match you with 3 vendors whose aesthetic, price &amp; city align with your shaadi's soul.</p>
      </div>

      <form onSubmit={handleSubmit} className="card-warm p-8 md:p-10 space-y-7" data-testid="matchmaker-form">
        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-[var(--maroon)]">Your Budget</label>
          <div className="flex items-center justify-between mt-2">
            <span className="font-display text-4xl font-700 text-[var(--maroon-ink)]" data-testid="matchmaker-budget-display">{formatINR(form.budget)}</span>
          </div>
          <input data-testid="matchmaker-budget" type="range" min="10000" max="10000000" step="10000" value={form.budget} onChange={e=>setForm({...form, budget:parseInt(e.target.value)})} className="shaadi-range mt-3"/>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-[var(--maroon)]">Wedding Theme / Vibe</label>
          <div className="flex flex-wrap gap-2 mt-3">
            {themes.map(t => (
              <button type="button" key={t} onClick={()=>setForm({...form, theme:t})} data-testid={`matchmaker-theme-${t.toLowerCase().replace(/\s/g,'-')}`} className={`chip ${form.theme===t ? '!bg-[var(--maroon)] !text-[var(--ivory)] !border-[var(--maroon)]' : ''}`}>{t}</button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-[var(--maroon)]">City</label>
            <input data-testid="matchmaker-city" value={form.city} onChange={e=>setForm({...form, city:e.target.value})} placeholder="Delhi, Mumbai, Udaipur…" className="w-full mt-2 px-4 py-3 rounded-xl border border-[var(--border-warm)] bg-[var(--ivory)] outline-none focus:border-[var(--maroon)]"/>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-[var(--maroon)]">Category</label>
            <select data-testid="matchmaker-category" value={form.category} onChange={e=>setForm({...form, category:e.target.value})} className="w-full mt-2 px-4 py-3 rounded-xl border border-[var(--border-warm)] bg-[var(--ivory)] outline-none focus:border-[var(--maroon)]">
              <option value="">Any category</option>
              {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-gold w-full justify-center !py-5 text-lg" data-testid="matchmaker-submit">
          {loading ? <>Matching…</> : <><Sparkles size={18}/> Find my perfect vendors <ArrowRight size={16}/></>}
        </button>
      </form>

      {result && (
        <div className="mt-12 fade-up" data-testid="matchmaker-results">
          <div className="card-warm p-8 mb-8 bg-gradient-to-br from-[var(--maroon-deep)] to-[var(--maroon)] text-[var(--ivory)] border-[var(--gold)]/30">
            <div className="flex items-center gap-2 text-[var(--gold-soft)] text-xs uppercase tracking-widest font-bold mb-3"><Sparkles size={14}/> Matchmaker says</div>
            <p className="font-display text-2xl md:text-3xl leading-relaxed font-400" data-testid="matchmaker-reasoning">{result.reasoning}</p>
          </div>

          {result.recommendations.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {result.recommendations.map((v, i) => (
                <div key={v.id} className="relative">
                  <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-[var(--gold)] text-[var(--maroon-ink)] flex items-center justify-center font-display font-800 text-lg z-10 shadow-lg">{i+1}</div>
                  <VendorCard vendor={v}/>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-[var(--ink)]/60">Try a different budget or city.</div>
          )}
        </div>
      )}
    </div>
  );
}

// ======================== REAL WEDDINGS ========================
function RealWeddings() {
  const [weddings, setWeddings] = useState([]);
  useEffect(() => {
    axios.get(`${API}/real-weddings`).then(r => setWeddings(r.data));
  }, []);
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16" data-testid="realweddings-page">
      <div className="ornament !justify-start mb-3"><span>Real couples · real stories</span></div>
      <h1 className="font-display text-5xl md:text-7xl font-500 text-[var(--maroon-ink)]">Real <em className="italic text-[var(--maroon)]">Shaadi</em></h1>
      <p className="text-[var(--ink)]/70 mt-4 max-w-2xl text-lg">Inspiration from weddings we've loved — from Udaipur palaces to Goa beaches.</p>
      <div className="grid md:grid-cols-2 gap-8 mt-12">
        {weddings.map(w => (
          <div key={w.id} className="card-warm group" data-testid={`realwedding-full-${w.id}`}>
            <div className="relative h-96 overflow-hidden">
              <img src={w.image} alt={w.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"/>
              <div className="absolute top-4 right-4 chip !bg-[var(--ivory)]/95 !text-[var(--maroon)]">{w.theme}</div>
            </div>
            <div className="p-6">
              <div className="text-xs text-[var(--maroon)] font-bold uppercase tracking-widest flex items-center gap-1.5"><MapPin size={11}/> {w.location}</div>
              <h3 className="font-display text-3xl font-600 mt-3 text-[var(--maroon-ink)]">{w.title}</h3>
              <p className="text-[var(--ink)]/75 mt-3 leading-relaxed">{w.story}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ======================== APP ========================
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Navbar/>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/vendors" element={<Vendors/>}/>
          <Route path="/vendor/:id" element={<VendorDetail/>}/>
          <Route path="/matchmaker" element={<Matchmaker/>}/>
          <Route path="/real-weddings" element={<RealWeddings/>}/>
        </Routes>
        <Footer/>
      </BrowserRouter>
    </div>
  );
}

export default App;
