# ShaadiSagaIndia — Product Requirements

## Original problem statement
Indian wedding vendor marketplace for 2026. User-provided logo (Instagram @vanshajhanda). Features: budget filter, vendor listings (mehndi artists etc.), modern light-red aesthetic, separate client & vendor login, Instagram connected.

## Tech stack
- FastAPI + MongoDB (motor) + Claude Sonnet 4.5 (via EMERGENT_LLM_KEY)
- JWT auth (httpOnly cookies, bcrypt, role-based client/vendor separation)
- React 19 + React Router v7 + Tailwind + lucide-react
- Fonts: Great Vibes (script) + Cormorant Garamond (display) + Inter (body)
- Palette: coral #E85A72 + soft blush #FFF6F4 + gold accents (light red aesthetic)

## Core features (implemented & tested — iteration 2)
- Logo at top-left of navbar (on every page) + footer
- Hero w/ script headline + centered search (city / category / budget slider)
- 19 vendor categories (16 PDF + 2026 hot: Content Creators, Drone, Eco)
- Vendor list with filters: category, city, budget slider, min-rating, verified, text search
- Vendor detail w/ gallery, starting price, verified badge, booking sidebar
- **AI Matchmaker** (Claude Sonnet 4.5) — budget + theme + city → 3 ranked vendors + warm reasoning
- Real Shaadi Stories page
- **JWT auth** — /login/client, /login/vendor, /register/client, /register/vendor, /dashboard
  - Role separation enforced (client creds can't login as vendor → 403)
  - Admin seeded on startup: `admin@shaadisaga.in` / `Admin@123`
- Instagram of owner linked (navbar icon + footer)
- Phone +91 72176 12408 (footer)

## Iterations
- 2026-04-21 (iter-1): MVP — editorial maroon palette; 12/12 backend tests pass
- 2026-04-21 (iter-2): Rebuilt to logo-matched royal red, then to **coral/blush light aesthetic** per user request. Added JWT client/vendor separate auth. Removed cities ribbon, updated phone, connected Instagram. 22/22 backend tests pass.

## Backlog / P1
- Direct chat (WebSocket) between client & vendor
- Vendor dashboard (manage listings, edit profile, view inquiries)
- Client favourites / save-vendor feature
- Brute-force lockout on /api/auth/login (5 attempts → 15 min)
- Protect /api/seed in production (admin-only)
- Password reset flow (forgot/reset)
- Real-time availability calendar
- 3D venue walkthroughs

## Test credentials
See `/app/memory/test_credentials.md`
