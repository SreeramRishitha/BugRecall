"""
Gemini wrapper — turns memory retrieved from Cognee + the dev's
question into a grounded, memory-aware answer.
"""
import os
import httpx

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-2.5-flash-lite:generateContent"
)

SYSTEM_PROMPT = """You are BugRecall, an AI debugging assistant with a persistent
memory of this specific bug investigation. You're given memory retrieved from past
evidence/hypotheses for this session, plus the developer's current question.

Rules:
- Never suggest something already marked RULED_OUT unless new evidence contradicts it.
- Ground every answer in the provided memory — reference what was tried and what happened.
- If recommending a next step, give exactly ONE concrete action and a short reason.
- Be concise — this is a live debugging session, not an essay.
"""


async def ask_claude(memory_context: str, question: str) -> str:
    """Name kept as ask_claude so chat.py doesn't need changes."""
    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is not set")

    prompt = f"""Session memory so far:
{memory_context or "(no memory yet — this is a fresh session)"}

Developer's question:
{question}"""

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            f"{GEMINI_URL}?key={GEMINI_API_KEY}",
            headers={"content-type": "application/json"},
            json={
                "system_instruction": {"parts": [{"text": SYSTEM_PROMPT}]},
                "contents": [{"parts": [{"text": prompt}]}],
            },
        )
        resp.raise_for_status()
        data = resp.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]
import json

SIMILAR_BUGS_PROMPT = """You are BugRecall, comparing a current bug investigation against
a developer's past solved/investigated bugs to find genuinely similar ones.

Only include a past bug if it is meaningfully similar (same root cause area, same kind of
symptom, or a hypothesis/fix that would likely transfer) — not just superficially related.
If nothing is meaningfully similar, return an empty list.

Respond with ONLY valid JSON, no markdown, no commentary, in exactly this shape:
{"matches": [{"session_id": <int>, "reason": "<one short sentence, reference specific evidence>"}]}
"""


async def find_similar_bugs(current_summary: str, candidates: list[dict]) -> list[dict]:
    """candidates: list of {id, title, project, summary} for other sessions."""
    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is not set")
    if not candidates:
        return []

    candidates_text = "\n\n".join(
        f"Session #{c['id']} — {c['title']} ({c['project']}):\n{c['summary']}"
        for c in candidates
    )
    prompt = f"""Current bug:
{current_summary}

Past sessions to compare against:
{candidates_text}"""

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            f"{GEMINI_URL}?key={GEMINI_API_KEY}",
            headers={"content-type": "application/json"},
            json={
                "system_instruction": {"parts": [{"text": SIMILAR_BUGS_PROMPT}]},
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"response_mime_type": "application/json"},
            },
        )
        resp.raise_for_status()
        data = resp.json()
        text = data["candidates"][0]["content"]["parts"][0]["text"]
        try:
            parsed = json.loads(text)
            return parsed.get("matches", [])
        except json.JSONDecodeError:
            return []