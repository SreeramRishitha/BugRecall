from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/evidence", tags=["Evidence"])


@router.post("/", response_model=schemas.EvidenceOut)
def create_evidence(evidence: schemas.EvidenceCreate, db: Session = Depends(get_db)):
    session = db.query(models.BugSession).filter(models.BugSession.id == evidence.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    db_evidence = models.Evidence(**evidence.model_dump())
    db.add(db_evidence)
    db.commit()
    db.refresh(db_evidence)
    return db_evidence


@router.get("/{session_id}", response_model=list[schemas.EvidenceOut])
def get_evidence(session_id: int, db: Session = Depends(get_db)):
    return db.query(models.Evidence).filter(models.Evidence.session_id == session_id).all()