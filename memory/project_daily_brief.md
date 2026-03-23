---
name: Daily Brief Project
description: Daily Brief MVP app - AI-powered personal morning update assistant
type: project
---

Built a full-stack "Daily Brief" MVP app in C:\Users\HP\Desktop\Claude Type Shi\update-app\

**Stack:** React + Vite (TypeScript) frontend, Express + TypeScript backend, Claude Opus 4.6 via Anthropic SDK.

**Structure:**
- `/server` — Express API, port 3001
- `/client` — Vite+React, port 5173 (proxies /api → 3001)
- Root `package.json` uses `concurrently` to run both with `npm run dev`

**Key files:**
- `server/src/index.ts` — Express server with /api/brief (GET SSE) and /api/ask (POST SSE)
- `server/src/brief.ts` — Streams daily brief via Claude Opus 4.6
- `server/src/question.ts` — Streams answers to follow-up questions
- `server/src/mock-data.ts` — Mocked Gmail emails + calendar events
- `client/src/App.tsx` — Single screen React app
- `client/src/index.css` — Dark minimal design (--bg: #09090b, accent: #c8a96e warm gold)

**Features:** SSE streaming brief, TTS via Web Speech API, Ask AI follow-up, Refresh.

**Setup:** Add ANTHROPIC_API_KEY to `server/.env`, then `npm run dev` from root.

**Why:** User Runit wants a Jarvis-style morning briefing app. MVP with mocked Gmail data, expandable to real Gmail API, WhatsApp, Slack.
