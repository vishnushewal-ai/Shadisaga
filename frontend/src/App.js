import { useEffect, useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  Search, MapPin, Star, Shield, ArrowRight, Sparkles, Menu, X, Phone,
  Heart, Camera, Flame, Gem, Music, Utensils, Mail, Scissors, Hand, Leaf,
  Plane, Film, Landmark, Building2, Flower2, Check, Filter
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const LOGO = "/assets/logo.jpeg";

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
    { to: "/vendors?category=venues", label: "Venues" },
    { to: "/vendors?category=photographers", label: "Photos" },
    { to: "/vendors", label: "Vendors" },
    { to: "/real-weddings", label: "Real Weddings" },
    { to: "/vendors?category=eco-vendors", label: "E-Invites" },
  ];
  return (
    <header className="sticky top-0 z-50" data-testid="navbar">
      {/* Top ribbon */}
      <div className="bg-[var(--red-deep)] text-[var(--ivory)] text-[11px] tracking-[0.2em] uppercase">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-8 flex items-center justify-between">
          <span className="flex items-center gap-2"><MapPin size={11}/> Delhi NCR · Mumbai · Jaipur · Udaipur</span>
          <span className="hidden md:flex items-center gap-2"><Phone size={11}/> +91 98765 43210</span>
        </div>
      </div>
      {/* Main nav */}
      <div className="bg-[var(--red)] border-b border-[var(--gold)]/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between h-24">
          <Link to="/" data-testid="nav-logo" className="flex items-center gap-3 leading-none">
            <img src={LOGO} alt="Shaadi Saga India" className="h-16 w-16 object-cover rounded-full border-2 border-[var(--gold)] shadow-[0_0_0_3px_rgba(212,169,68,0.25)]"/>
            <div className="hidden sm:block leading-tight">
              <div className="font-script text-[var(--ivory)] text-3xl lg:text-4xl">ShaadiSagaIndia</div>
              <div className="text-[var(--gold-soft)] text-[10px] tracking-[0.35em] uppercase font-semibold mt-0.5 text-center">
                <span className="text-[var(--gold)]">✦</span> Wedding Planning &amp; Styling <span className="text-[var(--gold)]">✦</span>
              </div>
            </div>
          </Link>
          <nav className="hidden lg:flex items-center gap-8">
            {links.map(l => (
              <Link key={l.label} to={l.to} data-testid={`nav-${l.label.toLowerCase().replace(/\s/g,'-')}`} className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[var(--ivory)] hover:text-[var(--gold-soft)] transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="hidden lg:flex items-center gap-4">
            <Link to="/matchmaker" data-testid="nav-matchmaker" className="btn-gold !py-2.5 !px-5 text-xs">
              <Sparkles size={14} /> AI Matchmaker
            </Link>
          </div>
          <button onClick={() => setOpen(!open)} className="lg:hidden text-[var(--ivory)]" data-testid="nav-mobile-toggle">
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <div className="lg:hidden border-t border-[var(--gold)]/40 bg-[var(--red)] px-6 py-4 space-y-3">
          {links.map(l => (
            <Link key={l.label} to={l.to} onClick={() => setOpen(false)} className="block text-sm font-semibold uppercase tracking-widest text-[var(--ivory)]">{l.label}</Link>
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
    <footer className="bg-[var(--red-ink)] text-[var(--ivory)]/85 mt-24 border-t-2 border-[var(--gold)]" data-testid="footer">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 grid md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img src={LOGO} alt="Shaadi Saga India" className="h-14 w-14 object-cover rounded-full border-2 border-[var(--gold)]"/>
            <div>
              <div className="font-script text-[var(--ivory)] text-3xl leading-none">ShaadiSagaIndia</div>
              <div className="text-[var(--gold-soft)] text-[9px] tracking-[0.3em] uppercase mt-1">Wedding Planning &amp; Styling</div>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-[var(--ivory)]/70">India's modern wedding marketplace — verified vendors, real prices, AI matchmaking. Est. 2026.</p>
        </div>
        <div>
          <h4 className="text-[var(--gold)] uppercase text-xs tracking-widest mb-4 font-semibold">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/vendors" className="hover:text-[var(--gold-soft)]">All Vendors</Link></li>
            <li><Link to="/vendors?category=venues" className="hover:text-[var(--gold-soft)]">Venues</Link></li>
            <li><Link to="/vendors?category=mehendi" className="hover:text-[var(--gold-soft)]">Mehendi Artists</Link></li>
            <li><Link to="/real-weddings" className="hover:text-[var(--gold-soft)]">Real Weddings</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[var(--gold)] uppercase text-xs tracking-widest mb-4 font-semibold">2026 New</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/matchmaker" className="hover:text-[var(--gold-soft)]">AI Matchmaker</Link></li>
            <li><Link to="/vendors?category=content-creators" className="hover:text-[var(--gold-soft)]">Content Creators</Link></li>
            <li><Link to="/vendors?category=drone-cinematography" className="hover:text-[var(--gold-soft)]">Drone Cinema</Link></li>
            <li><Link to="/vendors?category=eco-vendors" className="hover:text-[var(--gold-soft)]">Eco Vendors</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[var(--gold)] uppercase text-xs tracking-widest mb-4 font-semibold">Contact</h4>
          <p className="text-sm flex items-center gap-2"><Phone size={14}/> +91 98765 43210</p>
          <p className="text-sm flex items-center gap-2 mt-2"><Mail size={14}/> hello@shaadisaga.in</p>
        </div>
      </div>
      <div className="border-t border-[var(--gold)]/25 py-5 text-center text-xs text-[var(--ivory)]/60">© 2026 ShaadiSagaIndia · Wedding Planning &amp; Styling · All shaadi, no drama.</div>
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
    "Venues in Delhi NCR", "Bridal Makeup Mumbai", "Mehendi Artists Jaipur",
    "Destination Udaipur", "Content Creators", "Boho Decor", "Drone Cinema"
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
      <section className="relative overflow-hidden" data-testid="home-hero">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1519741497674-611481863552?w=2000&q=85" alt="" className="w-full h-full object-cover"/>
          <div className="absolute inset-0 hero-fade"/>
        </div>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-24 pb-36 lg:pt-32 lg:pb-44 text-center">
          <div className="fade-up max-w-4xl mx-auto">
            <div className="gold-divider mb-6 !text-[var(--gold-soft)]">
              <span className="font-script text-2xl">★</span>
            </div>
            <div className="text-[var(--gold-soft)] text-[11px] tracking-[0.4em] uppercase font-semibold mb-5">
              Est. 2026 · Wedding Planning &amp; Styling
            </div>
            <h1 className="font-script text-[var(--ivory)] text-6xl md:text-8xl lg:text-[130px] leading-[0.95] mb-2">
              Your shaadi,
            </h1>
            <h1 className="font-display text-[var(--gold-soft)] italic text-3xl md:text-5xl lg:text-6xl font-400 mb-7">
              beautifully planned.
            </h1>
            <p className="text-[var(--ivory)]/85 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              From the first mehendi stroke to the grand mandap — discover verified vendors, transparent prices, and an AI matchmaker designed for the modern Indian couple.
            </p>
            <div className="flex flex-wrap gap-4 justify-center mt-10">
              <Link to="/vendors" className="btn-primary" data-testid="hero-cta-browse"><Search size={16}/> Browse Vendors</Link>
              <Link to="/matchmaker" className="btn-gold" data-testid="hero-cta-matchmaker"><Sparkles size={16}/> Try Matchmaker</Link>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative max-w-6xl mx-auto px-6 lg:px-10 -mt-14 pb-4 fade-up delay-2">
          <div className="bg-[var(--cream)] rounded-sm p-4 md:p-5 shadow-[0_30px_60px_-20px_rgba(74,10,20,0.4)] border border-[var(--gold)] grid md:grid-cols-[1.2fr_1.3fr_2fr_auto] gap-3 items-end" style={{boxShadow:"0 0 0 4px var(--cream), 0 0 0 5px var(--gold), 0 30px 60px -20px rgba(74,10,20,0.4)"}}>
            <div className="px-3">
              <label className="text-[10px] uppercase tracking-[0.2em] text-[var(--red)] font-bold">City</label>
              <input data-testid="hero-search-city" value={search.city} onChange={e=>setSearch({...search, city:e.target.value})} placeholder="Delhi, Mumbai…" className="w-full bg-transparent outline-none text-[var(--ink)] placeholder:text-[var(--muted-2)] text-base py-1.5"/>
            </div>
            <div className="px-3 md:border-l md:border-[var(--border)]">
              <label className="text-[10px] uppercase tracking-[0.2em] text-[var(--red)] font-bold">Category</label>
              <select data-testid="hero-search-category" value={search.category} onChange={e=>setSearch({...search, category:e.target.value})} className="w-full bg-transparent outline-none text-[var(--ink)] text-base py-1.5">
                <option value="">Any category</option>
                {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            <div className="px-3 md:border-l md:border-[var(--border)]">
              <label className="text-[10px] uppercase tracking-[0.2em] text-[var(--red)] font-bold flex justify-between">
                <span>Budget (up to)</span>
                <span className="text-[var(--red-ink)] font-display font-700 not-italic text-sm">{formatINR(search.budget)}</span>
              </label>
              <input data-testid="hero-search-budget" type="range" min="10000" max="10000000" step="10000" value={search.budget} onChange={e=>setSearch({...search, budget:parseInt(e.target.value)})} className="shaadi-range mt-2"/>
            </div>
            <button data-testid="hero-search-submit" onClick={handleSearch} className="btn-primary !py-4 justify-center">
              <Search size={16}/> Search
            </button>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="bg-[var(--red-deep)] text-[var(--ivory)] py-4 overflow-hidden border-y border-[var(--gold)]/40">
        <div className="marquee text-sm">
          {[...Array(2)].map((_,i) => (
            <div key={i} className="flex gap-12 items-center">
              <span className="flex items-center gap-2"><Shield size={14} className="text-[var(--gold-soft)]"/> 100% Verified Vendors</span>
              <span className="text-[var(--gold)]">❖</span>
              <span className="flex items-center gap-2"><Star size={14} className="text-[var(--gold-soft)]"/> Real Reviews Only</span>
              <span className="text-[var(--gold)]">❖</span>
              <span className="flex items-center gap-2"><Sparkles size={14} className="text-[var(--gold-soft)]"/> Transparent Starting Prices</span>
              <span className="text-[var(--gold)]">❖</span>
              <span className="flex items-center gap-2"><Heart size={14} className="text-[var(--gold-soft)]"/> AI-Powered Matchmaking</span>
              <span className="text-[var(--gold)]">❖</span>
            </div>
          ))}
        </div>
      </section>

      {/* POPULAR SEARCHES */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pt-10">
        <div className="flex flex-wrap gap-2 items-center justify-center">
          <span className="text-xs text-[var(--muted)] mr-1 uppercase tracking-widest">Popular searches:</span>
          {popularSearches.map(p => (
            <Link key={p} to="/vendors" data-testid={`popular-${p.toLowerCase().replace(/\s/g,'-')}`} className="chip hover:border-[var(--red)] hover:text-[var(--red)] transition-colors">{p}</Link>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-20" data-testid="home-categories">
        <div className="text-center mb-12">
          <div className="ornament mb-3"><span>Plan every ceremony</span></div>
          <h2 className="font-script text-[var(--red)] text-5xl md:text-6xl mb-2">Wedding Categories</h2>
          <p className="text-[var(--muted)] max-w-xl mx-auto">From mandap to mehendi — every vendor you need for a grand Indian shaadi.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.map((c, i) => {
            const Icon = ICONS[c.icon] || Sparkles;
            return (
              <Link key={c.slug} to={`/vendors?category=${c.slug}`} data-testid={`category-${c.slug}`} className="card-warm group fade-up" style={{animationDelay: `${i*40}ms`}}>
                <div className="relative h-36 overflow-hidden">
                  <img src={c.image} alt={c.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--red-ink)]/60 via-transparent to-transparent"/>
                  <div className="absolute top-3 left-3 w-9 h-9 rounded-full bg-[var(--cream)] flex items-center justify-center text-[var(--red)] border border-[var(--gold)]">
                    <Icon size={15}/>
                  </div>
                </div>
                <div className="p-4 text-center">
                  <div className="font-display text-xl text-[var(--red-ink)] leading-tight font-600">{c.name}</div>
                  <div className="text-[11px] text-[var(--muted)] mt-1 tracking-widest uppercase">{c.count} vendors</div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* AI MATCHMAKER CTA */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16" data-testid="home-matchmaker-cta">
        <div className="relative rounded-sm overflow-hidden bg-[var(--red)] p-10 md:p-16 text-[var(--ivory)] border-y-2 border-[var(--gold)]">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--gold)]/15 rounded-full blur-3xl -mr-20 -mt-20"/>
          <div className="relative grid md:grid-cols-[1.3fr_1fr] gap-10 items-center">
            <div>
              <div className="chip !bg-[var(--gold)]/20 !text-[var(--gold-soft)] !border-[var(--gold)]/50 mb-5"><Sparkles size={12}/> New · 2026</div>
              <h2 className="font-script text-5xl md:text-7xl text-[var(--gold-soft)] mb-2">The Matchmaker</h2>
              <p className="font-display italic text-[var(--ivory)]/90 text-xl md:text-2xl mb-5">Powered by AI. Guided by tradition.</p>
              <p className="text-[var(--ivory)]/75 text-base max-w-xl">Tell us your budget, vibe &amp; city — we'll hand-pick 3 vendors that match your shaadi's soul in seconds.</p>
              <Link to="/matchmaker" className="btn-gold mt-7" data-testid="home-matchmaker-btn"><Sparkles size={16}/> Try Matchmaker <ArrowRight size={14}/></Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {["Budget","Theme","City"].map((t,i) => (
                <div key={t} className="bg-[var(--ivory)]/5 border border-[var(--gold)]/30 rounded-sm p-4 backdrop-blur-sm text-center">
                  <div className="text-[var(--gold-soft)] font-display text-4xl font-700">0{i+1}</div>
                  <div className="text-sm mt-2 text-[var(--ivory)]/90 uppercase tracking-widest text-[10px] font-semibold">{t}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED VENDORS */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16" data-testid="home-featured">
          <div className="text-center mb-12">
            <div className="ornament mb-3"><span>Handpicked · Verified</span></div>
            <h2 className="font-script text-[var(--red)] text-5xl md:text-6xl">Featured Vendors</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map(v => <VendorCard key={v.id} vendor={v}/>)}
          </div>
          <div className="text-center mt-10">
            <Link to="/vendors" className="btn-outline">View All Vendors <ArrowRight size={14}/></Link>
          </div>
        </section>
      )}

      {/* REAL WEDDINGS */}
      {realWeddings.length > 0 && (
        <section className="cream-bg py-20 border-y border-[var(--border)]" data-testid="home-real-weddings">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="text-center mb-12">
              <div className="ornament mb-3"><span>Love in action</span></div>
              <h2 className="font-script text-[var(--red)] text-5xl md:text-6xl">Real Shaadi Stories</h2>
              <p className="text-[var(--muted)] max-w-xl mx-auto mt-3">Inspiration from weddings we've loved — from Udaipur palaces to Goa beaches.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {realWeddings.map((w, i) => (
                <div key={w.id} className="card-warm group fade-up" style={{animationDelay: `${i*60}ms`}} data-testid={`realwedding-${i}`}>
                  <div className="relative h-64 overflow-hidden">
                    <img src={w.image} alt={w.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"/>
                    <div className="absolute top-3 right-3 chip !bg-[var(--cream)]/95 !text-[var(--red)] !border-[var(--gold)]">{w.theme}</div>
                  </div>
                  <div className="p-5">
                    <div className="text-[10px] text-[var(--red)] font-bold uppercase tracking-[0.2em] flex items-center gap-1"><MapPin size={10}/> {w.location}</div>
                    <div className="font-display text-xl font-600 mt-2 text-[var(--red-ink)] leading-snug">{w.title}</div>
                    <p className="text-sm text-[var(--muted)] mt-2 leading-relaxed line-clamp-3">{w.story}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* WHY CHOOSE */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-24" data-testid="home-why">
        <div className="text-center mb-14">
          <div className="ornament mb-3"><span>Why Shaadi Saga</span></div>
          <h2 className="font-script text-[var(--red)] text-5xl md:text-6xl">Built for the 2026 couple</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {icon: Shield, title: "Verified vendors only", desc: "Every vendor's GST & 3 client references checked before we award the badge."},
            {icon: Sparkles, title: "AI Matchmaker", desc: "Describe your vibe. We match you with vendors who get it — in seconds."},
            {icon: Heart, title: "Direct chat & prices", desc: "No \"contact for pricing\". Real starting prices, real-time chat — no middlemen."},
          ].map(b => (
            <div key={b.title} className="card-warm p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-[var(--red)] text-[var(--gold-soft)] flex items-center justify-center mx-auto mb-5 border-2 border-[var(--gold)]"><b.icon size={22}/></div>
              <h3 className="font-display text-2xl font-600 text-[var(--red-ink)]">{b.title}</h3>
              <p className="text-[var(--muted)] mt-3 leading-relaxed">{b.desc}</p>
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
        <div className="absolute top-3 right-3 chip !bg-[var(--cream)]/95 !border-[var(--gold)]">
          <Star size={12} className="fill-[var(--gold)] text-[var(--gold)]"/> {vendor.rating} <span className="text-[var(--muted)] font-normal">({vendor.reviews})</span>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-1.5 text-[10px] text-[var(--red)] font-bold uppercase tracking-[0.2em]"><MapPin size={10}/> {vendor.city}</div>
        <h3 className="font-display text-2xl font-600 mt-2 text-[var(--red-ink)] leading-snug group-hover:text-[var(--red)] transition-colors">{vendor.name}</h3>
        <p className="text-sm text-[var(--muted)] mt-2 line-clamp-2 leading-relaxed">{vendor.description}</p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {vendor.tags.slice(0,3).map(t => <span key={t} className="text-[10px] font-semibold px-2 py-1 rounded-full bg-[var(--bg-soft)] text-[var(--red-deep)] border border-[var(--border)]">{t}</span>)}
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--border)]">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Starting at</div>
            <div className="font-display text-2xl font-700 text-[var(--red-ink)]">{formatINR(vendor.starting_price)}</div>
          </div>
          <div className="flex items-center gap-1 text-[var(--red)] font-semibold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
            View <ArrowRight size={14}/>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ======================== VENDORS LISTING ========================
function Vendors() {
  const [searchParams] = useSearchParams();
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

  useEffect(() => { axios.get(`${API}/categories`).then(r => setCategories(r.data)); }, []);

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
      <div className="mb-10 fade-up text-center">
        <div className="ornament mb-3"><span>Browse &amp; book</span></div>
        <h1 className="font-script text-[var(--red)] text-5xl md:text-7xl">
          {activeCat ? activeCat.name : "All Vendors"}
        </h1>
        <p className="text-[var(--muted)] mt-3 max-w-2xl mx-auto">{vendors.length} vendors match your filters. Transparent starting prices — no "contact for quote" nonsense.</p>
      </div>

      <div className="grid lg:grid-cols-[300px_1fr] gap-10">
        {/* Filters */}
        <aside className="card-warm p-6 h-fit lg:sticky lg:top-40" data-testid="vendors-filters">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-xl font-600 text-[var(--red-ink)] flex items-center gap-2"><Filter size={16}/> Filters</h3>
            <button onClick={() => setFilters({category:"", city:"", max_budget:10000000, min_budget:0, verified_only:false, min_rating:0, q:""})} className="text-xs text-[var(--red)] font-semibold underline" data-testid="filter-clear">Clear</button>
          </div>
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--red)]">Search</label>
              <input data-testid="filter-q" value={filters.q} onChange={e=>updateFilter('q',e.target.value)} placeholder="Name, tag…" className="w-full mt-2 px-3 py-2.5 rounded-sm border border-[var(--border)] bg-[var(--cream)] text-sm outline-none focus:border-[var(--red)]"/>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--red)]">Category</label>
              <select data-testid="filter-category" value={filters.category} onChange={e=>updateFilter('category',e.target.value)} className="w-full mt-2 px-3 py-2.5 rounded-sm border border-[var(--border)] bg-[var(--cream)] text-sm outline-none focus:border-[var(--red)]">
                <option value="">All categories</option>
                {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--red)]">City</label>
              <input data-testid="filter-city" value={filters.city} onChange={e=>updateFilter('city',e.target.value)} placeholder="e.g. Delhi" className="w-full mt-2 px-3 py-2.5 rounded-sm border border-[var(--border)] bg-[var(--cream)] text-sm outline-none focus:border-[var(--red)]"/>
            </div>
            <div>
              <div className="flex justify-between">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--red)]">Max Budget</label>
                <span className="text-xs font-display font-700 text-[var(--red-ink)]">{formatINR(filters.max_budget)}</span>
              </div>
              <input data-testid="filter-max-budget" type="range" min="5000" max="10000000" step="5000" value={filters.max_budget} onChange={e=>updateFilter('max_budget',parseInt(e.target.value))} className="shaadi-range mt-3"/>
              <div className="flex justify-between text-[10px] text-[var(--muted)] mt-1">
                <span>₹5K</span><span>₹1 Cr+</span>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--red)]">Min Rating</label>
              <div className="flex gap-2 mt-2">
                {[0, 4, 4.5, 4.8].map(r => (
                  <button key={r} onClick={()=>updateFilter('min_rating',r)} data-testid={`filter-rating-${r}`} className={`flex-1 py-2 rounded-sm text-xs font-semibold transition-colors ${filters.min_rating===r ? 'bg-[var(--red)] text-[var(--ivory)]' : 'bg-[var(--bg-soft)] text-[var(--red-deep)] border border-[var(--border)]'}`}>
                    {r === 0 ? 'Any' : `${r}+`}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-3 cursor-pointer" data-testid="filter-verified-label">
              <input type="checkbox" checked={filters.verified_only} onChange={e=>updateFilter('verified_only',e.target.checked)} data-testid="filter-verified" className="w-5 h-5 accent-[var(--red)]"/>
              <span className="text-sm font-semibold text-[var(--red-ink)] flex items-center gap-1.5"><Shield size={14} className="text-[var(--red)]"/> Verified only</span>
            </label>
          </div>
        </aside>

        {/* Results */}
        <div>
          {loading ? (
            <div className="text-center py-20 text-[var(--muted)]" data-testid="vendors-loading">Loading…</div>
          ) : vendors.length === 0 ? (
            <div className="text-center py-20 card-warm p-10" data-testid="vendors-empty">
              <Sparkles size={28} className="text-[var(--gold)] mx-auto"/>
              <h3 className="font-display text-2xl text-[var(--red-ink)] mt-3">No vendors match those filters</h3>
              <p className="text-[var(--muted)] mt-2">Try widening your budget or clearing filters.</p>
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

  if (!vendor) return <div className="text-center py-20 text-[var(--muted)]">Loading…</div>;

  return (
    <div data-testid="vendor-detail-page">
      <div className="relative h-[55vh] overflow-hidden">
        <img src={vendor.images[0]} alt={vendor.name} className="w-full h-full object-cover"/>
        <div className="absolute inset-0 hero-fade"/>
        <div className="absolute inset-x-0 bottom-0 max-w-7xl mx-auto px-6 lg:px-10 pb-10 text-[var(--ivory)]">
          <Link to="/vendors" className="text-[var(--gold-soft)] text-sm font-semibold">← Back to vendors</Link>
          <div className="flex items-center gap-3 mt-4 flex-wrap">
            {vendor.verified && <div className="verified-badge"><Shield size={10}/> Verified</div>}
            <div className="chip !bg-[var(--cream)]/95 !text-[var(--red)] !border-[var(--gold)]"><Star size={12} className="fill-[var(--gold)] text-[var(--gold)]"/> {vendor.rating} ({vendor.reviews} reviews)</div>
          </div>
          <h1 className="font-script text-5xl md:text-7xl mt-4 leading-none text-[var(--ivory)]" data-testid="vendor-name">{vendor.name}</h1>
          <div className="flex items-center gap-4 mt-3 text-[var(--ivory)]/90 flex-wrap">
            <span className="flex items-center gap-1.5"><MapPin size={14}/> {vendor.city}</span>
            <span className="chip !bg-[var(--gold)] !text-[var(--red-ink)] !border-[var(--gold-dark)]">Starting at {formatINR(vendor.starting_price)}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 grid lg:grid-cols-[2fr_1fr] gap-12">
        <div>
          <div className="ornament mb-4"><span>About</span></div>
          <p className="font-display text-2xl md:text-3xl leading-relaxed text-[var(--red-ink)] font-400" data-testid="vendor-description">{vendor.description}</p>

          <div className="mt-10">
            <h3 className="text-xs uppercase tracking-[0.25em] text-[var(--red)] font-bold mb-4">Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {vendor.tags.map(t => <span key={t} className="chip !bg-[var(--red)] !text-[var(--ivory)] !border-[var(--gold)]">{t}</span>)}
            </div>
          </div>

          {vendor.images.length > 1 && (
            <div className="mt-12">
              <h3 className="text-xs uppercase tracking-[0.25em] text-[var(--red)] font-bold mb-4">Gallery</h3>
              <div className="grid grid-cols-2 gap-4">
                {vendor.images.map((img,i) => (
                  <img key={i} src={img} alt="" className="w-full h-64 object-cover rounded-sm border border-[var(--border)]"/>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="card-warm p-8 h-fit lg:sticky lg:top-40" data-testid="vendor-booking-card">
          <div className="text-[10px] uppercase tracking-[0.25em] text-[var(--muted)] font-semibold">Starting at</div>
          <div className="font-display text-5xl font-700 text-[var(--red-ink)] mt-1">{formatINR(vendor.starting_price)}</div>
          <div className="text-xs text-[var(--muted)] mt-1">Final price varies by package</div>

          <div className="mt-6 space-y-3">
            {["Instant availability calendar","Direct chat — no forms","Transparent pricing","Verified by Shaadi Saga"].map(f => (
              <div key={f} className="flex items-center gap-2 text-sm text-[var(--red-ink)]">
                <Check size={16} className="text-[var(--gold-dark)]"/> {f}
              </div>
            ))}
          </div>

          <button className="btn-primary w-full justify-center mt-7" data-testid="vendor-chat-btn"><Heart size={16}/> Start Chat</button>
          <button className="btn-outline w-full justify-center mt-3" data-testid="vendor-availability-btn">Check Availability</button>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-20">
          <h2 className="font-script text-4xl text-[var(--red)] mb-6">Similar Vendors</h2>
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

  useEffect(() => { axios.get(`${API}/categories`).then(r => setCategories(r.data)); }, []);
  const themes = ["Boho-Chic", "Royal Regal", "Minimalist Luxe", "Destination Beach", "Traditional", "Eco-Friendly", "Bollywood Glam"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setResult(null);
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
        <h1 className="font-script text-[var(--red)] text-6xl md:text-8xl leading-tight">The Matchmaker</h1>
        <p className="font-display italic text-[var(--red-deep)] text-2xl mt-1">Powered by AI · Guided by tradition</p>
        <p className="text-[var(--muted)] mt-5 max-w-xl mx-auto text-base leading-relaxed">Tell us your vibe. We'll match you with 3 vendors whose aesthetic, price &amp; city align with your shaadi's soul.</p>
      </div>

      <form onSubmit={handleSubmit} className="card-warm p-8 md:p-10 space-y-7" data-testid="matchmaker-form">
        <div>
          <label className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--red)]">Your Budget</label>
          <div className="flex items-center justify-between mt-2">
            <span className="font-display text-4xl font-700 text-[var(--red-ink)]" data-testid="matchmaker-budget-display">{formatINR(form.budget)}</span>
          </div>
          <input data-testid="matchmaker-budget" type="range" min="10000" max="10000000" step="10000" value={form.budget} onChange={e=>setForm({...form, budget:parseInt(e.target.value)})} className="shaadi-range mt-3"/>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--red)]">Wedding Theme / Vibe</label>
          <div className="flex flex-wrap gap-2 mt-3">
            {themes.map(t => (
              <button type="button" key={t} onClick={()=>setForm({...form, theme:t})} data-testid={`matchmaker-theme-${t.toLowerCase().replace(/\s/g,'-')}`} className={`chip ${form.theme===t ? '!bg-[var(--red)] !text-[var(--ivory)] !border-[var(--gold)]' : ''}`}>{t}</button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--red)]">City</label>
            <input data-testid="matchmaker-city" value={form.city} onChange={e=>setForm({...form, city:e.target.value})} placeholder="Delhi, Mumbai…" className="w-full mt-2 px-4 py-3 rounded-sm border border-[var(--border)] bg-[var(--cream)] outline-none focus:border-[var(--red)]"/>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--red)]">Category</label>
            <select data-testid="matchmaker-category" value={form.category} onChange={e=>setForm({...form, category:e.target.value})} className="w-full mt-2 px-4 py-3 rounded-sm border border-[var(--border)] bg-[var(--cream)] outline-none focus:border-[var(--red)]">
              <option value="">Any category</option>
              {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-gold w-full justify-center !py-5 text-base" data-testid="matchmaker-submit">
          {loading ? <>Matching…</> : <><Sparkles size={18}/> Find My Perfect Vendors <ArrowRight size={16}/></>}
        </button>
      </form>

      {result && (
        <div className="mt-12 fade-up" data-testid="matchmaker-results">
          <div className="card-warm p-8 mb-8 bg-[var(--red)] text-[var(--ivory)] border-[var(--gold)]">
            <div className="flex items-center gap-2 text-[var(--gold-soft)] text-xs uppercase tracking-[0.25em] font-bold mb-3"><Sparkles size={14}/> Matchmaker says</div>
            <p className="font-display text-xl md:text-2xl leading-relaxed text-[var(--ivory)]" data-testid="matchmaker-reasoning">{result.reasoning}</p>
          </div>

          {result.recommendations.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {result.recommendations.map((v, i) => (
                <div key={v.id} className="relative">
                  <div className="absolute -top-3 -left-3 w-11 h-11 rounded-full bg-[var(--gold)] text-[var(--red-ink)] flex items-center justify-center font-display font-800 text-xl z-10 shadow-lg border-2 border-[var(--red)]">{i+1}</div>
                  <VendorCard vendor={v}/>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-[var(--muted)]">Try a different budget or city.</div>
          )}
        </div>
      )}
    </div>
  );
}

// ======================== REAL WEDDINGS ========================
function RealWeddings() {
  const [weddings, setWeddings] = useState([]);
  useEffect(() => { axios.get(`${API}/real-weddings`).then(r => setWeddings(r.data)); }, []);
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16" data-testid="realweddings-page">
      <div className="text-center mb-12">
        <div className="ornament mb-3"><span>Real couples · real stories</span></div>
        <h1 className="font-script text-[var(--red)] text-6xl md:text-8xl">Real Shaadi</h1>
        <p className="text-[var(--muted)] mt-4 max-w-2xl mx-auto text-base">Inspiration from weddings we've loved — from Udaipur palaces to Goa beaches.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        {weddings.map(w => (
          <div key={w.id} className="card-warm group" data-testid={`realwedding-full-${w.id}`}>
            <div className="relative h-96 overflow-hidden">
              <img src={w.image} alt={w.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"/>
              <div className="absolute top-4 right-4 chip !bg-[var(--cream)]/95 !text-[var(--red)] !border-[var(--gold)]">{w.theme}</div>
            </div>
            <div className="p-6">
              <div className="text-[10px] text-[var(--red)] font-bold uppercase tracking-[0.25em] flex items-center gap-1.5"><MapPin size={10}/> {w.location}</div>
              <h3 className="font-display text-3xl font-600 mt-3 text-[var(--red-ink)]">{w.title}</h3>
              <p className="text-[var(--muted)] mt-3 leading-relaxed">{w.story}</p>
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
