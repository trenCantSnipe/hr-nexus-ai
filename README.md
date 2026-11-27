# 👥 HR Nexus AI

An HR management suite with Gemini built into each workflow: hiring, performance reviews, audits and a voice assistant. It has separate **admin** and **employee** portals.

## Modules

| Module | What it does |
|---|---|
| **Recruitment** | Generates role-specific interview questions, scores candidate answers (structured JSON), suggests interview slots, drafts outreach emails |
| **Performance** | Writes performance reviews with the model's reasoning visible |
| **Audit & Reports** | Produces compliance/audit reports with charts (Recharts) |
| **Live Assistant** | Real-time voice assistant (Gemini Live API) plus text-to-speech replies |
| **Grounded chat** | Answers grounded in Google Search and Google Maps (e.g. office locations, commute) |
| **Employee portal** | Self-service view for staff |

## Tech stack

React 19 · TypeScript · Vite · Recharts · Gemini 3 Pro / 2.5 Flash · Gemini Live API · Gemini TTS

> Login is a client-side demo gate with sample roles, not real authentication.

## Run locally

```bash
git clone https://github.com/trenCantSnipe/hr-nexus-ai.git && cd hr-nexus-ai
npm install
echo "GEMINI_API_KEY=your_key_here" > .env.local
npm run dev
```

Get a free key at [Google AI Studio](https://aistudio.google.com/apikey). The key stays in `.env.local`, which is git-ignored.
