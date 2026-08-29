import os
import re

import ollama

from app.services.rag_service import search

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_CHAT_MODEL = os.getenv("OLLAMA_CHAT_MODEL", "qwen3:14b")


def _strip_reasoning_trace(content: str) -> str:
    """Keep Qwen reasoning tokens out of the operator-facing answer."""
    return re.sub(r"<think>.*?</think>", "", content, flags=re.DOTALL).strip()


def _build_prompt(message: str, chunks: list[dict]) -> str:
    context_blocks = []
    for index, chunk in enumerate(chunks, start=1):
        doc = chunk.get("doc", "Unknown document")
        page = chunk.get("page")
        snippet = chunk.get("snippet") or chunk.get("text") or ""
        page_label = f", page {page}" if page else ""
        context_blocks.append(f"[{index}] Source: {doc}{page_label}\n{snippet}")

    context = "\n\n".join(context_blocks) or "No indexed refinery documents were retrieved."
    return f"""You are RefinaAI, a refinery operations assistant for refinery engineers and safety teams.
Answer the user's question using only the retrieved context below.

Rules:
- Be concise, operational, and safety-aware.
- Cite source document names and page numbers when context is available.
- If the answer is not supported by the context, say what is missing and suggest which document to upload.
- Do not invent procedures, thresholds, permits, or compliance claims.

Retrieved context:
{context}

User question:
{message}
"""


def generate_answer(message: str):
    chunks = search(message, k=4)
    citations = [
        {"label": chunk.get("doc", "Unknown document"), "page": chunk.get("page")}
        for chunk in chunks
        if chunk.get("doc")
    ]

    prompt = _build_prompt(message, chunks)
    client = ollama.Client(host=OLLAMA_HOST)

    try:
        response = client.chat(
            model=OLLAMA_CHAT_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You are RefinaAI. Ground every operational answer in provided refinery documents.",
                },
                {"role": "user", "content": prompt},
            ],
            options={"temperature": 0.2},
        )
        answer = _strip_reasoning_trace(response["message"]["content"])
    except Exception as exc:
        answer = (
            "I could not reach the local Ollama chat model yet. Start Ollama and make sure "
            f"`{OLLAMA_CHAT_MODEL}` is pulled, then retry this question. Backend detail: {exc}"
        )

    return answer, citations
