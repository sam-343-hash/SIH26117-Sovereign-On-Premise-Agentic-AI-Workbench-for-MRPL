from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.services.rag_service import query_rag
from app.services.llm_service import stream_chat_completion

router = APIRouter(prefix="/api/chat", tags=["Chat"])

class ChatRequest(BaseModel):
    message: str

@router.post("/message")
async def send_chat_message(req: ChatRequest):
    retrieved_chunks = await query_rag(req.message, n_results=3)
    return StreamingResponse(
        stream_chat_completion(req.message, retrieved_chunks),
        media_type="text/event-stream"
    )
