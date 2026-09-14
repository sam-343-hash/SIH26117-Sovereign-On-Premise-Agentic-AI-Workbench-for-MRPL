from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.rag_service import query_rag

router = APIRouter(tags=["RAG"])

class SearchRequest(BaseModel):
    query: str
    limit: int = 4

@router.post("/search")
async def execute_rag_search(req: SearchRequest):
    try:
        results = await query_rag(req.query, n_results=req.limit)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=f"RAG is unavailable: {exc}") from exc
    return {"query": req.query, "matches": results}
