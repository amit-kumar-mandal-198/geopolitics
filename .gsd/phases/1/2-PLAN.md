---
phase: 1
plan: 2
wave: 1
---

# Plan 1.2: Database Schema & Data Layer

## Objective
Design and implement the SQLite database schema with all tables needed for articles, categories, sources, comments, and full-text search. Create the database initialization module and seed data for categories and sources.

## Context
- .gsd/SPEC.md (sections, sources list)
- .gsd/ROADMAP.md

## Tasks

<task type="auto">
  <name>Create SQLite database schema</name>
  <files>server/db/schema.sql, server/db/init.js</files>
  <action>
    1. Create server/db/ directory
    2. Create schema.sql with these tables:
       - `sources` (id, name, url, rss_url, type, active, created_at)
       - `categories` (id, name, slug, type ENUM('region','topic'), icon, display_order)
       - `articles` (id, title, slug, summary, content, analysis, source_id FK, original_url, image_url, published_at, fetched_at, is_breaking, content_hash)
       - `article_categories` (article_id FK, category_id FK) — many-to-many
       - `comments` (id, article_id FK, display_name, content, created_at)
       - `articles_fts` — FTS5 virtual table on title + summary + content
    3. Create init.js that:
       - Opens/creates SQLite database at server/db/geoscope.db
       - Runs schema.sql if tables don't exist
       - Exports db connection
    4. Add indexes on articles.published_at, articles.content_hash, articles.is_breaking
  </action>
  <verify>cd server && node -e "const db = require('./db/init.js'); console.log(db.pragma('table_info(articles)'))" — should show columns</verify>
  <done>SQLite database created with all tables, indexes, and FTS5 virtual table</done>
</task>

<task type="auto">
  <name>Seed categories and sources</name>
  <files>server/db/seed.js</files>
  <action>
    1. Create seed.js that inserts:
       - 6 region categories: Asia, Europe, Middle East & North Africa, Americas, Sub-Saharan Africa, Oceania & Pacific
       - 6 topic categories: Diplomacy & Foreign Relations, Conflicts & Security, Trade & Economy, Elections & Politics, Climate & Environment, Technology & Cyber
       - 8+ news sources with RSS URLs:
         * Reuters World (feeds.reuters.com/Reuters/worldNews)
         * BBC World (feeds.bbci.co.uk/news/world/rss.xml)
         * Al Jazeera (aljazeera.com/xml/rss/all.xml)
         * The Guardian World (theguardian.com/world/rss)
         * Times of India World (timesofindia.indiatimes.com/rssfeeds/296589292.cms)
         * AP News (apnews.com/index.rss)
         * France24 (france24.com/en/rss)
         * DW News (rss.dw.com/rdf/rss-en-world)
    2. Use INSERT OR IGNORE to be idempotent
    3. Add npm script: "seed" in package.json
  </action>
  <verify>cd server && node db/seed.js && node -e "const db = require('./db/init.js'); console.log('Categories:', db.prepare('SELECT count(*) as c FROM categories').get()); console.log('Sources:', db.prepare('SELECT count(*) as c FROM sources').get())"</verify>
  <done>12 categories and 8+ sources seeded into database</done>
</task>

## Success Criteria
- [ ] SQLite database created with proper schema
- [ ] FTS5 virtual table for full-text search
- [ ] 12 categories (6 regions + 6 topics) seeded
- [ ] 8+ news sources with RSS URLs seeded
- [ ] Database queries work without errors
