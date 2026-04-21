# ShaadiSagaIndia — Product Requirements

## Original problem statement
Build an Indian wedding vendor marketplace (Shaadi Saga India style) for 2026 trends. User requested: use the PDF for interface, Indian audience appeal, budget filter, vendor listings (like mehndi artists), take info from the PDF. Logo uploaded — must be visible on top of website.

## Tech stack
- FastAPI (Python) + MongoDB (motor) + Claude Sonnet 4.5 (via emergentintegrations/EMERGENT_LLM_KEY)
- React 19 + React Router v7 + Tailwind + lucide-react
- Fonts: Great Vibes (script, matches logo), Cormorant Garamond (display serif), Inter (body)
- Palette: Royal red #A01A2C, gold #D4A944, ivory #F5E8C8, cream #FFF9EB — sourced from the user's logo

## Core features (all implemented & tested)
- Hero with script headline + centered search (city / category / **budget slider** / go)
- 19 vendor categories (16 PDF + 2026 hot: Content Creators, Drone Cinematographers, Eco-Vendors)
- Vendor listings with filters: category, city, budget slider, min-rating, verified-only, text search
- Vendor detail pages with gallery, starting price, verified badge, booking sidebar
- **AI Matchmaker** (Claude Sonnet 4.5) — budget + theme + city + category → 3 ranked vendors + warm reasoning
- Real Shaadi Stories (4 curated stories)
- Logo prominently displayed in navbar + footer with script wordmark + "Wedding Planning & Styling" tagline

## Seeded data
~41 vendors incl. 5 Mehendi artists (Shalini, Veena Nagda, Ash Kumar, Nupur, Divya), 5 Venues (Leela, Taj, Jaypee, Roseate, Heritage Village), and all 19 categories populated

## Iterations
- 2026-04-21: MVP built (editorial maroon editorial palette) — backend 12/12 tests pass, frontend flows pass
- 2026-04-21: Redesigned to logo-matched royal red/gold/ivory + Great Vibes script + logo image in navbar

## Backlog / P1
- Direct chat (WebSocket) between user and vendor
- Real-time availability calendar
- 3D venue walkthroughs
- User auth (signup/favourites/saved vendors)
- Vendor dashboard (self-onboarding)
- Pagination on vendor list beyond 100
- Rate limit `/api/matchmaker` (LLM cost)
- Protect `/api/seed` in production

## Test report
`/app/test_reports/iteration_1.json` — all backend + frontend flows passing.
