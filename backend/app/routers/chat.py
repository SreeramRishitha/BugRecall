from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.memory import recall
from app.ai import ask_claude
from app.ai import find_similar_bugs

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
@router.get("/{session_id}/similar", response_model=schemas.SimilarBugsResponse)
async def similar(session_id: int, db: Session = Depends(get_db)):
    session = db.query(models.BugSession).filter(models.BugSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    current_evidence = db.query(models.Evidence).filter(models.Evidence.session_id == session_id).all()
    current_hyps = db.query(models.Hypothesis).filter(models.Hypothesis.session_id == session_id).all()
    current_summary = f"{session.title}: " + "; ".join(
        [e.content for e in current_evidence] + [h.title for h in current_hyps]
    )

    other_sessions = db.query(models.BugSession).filter(models.BugSession.id != session_id).all()
    candidates = []
    for s in other_sessions:
        ev = db.query(models.Evidence).filter(models.Evidence.session_id == s.id).all()
        hyp = db.query(models.Hypothesis).filter(models.Hypothesis.session_id == s.id).all()
        summary_text = "; ".join([e.content for e in ev] + [h.title for h in hyp]) or "(no details logged)"
        candidates.append({"id": s.id, "title": s.title, "project": s.project, "summary": summary_text})

    raw_matches = await find_similar_bugs(current_summary, candidates)

    lookup = {s.id: s for s in other_sessions}
    matches = []
    for m in raw_matches:
        sid = m.get("session_id")
        s = lookup.get(sid)
        if s:
            matches.append(schemas.SimilarBug(session_id=sid, title=s.title, project=s.project, reason=m.get("reason", "")))

    return schemas.SimilarBugsResponse(matches=matches)