"""
RefinaAI backend — FastAPI entrypoint.

Phase 2 goal: real HTTP contract that the Next.js frontend can call,
backed by SQLite, matching the shapes already used by the mock data in
lib/mock-data.ts. Phase 3+ swaps the stub logic in services/ for real
Ollama + ChromaDB + LangChain calls without changing these routes.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.routers import chat, documents, rag, safety, reports, admin

app = FastAPI(title="RefinaAI API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "refinaai-backend"}


app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])
app.include_router(rag.router, prefix="/api/rag", tags=["rag"])
app.include_router(safety.router, prefix="/api/safety", tags=["safety"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
