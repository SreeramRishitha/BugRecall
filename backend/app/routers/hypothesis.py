from app.memory import ingest_text
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/hypothesis", tags=["Hypothesis"])


@router.post("/", response_model=schemas.HypothesisOut)
async def create_hypothesis(hyp: schemas.HypothesisCreate, db: Session = Depends(get_db)):
    session = db.query(models.BugSession).filter(models.BugSession.id == hyp.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    db_hyp = models.Hypothesis(**hyp.model_dump())
    db.add(db_hyp)
    db.commit()
    db.refresh(db_hyp)
    await ingest_text(hyp.session_id, f"Hypothesis: {hyp.title}")

    return db_hyp


@router.get("/{session_id}", response_model=list[schemas.HypothesisOut])
def get_hypotheses(session_id: int, db: Session = Depends(get_db)):
    return db.query(models.Hypothesis).filter(models.Hypothesis.session_id == session_id).all()


@router.patch("/{hyp_id}", response_model=schemas.HypothesisOut)
async def update_hypothesis(hyp_id: int, update: schemas.HypothesisUpdate, db: Session = Depends(get_db)):
    hyp = db.query(models.Hypothesis).filter(models.Hypothesis.id == hyp_id).first()
    if not hyp:
        raise HTTPException(status_code=404, detail="Hypothesis not found")
    hyp.status = update.status
    if update.reason is not None:
        hyp.reason = update.reason
    db.commit()
    db.refresh(hyp)
    await ingest_text(hyp.session_id, f"Hypothesis '{hyp.title}' was marked {update.status}. Reason: {update.reason or 'none given'}")
    return hyp
