# BugRecall

An AI debugging assistant that remembers every debugging session and intelligently continues where the developer left off — instead of a normal AI chat that forgets everything between sessions, BugRecall keeps a permanent memory of each bug investigation.

## Concept

Every bug gets a **Bug Session** — a persistent case file that stores:

- Evidence (logs, notes, stack traces, snippets)
- Hypotheses (theories, marked Untested / Confirmed / Ruled Out)
- A timeline of the investigation

That memory is pushed into a knowledge graph via **Cognee**, so an AI assistant (**Gemini**) can be asked "what should I check next?" and answer grounded in everything already tried for that specific bug — instead of repeating suggestions that have already failed.

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React + TypeScript + Vite |
| Backend | FastAPI (Python, async) |
| Database | SQLite (via SQLAlchemy) |
| Memory layer | [Cognee](https://www.cognee.ai/) — knowledge graph over evidence/hypotheses |
| AI reasoning | Google Gemini API (`gemini-2.5-flash`) |
| Embeddings | Gemini (`gemini-embedding-001`) |

## Features

### ✅ Working

- **Bug Session management** — create, view, and list debugging sessions (title, project, description, status)
- **Evidence logging** — attach logs/notes/snippets to a session; automatically ingested into memory
- **Hypothesis tracking** — log theories, mark them Confirmed / Ruled Out; status changes are also fed into memory
- **Investigation Timeline** — chronological view of evidence + hypotheses for a session
- **AI Recall Chat** — "Ask BugRecall" panel, fully working end-to-end: evidence/hypotheses are pushed into a Cognee knowledge graph per session, queried on each question, and answered by Gemini with a grounded, memory-aware recommendation (verified to correctly reference prior evidence and avoid re-suggesting ruled-out hypotheses)

### 🚧 In progress

- **Resume Previous Session** — `GET /sessions/{id}/summary` endpoint exists and uses the same working pipeline as chat, but hasn't been tested/wired into the frontend yet as a "welcome back" banner

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
    ai/             # Gemini API wrapper
    database.py
    main.py
  test_cognee.py    # standalone script for testing Cognee outside FastAPI
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
GEMINI_API_KEY=your-gemini-key-here
LLM_API_KEY=your-gemini-key-here
LLM_PROVIDER=gemini
LLM_MODEL=gemini/gemini-2.5-flash
EMBEDDING_PROVIDER=gemini
EMBEDDING_API_KEY=your-gemini-key-here
EMBEDDING_MODEL=gemini/gemini-embedding-001
```

Get a free Gemini API key at [aistudio.google.com](https://aistudio.google.com) — no card required.

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

## Verifying the AI Recall engine

1. Log a piece of evidence and a hypothesis on a session (via the UI or `/docs`)
2. Ask a question in "Ask BugRecall" (or `POST /sessions/{id}/ask`)
3. The answer should reference the specific evidence/hypotheses just logged, not generic advice — this confirms Cognee ingestion and Gemini reasoning are both wired correctly

To debug the memory layer in isolation from FastAPI, run `python test_cognee.py` from `backend/`.

## Notes on Cognee configuration

- Cognee reads `LLM_PROVIDER` / `LLM_API_KEY` / `LLM_MODEL` / `EMBEDDING_*` directly from environment variables — calling `cognee.config.set_llm_config(...)` in code was found to be unreliable and is not used
- Cognee's system/data storage is pointed at `backend/.cognee_system/` and `backend/.cognee_data/` (set in `app/memory/__init__.py`) rather than its default location inside `.venv/site-packages`, which was unreliable to write to on this setup
- Both directories are gitignored, along with `.env`

## Roadmap

Based on the original 3-day plan:

- [x] Bug Session / Evidence / Hypothesis CRUD (backend + frontend)
- [x] Chat UI wired to a real endpoint
- [x] Cognee memory ingestion/search working
- [x] AI Next Best Step recommendations (grounded, memory-aware)
- [ ] Session Resume auto-summary (backend done, frontend pending)
- [ ] Similar Bug Search
- [ ] Polish + demo prep