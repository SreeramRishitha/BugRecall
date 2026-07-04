BugRecall

An AI debugging assistant that remembers every debugging session and intelligently continues where the developer left off — instead of a normal AI chat that forgets everything between sessions, BugRecall keeps a permanent memory of each bug investigation.

Concept

Every bug gets a Bug Session — a persistent case file that stores:


Evidence (logs, notes, stack traces, snippets)
Hypotheses (theories, marked Untested / Confirmed / Ruled Out)
A timeline of the investigation


That memory is pushed into a knowledge graph via Cognee, so an AI assistant (Gemini) can be asked "what should I check next?" and answer grounded in everything already tried for that specific bug — instead of repeating suggestions that have already failed. It can also recall a session's history on return, and spot when a new bug resembles one already solved elsewhere in the project.

Tech Stack

LayerChoiceFrontendReact + TypeScript + ViteBackendFastAPI (Python, async)DatabaseSQLite (via SQLAlchemy)Memory layerCognee — knowledge graph over evidence/hypothesesAI reasoningGoogle Gemini API (gemini-2.5-flash-lite)EmbeddingsGemini (gemini-embedding-001)

We use gemini-2.5-flash-lite rather than gemini-2.5-flash specifically for its much larger free-tier daily quota — important for a hackathon build with heavy iterative testing.

Features

✅ Working


Bug Session management — create, view, and list debugging sessions (title, project, description, status)
Evidence logging — attach logs/notes/snippets to a session; automatically ingested into memory
Hypothesis tracking — log theories, mark them Confirmed / Ruled Out; status changes are also fed into memory
Investigation Timeline — chronological view of evidence + hypotheses for a session
AI Recall Chat — "Ask BugRecall" panel: evidence/hypotheses are pushed into a Cognee knowledge graph per session, queried on each question, and answered by Gemini with a grounded, memory-aware recommendation
Resume Previous Session — reopening a session fetches an auto-generated "Welcome back" recap of what's been investigated so far, using the same memory pipeline as chat
Similar Bug Search — compares the current session's evidence/hypotheses against every other session's, and surfaces genuinely related past bugs with a specific, grounded reason (e.g. "both mention database connection timeouts as the cause of 500 errors")


⬜ Not started


GitHub Issue Import (bonus feature from the original plan — lowest priority, not required for core functionality)


Project Structure

backend/
  app/
    routers/       # bug_session, evidence, hypothesis, chat
    models/        # SQLAlchemy models
    schemas/        # Pydantic request/response schemas
    memory/         # Cognee ingestion + recall
    ai/             # Gemini API wrapper (chat, resume summary, similar-bug matching)
    database.py
    main.py
  test_cognee.py    # standalone script for testing Cognee outside FastAPI
frontend/
  src/
    pages/          # Dashboard, BugSessionPage
    components/     # Sidebar, SessionHeader, Timeline, EvidenceCard, HypothesisCard,
                     # ResumeBanner, SimilarBugs, StatusPill, etc.
    lib/api.ts       # typed API client
    types.ts

Setup

Backend

bashcd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

Create backend/.env:

GEMINI_API_KEY=your-gemini-key-here
LLM_API_KEY=your-gemini-key-here
LLM_PROVIDER=gemini
LLM_MODEL=gemini/gemini-2.5-flash-lite
EMBEDDING_PROVIDER=gemini
EMBEDDING_API_KEY=your-gemini-key-here
EMBEDDING_MODEL=gemini/gemini-embedding-001

Get a free Gemini API key at aistudio.google.com — no card required.

Run:

bashuvicorn app.main:app --reload

API docs available at http://127.0.0.1:8000/docs.

Note: editing .env requires a full stop/restart of uvicorn (Ctrl+C then rerun) — --reload only watches .py file changes, not .env.

Frontend

bashcd frontend
npm install
npm run dev

App available at http://localhost:5173.

Verifying end-to-end


Create two bug sessions with related root causes (e.g. two different endpoints both failing due to a database connection pool issue)
Log evidence and a hypothesis on each
Ask a question in "Ask BugRecall" on one of them — the answer should reference the specific evidence/hypotheses just logged
Reopen the session — a "Welcome back" recap banner should appear automatically
Check the "Similar Past Cases" panel — it should surface the other related session with a specific reason, not a generic one


To debug the memory layer in isolation from FastAPI, run python test_cognee.py from backend/.

Notes on Gemini/Cognee configuration


Cognee reads LLM_PROVIDER / LLM_API_KEY / LLM_MODEL / EMBEDDING_* directly from environment variables — calling cognee.config.set_llm_config(...) in code was found to be unreliable and is not used
Cognee's system/data storage is pointed at backend/.cognee_system/ and backend/.cognee_data/ (set in app/memory/__init__.py) rather than its default location inside .venv/site-packages, which was unreliable to write to on this setup
The model name is set in two places and both need to match: .env's LLM_MODEL (used by Cognee) and the hardcoded URL in app/ai/__init__.py (used by our own direct Gemini calls for chat/summary/similar-bug matching) — this cost real debugging time when only one was updated after hitting a rate limit
gemini-2.5-flash's free tier is very low (20 requests/day on this project) and easy to exhaust during active development; gemini-2.5-flash-lite has a much larger daily quota and is used throughout
Gemini's free-tier daily quota resets at midnight Pacific Time and is per Google Cloud project, not per API key
Both .cognee_system/ and .cognee_data/ are gitignored, along with .env


Roadmap

Based on the original 3-day plan:


 Bug Session / Evidence / Hypothesis CRUD (backend + frontend)
 Chat UI wired to a real endpoint
 Cognee memory ingestion/search working
 AI Next Best Step recommendations (grounded, memory-aware)
 Session Resume auto-summary
 Similar Bug Search
