from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from app.services.rag_service import query_rag

router = APIRouter(prefix="/api/rag", tags=["RAG"])

class SearchRequest(BaseModel):
    query: str
    limit: int = 4

@router.post("/search")
async def execute_rag_search(req: SearchRequest):
    if not req.query.strip():
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Search query cannot be empty.")
    try:
        results = await query_rag(req.query, n_results=req.limit)
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    return {"query": req.query, "matches": results}
