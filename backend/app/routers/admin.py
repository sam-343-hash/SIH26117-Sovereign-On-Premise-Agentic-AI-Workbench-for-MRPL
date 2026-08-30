from fastapi import APIRouter
import httpx
import os

router = APIRouter(prefix="/api/admin", tags=["Admin"])
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

@router.get("/status")
async def get_system_status():
    ollama_online = False
    models = []
    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            resp = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            if resp.status_code == 200:
                ollama_online = True
                models = resp.json().get("models", [])
    except Exception:
        ollama_online = False

    return {
        "engine_state": "HEALTHY",
        "database": "SQLite WAL Active",
        "vector_store": "ChromaDB Persistent (HNSW Cosine)",
        "ollama_connectivity": ollama_online,
        "loaded_models": [m.get("name") for m in models]
    }
