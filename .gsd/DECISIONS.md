# DECISIONS.md — Architecture Decision Records

## ADR-001: Zero-Budget Tech Stack
**Date**: 2026-03-26
**Status**: Accepted
**Decision**: Use exclusively free-tier services — Gemini API free tier for AI, RSS feeds + free news APIs for sourcing, SQLite for database, Vercel/Render for hosting.
**Rationale**: User has zero budget. All components must run at $0/month.

## ADR-002: No User Authentication
**Date**: 2026-03-26
**Status**: Accepted
**Decision**: No login/signup system. Bookmarks use localStorage. Comments require only a display name.
**Rationale**: Keeps the site simple, public, and free. Avoids auth infrastructure costs and complexity.

## ADR-003: Gemini API for AI Processing
**Date**: 2026-03-26
**Status**: Accepted
**Decision**: Use Google Gemini API (free tier: 15 RPM, 1M tokens/day) for all AI tasks — summarization, rewriting, categorization, deduplication scoring.
**Rationale**: Most generous free tier among LLM providers. Daily batch processing at 7 PM stays well within limits.
