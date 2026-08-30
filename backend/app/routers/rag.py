from fastapi import APIRouter
from pydantic import BaseModel
from app.services.rag_service import query_rag

router = APIRouter(prefix="/api/rag", tags=["RAG"])

class SearchRequest(BaseModel):
    query: str
    limit: int = 4

@router.post("/search")
async def execute_rag_search(req: SearchRequest):
    results = await query_rag(req.query, n_results=req.limit)
    return {"query": req.query, "matches": results}
