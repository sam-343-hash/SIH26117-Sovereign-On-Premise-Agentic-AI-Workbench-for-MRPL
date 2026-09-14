from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.services.rag_service import query_rag
from app.services.llm_service import stream_chat_completion

router = APIRouter(tags=["Chat"])

class ChatRequest(BaseModel):
    message: str

@router.post("/message")
async def send_chat_message(req: ChatRequest):
    if not req.message.strip():
        raise HTTPException(status_code=422, detail="Message cannot be empty.")
    try:
        retrieved_chunks = await query_rag(req.message, n_results=3)
    except (RuntimeError, ValueError) as exc:
        raise HTTPException(status_code=503, detail=f"RAG is unavailable: {exc}") from exc
    return StreamingResponse(
        stream_chat_completion(req.message, retrieved_chunks),
        media_type="text/event-stream"
    )
