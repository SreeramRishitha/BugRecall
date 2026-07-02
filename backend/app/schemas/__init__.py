from pydantic import BaseModel
from datetime import datetime
from typing import Optional


# ---- BugSession ----
class BugSessionCreate(BaseModel):
    title: str
    project: str
    description: Optional[str] = None


class BugSessionOut(BaseModel):
    id: int
    title: str
    project: str
    description: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# ---- Evidence ----
class EvidenceCreate(BaseModel):
    session_id: int
    type: str
    content: str


class EvidenceOut(BaseModel):
    id: int
    session_id: int
    type: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


# ---- Hypothesis ----
class HypothesisCreate(BaseModel):
    session_id: int
    title: str


class HypothesisUpdate(BaseModel):
    status: str
    reason: Optional[str] = None


class HypothesisOut(BaseModel):
    id: int
    session_id: int
    title: str
    status: str
    reason: Optional[str]

    class Config:
        from_attributes = True