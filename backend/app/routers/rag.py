from fastapi import APIRouter, Query
from app.services.rag_service import search

router = APIRouter()


@router.get("/search")
def rag_search(q: str = Query(..., min_length=1)):
    return search(q)
