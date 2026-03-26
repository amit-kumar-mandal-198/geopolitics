# ROADMAP.md

> **Current Phase**: Not started
> **Milestone**: v1.0 — GeoScope Launch

## Must-Haves (from SPEC)
- [ ] News aggregation from 8+ trusted sources
- [ ] AI summarization, rewriting, categorization (Gemini free tier)
- [ ] Duplicate detection and merging
- [ ] Regional sections (6) + Topic sections (6)
- [ ] Breaking news section
- [ ] Search and filter
- [ ] Bookmarks (localStorage)
- [ ] Comments (no auth)
- [ ] Scheduled 7 PM IST daily update
- [ ] Fully responsive, modern UI

## Phases

### Phase 1: Foundation & Infrastructure
**Status**: ⬜ Not Started
**Objective**: Set up project scaffolding, database, and basic server
**Requirements**: REQ-01, REQ-02

**Deliverables:**
- Vite + React frontend scaffolding with design system (colors, typography, layout)
- Express backend with API structure
- SQLite database with full schema (articles, categories, sources, comments)
- Basic API endpoints (health check, CORS config)
- Project structure: `client/` and `server/` directories

---

### Phase 2: News Ingestion & AI Engine
**Status**: ⬜ Not Started
**Objective**: Build the complete news pipeline — fetch, process, deduplicate, store
**Requirements**: REQ-03, REQ-04, REQ-05, REQ-06, REQ-07, REQ-08

**Deliverables:**
- RSS feed parser for 8+ sources
- Free news API integration (GNews, Guardian)
- Gemini API integration for:
  - Article summarization (short blurbs)
  - Full article rewriting/analysis
  - Auto-categorization (region + topic tagging)
- Duplicate detection algorithm (title similarity + content hashing)
- node-cron scheduler for 7 PM IST batch job
- Breaking news detector with 30-min polling
- Ingestion logging and error handling

---

### Phase 3: Frontend — Core Pages & Navigation
**Status**: ⬜ Not Started
**Objective**: Build the main UI — homepage, section pages, article detail
**Requirements**: REQ-09, REQ-10, REQ-11

**Deliverables:**
- Homepage with:
  - Breaking news ticker/banner at top
  - Featured article hero section
  - Region-based section cards
  - Topic-based section cards
  - Latest news feed
- Section pages (filtered by region or topic)
- Article detail page with:
  - AI summary at top
  - Full AI-rewritten analysis below
  - Source attribution and links
- Responsive navigation (sidebar + top nav)
- Dark/light mode toggle

---

### Phase 4: Interactive Features
**Status**: ⬜ Not Started
**Objective**: Add search, filter, bookmarks, and comments
**Requirements**: REQ-12, REQ-13, REQ-14, REQ-15

**Deliverables:**
- Full-text search bar (SQLite FTS5 backend)
- Filter panel: region, topic, date range, keywords
- Bookmark system (localStorage, bookmark icon on cards)
- Bookmarks page showing saved articles
- Comment section on article pages
- Comment form (display name + text, no auth)
- Comment storage in SQLite

---

### Phase 5: Polish, Performance & Deployment
**Status**: ⬜ Not Started
**Objective**: Final UI polish, performance optimization, and free-tier deployment
**Requirements**: REQ-16, REQ-17, REQ-18

**Deliverables:**
- Responsive design audit (mobile, tablet, desktop)
- Performance optimization (lazy loading, code splitting, image optimization)
- SEO meta tags and Open Graph tags
- Loading states and error boundaries
- 404 and error pages
- Deployment to Vercel (frontend) + Render (backend)
- Final testing and verification
