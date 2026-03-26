---
phase: 1
plan: 3
wave: 2
---

# Plan 1.3: API Endpoints & Frontend Design System

## Objective
Create the core REST API endpoints for serving articles, categories, and comments. Set up the React frontend with a comprehensive design system (CSS custom properties, component styles, layout system).

## Context
- .gsd/SPEC.md
- server/db/init.js (from Plan 1.2)
- client/src/index.css (from Plan 1.1)

## Tasks

<task type="auto">
  <name>Create REST API routes</name>
  <files>server/routes/articles.js, server/routes/categories.js, server/routes/comments.js, server/index.js</files>
  <action>
    1. Create server/routes/ directory
    2. Create articles.js with routes:
       - GET /api/articles — List articles (with pagination, filter by category, search query)
       - GET /api/articles/breaking — Get breaking news articles
       - GET /api/articles/:slug — Get single article with full analysis
    3. Create categories.js with routes:
       - GET /api/categories — List all categories (grouped by type: region/topic)
       - GET /api/categories/:slug/articles — Articles in a category
    4. Create comments.js with routes:
       - GET /api/articles/:slug/comments — Get comments for article
       - POST /api/articles/:slug/comments — Add comment (body: display_name, content)
    5. Register all routes in index.js
    6. Add basic input validation (no empty comments, name required)
    7. Add error handling middleware
  </action>
  <verify>Start server, curl http://localhost:3001/api/categories — should return JSON array of categories</verify>
  <done>All API endpoints respond correctly, categories and articles served as JSON</done>
</task>

<task type="auto">
  <name>Set up frontend design system</name>
  <files>client/src/index.css, client/src/App.jsx, client/src/App.css</files>
  <action>
    1. Create comprehensive CSS design system in index.css:
       - CSS custom properties for colors (dark theme primary):
         * --bg-primary: #0a0a0f (deep dark)
         * --bg-secondary: #12121a
         * --bg-card: #1a1a2e
         * --accent-primary: #e94560 (geopolitics red)
         * --accent-secondary: #0f3460 (deep blue)
         * --accent-gold: #f0a500
         * --text-primary: #e8e8e8
         * --text-secondary: #a0a0b0
       - Typography scale using Inter (Google Font)
       - Spacing scale (4px base)
       - Border radius tokens
       - Shadow tokens with subtle glows
       - Transition tokens
       - Glassmorphism utility classes
    2. Create layout structure in App.jsx:
       - Top navigation bar with logo "GeoScope"
       - Breaking news ticker placeholder
       - Main content area
       - Sidebar with category navigation
       - Footer
    3. Make layout responsive (mobile-first)
    4. Import Google Font (Inter) in index.html
  </action>
  <verify>cd client && npm run dev — open browser, dark theme renders with proper typography</verify>
  <done>Complete design system with dark theme, responsive layout shell with nav, sidebar, and content area</done>
</task>

## Success Criteria
- [ ] All API endpoints return proper JSON responses
- [ ] Frontend design system with dark theme and all CSS tokens
- [ ] Responsive layout with navigation, content area, and sidebar
- [ ] API correctly serves seeded categories
