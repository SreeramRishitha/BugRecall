from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.memory import recall
from app.ai import ask_claude

router = APIRouter(prefix="/sessions", tags=["Chat / Recall"])


def _format_memory(results) -> str:
    return "\n".join(str(r) for r in results)


@router.post("/{session_id}/ask", response_model=schemas.ChatResponse)
async def ask(session_id: int, req: schemas.ChatRequest, db: Session = Depends(get_db)):
    session = db.query(models.BugSession).filter(models.BugSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    memory_results = await recall(session_id, req.question)
    answer = await ask_claude(_format_memory(memory_results), req.question)
    return schemas.ChatResponse(answer=answer)


@router.get("/{session_id}/summary", response_model=schemas.ChatResponse)
async def summary(session_id: int, db: Session = Depends(get_db)):
    session = db.query(models.BugSession).filter(models.BugSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    memory_results = await recall(
        session_id, "Summarize everything investigated so far: confirmed, ruled out, pending."
    )
    answer = await ask_claude(
        _format_memory(memory_results),
        "Give a short 'welcome back' recap of this bug session: what's done and what's next.",
    )
    return schemas.ChatResponse(answer=answer)