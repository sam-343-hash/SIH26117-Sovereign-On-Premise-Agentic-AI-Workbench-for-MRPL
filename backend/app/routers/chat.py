from pydantic import BaseModel
from fastapi import APIRouter
from app.services.llm_service import generate_answer

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    thread_id: str | None = None


class Citation(BaseModel):
    label: str
    page: int | None = None


class ChatResponse(BaseModel):
    content: str
    citations: list[Citation] = []


@router.post("/message", response_model=ChatResponse)
def send_message(req: ChatRequest):
    # Phase 3 replaces generate_answer's stub body with a real call to
    # Ollama (Qwen3) using retrieved chunks from rag_service as context.
    answer, citations = generate_answer(req.message)
    return ChatResponse(content=answer, citations=citations)
