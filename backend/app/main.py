from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routers import bug_session, evidence, hypothesis

Base.metadata.create_all(bind=engine)

app = FastAPI(title="BugRecall API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(bug_session.router)
app.include_router(evidence.router)
app.include_router(hypothesis.router)


@app.get("/")
def root():
    return {"status": "BugRecall API is running"}
