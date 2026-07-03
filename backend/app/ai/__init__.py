"""
Gemini wrapper — turns memory retrieved from Cognee + the dev's
question into a grounded, memory-aware answer.
"""
import os
import httpx

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-2.5-flash:generateContent"
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