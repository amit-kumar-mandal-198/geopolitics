# SPEC.md — Project Specification

> **Status**: `FINALIZED`

## Vision

**GeoScope** is a free, public-facing geopolitics news platform that aggregates, deduplicates, and presents world news in well-organized regional and topic-based sections. An AI engine (powered by Google Gemini free tier) runs daily at 7 PM IST to fetch news from trusted sources via RSS feeds and free APIs, generate concise summaries, rewrite in-depth analysis articles, and auto-categorize content. Users get a clean, modern reading experience with breaking news at the top, searchable/filterable archives, bookmarking (localStorage), and a simple comment system — all at zero cost.

## Goals

1. **Comprehensive Coverage** — Aggregate news from 10+ trusted global sources across every major region and geopolitical topic
2. **AI-Powered Curation** — Automatically summarize, rewrite, categorize, tag, and deduplicate news articles daily
3. **Intuitive Navigation** — Present news in clearly organized sections (by region + by topic) so users find what they need instantly
4. **Breaking News** — Surface urgent stories in a dedicated top section with more frequent update checks
5. **Interactive Features** — Search, filter, bookmark articles, and leave comments without requiring user accounts
6. **Zero Budget** — Entire stack runs on free-tier services (Gemini API free tier, free news APIs, RSS feeds, free hosting)

## Non-Goals (Out of Scope)

- User authentication / login system
- Paid subscriptions or paywalled content
- Original journalism or editorial content (we aggregate, not create)
- Mobile native apps (responsive web only)
- Real-time live updates (polling intervals, not WebSockets)
- Multi-language support (English only for v1)
- Newsletter / email notifications

## Users

**Primary**: Anyone interested in global geopolitics — students, professionals, researchers, news enthusiasts — who want a single destination that organizes world news clearly without needing to visit 10+ different news sites.

**Usage Pattern**: Daily visits, primarily in the evening after the 7 PM update. Some users will browse sections; others will search for specific topics or countries.

## Sections

### By Region
- 🌏 Asia (South Asia, East Asia, Southeast Asia, Central Asia)
- 🌍 Europe (Western, Eastern, EU affairs)
- 🌍 Middle East & North Africa
- 🌎 Americas (North America, Latin America)
- 🌍 Sub-Saharan Africa
- 🌏 Oceania & Pacific

### By Topic
- 🤝 Diplomacy & Foreign Relations
- ⚔️ Conflicts & Security
- 📊 Trade & Economy
- 🗳️ Elections & Politics
- 🌱 Climate & Environment
- 💻 Technology & Cyber

## News Sources (All Free)

### RSS Feeds (No API key required)
- Reuters World News
- BBC World
- Al Jazeera
- The Guardian (World)
- Times of India (World)
- AP News
- France24
- DW News (Deutsche Welle)

### Free-Tier APIs
- GNews API (100 req/day free)
- NewsAPI.org (100 req/day free, dev only)
- The Guardian Open Platform API (free)
- NYT Article Search API (free tier)

## Tech Stack

| Layer | Technology | Cost |
|-------|-----------|------|
| Frontend | React (Vite) + Vanilla CSS | Free |
| Backend | Node.js + Express | Free |
| Database | SQLite (via better-sqlite3) with FTS5 | Free |
| AI/LLM | Google Gemini API (free tier — 15 RPM, 1M tokens/day) | Free |
| News Ingestion | RSS Parser (rss-parser npm) + Free APIs | Free |
| Scheduling | node-cron (7 PM IST daily + 30-min breaking news checks) | Free |
| Hosting | Vercel (frontend) + Railway/Render (backend) | Free tier |

## Constraints

- **Zero budget** — All services must be free tier
- **Gemini API rate limits** — 15 requests/minute, 1M tokens/day (sufficient for daily batch)
- **Free news API limits** — ~100 requests/day per API (offset by RSS feeds which are unlimited)
- **No user auth** — Bookmarks stored in localStorage, comments require only a display name
- **SQLite** — Single-server database (fine for this scale)

## Success Criteria

- [ ] News from 8+ sources aggregated and displayed across all sections
- [ ] AI generates summaries and rewrites for every article daily at 7 PM
- [ ] Duplicate stories from different sources are detected and merged
- [ ] Users can search and filter by region, topic, date, and keywords
- [ ] Breaking news section updates every 30 minutes
- [ ] Bookmarking works via localStorage without login
- [ ] Comment system allows public comments with display name
- [ ] Site loads in under 3 seconds on average connection
- [ ] Fully responsive design (mobile, tablet, desktop)
- [ ] Entire infrastructure runs at $0/month
