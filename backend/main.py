from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from app.routers import chat, documents, rag, safety, graph, reports, admin

app = FastAPI(
    title="RefinaAI Industrial Platform Engine",
    description="Operational RAG, Safety Agent, and Knowledge Graph Engine for Smart India Hackathon 2026",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

app.include_router(chat.router)
app.include_router(documents.router)
app.include_router(rag.router)
app.include_router(safety.router)
app.include_router(graph.router)
app.include_router(reports.router)
app.include_router(admin.router)

@app.get("/health")
def health():
    return {"status": "ONLINE", "tier": "ENTERPRISE_EDGE"}
