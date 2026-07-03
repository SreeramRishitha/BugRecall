# BugRecall

An AI debugging assistant that remembers every debugging session and intelligently continues where the developer left off — instead of a normal AI chat that forgets everything between sessions, BugRecall keeps a permanent memory of each bug investigation.

## Concept

Every bug gets a **Bug Session** — a persistent case file that stores:

- Evidence (logs, notes, stack traces, snippets)
- Hypotheses (theories, marked Untested / Confirmed / Ruled Out)
- A timeline of the investigation

That memory is pushed into a knowledge graph via **Cognee**, so an AI assistant (**Claude**) can be asked "what should I check next?" and answer grounded in everything already tried for that specific bug — instead of repeating suggestions that have already failed.

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React + TypeScript + Vite |
| Backend | FastAPI (Python, async) |
| Database | SQLite (via SQLAlchemy) |
| Memory layer | [Cognee](https://www.cognee.ai/) — knowledge graph over evidence/hypotheses |
| AI reasoning | Claude API (Anthropic) |

## Features

### ✅ Working

- **Bug Session management** — create, view, and list debugging sessions (title, project, description, status)
- **Evidence logging** — attach logs/notes/snippets to a session
- **Hypothesis tracking** — log theories and mark them Confirmed / Ruled Out
- **Investigation Timeline** — chronological view of evidence + hypotheses for a session
- **Chat UI** — "Ask BugRecall" panel wired to the backend `/sessions/{id}/ask` endpoint

### 🚧 In progress

- **AI Recall Engine** — Cognee ingestion + Claude-powered answers are wired end-to-end, but memory `search()` calls are currently failing on a Cognee internal SQLite path issue (see Known Issues below). Ingestion (`add`/`cognify`) has not yet been verified working.
- **Resume Previous Session** — auto-summary endpoint (`/sessions/{id}/summary`) exists but is blocked by the same issue as above.

### ⬜ Not started

- Similar Bug Search (embedding-based cross-session matching)
- GitHub Issue Import

## Project Structure

```
backend/
  app/
    routers/       # bug_session, evidence, hypothesis, chat
    models/        # SQLAlchemy models
    schemas/        # Pydantic request/response schemas
    memory/         # Cognee ingestion + recall
    ai/             # Claude API wrapper
    database.py
    main.py
frontend/
  src/
    pages/          # Dashboard, BugSessionPage
    components/     # StatusPill, etc.
    lib/api.ts       # typed API client
    types.ts
```

## Setup

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create `backend/.env`:

```
ANTHROPIC_API_KEY=your-key-here
```

Run:

```bash
uvicorn app.main:app --reload
```

API docs available at `http://127.0.0.1:8000/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App available at `http://localhost:5173`.

## Known Issues

- `POST /sessions/{id}/ask` currently returns a `500` with:
  ```
  sqlite3.OperationalError: unable to open database file
  ```
  This happens inside Cognee's own internal user/auth database lookup (`get_default_user`), not the app's own SQLite DB. Likely cause: Cognee's system data directory doesn't exist yet, or the process doesn't have write permission to it. Needs investigation before the AI chat and resume-summary features will work end-to-end.

## Roadmap

Based on the original 3-day plan:

- [x] Bug Session / Evidence / Hypothesis CRUD (backend + frontend)
- [x] Chat UI shell wired to a real endpoint
- [ ] Fix Cognee memory ingestion/search (blocking)
- [ ] AI Next Best Step recommendations
- [ ] Session Resume auto-summary
- [ ] Similar Bug Search
- [ ] Polish + demo prep