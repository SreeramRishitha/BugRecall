from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class BugSession(Base):
    __tablename__ = "bug_sessions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    project = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, default="OPEN")  # OPEN / CLOSED
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    evidence = relationship("Evidence", back_populates="session", cascade="all, delete-orphan")
    hypotheses = relationship("Hypothesis", back_populates="session", cascade="all, delete-orphan")


class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("bug_sessions.id"), nullable=False)
    type = Column(String, nullable=False)  # LOG / CODE / NOTE
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    session = relationship("BugSession", back_populates="evidence")


class Hypothesis(Base):
    __tablename__ = "hypotheses"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("bug_sessions.id"), nullable=False)
    title = Column(String, nullable=False)
    status = Column(String, default="UNTESTED")  # UNTESTED / TESTED / CONFIRMED / RULED_OUT
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    session = relationship("BugSession", back_populates="hypotheses")