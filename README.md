# Daily Brief

A minimal AI-powered morning briefing app. Opens once, reads your emails and calendar, and delivers a calm, human-like summary of your day — no dashboards, no noise.

![Daily Brief](https://img.shields.io/badge/stack-React%20%2B%20Express%20%2B%20Groq-black)

---

## What it does

On launch, the app pulls your emails and calendar events, sends them to an LLM, and streams back a warm, concise daily brief — highlighting names, deadlines, and action items. You can listen to it read aloud or refresh for a new take.

---

## Features

- **AI-generated brief** — powered by Groq's `llama-3.3-70b-versatile`, streamed in real time
- **Text-to-speech** — plays the brief in a natural female voice via the Web Speech API
- **Keyboard shortcuts** — `SPACE` to play/stop, `R` to refresh, `ESC` to close
- **Clean, minimal UI** — white canvas, muted prose, bold highlights for key info
- **Streaming UX** — subtitle and brief text appear token by token as they generate

---

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Backend | Node.js, Express, TypeScript |
| AI | Groq API (`llama-3.3-70b-versatile`) |
| Streaming | Server-Sent Events (SSE) |
| TTS | Web Speech API |
| Font | Geist |

---

## Getting started

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd update-app
```

### 2. Set up your Groq API key

Create a `.env` file inside the `server/` directory:

```bash
# server/.env
GROQ_API_KEY=your_groq_api_key_here
PORT=3001
```

Get a free API key at [console.groq.com](https://console.groq.com).

### 3. Install dependencies

```bash
npm install
cd server && npm install
cd ../client && npm install
```

### 4. Run the app

From the root:

```bash
npm run dev
```

This starts both the Express server (port 3001) and the Vite dev server concurrently. Open the URL Vite prints in your terminal.

---

## Project structure

```
update-app/
├── client/               # React frontend (Vite)
│   └── src/
│       ├── App.tsx       # Main component — state, streaming, TTS
│       └── index.css     # All styles
├── server/               # Express backend
│   └── src/
│       ├── index.ts      # Routes
│       ├── brief.ts      # AI brief generation (SSE stream)
│       └── mock-data.ts  # Simulated emails + calendar events
└── package.json          # Root — runs both servers via concurrently
```

---

## Notes

- The app currently uses **mock data** (simulated emails and calendar events) to demonstrate the concept. Connecting real Gmail and Google Calendar would require OAuth 2.0 setup via the Google Cloud Console.
- The Groq free tier is generous enough to run this comfortably with no cost.
