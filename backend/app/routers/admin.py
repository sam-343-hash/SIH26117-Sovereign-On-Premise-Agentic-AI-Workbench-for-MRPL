from fastapi import APIRouter

router = APIRouter()

_config = {
    "chatModel": "qwen3:14b",
    "visionModel": "qwen2.5-vl:7b",
    "embeddingModel": "nomic-embed-text",
    "vectorStore": "ChromaDB (local)",
    "graphStore": "Neo4j (disabled)",
    "temperature": 0.3,
}


@router.get("/config")
def get_config():
    return _config


@router.put("/config")
def update_config(new_config: dict):
    _config.update(new_config)
    return _config


@router.get("/health")
def system_health():
    import shutil

    return [
        {"name": "Ollama Runtime", "status": "Healthy" if shutil.which("ollama") else "Not found", "detail": _config["chatModel"]},
        {"name": "FastAPI Backend", "status": "Healthy", "detail": "v0.1.0"},
        {"name": "ChromaDB", "status": "Healthy", "detail": "local persistent client"},
        {"name": "Neo4j Graph", "status": "Disabled", "detail": "Enable in Phase 6"},
    ]
