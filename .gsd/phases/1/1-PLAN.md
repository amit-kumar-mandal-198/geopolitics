---
phase: 1
plan: 1
wave: 1
---

# Plan 1.1: Project Scaffolding

## Objective
Set up the monorepo structure with a Vite + React frontend and Node.js + Express backend. Create the `.env` file with the Gemini API key and configure the basic project structure both sides need.

## Context
- .gsd/SPEC.md
- .gsd/ROADMAP.md

## Tasks

<task type="auto">
  <name>Initialize Vite + React frontend</name>
  <files>client/package.json, client/vite.config.js, client/index.html, client/src/main.jsx, client/src/App.jsx, client/src/index.css</files>
  <action>
    1. Run `npx -y create-vite@latest client -- --template react` from project root
    2. Install dependencies: `cd client && npm install`
    3. Clean up default Vite boilerplate (remove default counter app)
    4. Set up base CSS with design tokens (dark theme, color palette, typography using Inter font)
    5. Create basic App.jsx with placeholder layout
  </action>
  <verify>cd client && npm run build — should complete without errors</verify>
  <done>Vite + React app scaffolded, builds without errors, default boilerplate removed</done>
</task>

<task type="auto">
  <name>Initialize Express backend</name>
  <files>server/package.json, server/index.js, server/.env, server/.env.example</files>
  <action>
    1. Create server/ directory with `npm init -y`
    2. Install dependencies: express, cors, better-sqlite3, dotenv, rss-parser, node-cron, @google/generative-ai
    3. Create index.js with:
       - Express app with CORS enabled (allow client origin)
       - dotenv config
       - Health check endpoint: GET /api/health
       - Port 3001
    4. Create .env with GEMINI_API_KEY
    5. Create .env.example (without actual key)
    6. Add .gitignore with node_modules/ and .env
    7. Add "dev" script using nodemon (install as devDep)
  </action>
  <verify>cd server && node -e "require('./index.js')" — server starts without crash (or just validate syntax)</verify>
  <done>Express server created, starts on port 3001, /api/health returns 200</done>
</task>

## Success Criteria
- [ ] `client/` directory with working Vite + React app
- [ ] `server/` directory with working Express server
- [ ] Both build/start without errors
- [ ] .env file contains GEMINI_API_KEY
