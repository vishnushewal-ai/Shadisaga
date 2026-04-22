# ShaadiSagaIndia — Product Requirements

## Original problem statement
Modern Indian wedding vendor marketplace (Shaadi Saga India inspired) for 2026 — verified vendors, transparent prices, AI matchmaker, budget filter, mehendi artists + all wedding categories. Logo-matched branding with owner's Instagram.

## Tech stack
- FastAPI + MongoDB (motor) + Claude Sonnet 4.5 (via EMERGENT_LLM_KEY)
- JWT auth (httpOnly cookies, bcrypt, client/vendor/admin roles)
- React 19 + React Router v7 + Tailwind + lucide-react
- Fonts: Dancing Script (brand wordmark) + Great Vibes (script) + Cormorant Garamond (display) + Inter (body)
- Palette: coral #E85A72 + soft blush #FFF6F4 + gold accents

## Features (implemented through iteration 5)
### Discovery
- 19 vendor categories (16 Shaadi Saga + 2026 hot: Content Creators, Drone, Eco)
- Vendor list with filters: category, city, budget slider, min-rating, verified, text search
- Vendor detail w/ animated Ken Burns hero, gallery, booking sidebar
- Real Shaadi Stories page

### AI & personalisation
- AI Matchmaker (Claude Sonnet 4.5) — budget + theme + city → 3 ranked vendors with reasoning
- Personal welcome banner for logged-in clients (time-based greeting + 3 top picks)
- Recently-viewed strip on home (localStorage, 6 last-seen vendors)

### Auth
- JWT role-based: /login/client, /login/vendor, /login/admin
- /register/client & /register/vendor with auto-login
- Admin seeded on startup: admin@shaadisaga.in / Admin@123
- Protected /dashboard, /favourites, /admin/queries

### Customer experience
- ❤ Favourites — heart toggle on vendor cards (client only) + /favourites shortlist page
- WhatsApp quick-contact button on every vendor card + vendor detail page (opens wa.me/917217612408 with pre-filled message)
- /contact page — query form (name, email, phone, city, subject chips, message) + sidebar with phone/email/Instagram
- /budget — interactive Indian wedding budget calculator (8 categories, percentage breakdown, real-time slider)

### Admin
- /admin/queries inbox — list all queries with status filter (new/read/replied/closed), one-click email/WhatsApp response, status dropdown
- GET /api/queries/stats for future unread-badge in nav

### Branding
- Logo prominently at top-left (88px desktop) + wordmark in Dancing Script gradient
- Owner Instagram linked (@vanshajhanda) in navbar + footer
- Phone +91 72176 12408 in footer + contact page
- Animated hero: Ken Burns wedding image + bokeh + light sweep + 8 floating petals + script reveal
- Page title & meta updated for SEO

## Iterations
- iter-1: MVP editorial maroon palette; 12 backend tests
- iter-2: Royal red/gold logo-matched theme
- iter-3: Coral/blush light aesthetic; JWT auth; 22 backend tests
- iter-4: Motion hero (Ken Burns); testimonials marquee; Pinyon→Dancing Script wordmark; personal welcome; counter animations
- iter-5: Favourites + WhatsApp + Admin Inbox + Budget tool + Recently viewed; 44 backend tests all passing

## Backlog / P1
- Brute-force lockout on /api/auth/login
- Rate-limit or captcha on /api/query (public spam risk)
- Protect /api/seed in production
- Password reset flow
- Vendor dashboard (self-listing, edit profile, inquiry inbox)
- Pagination on vendor list beyond 100 + /api/queries beyond 200
- Phone format validation on QueryIn
- Nav unread-dot badge using /api/queries/stats
