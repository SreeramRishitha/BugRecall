from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/sessions", tags=["Bug Sessions"])


@router.post("/", response_model=schemas.BugSessionOut)
def create_session(session: schemas.BugSessionCreate, db: Session = Depends(get_db)):
    db_session = models.BugSession(**session.model_dump())
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session


@router.get("/", response_model=list[schemas.BugSessionOut])
def list_sessions(db: Session = Depends(get_db)):
    return db.query(models.BugSession).all()


@router.get("/{session_id}", response_model=schemas.BugSessionOut)
def get_session(session_id: int, db: Session = Depends(get_db)):
    session = db.query(models.BugSession).filter(models.BugSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.delete("/{session_id}")
def delete_session(session_id: int, db: Session = Depends(get_db)):
    session = db.query(models.BugSession).filter(models.BugSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    db.delete(session)
    db.commit()
    return {"detail": "Session deleted"}