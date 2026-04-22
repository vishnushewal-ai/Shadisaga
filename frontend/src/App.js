import { useEffect, useState, createContext, useContext } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate, useSearchParams, Navigate } from "react-router-dom";
import axios from "axios";
import {
  Search, MapPin, Star, Shield, ArrowRight, Sparkles, Menu, X, Phone, Instagram,
  Heart, Camera, Flame, Gem, Music, Utensils, Mail, Scissors, Hand, Leaf,
  Plane, Film, Landmark, Building2, Flower2, Check, Filter, User, LogOut, ChevronDown, Store,
  MessageCircle, Inbox, Calculator, Clock
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const LOGO = "/assets/logo.jpeg";
const INSTAGRAM_URL = "https://www.instagram.com/vanshajhanda?igsh=MXJ0amZneXVnaHRhcw==";
const PHONE = "+91 72176 12408";
const WHATSAPP = "917217612408";

axios.defaults.withCredentials = true;

// Recently-viewed tracker (localStorage — non-sensitive vendor IDs only; auth uses httpOnly cookies)
const RV_KEY = "ssi-recent-vendors";
const addRecent = (vendor) => {
  try {
    const raw = JSON.parse(localStorage.getItem(RV_KEY) || "[]");
    const next = [vendor, ...raw.filter(v => v.id !== vendor.id)].slice(0, 6);
    localStorage.setItem(RV_KEY, JSON.stringify(next));
  } catch (err) {
    console.warn("addRecent failed:", err);
  }
};
const getRecent = () => {
  try { return JSON.parse(localStorage.getItem(RV_KEY) || "[]"); }
  catch (err) { console.warn("getRecent failed:", err); return []; }
};

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

function formatErr(d) {
  if (d == null) return "Something went wrong.";
  if (typeof d === "string") return d;
  if (Array.isArray(d)) return d.map(e => e?.msg || JSON.stringify(e)).join(" ");
  if (d?.msg) return d.msg;
  return String(d);
}

// ======================== ANIMATED COUNTER ========================
function CountUp({ to, duration = 1600, suffix = "", prefix = "" }) {
  const [n, setN] = useState(0);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    if (!started) return;
    const start = performance.now();
    let raf;
    const step = (t) => {
      const p = Math.min((t - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setN(Math.floor(to * ease));
      if (p < 1) raf = requestAnimationFrame(step);
      else setN(to);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [started, to, duration]);
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) setStarted(true); });
    }, { threshold: 0.3 });
    const el = document.getElementById(`cu-${to}-${suffix}`);
    if (el) obs.observe(el);
    return () => obs.disconnect();
  }, [to, suffix]);
  return <span id={`cu-${to}-${suffix}`} className="count-up">{prefix}{n}{suffix}</span>;
}

// ======================== AUTH CONTEXT ========================
const AuthCtx = createContext();
const useAuth = () => useContext(AuthCtx);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null=loading, false=guest, object=user
  const [favIds, setFavIds] = useState(new Set());
  useEffect(() => {
    axios.get(`${API}/auth/me`).then(r => setUser(r.data)).catch(() => setUser(false));
  }, []);
  useEffect(() => {
    if (user && user.role === "client") {
      axios.get(`${API}/favourites`).then(r => setFavIds(new Set(r.data.vendor_ids))).catch(()=>{});
    } else { setFavIds(new Set()); }
  }, [user]);
  const login = async (payload) => {
    const r = await axios.post(`${API}/auth/login`, payload);
    setUser(r.data);
    return r.data;
  };
  const register = async (payload) => {
    const r = await axios.post(`${API}/auth/register`, payload);
    setUser(r.data);
    return r.data;
  };
  const logout = async () => {
    await axios.post(`${API}/auth/logout`).catch(()=>{});
    setUser(false); setFavIds(new Set());
  };
  const toggleFav = async (vendorId) => {
    if (!user || user.role !== "client") return { needLogin: true };
    const r = await axios.post(`${API}/favourites/toggle`, { vendor_id: vendorId });
    setFavIds(prev => {
      const n = new Set(prev);
      if (r.data.favourited) n.add(vendorId); else n.delete(vendorId);
      return n;
    });
    return r.data;
  };
  return <AuthCtx.Provider value={{ user, login, register, logout, favIds, toggleFav }}>{children}</AuthCtx.Provider>;
}

// ======================== NAVBAR ========================
function Navbar() {
  const [open, setOpen] = useState(false);
  const [loginMenu, setLoginMenu] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = [
    { to: "/vendors?category=venues", label: "Venues" },
    { to: "/vendors", label: "Vendors" },
    { to: "/budget", label: "Budget" },
    { to: "/real-weddings", label: "Real Weddings" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[var(--border)]" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between h-28">
        <Link to="/" data-testid="nav-logo" className="flex items-center gap-4 leading-none">
          <img src={LOGO} alt="Shaadi Saga India" className="h-20 w-20 md:h-[88px] md:w-[88px] object-cover rounded-full border-2 border-[var(--coral-soft)] shadow-md"/>
          <div className="hidden sm:block leading-tight">
            <div className="font-brand brand-gradient text-4xl lg:text-[46px] leading-none">ShaadiSagaIndia</div>
            <div className="text-[var(--muted)] text-[10px] tracking-[0.35em] uppercase font-semibold mt-1.5 text-center">
              <span className="text-[var(--gold)]">✦</span> Wedding Planning &amp; Styling <span className="text-[var(--gold)]">✦</span>
            </div>
          </div>
        </Link>
        <nav className="hidden lg:flex items-center gap-8">
          {links.map(l => (
            <Link key={l.label} to={l.to} data-testid={`nav-${l.label.toLowerCase().replace(/\s/g,'-')}`} className="text-[12px] font-semibold uppercase tracking-[0.15em] text-[var(--ink)] hover:text-[var(--coral)] transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden lg:flex items-center gap-3">
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" data-testid="nav-instagram" aria-label="Instagram"
             className="w-10 h-10 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--coral)] hover:bg-[var(--coral)] hover:text-white transition-colors">
            <Instagram size={16}/>
          </a>
          {user === null ? <div className="w-24 h-8"/> : user ? (
            <div className="relative">
              <button onClick={() => setUserMenu(!userMenu)} data-testid="nav-user-menu" className="flex items-center gap-2 px-3 h-10 rounded-full border border-[var(--border)] text-sm font-semibold text-[var(--ink)] hover:bg-[var(--coral-wash)]">
                <User size={14}/> {user.name.split(" ")[0]} <ChevronDown size={12}/>
              </button>
              {userMenu && (
                <div className="dropdown" onMouseLeave={()=>setUserMenu(false)} data-testid="nav-user-dropdown">
                  <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-[var(--muted)] font-bold border-b border-[var(--border)] mb-1">{user.role}</div>
                  <Link to="/dashboard" onClick={()=>setUserMenu(false)}><User size={14}/> Dashboard</Link>
                  {user.role === "client" && <Link to="/favourites" onClick={()=>setUserMenu(false)} data-testid="nav-favourites"><Heart size={14}/> My Favourites</Link>}
                  {user.role === "admin" && <Link to="/admin/queries" onClick={()=>setUserMenu(false)} data-testid="nav-admin-inbox"><Inbox size={14}/> Query Inbox</Link>}
                  <button onClick={async()=>{await logout(); setUserMenu(false); navigate("/");}} data-testid="nav-logout" className="w-full flex items-center gap-2 p-3 rounded-lg text-sm font-medium text-[var(--ink)] hover:bg-[var(--coral-wash)] hover:text-[var(--coral)]"><LogOut size={14}/> Log out</button>
                </div>
              )}
            </div>
          ) : (
            <div className="relative" onMouseLeave={()=>setLoginMenu(false)}>
              <button onClick={()=>setLoginMenu(!loginMenu)} data-testid="nav-login" className="flex items-center gap-2 h-10 px-4 rounded-full border border-[var(--coral)] text-[var(--coral)] text-sm font-semibold hover:bg-[var(--coral)] hover:text-white transition-colors">
                <User size={14}/> Login <ChevronDown size={12}/>
              </button>
              {loginMenu && (
                <div className="dropdown" data-testid="nav-login-dropdown">
                  <Link to="/login/client" onClick={()=>setLoginMenu(false)} data-testid="nav-login-client"><Heart size={14}/> I'm planning my wedding</Link>
                  <Link to="/login/vendor" onClick={()=>setLoginMenu(false)} data-testid="nav-login-vendor"><Store size={14}/> I'm a vendor</Link>
                  <div className="border-t border-[var(--border)] my-1"/>
                  <Link to="/register/client" onClick={()=>setLoginMenu(false)} data-testid="nav-register-client" className="!text-[var(--coral)] font-semibold">Create client account</Link>
                  <Link to="/register/vendor" onClick={()=>setLoginMenu(false)} data-testid="nav-register-vendor" className="!text-[var(--coral)] font-semibold">List your business</Link>
                </div>
              )}
            </div>
          )}
          <Link to="/matchmaker" data-testid="nav-matchmaker" className="btn-gold !py-2.5 !px-5 text-xs">
            <Sparkles size={13} /> AI Match
          </Link>
        </div>
        <button onClick={() => setOpen(!open)} className="lg:hidden text-[var(--ink)]" data-testid="nav-mobile-toggle">{open ? <X /> : <Menu />}</button>
      </div>
      {open && (
        <div className="lg:hidden border-t border-[var(--border)] bg-white px-6 py-4 space-y-3">
          {links.map(l => (<Link key={l.label} to={l.to} onClick={() => setOpen(false)} className="block text-sm font-semibold uppercase tracking-widest text-[var(--ink)]">{l.label}</Link>))}
          {!user && (
            <>
              <Link to="/login/client" onClick={()=>setOpen(false)} className="block text-sm font-semibold text-[var(--coral)]">Client Login</Link>
              <Link to="/login/vendor" onClick={()=>setOpen(false)} className="block text-sm font-semibold text-[var(--coral)]">Vendor Login</Link>
            </>
          )}
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-semibold text-[var(--coral)]"><Instagram size={14}/> Instagram</a>
          <Link to="/matchmaker" onClick={() => setOpen(false)} className="btn-gold !w-full justify-center !py-3 text-sm"><Sparkles size={16}/> AI Matchmaker</Link>
        </div>
      )}
    </header>
  );
}

// ======================== FOOTER ========================
function Footer() {
  return (
    <footer className="bg-[var(--ink)] text-white/85 mt-24" data-testid="footer">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 grid md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img src={LOGO} alt="Shaadi Saga India" className="h-16 w-16 object-cover rounded-full border-2 border-[var(--coral-soft)]"/>
            <div>
              <div className="font-brand brand-gradient text-4xl leading-none">ShaadiSagaIndia</div>
              <div className="text-[var(--coral-soft)] text-[9px] tracking-[0.3em] uppercase mt-1.5">Wedding Planning &amp; Styling</div>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-white/70">India's modern wedding marketplace — verified vendors, real prices, AI matchmaking. Est. 2026.</p>
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" data-testid="footer-instagram" className="inline-flex items-center gap-2 mt-5 text-sm text-[var(--coral-soft)] hover:text-white">
            <Instagram size={16}/> @vanshajhanda
          </a>
        </div>
        <div>
          <h4 className="text-[var(--coral-soft)] uppercase text-xs tracking-widest mb-4 font-semibold">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/vendors" className="hover:text-white">All Vendors</Link></li>
            <li><Link to="/vendors?category=venues" className="hover:text-white">Venues</Link></li>
            <li><Link to="/vendors?category=mehendi" className="hover:text-white">Mehendi Artists</Link></li>
            <li><Link to="/real-weddings" className="hover:text-white">Real Weddings</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[var(--coral-soft)] uppercase text-xs tracking-widest mb-4 font-semibold">Account</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/login/client" className="hover:text-white">Client Login</Link></li>
            <li><Link to="/login/vendor" className="hover:text-white">Vendor Login</Link></li>
            <li><Link to="/register/vendor" className="hover:text-white">List Your Business</Link></li>
            <li><Link to="/contact" className="hover:text-white">Get in Touch</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[var(--coral-soft)] uppercase text-xs tracking-widest mb-4 font-semibold">Contact</h4>
          <a href={`tel:${PHONE.replace(/\s/g,'')}`} className="text-sm flex items-center gap-2 hover:text-white" data-testid="footer-phone"><Phone size={14}/> {PHONE}</a>
          <p className="text-sm flex items-center gap-2 mt-2"><Mail size={14}/> hello@shaadisaga.in</p>
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="text-sm flex items-center gap-2 mt-2 hover:text-white"><Instagram size={14}/> Instagram</a>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/50">© 2026 ShaadiSagaIndia · Wedding Planning &amp; Styling · All shaadi, no drama.</div>
    </footer>
  );
}

// ======================== AUTH PAGES ========================
function AuthShell({ title, subtitle, children }) {
  return (
    <div className="min-h-[calc(100vh-200px)] grid lg:grid-cols-2">
      <div className="hidden lg:block relative">
        <img src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=85" className="w-full h-full object-cover" alt=""/>
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--coral)]/20 to-[var(--coral-2)]/40"/>
        <div className="absolute inset-0 flex items-end p-12">
          <div className="text-white">
            <div className="font-script text-6xl leading-none">ShaadiSagaIndia</div>
            <div className="text-sm mt-2 tracking-widest uppercase opacity-90">Your shaadi, beautifully planned.</div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          <div className="ornament mb-3"><span>Welcome</span></div>
          <h1 className="font-script text-[var(--coral)] text-5xl md:text-6xl leading-none">{title}</h1>
          <p className="text-[var(--muted)] mt-3">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

function LoginPage({ role }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const submit = async (e) => {
    e.preventDefault(); setErr(""); setLoading(true);
    try {
      await login({ ...form, role });
      navigate("/dashboard");
    } catch (ex) {
      setErr(formatErr(ex.response?.data?.detail) || "Login failed");
    }
    setLoading(false);
  };
  const title = role === "vendor" ? "Vendor Login" : "Welcome back";
  const subtitle = role === "vendor" ? "Manage your listings, bookings & profile." : "Sign in to save vendors, chat, and plan your shaadi.";
  return (
    <AuthShell title={title} subtitle={subtitle}>
      <form onSubmit={submit} className="space-y-4" data-testid={`login-form-${role}`}>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--coral)]">Email</label>
          <input type="email" required value={form.email} onChange={e=>setForm({...form, email:e.target.value})} data-testid="login-email" className="w-full mt-2 px-4 py-3 rounded-xl border border-[var(--border)] bg-white outline-none focus:border-[var(--coral)]"/>
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--coral)]">Password</label>
          <input type="password" required minLength={6} value={form.password} onChange={e=>setForm({...form, password:e.target.value})} data-testid="login-password" className="w-full mt-2 px-4 py-3 rounded-xl border border-[var(--border)] bg-white outline-none focus:border-[var(--coral)]"/>
        </div>
        {err && <div className="text-sm text-[var(--coral-2)] bg-[var(--coral-wash)] p-3 rounded-xl border border-[var(--coral-soft)]" data-testid="login-error">{err}</div>}
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center !py-4" data-testid="login-submit">
          {loading ? "Signing in..." : `Sign in as ${role}`}
        </button>
      </form>
      <div className="mt-6 space-y-2 text-sm text-center">
        <div>New to Shaadi Saga? <Link to={`/register/${role}`} className="link-u">Create a {role} account</Link></div>
        <div className="text-[var(--muted)]">Or <Link to={`/login/${role==="client"?"vendor":"client"}`} className="link-u">switch to {role==="client"?"vendor":"client"} login</Link></div>
      </div>
    </AuthShell>
  );
}

function RegisterPage({ role }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", business_name: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const submit = async (e) => {
    e.preventDefault(); setErr(""); setLoading(true);
    try {
      const payload = { ...form, role };
      if (role !== "vendor") delete payload.business_name;
      await register(payload);
      navigate("/dashboard");
    } catch (ex) {
      setErr(formatErr(ex.response?.data?.detail) || "Registration failed");
    }
    setLoading(false);
  };
  const title = role === "vendor" ? "List your business" : "Create account";
  const subtitle = role === "vendor" ? "Join 500+ vendors growing with Shaadi Saga." : "Plan your dream shaadi with AI-powered help.";
  return (
    <AuthShell title={title} subtitle={subtitle}>
      <form onSubmit={submit} className="space-y-4" data-testid={`register-form-${role}`}>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--coral)]">Your name</label>
          <input required value={form.name} onChange={e=>setForm({...form, name:e.target.value})} data-testid="register-name" className="w-full mt-2 px-4 py-3 rounded-xl border border-[var(--border)] bg-white outline-none focus:border-[var(--coral)]"/>
        </div>
        {role === "vendor" && (
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--coral)]">Business name</label>
            <input required value={form.business_name} onChange={e=>setForm({...form, business_name:e.target.value})} data-testid="register-business" className="w-full mt-2 px-4 py-3 rounded-xl border border-[var(--border)] bg-white outline-none focus:border-[var(--coral)]"/>
          </div>
        )}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--coral)]">Email</label>
          <input type="email" required value={form.email} onChange={e=>setForm({...form, email:e.target.value})} data-testid="register-email" className="w-full mt-2 px-4 py-3 rounded-xl border border-[var(--border)] bg-white outline-none focus:border-[var(--coral)]"/>
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--coral)]">Phone (optional)</label>
          <input value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} data-testid="register-phone" className="w-full mt-2 px-4 py-3 rounded-xl border border-[var(--border)] bg-white outline-none focus:border-[var(--coral)]"/>
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--coral)]">Password (min 6)</label>
          <input type="password" required minLength={6} value={form.password} onChange={e=>setForm({...form, password:e.target.value})} data-testid="register-password" className="w-full mt-2 px-4 py-3 rounded-xl border border-[var(--border)] bg-white outline-none focus:border-[var(--coral)]"/>
        </div>
        {err && <div className="text-sm text-[var(--coral-2)] bg-[var(--coral-wash)] p-3 rounded-xl border border-[var(--coral-soft)]" data-testid="register-error">{err}</div>}
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center !py-4" data-testid="register-submit">
          {loading ? "Creating..." : `Create ${role} account`}
        </button>
      </form>
      <div className="mt-6 text-sm text-center">
        Already registered? <Link to={`/login/${role}`} className="link-u">Sign in as {role}</Link>
      </div>
    </AuthShell>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const [picks, setPicks] = useState([]);
  useEffect(() => {
    if (user?.role === "client") {
      axios.get(`${API}/vendors?limit=6&verified_only=true&min_rating=4.8`).then(r => setPicks(r.data)).catch(()=>{});
    }
  }, [user]);
  if (user === null) return <div className="text-center py-20 text-[var(--muted)]">Loading…</div>;
  if (!user) return <Navigate to="/login/client" replace/>;
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const emoji = hour < 12 ? "🌅" : hour < 17 ? "☀️" : "🌙";
  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-10 py-12" data-testid="dashboard-page">
      <div className="flex items-center gap-2 text-[var(--coral)] text-xs uppercase tracking-[0.25em] font-bold mb-3">
        <span className="pulse-heart inline-block">{emoji}</span> {greet}
      </div>
      <h1 className="font-brand brand-gradient text-6xl md:text-7xl leading-none">Namaste, {user.name.split(" ")[0]}!</h1>

      <div className="grid md:grid-cols-3 gap-4 mt-8">
        <div className="card-warm p-5">
          <div className="text-[10px] uppercase tracking-widest text-[var(--coral)] font-bold mb-1">Email</div>
          <div className="font-semibold text-sm truncate">{user.email}</div>
        </div>
        <div className="card-warm p-5">
          <div className="text-[10px] uppercase tracking-widest text-[var(--coral)] font-bold mb-1">Role</div>
          <div className="font-semibold text-sm capitalize">{user.role}</div>
        </div>
        <div className="card-warm p-5">
          <div className="text-[10px] uppercase tracking-widest text-[var(--coral)] font-bold mb-1">{user.role === "vendor" ? "Business" : "Phone"}</div>
          <div className="font-semibold text-sm truncate">{user.business_name || user.phone || "—"}</div>
        </div>
      </div>

      {user.role === "client" && picks.length > 0 && (
        <div className="mt-12" data-testid="dashboard-picks">
          <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
            <div>
              <div className="ornament mb-2"><span>Fresh picks for you</span></div>
              <h2 className="font-script text-[var(--coral)] text-4xl md:text-5xl">Top verified vendors</h2>
            </div>
            <Link to="/matchmaker" className="btn-gold !py-2.5 !px-5 text-xs"><Sparkles size={14}/> Personalize with AI</Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {picks.map(v => <VendorCard key={v.id} vendor={v}/>)}
          </div>
        </div>
      )}

      <div className="mt-10 flex gap-3 flex-wrap">
        <Link to="/vendors" className="btn-primary"><Search size={14}/> Browse Vendors</Link>
        <Link to="/matchmaker" className="btn-outline"><Sparkles size={14}/> AI Matchmaker</Link>
      </div>
    </div>
  );
}

// ======================== PERSONAL WELCOME ========================
function PersonalWelcome() {
  const { user } = useAuth();
  const [picks, setPicks] = useState([]);
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem("welcome-dismissed") === "1");

  useEffect(() => {
    if (user && user.role === "client" && !dismissed) {
      axios.get(`${API}/vendors?limit=3&verified_only=true&min_rating=4.8`)
        .then(r => setPicks(r.data.slice(0, 3))).catch(()=>{});
    }
  }, [user, dismissed]);

  if (!user || user.role !== "client" || dismissed || picks.length === 0) return null;

  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const emoji = hour < 12 ? "🌅" : hour < 17 ? "☀️" : "🌙";
  const first = user.name.split(" ")[0];

  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-10 pt-6" data-testid="personal-welcome">
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[var(--coral-wash)] via-white to-[var(--bg-soft)] border border-[var(--coral-soft)] p-6 md:p-8 fade-up">
        <button
          onClick={() => { sessionStorage.setItem("welcome-dismissed","1"); setDismissed(true); }}
          data-testid="welcome-dismiss"
          className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-[var(--coral-wash)] flex items-center justify-center text-[var(--muted)]">
          <X size={16}/>
        </button>
        <div className="grid md:grid-cols-[1.2fr_2fr] gap-6 items-center">
          <div>
            <div className="flex items-center gap-2 text-[var(--coral)] text-xs uppercase tracking-[0.25em] font-bold mb-2">
              <span className="pulse-heart inline-block">{emoji}</span> {greet}
            </div>
            <h2 className="font-brand brand-gradient text-5xl leading-none" data-testid="welcome-name">Namaste, {first}!</h2>
            <p className="text-[var(--ink-2)] mt-3 text-sm leading-relaxed">
              3 fresh picks from our top-rated verified vendors — handpicked for your shaadi planning.
            </p>
            <Link to="/dashboard" className="btn-outline !py-2.5 !px-4 text-xs mt-4" data-testid="welcome-dashboard">
              <User size={13}/> My Dashboard <ArrowRight size={12}/>
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {picks.map((v, i) => (
              <Link key={v.id} to={`/vendor/${v.id}`} data-testid={`welcome-pick-${i}`} className="group bg-white border border-[var(--border)] rounded-xl overflow-hidden hover:border-[var(--coral)] hover:shadow-lg transition-all">
                <div className="relative h-24 overflow-hidden">
                  <img src={v.images[0]} alt={v.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
                  {v.verified && <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[var(--coral)] flex items-center justify-center"><Shield size={10} className="text-white"/></div>}
                </div>
                <div className="p-2.5">
                  <div className="text-[9px] text-[var(--coral)] font-bold uppercase tracking-widest truncate">{v.category}</div>
                  <div className="font-display text-sm font-600 text-[var(--ink)] truncate leading-tight mt-0.5">{v.name}</div>
                  <div className="flex items-center justify-between mt-1.5">
                    <div className="text-[10px] text-[var(--muted)] flex items-center gap-0.5"><Star size={9} className="fill-[var(--gold)] text-[var(--gold)]"/> {v.rating}</div>
                    <div className="text-[10px] font-bold text-[var(--ink)]">{formatINR(v.starting_price)}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
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

  const popularSearches = ["Venues Delhi", "Bridal Makeup Mumbai", "Mehendi Jaipur", "Udaipur Destination", "Content Creators", "Boho Decor"];

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search.category) params.set("category", search.category);
    if (search.city) params.set("city", search.city);
    if (search.budget) params.set("max_budget", search.budget);
    navigate(`/vendors?${params.toString()}`);
  };

  return (
    <div data-testid="home-page">
      <PersonalWelcome/>
      <RecentlyViewed/>
      {/* HERO */}
      <section className="relative overflow-hidden" data-testid="home-hero">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-16 pb-10 lg:pt-20 lg:pb-16 grid lg:grid-cols-[1.05fr_1fr] gap-12 items-center">
          <div className="fade-up">
            <div className="ornament mb-5"><span>India's Modern Wedding Marketplace</span></div>
            <h1 className="font-script text-[var(--coral)] text-6xl md:text-7xl lg:text-[120px] leading-[0.9]">Your shaadi,</h1>
            <h1 className="font-display italic text-[var(--ink)] text-3xl md:text-5xl mt-1">beautifully planned.</h1>
            <p className="text-[var(--muted)] text-lg mt-6 max-w-xl leading-relaxed">
              Hum aapke saath hain, from the first "haan" to the last pheri. Verified vendors, transparent prices, and an AI matchmaker that truly understands your vibe.
            </p>
            <div className="flex items-center gap-4 mt-8">
              <Link to="/vendors" className="btn-primary" data-testid="hero-cta-browse"><Search size={15}/> Browse Vendors</Link>
              <Link to="/matchmaker" className="btn-outline" data-testid="hero-cta-matchmaker"><Sparkles size={15}/> Try Matchmaker</Link>
            </div>
            <div className="flex items-center gap-8 mt-10 pt-8 border-t border-[var(--border)]">
              <div>
                <div className="font-display text-4xl font-700"><CountUp to={500} suffix="+"/></div>
                <div className="text-xs text-[var(--muted)] mt-0.5">Verified vendors</div>
              </div>
              <div>
                <div className="font-display text-4xl font-700"><CountUp to={19}/></div>
                <div className="text-xs text-[var(--muted)] mt-0.5">Categories</div>
              </div>
              <div>
                <div className="font-display text-4xl font-700"><CountUp to={48} suffix=""/><span className="count-up">★</span></div>
                <div className="text-xs text-[var(--muted)] mt-0.5">Avg rating (4.8)</div>
              </div>
            </div>
          </div>
          <div className="relative fade-up delay-2">
            <div className="hero-canvas" data-testid="hero-motion">
              {/* Ken Burns wedding image */}
              <img src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1400&q=85" alt="Indian wedding" className="hero-img"/>
              <div className="hero-img-tint"/>
              <div className="light-sweep"/>

              {/* Floating bokeh orbs */}
              <div className="bokeh b1"/>
              <div className="bokeh b2"/>
              <div className="bokeh b3"/>
              <div className="bokeh b4"/>

              {/* Floating petals */}
              {["p1","p2","p3","p4","p5","p6","p7","p8"].map(p => (
                <div key={p} className={`petal ${p}`} style={{top:"100%"}}>
                  <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
                    <circle cx="16" cy="16" r="6" fill="#FFB7C5" opacity="0.9"/>
                    <circle cx="10" cy="12" r="5" fill="#E85A72" opacity="0.8"/>
                    <circle cx="22" cy="12" r="5" fill="#E85A72" opacity="0.8"/>
                    <circle cx="10" cy="20" r="5" fill="#E85A72" opacity="0.8"/>
                    <circle cx="22" cy="20" r="5" fill="#E85A72" opacity="0.8"/>
                    <circle cx="16" cy="16" r="3" fill="#D4A944"/>
                  </svg>
                </div>
              ))}

              {/* Centered script overlay */}
              <div className="hero-center">
                <div className="reveal-text mb-3 pulse-heart">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/30 text-white text-[10px] tracking-[0.3em] uppercase font-semibold">
                    <Sparkles size={12}/> Shubh Vivah
                  </div>
                </div>
                <h3 className="reveal-text r2 font-script shimmer-text text-6xl md:text-7xl leading-none drop-shadow-lg">Your shaadi,</h3>
                <h3 className="reveal-text r3 font-display italic text-white text-2xl md:text-3xl mt-2" style={{textShadow:"0 2px 20px rgba(0,0,0,0.5)"}}>a story to cherish.</h3>
                <div className="reveal-text r3 mt-6 flex gap-2 justify-center">
                  <span className="w-12 h-0.5 bg-[var(--gold-soft)]"/>
                  <span className="w-2 h-2 rounded-full bg-[var(--gold-soft)] -translate-y-0.5"/>
                  <span className="w-12 h-0.5 bg-[var(--gold-soft)]"/>
                </div>
              </div>

              {/* Gold corner ornaments */}
              <svg className="absolute top-4 left-4 w-10 h-10 opacity-80 z-5" viewBox="0 0 40 40" fill="#FFE4B5">
                <path d="M0 0 L40 0 L40 3 Q20 3, 3 20 Q3 40, 0 40 Z"/>
              </svg>
              <svg className="absolute top-4 right-4 w-10 h-10 opacity-80 -scale-x-100 z-5" viewBox="0 0 40 40" fill="#FFE4B5">
                <path d="M0 0 L40 0 L40 3 Q20 3, 3 20 Q3 40, 0 40 Z"/>
              </svg>
              <svg className="absolute bottom-4 left-4 w-10 h-10 opacity-80 -scale-y-100 z-5" viewBox="0 0 40 40" fill="#FFE4B5">
                <path d="M0 0 L40 0 L40 3 Q20 3, 3 20 Q3 40, 0 40 Z"/>
              </svg>
              <svg className="absolute bottom-4 right-4 w-10 h-10 opacity-80 -scale-100 z-5" viewBox="0 0 40 40" fill="#FFE4B5">
                <path d="M0 0 L40 0 L40 3 Q20 3, 3 20 Q3 40, 0 40 Z"/>
              </svg>
            </div>

            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl border border-[var(--border)] flex items-center gap-3 max-w-[260px] float-badge">
              <div className="w-10 h-10 rounded-full bg-[var(--coral-wash)] flex items-center justify-center text-[var(--coral)]"><Shield size={18}/></div>
              <div>
                <div className="text-xs font-semibold text-[var(--ink)]">Verified vendors only</div>
                <div className="text-[11px] text-[var(--muted)] mt-0.5">GST & references checked</div>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 bg-[var(--coral)] text-white rounded-2xl p-4 shadow-xl max-w-[220px] float-badge" style={{animationDelay:"0.4s"}}>
              <div className="flex items-center gap-2 text-white/90 text-[10px] uppercase tracking-widest font-semibold"><Sparkles size={12}/> New 2026</div>
              <div className="text-sm font-medium mt-1.5">AI Matchmaker finds your 3 perfect vendors</div>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="max-w-6xl mx-auto px-6 lg:px-10 pb-10 fade-up delay-3">
          <div className="bg-white rounded-2xl p-4 md:p-5 shadow-[0_30px_60px_-30px_rgba(232,90,114,0.25)] border border-[var(--border)] grid md:grid-cols-[1.2fr_1.3fr_2fr_auto] gap-3 items-end">
            <div className="px-3">
              <label className="text-[10px] uppercase tracking-widest text-[var(--muted)] font-semibold">City</label>
              <input data-testid="hero-search-city" value={search.city} onChange={e=>setSearch({...search, city:e.target.value})} placeholder="Delhi, Mumbai, Udaipur…" className="w-full bg-transparent outline-none text-[var(--ink)] placeholder:text-[var(--muted-2)] text-base py-1.5"/>
            </div>
            <div className="px-3 md:border-l md:border-[var(--border)]">
              <label className="text-[10px] uppercase tracking-widest text-[var(--muted)] font-semibold">Category</label>
              <select data-testid="hero-search-category" value={search.category} onChange={e=>setSearch({...search, category:e.target.value})} className="w-full bg-transparent outline-none text-[var(--ink)] text-base py-1.5">
                <option value="">Any category</option>
                {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            <div className="px-3 md:border-l md:border-[var(--border)]">
              <label className="text-[10px] uppercase tracking-widest text-[var(--muted)] font-semibold flex justify-between">
                <span>Budget (up to)</span>
                <span className="text-[var(--coral)] font-bold">{formatINR(search.budget)}</span>
              </label>
              <input data-testid="hero-search-budget" type="range" min="10000" max="10000000" step="10000" value={search.budget} onChange={e=>setSearch({...search, budget:parseInt(e.target.value)})} className="shaadi-range mt-2"/>
            </div>
            <button data-testid="hero-search-submit" onClick={handleSearch} className="btn-primary !py-4 justify-center"><Search size={16}/> Search</button>
          </div>
          <div className="mt-5 flex flex-wrap gap-2 items-center">
            <span className="text-xs text-[var(--muted)] mr-1">Trending:</span>
            {popularSearches.map(p => (
              <Link key={p} to="/vendors" data-testid={`popular-${p.toLowerCase().replace(/\s/g,'-')}`} className="chip hover:bg-[var(--coral)] hover:text-white hover:border-[var(--coral)] transition-colors">{p}</Link>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16" data-testid="home-categories">
        <div className="text-center mb-10">
          <div className="ornament mb-3"><span>Plan every ceremony</span></div>
          <h2 className="font-script text-[var(--coral)] text-5xl md:text-6xl">Wedding Categories</h2>
          <p className="text-[var(--muted)] max-w-xl mx-auto mt-3">From mandap to mehendi — every vendor you need.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.map((c, i) => {
            const Icon = ICONS[c.icon] || Sparkles;
            return (
              <Link key={c.slug} to={`/vendors?category=${c.slug}`} data-testid={`category-${c.slug}`} className="card-warm group fade-up" style={{animationDelay: `${i*40}ms`}}>
                <div className="relative h-36 overflow-hidden">
                  <img src={c.image} alt={c.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"/>
                  <div className="absolute top-3 left-3 w-9 h-9 rounded-full bg-white flex items-center justify-center text-[var(--coral)] shadow-sm">
                    <Icon size={15}/>
                  </div>
                </div>
                <div className="p-4">
                  <div className="font-display text-xl font-600 text-[var(--ink)] leading-tight">{c.name}</div>
                  <div className="text-[10px] text-[var(--muted)] mt-1 tracking-widest uppercase">{c.count} vendors</div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* AI MATCHMAKER CTA */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-12" data-testid="home-matchmaker-cta">
        <div className="relative rounded-[28px] overflow-hidden bg-gradient-to-br from-[var(--coral)] via-[var(--coral-2)] to-[var(--coral)] p-10 md:p-16 text-white">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/15 rounded-full blur-3xl -mr-20 -mt-20"/>
          <div className="relative grid md:grid-cols-[1.3fr_1fr] gap-10 items-center">
            <div>
              <div className="chip !bg-white/15 !text-white !border-white/30 mb-5"><Sparkles size={12}/> New · 2026</div>
              <h2 className="font-script text-5xl md:text-7xl text-white mb-2">The Matchmaker</h2>
              <p className="font-display italic text-white/95 text-xl md:text-2xl mb-5">Powered by AI. Guided by tradition.</p>
              <p className="text-white/85 text-base max-w-xl">Tell us your budget, vibe &amp; city — we'll hand-pick 3 vendors in seconds.</p>
              <Link to="/matchmaker" className="btn-gold mt-7" data-testid="home-matchmaker-btn"><Sparkles size={16}/> Try Matchmaker <ArrowRight size={14}/></Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {["Budget","Theme","City"].map((t,i) => (
                <div key={t} className="bg-white/10 border border-white/20 rounded-2xl p-4 backdrop-blur-sm text-center">
                  <div className="font-display text-4xl font-700 text-white">0{i+1}</div>
                  <div className="text-[10px] mt-2 uppercase tracking-widest font-semibold text-white/90">{t}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16" data-testid="home-featured">
          <div className="text-center mb-10">
            <div className="ornament mb-3"><span>Handpicked · Verified</span></div>
            <h2 className="font-script text-[var(--coral)] text-5xl md:text-6xl">Featured Vendors</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{featured.map(v => <VendorCard key={v.id} vendor={v}/>)}</div>
          <div className="text-center mt-10"><Link to="/vendors" className="btn-outline">View All Vendors <ArrowRight size={14}/></Link></div>
        </section>
      )}

      {/* REAL WEDDINGS */}
      {realWeddings.length > 0 && (
        <section className="cream-bg py-20" data-testid="home-real-weddings">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="text-center mb-10">
              <div className="ornament mb-3"><span>Love in action</span></div>
              <h2 className="font-script text-[var(--coral)] text-5xl md:text-6xl">Real Shaadi Stories</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {realWeddings.map((w, i) => (
                <div key={w.id} className="card-warm group fade-up" style={{animationDelay: `${i*60}ms`}} data-testid={`realwedding-${i}`}>
                  <div className="relative h-64 overflow-hidden">
                    <img src={w.image} alt={w.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"/>
                    <div className="absolute top-3 right-3 chip !bg-white/95">{w.theme}</div>
                  </div>
                  <div className="p-5">
                    <div className="text-[10px] text-[var(--coral)] font-bold uppercase tracking-[0.2em] flex items-center gap-1"><MapPin size={10}/> {w.location}</div>
                    <div className="font-display text-xl font-600 mt-2 text-[var(--ink)] leading-snug">{w.title}</div>
                    <p className="text-sm text-[var(--muted)] mt-2 leading-relaxed line-clamp-3">{w.story}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TESTIMONIALS STRIP */}
      <section className="py-14 bg-gradient-to-br from-[var(--coral-wash)] via-white to-[var(--bg-soft)] overflow-hidden border-y border-[var(--border)]" data-testid="home-testimonials">
        <div className="text-center mb-8">
          <div className="ornament mb-3"><span>Real couples · Real joy</span></div>
          <h2 className="font-display text-3xl md:text-4xl text-[var(--ink)]">The shaadis we've been part of</h2>
        </div>
        <div className="marquee-slow">
          {[0, 1].map((row) => (
            <div key={`row-${row}`} className="flex gap-6 items-center">
              {[
                {n:"Priya & Arjun", l:"Udaipur", q:"Shaadi Saga made our destination wedding effortless. 5 vendors, zero stress."},
                {n:"Neha & Rohit", l:"Delhi NCR", q:"AI Matchmaker nailed our boho-chic vibe. Saved us 3 weeks of research."},
                {n:"Sara & Dev", l:"Bengaluru", q:"Transparent pricing finally! No more 'contact for quote' headaches."},
                {n:"Anaya & Vihaan", l:"Mumbai", q:"Veena Nagda for mehendi was a dream. Verified badge is legit."},
                {n:"Kiara & Rahul", l:"Jaipur", q:"From Sabyasachi to pandit ji — all in one place. Thank you Shaadi Saga!"},
                {n:"Isha & Karan", l:"Goa", q:"Booked 3 vendors in one afternoon. That's the 2026 way."},
              ].map((t) => (
                <div key={`${row}-${t.n}`} className="bg-white border border-[var(--border)] rounded-2xl p-5 w-80 shadow-sm">
                  <div className="flex items-center gap-1 text-[var(--gold)] mb-2">
                    {["s1","s2","s3","s4","s5"].map(s => <Star key={s} size={13} className="fill-[var(--gold)]"/>)}
                  </div>
                  <p className="text-sm text-[var(--ink-2)] italic leading-relaxed font-display">"{t.q}"</p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[var(--coral-wash)] text-[var(--coral)] flex items-center justify-center font-display font-700 text-sm">{t.n.charAt(0)}</div>
                    <div>
                      <div className="text-xs font-bold text-[var(--ink)]">{t.n}</div>
                      <div className="text-[10px] text-[var(--muted)] flex items-center gap-1"><MapPin size={9}/> {t.l}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* WHY */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-24" data-testid="home-why">
        <div className="text-center mb-14">
          <div className="ornament mb-3"><span>Why Shaadi Saga</span></div>
          <h2 className="font-script text-[var(--coral)] text-5xl md:text-6xl">Built for the 2026 couple</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {icon: Shield, title: "Verified vendors only", desc: "Every vendor's GST & 3 client references checked before the badge."},
            {icon: Sparkles, title: "AI Matchmaker", desc: "Describe your vibe. We match you with vendors who get it."},
            {icon: Heart, title: "Direct chat & prices", desc: "Real starting prices, real-time chat — no middlemen."},
          ].map(b => (
            <div key={b.title} className="card-warm p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[var(--coral-wash)] text-[var(--coral)] flex items-center justify-center mx-auto mb-5"><b.icon size={22}/></div>
              <h3 className="font-display text-2xl font-600 text-[var(--ink)]">{b.title}</h3>
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
  const { user, favIds, toggleFav } = useAuth();
  const isFav = favIds?.has(vendor.id);
  const navigate = useNavigate();
  const handleFav = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) { navigate("/login/client"); return; }
    await toggleFav(vendor.id);
  };
  const waLink = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hi! I'm interested in ${vendor.name} (${vendor.category}, ${vendor.city}) from Shaadi Saga India.`)}`;
  return (
    <Link to={`/vendor/${vendor.id}`} className="card-warm group block fade-up relative" data-testid={`vendor-card-${vendor.id}`}>
      <div className="relative h-60 overflow-hidden">
        <img src={vendor.images[0]} alt={vendor.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" onError={(e)=>{e.target.src="https://images.unsplash.com/photo-1519741497674-611481863552?w=900";}}/>
        {vendor.verified && <div className="verified-badge absolute top-3 left-3"><Shield size={10}/> Verified</div>}
        <div className="absolute top-3 right-3 chip !bg-white/95">
          <Star size={12} className="fill-[var(--gold)] text-[var(--gold)]"/> {vendor.rating} <span className="text-[var(--muted)] font-normal">({vendor.reviews})</span>
        </div>
        {/* Heart favourite */}
        <button onClick={handleFav} data-testid={`fav-${vendor.id}`} aria-label="Save to favourites"
          className={`absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all ${isFav ? "bg-[var(--coral)] text-white scale-110" : "bg-white/95 text-[var(--coral)] hover:bg-[var(--coral)] hover:text-white"}`}>
          <Heart size={16} className={isFav ? "fill-white" : ""}/>
        </button>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-1.5 text-[10px] text-[var(--coral)] font-bold uppercase tracking-[0.2em]"><MapPin size={10}/> {vendor.city}</div>
        <h3 className="font-display text-2xl font-600 mt-2 text-[var(--ink)] leading-snug group-hover:text-[var(--coral)] transition-colors">{vendor.name}</h3>
        <p className="text-sm text-[var(--muted)] mt-2 line-clamp-2 leading-relaxed">{vendor.description}</p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {vendor.tags.slice(0,3).map(t => <span key={t} className="text-[10px] font-semibold px-2 py-1 rounded-full bg-[var(--coral-wash)] text-[var(--coral-2)] border border-[var(--coral-soft)]">{t}</span>)}
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--border)]">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Starting at</div>
            <div className="font-display text-2xl font-700 text-[var(--ink)]">{formatINR(vendor.starting_price)}</div>
          </div>
          <button type="button" onClick={(e)=>{e.preventDefault(); e.stopPropagation(); window.open(waLink, "_blank");}} data-testid={`wa-${vendor.id}`}
             className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#25D366] text-white text-xs font-bold hover:scale-105 transition-transform">
            <MessageCircle size={14}/> WhatsApp
          </button>
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
    min_budget: 0, verified_only: false, min_rating: 0, q: "",
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
    axios.get(`${API}/vendors`, { params }).then(r => { setVendors(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, [filters]);

  const updateFilter = (k, v) => setFilters({ ...filters, [k]: v });
  const activeCat = categories.find(c => c.slug === filters.category);

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12" data-testid="vendors-page">
      <div className="mb-10 fade-up text-center">
        <div className="ornament mb-3"><span>Browse &amp; book</span></div>
        <h1 className="font-script text-[var(--coral)] text-5xl md:text-7xl">{activeCat ? activeCat.name : "All Vendors"}</h1>
        <p className="text-[var(--muted)] mt-3 max-w-2xl mx-auto">{vendors.length} vendors match your filters. Transparent starting prices — no "contact for quote" nonsense.</p>
      </div>
      <div className="grid lg:grid-cols-[300px_1fr] gap-10">
        <aside className="card-warm p-6 h-fit lg:sticky lg:top-28" data-testid="vendors-filters">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-xl font-600 text-[var(--ink)] flex items-center gap-2"><Filter size={16}/> Filters</h3>
            <button onClick={() => setFilters({category:"", city:"", max_budget:10000000, min_budget:0, verified_only:false, min_rating:0, q:""})} className="text-xs text-[var(--coral)] font-semibold underline" data-testid="filter-clear">Clear</button>
          </div>
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--coral)]">Search</label>
              <input data-testid="filter-q" value={filters.q} onChange={e=>updateFilter('q',e.target.value)} placeholder="Name, tag…" className="w-full mt-2 px-3 py-2.5 rounded-lg border border-[var(--border)] bg-white text-sm outline-none focus:border-[var(--coral)]"/>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--coral)]">Category</label>
              <select data-testid="filter-category" value={filters.category} onChange={e=>updateFilter('category',e.target.value)} className="w-full mt-2 px-3 py-2.5 rounded-lg border border-[var(--border)] bg-white text-sm outline-none focus:border-[var(--coral)]">
                <option value="">All categories</option>
                {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--coral)]">City</label>
              <input data-testid="filter-city" value={filters.city} onChange={e=>updateFilter('city',e.target.value)} placeholder="e.g. Delhi" className="w-full mt-2 px-3 py-2.5 rounded-lg border border-[var(--border)] bg-white text-sm outline-none focus:border-[var(--coral)]"/>
            </div>
            <div>
              <div className="flex justify-between">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--coral)]">Max Budget</label>
                <span className="text-xs font-display font-700 text-[var(--ink)]">{formatINR(filters.max_budget)}</span>
              </div>
              <input data-testid="filter-max-budget" type="range" min="5000" max="10000000" step="5000" value={filters.max_budget} onChange={e=>updateFilter('max_budget',parseInt(e.target.value))} className="shaadi-range mt-3"/>
              <div className="flex justify-between text-[10px] text-[var(--muted)] mt-1"><span>₹5K</span><span>₹1 Cr+</span></div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--coral)]">Min Rating</label>
              <div className="flex gap-2 mt-2">
                {[0, 4, 4.5, 4.8].map(r => (
                  <button key={r} onClick={()=>updateFilter('min_rating',r)} data-testid={`filter-rating-${r}`} className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${filters.min_rating===r ? 'bg-[var(--coral)] text-white' : 'bg-[var(--coral-wash)] text-[var(--coral-2)]'}`}>
                    {r === 0 ? 'Any' : `${r}+`}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-3 cursor-pointer" data-testid="filter-verified-label">
              <input type="checkbox" checked={filters.verified_only} onChange={e=>updateFilter('verified_only',e.target.checked)} data-testid="filter-verified" className="w-5 h-5 accent-[var(--coral)]"/>
              <span className="text-sm font-semibold text-[var(--ink)] flex items-center gap-1.5"><Shield size={14} className="text-[var(--coral)]"/> Verified only</span>
            </label>
          </div>
        </aside>
        <div>
          {loading ? <div className="text-center py-20 text-[var(--muted)]" data-testid="vendors-loading">Loading…</div>
          : vendors.length === 0 ? (
            <div className="text-center py-20 card-warm p-10" data-testid="vendors-empty">
              <Sparkles size={28} className="text-[var(--coral)] mx-auto"/>
              <h3 className="font-display text-2xl text-[var(--ink)] mt-3">No vendors match those filters</h3>
              <p className="text-[var(--muted)] mt-2">Try widening your budget or clearing filters.</p>
            </div>
          ) : <div className="grid md:grid-cols-2 gap-6">{vendors.map(v => <VendorCard key={v.id} vendor={v}/>)}</div>}
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
      addRecent({ id: r.data.id, name: r.data.name, category: r.data.category, city: r.data.city, starting_price: r.data.starting_price, images: r.data.images });
      axios.get(`${API}/vendors?category=${r.data.category}&limit=4`).then(rr => setRelated(rr.data.filter(x=>x.id!==id).slice(0,3)));
    });
  }, [id]);
  if (!vendor) return <div className="text-center py-20 text-[var(--muted)]">Loading…</div>;
  return (
    <div data-testid="vendor-detail-page">
      <div className="relative h-[50vh] overflow-hidden">
        <img src={vendor.images[0]} alt={vendor.name} className="w-full h-full object-cover"/>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"/>
        <div className="absolute inset-x-0 bottom-0 max-w-7xl mx-auto px-6 lg:px-10 pb-10 text-white">
          <Link to="/vendors" className="text-[var(--coral-soft)] text-sm font-semibold">← Back to vendors</Link>
          <div className="flex items-center gap-3 mt-4 flex-wrap">
            {vendor.verified && <div className="verified-badge"><Shield size={10}/> Verified</div>}
            <div className="chip !bg-white/95 !text-[var(--ink)]"><Star size={12} className="fill-[var(--gold)] text-[var(--gold)]"/> {vendor.rating} ({vendor.reviews} reviews)</div>
          </div>
          <h1 className="font-script text-5xl md:text-7xl mt-4 leading-none text-white" data-testid="vendor-name">{vendor.name}</h1>
          <div className="flex items-center gap-4 mt-3 text-white/90 flex-wrap">
            <span className="flex items-center gap-1.5"><MapPin size={14}/> {vendor.city}</span>
            <span className="chip !bg-[var(--coral)] !text-white !border-[var(--coral)]">Starting at {formatINR(vendor.starting_price)}</span>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 grid lg:grid-cols-[2fr_1fr] gap-12">
        <div>
          <div className="ornament mb-4"><span>About</span></div>
          <p className="font-display text-2xl md:text-3xl leading-relaxed text-[var(--ink)] font-400" data-testid="vendor-description">{vendor.description}</p>
          <div className="mt-10">
            <h3 className="text-xs uppercase tracking-[0.25em] text-[var(--coral)] font-bold mb-4">Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {vendor.tags.map(t => <span key={t} className="chip !bg-[var(--coral)] !text-white !border-[var(--coral)]">{t}</span>)}
            </div>
          </div>
          {vendor.images.length > 1 && (
            <div className="mt-12">
              <h3 className="text-xs uppercase tracking-[0.25em] text-[var(--coral)] font-bold mb-4">Gallery</h3>
              <div className="grid grid-cols-2 gap-4">
                {vendor.images.map((img,i) => (<img key={i} src={img} alt="" className="w-full h-64 object-cover rounded-2xl"/>))}
              </div>
            </div>
          )}
        </div>
        <aside className="card-warm p-8 h-fit lg:sticky lg:top-28" data-testid="vendor-booking-card">
          <div className="text-[10px] uppercase tracking-[0.25em] text-[var(--muted)] font-semibold">Starting at</div>
          <div className="font-display text-5xl font-700 text-[var(--ink)] mt-1">{formatINR(vendor.starting_price)}</div>
          <div className="text-xs text-[var(--muted)] mt-1">Final price varies by package</div>
          <div className="mt-6 space-y-3">
            {["Instant availability calendar","Direct chat — no forms","Transparent pricing","Verified by Shaadi Saga"].map(f => (
              <div key={f} className="flex items-center gap-2 text-sm text-[var(--ink)]"><Check size={16} className="text-[var(--coral)]"/> {f}</div>
            ))}
          </div>
          <button className="btn-primary w-full justify-center mt-7" data-testid="vendor-chat-btn"><Heart size={16}/> Start Chat</button>
          <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hi! I'm interested in ${vendor.name} from Shaadi Saga India.`)}`} target="_blank" rel="noreferrer" data-testid="vendor-whatsapp-btn" className="w-full mt-3 flex items-center justify-center gap-2 py-3 rounded-full bg-[#25D366] text-white font-semibold text-sm hover:bg-[#1FB855] transition-colors">
            <MessageCircle size={16}/> WhatsApp us
          </a>
          <button className="btn-outline w-full justify-center mt-3" data-testid="vendor-availability-btn">Check Availability</button>
        </aside>
      </div>
      {related.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-20">
          <h2 className="font-script text-4xl text-[var(--coral)] mb-6">Similar Vendors</h2>
          <div className="grid md:grid-cols-3 gap-6">{related.map(v => <VendorCard key={v.id} vendor={v}/>)}</div>
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
    e.preventDefault(); setLoading(true); setResult(null);
    try { const r = await axios.post(`${API}/matchmaker`, form); setResult(r.data); }
    catch { setResult({ reasoning: "Something went wrong.", recommendations: [] }); }
    setLoading(false);
  };
  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-10 py-16" data-testid="matchmaker-page">
      <div className="text-center mb-12 fade-up">
        <div className="ornament mb-4"><span>AI-powered · 2026</span></div>
        <h1 className="font-script text-[var(--coral)] text-6xl md:text-8xl leading-tight">The Matchmaker</h1>
        <p className="font-display italic text-[var(--ink-2)] text-xl md:text-2xl mt-4 max-w-2xl mx-auto leading-snug">We bring you the best of Indian weddings with a twist of tradition and swag.</p>
      </div>
      <form onSubmit={handleSubmit} className="card-warm p-8 md:p-10 space-y-7" data-testid="matchmaker-form">
        <div>
          <label className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--coral)]">Your Budget</label>
          <div className="flex items-center justify-between mt-2"><span className="font-display text-4xl font-700 text-[var(--ink)]" data-testid="matchmaker-budget-display">{formatINR(form.budget)}</span></div>
          <input data-testid="matchmaker-budget" type="range" min="10000" max="10000000" step="10000" value={form.budget} onChange={e=>setForm({...form, budget:parseInt(e.target.value)})} className="shaadi-range mt-3"/>
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--coral)]">Wedding Theme / Vibe</label>
          <div className="flex flex-wrap gap-2 mt-3">
            {themes.map(t => (
              <button type="button" key={t} onClick={()=>setForm({...form, theme:t})} data-testid={`matchmaker-theme-${t.toLowerCase().replace(/\s/g,'-')}`} className={`chip ${form.theme===t ? '!bg-[var(--coral)] !text-white !border-[var(--coral)]' : ''}`}>{t}</button>
            ))}
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--coral)]">City</label>
            <input data-testid="matchmaker-city" value={form.city} onChange={e=>setForm({...form, city:e.target.value})} placeholder="Delhi, Mumbai…" className="w-full mt-2 px-4 py-3 rounded-xl border border-[var(--border)] bg-white outline-none focus:border-[var(--coral)]"/>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--coral)]">Category</label>
            <select data-testid="matchmaker-category" value={form.category} onChange={e=>setForm({...form, category:e.target.value})} className="w-full mt-2 px-4 py-3 rounded-xl border border-[var(--border)] bg-white outline-none focus:border-[var(--coral)]">
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
          <div className="card-warm p-8 mb-8 bg-gradient-to-br from-[var(--coral)] to-[var(--coral-2)] text-white border-[var(--coral)]">
            <div className="flex items-center gap-2 text-white/95 text-xs uppercase tracking-[0.25em] font-bold mb-3"><Sparkles size={14}/> Matchmaker says</div>
            <p className="font-display text-xl md:text-2xl leading-relaxed text-white" data-testid="matchmaker-reasoning">{result.reasoning}</p>
          </div>
          {result.recommendations.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {result.recommendations.map((v, i) => (
                <div key={v.id} className="relative">
                  <div className="absolute -top-3 -left-3 w-11 h-11 rounded-full bg-[var(--coral)] text-white flex items-center justify-center font-display font-800 text-xl z-10 shadow-lg border-2 border-white">{i+1}</div>
                  <VendorCard vendor={v}/>
                </div>
              ))}
            </div>
          ) : <div className="text-center py-10 text-[var(--muted)]">Try a different budget or city.</div>}
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
        <h1 className="font-script text-[var(--coral)] text-6xl md:text-8xl">Real Shaadi</h1>
        <p className="text-[var(--muted)] mt-4 max-w-2xl mx-auto">Inspiration from weddings we've loved — from Udaipur palaces to Goa beaches.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        {weddings.map(w => (
          <div key={w.id} className="card-warm group" data-testid={`realwedding-full-${w.id}`}>
            <div className="relative h-96 overflow-hidden">
              <img src={w.image} alt={w.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"/>
              <div className="absolute top-4 right-4 chip !bg-white/95">{w.theme}</div>
            </div>
            <div className="p-6">
              <div className="text-[10px] text-[var(--coral)] font-bold uppercase tracking-[0.25em] flex items-center gap-1.5"><MapPin size={10}/> {w.location}</div>
              <h3 className="font-display text-3xl font-600 mt-3 text-[var(--ink)]">{w.title}</h3>
              <p className="text-[var(--muted)] mt-3 leading-relaxed">{w.story}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ======================== FAVOURITES PAGE ========================
function FavouritesPage() {
  const { user } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (user && user.role === "client") {
      axios.get(`${API}/favourites`).then(r => { setVendors(r.data.vendors); setLoading(false); }).catch(()=>setLoading(false));
    }
  }, [user]);
  if (user === null) return <div className="text-center py-20 text-[var(--muted)]">Loading…</div>;
  if (!user || user.role !== "client") return <Navigate to="/login/client" replace/>;
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16" data-testid="favourites-page">
      <div className="text-center mb-12">
        <div className="ornament mb-3"><span>Your shortlist</span></div>
        <h1 className="font-brand brand-gradient text-6xl md:text-7xl leading-none">My Favourites</h1>
        <p className="text-[var(--muted)] mt-4 max-w-xl mx-auto">{vendors.length} vendor{vendors.length !== 1 ? "s" : ""} saved. Build your dream shaadi team, one heart at a time.</p>
      </div>
      {loading ? <div className="text-center py-10 text-[var(--muted)]">Loading…</div>
       : vendors.length === 0 ? (
        <div className="card-warm p-12 text-center max-w-xl mx-auto" data-testid="favourites-empty">
          <Heart size={40} className="text-[var(--coral)] mx-auto"/>
          <h3 className="font-display text-2xl mt-4 text-[var(--ink)]">No favourites yet</h3>
          <p className="text-[var(--muted)] mt-2">Tap the ❤ on any vendor card to save it here.</p>
          <Link to="/vendors" className="btn-primary mt-6 inline-flex"><Search size={14}/> Browse vendors</Link>
        </div>
       ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map(v => <VendorCard key={v.id} vendor={v}/>)}
        </div>
       )}
    </div>
  );
}

// ======================== BUDGET CALCULATOR ========================
function BudgetPage() {
  const [total, setTotal] = useState(1500000);
  const breakdown = [
    { label: "Venue & Catering", pct: 45, icon: Building2, desc: "Banquet hall or hotel + multi-cuisine per-plate" },
    { label: "Photography & Content", pct: 12, icon: Camera, desc: "Photographer + content creator + drone" },
    { label: "Decor & Flowers", pct: 12, icon: Flower2, desc: "Mandap, stage, entrance, floral installations" },
    { label: "Bridal Wear & Jewellery", pct: 10, icon: Gem, desc: "Lehenga/saree, jewellery, groomwear" },
    { label: "Makeup & Mehendi", pct: 6, icon: Hand, desc: "MUA, mehendi artist, bridal grooming" },
    { label: "Music & Entertainment", pct: 5, icon: Music, desc: "DJ, live band, sufi night" },
    { label: "Invites & Gifts", pct: 4, icon: Mail, desc: "E-invites, return gifts, trousseau" },
    { label: "Pandit, Travel & Buffer", pct: 6, icon: Flame, desc: "Pandit ji, transport, hotel rooms, contingency" },
  ];
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16" data-testid="budget-page">
      <div className="text-center mb-12">
        <div className="ornament mb-3"><span>2026 Indian Wedding Budget</span></div>
        <h1 className="font-brand brand-gradient text-6xl md:text-7xl leading-none">Budget Planner</h1>
        <p className="text-[var(--muted)] mt-4 max-w-xl mx-auto">Drag the slider — we'll split your budget into typical Indian wedding categories.</p>
      </div>
      <div className="card-warm p-8 md:p-10 mb-10">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-widest text-[var(--coral)]">Total Wedding Budget</label>
          <span className="font-display text-4xl md:text-5xl font-700 text-[var(--ink)]" data-testid="budget-total">{formatINR(total)}</span>
        </div>
        <input data-testid="budget-slider" type="range" min="200000" max="50000000" step="50000" value={total} onChange={e=>setTotal(parseInt(e.target.value))} className="shaadi-range mt-4"/>
        <div className="flex justify-between text-[11px] text-[var(--muted)] mt-2 uppercase tracking-widest"><span>₹2L</span><span>₹5 Cr</span></div>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {breakdown.map((b, i) => {
          const amount = Math.round((total * b.pct) / 100);
          return (
            <div key={b.label} className="card-warm p-6 fade-up" style={{animationDelay: `${i*40}ms`}} data-testid={`budget-${b.label.toLowerCase().replace(/[^a-z]+/g,'-')}`}>
              <div className="w-11 h-11 rounded-full bg-[var(--coral-wash)] text-[var(--coral)] flex items-center justify-center mb-4"><b.icon size={20}/></div>
              <div className="text-[10px] uppercase tracking-widest text-[var(--muted)] font-bold">{b.pct}% of total</div>
              <div className="font-display text-xl font-600 text-[var(--ink)] mt-1 leading-tight">{b.label}</div>
              <div className="font-display text-3xl font-700 text-[var(--coral)] mt-2">{formatINR(amount)}</div>
              <p className="text-xs text-[var(--muted)] mt-2 leading-relaxed">{b.desc}</p>
            </div>
          );
        })}
      </div>
      <div className="text-center mt-12">
        <Link to="/matchmaker" className="btn-gold"><Sparkles size={15}/> Match me with vendors in this budget <ArrowRight size={14}/></Link>
      </div>
    </div>
  );
}

// ======================== ADMIN QUERY INBOX ========================
function AdminInbox() {
  const { user } = useAuth();
  const [queries, setQueries] = useState([]);
  const [stats, setStats] = useState({ new: 0, total: 0 });
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const load = async () => {
    try {
      const [q, s] = await Promise.all([axios.get(`${API}/queries`), axios.get(`${API}/queries/stats`)]);
      setQueries(q.data); setStats(s.data);
    } catch (err) {
      console.error("Admin inbox load failed:", err);
    }
    setLoading(false);
  };
  useEffect(() => { if (user?.role === "admin") load(); }, [user]);
  if (user === null) return <div className="text-center py-20 text-[var(--muted)]">Loading…</div>;
  if (!user || user.role !== "admin") return <Navigate to="/login/client" replace/>;
  const setStatus = async (qid, status) => {
    await axios.patch(`${API}/queries/${qid}`, { status });
    load();
  };
  const filtered = filter === "all" ? queries : queries.filter(q => q.status === filter);
  const statusColors = { new: "bg-[var(--coral)] text-white", read: "bg-[var(--gold)] text-[var(--ink)]", replied: "bg-green-600 text-white", closed: "bg-gray-400 text-white" };
  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-10 py-12" data-testid="admin-inbox">
      <div className="mb-8">
        <div className="ornament mb-3"><span>Admin · Inquiries</span></div>
        <h1 className="font-brand brand-gradient text-5xl md:text-6xl leading-none">Query Inbox</h1>
        <p className="text-[var(--muted)] mt-3">{stats.total} total · <span className="text-[var(--coral)] font-bold">{stats.new} unread</span></p>
      </div>
      <div className="flex gap-2 mb-6 flex-wrap">
        {["all", "new", "read", "replied", "closed"].map(f => (
          <button key={f} onClick={()=>setFilter(f)} data-testid={`inbox-filter-${f}`} className={`chip ${filter===f ? '!bg-[var(--coral)] !text-white !border-[var(--coral)]' : ''} capitalize`}>{f}</button>
        ))}
      </div>
      {loading ? <div className="text-center py-10 text-[var(--muted)]">Loading…</div>
       : filtered.length === 0 ? <div className="card-warm p-10 text-center"><Inbox size={32} className="mx-auto text-[var(--muted)]"/><p className="mt-3 text-[var(--muted)]">No queries in this view.</p></div>
       : (
        <div className="space-y-3">
          {filtered.map(q => (
            <div key={q.id} className="card-warm p-5" data-testid={`inbox-query-${q.id}`}>
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="flex-1 min-w-[240px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[9px] px-2 py-0.5 rounded-full uppercase tracking-widest font-bold ${statusColors[q.status] || statusColors.new}`}>{q.status}</span>
                    <h3 className="font-display text-lg font-600 text-[var(--ink)]">{q.subject}</h3>
                  </div>
                  <div className="text-xs text-[var(--muted)] mt-1">{q.name} · {q.email} {q.phone && `· ${q.phone}`} {q.city && `· ${q.city}`}</div>
                  <p className="text-sm text-[var(--ink-2)] mt-3 leading-relaxed">{q.message}</p>
                  <div className="text-[10px] text-[var(--muted-2)] mt-3 uppercase tracking-widest"><Clock size={10} className="inline"/> {new Date(q.created_at).toLocaleString()}</div>
                </div>
                <div className="flex flex-col gap-2">
                  <a href={`mailto:${q.email}?subject=Re: ${q.subject}`} className="text-xs px-3 py-1.5 rounded-full bg-[var(--ink)] text-white text-center font-semibold">Email</a>
                  {q.phone && <a href={`https://wa.me/${q.phone.replace(/\D/g,'')}?text=${encodeURIComponent(`Hi ${q.name}, thanks for reaching out to Shaadi Saga India! `)}`} target="_blank" rel="noreferrer" className="text-xs px-3 py-1.5 rounded-full bg-[#25D366] text-white text-center font-semibold">WhatsApp</a>}
                  <select value={q.status} onChange={e=>setStatus(q.id, e.target.value)} data-testid={`inbox-status-${q.id}`} className="text-xs px-2 py-1.5 rounded-full border border-[var(--border)] bg-white">
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
       )}
    </div>
  );
}

// ======================== RECENTLY VIEWED STRIP ========================
function RecentlyViewed() {
  const [recent, setRecent] = useState([]);
  useEffect(() => { setRecent(getRecent()); }, []);
  if (recent.length < 2) return null;
  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-10 py-10" data-testid="recently-viewed">
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="ornament mb-2"><span>Your journey</span></div>
          <h2 className="font-display text-3xl md:text-4xl text-[var(--ink)]">Continue where you left off</h2>
        </div>
        <button onClick={()=>{localStorage.removeItem(RV_KEY); setRecent([]);}} className="text-xs text-[var(--coral)] font-semibold underline" data-testid="recent-clear">Clear history</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {recent.slice(0, 6).map(v => (
          <Link key={v.id} to={`/vendor/${v.id}`} className="card-warm group block" data-testid={`recent-${v.id}`}>
            <div className="relative h-28 overflow-hidden">
              <img src={v.images?.[0]} alt={v.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
            </div>
            <div className="p-2.5">
              <div className="text-[9px] text-[var(--coral)] font-bold uppercase tracking-widest truncate">{v.category}</div>
              <div className="font-display text-sm font-600 text-[var(--ink)] truncate leading-tight mt-0.5">{v.name}</div>
              <div className="text-[10px] font-bold text-[var(--muted)] mt-1">{formatINR(v.starting_price)}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ======================== CONTACT PAGE ========================
function ContactPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    city: "",
    subject: "Wedding planning inquiry",
    message: "",
  });
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) setForm(f => ({...f, name: user.name || f.name, email: user.email || f.email, phone: user.phone || f.phone}));
  }, [user]);

  const subjects = [
    "Wedding planning inquiry",
    "Vendor booking help",
    "Budget planning",
    "Destination wedding",
    "AI Matchmaker help",
    "List my business",
    "Something else",
  ];

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      await axios.post(`${API}/query`, form);
      setSent(true);
    } catch (ex) {
      setErr(formatErr(ex.response?.data?.detail) || "Could not send. Please try again.");
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="max-w-3xl mx-auto px-6 lg:px-10 py-24 text-center" data-testid="contact-success">
        <div className="w-20 h-20 rounded-full bg-[var(--coral-wash)] text-[var(--coral)] flex items-center justify-center mx-auto pulse-heart">
          <Check size={40}/>
        </div>
        <div className="ornament mt-6 mb-3"><span>Thank you</span></div>
        <h1 className="font-brand brand-gradient text-6xl md:text-7xl leading-none">Dhanyavaad, {form.name.split(" ")[0]}!</h1>
        <p className="text-[var(--muted)] mt-5 max-w-xl mx-auto text-lg leading-relaxed">
          Your query has reached us. Our team will get back to you within 24 hours on <strong className="text-[var(--ink)]">{form.email}</strong> or call you at <strong className="text-[var(--ink)]">{form.phone || "your number on record"}</strong>.
        </p>
        <div className="flex gap-3 justify-center mt-8">
          <Link to="/vendors" className="btn-primary"><Search size={14}/> Browse Vendors</Link>
          <Link to="/" className="btn-outline">Back home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-10 py-16" data-testid="contact-page">
      <div className="text-center mb-12 fade-up">
        <div className="ornament mb-3"><span>Query · Connect · Plan</span></div>
        <h1 className="font-brand brand-gradient text-6xl md:text-8xl leading-none">Get in touch</h1>
        <p className="font-display italic text-[var(--ink-2)] text-xl md:text-2xl mt-4 max-w-2xl mx-auto">
          We bring you the best of Indian weddings with a twist of tradition and swag.
        </p>
        <p className="text-[var(--muted)] mt-3 max-w-xl mx-auto">Tell us about your shaadi — we'll connect you directly to the right vendors or our planners.</p>
      </div>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-10">
        {/* Form */}
        <form onSubmit={submit} className="card-warm p-8 md:p-10 space-y-5" data-testid="contact-form">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--coral)]">Your name</label>
              <input required value={form.name} onChange={e=>setForm({...form, name:e.target.value})} data-testid="contact-name" className="w-full mt-2 px-4 py-3 rounded-xl border border-[var(--border)] bg-white outline-none focus:border-[var(--coral)]"/>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--coral)]">Email</label>
              <input type="email" required value={form.email} onChange={e=>setForm({...form, email:e.target.value})} data-testid="contact-email" className="w-full mt-2 px-4 py-3 rounded-xl border border-[var(--border)] bg-white outline-none focus:border-[var(--coral)]"/>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--coral)]">Phone</label>
              <input value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} placeholder="+91 ..." data-testid="contact-phone" className="w-full mt-2 px-4 py-3 rounded-xl border border-[var(--border)] bg-white outline-none focus:border-[var(--coral)]"/>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--coral)]">City</label>
              <input value={form.city} onChange={e=>setForm({...form, city:e.target.value})} placeholder="Delhi, Mumbai…" data-testid="contact-city" className="w-full mt-2 px-4 py-3 rounded-xl border border-[var(--border)] bg-white outline-none focus:border-[var(--coral)]"/>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--coral)]">What's this about?</label>
            <div className="flex flex-wrap gap-2 mt-3">
              {subjects.map(s => (
                <button type="button" key={s} onClick={()=>setForm({...form, subject:s})} data-testid={`contact-subject-${s.toLowerCase().replace(/\s/g,'-')}`} className={`chip ${form.subject===s ? '!bg-[var(--coral)] !text-white !border-[var(--coral)]' : ''}`}>{s}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--coral)]">Your message</label>
            <textarea required minLength={5} rows={5} value={form.message} onChange={e=>setForm({...form, message:e.target.value})} placeholder="Tell us about your wedding — dates, guests, vibe, vendors you're looking for…" data-testid="contact-message" className="w-full mt-2 px-4 py-3 rounded-xl border border-[var(--border)] bg-white outline-none focus:border-[var(--coral)] resize-none"/>
          </div>
          {err && <div className="text-sm text-[var(--coral-2)] bg-[var(--coral-wash)] p-3 rounded-xl border border-[var(--coral-soft)]" data-testid="contact-error">{err}</div>}
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center !py-4" data-testid="contact-submit">
            {loading ? "Sending…" : <><Heart size={15}/> Send message <ArrowRight size={14}/></>}
          </button>
          <p className="text-[11px] text-[var(--muted)] text-center">We'll respond within 24 hours. Your info stays private.</p>
        </form>

        {/* Side info */}
        <aside className="space-y-4">
          <div className="card-warm p-6">
            <div className="w-12 h-12 rounded-full bg-[var(--coral-wash)] text-[var(--coral)] flex items-center justify-center mb-4"><Phone size={20}/></div>
            <div className="text-[10px] uppercase tracking-widest text-[var(--muted)] font-bold">Call directly</div>
            <a href={`tel:${PHONE.replace(/\s/g,'')}`} className="font-display text-2xl font-700 text-[var(--ink)] block mt-1 hover:text-[var(--coral)]" data-testid="contact-phone-link">{PHONE}</a>
            <div className="text-xs text-[var(--muted)] mt-2">Mon – Sat, 10am – 8pm IST</div>
          </div>
          <div className="card-warm p-6">
            <div className="w-12 h-12 rounded-full bg-[var(--coral-wash)] text-[var(--coral)] flex items-center justify-center mb-4"><Mail size={20}/></div>
            <div className="text-[10px] uppercase tracking-widest text-[var(--muted)] font-bold">Email us</div>
            <a href="mailto:hello@shaadisaga.in" className="font-display text-xl font-600 text-[var(--ink)] block mt-1 hover:text-[var(--coral)]">hello@shaadisaga.in</a>
          </div>
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="card-warm p-6 block hover:border-[var(--coral)]" data-testid="contact-instagram">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--coral)] to-[var(--gold)] text-white flex items-center justify-center mb-4"><Instagram size={20}/></div>
            <div className="text-[10px] uppercase tracking-widest text-[var(--muted)] font-bold">DM on Instagram</div>
            <div className="font-display text-xl font-600 text-[var(--ink)] mt-1">@vanshajhanda</div>
            <div className="text-xs text-[var(--coral)] mt-2 font-semibold">Fastest response →</div>
          </a>
        </aside>
      </div>
    </div>
  );
}

// ======================== APP ========================
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <Navbar/>
          <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/vendors" element={<Vendors/>}/>
            <Route path="/vendor/:id" element={<VendorDetail/>}/>
            <Route path="/matchmaker" element={<Matchmaker/>}/>
            <Route path="/real-weddings" element={<RealWeddings/>}/>
            <Route path="/login/client" element={<LoginPage role="client"/>}/>
            <Route path="/login/vendor" element={<LoginPage role="vendor"/>}/>
            <Route path="/login/admin" element={<LoginPage role="admin"/>}/>
            <Route path="/register/client" element={<RegisterPage role="client"/>}/>
            <Route path="/register/vendor" element={<RegisterPage role="vendor"/>}/>
            <Route path="/dashboard" element={<Dashboard/>}/>
            <Route path="/contact" element={<ContactPage/>}/>
            <Route path="/favourites" element={<FavouritesPage/>}/>
            <Route path="/budget" element={<BudgetPage/>}/>
            <Route path="/admin/queries" element={<AdminInbox/>}/>
          </Routes>
          <Footer/>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
