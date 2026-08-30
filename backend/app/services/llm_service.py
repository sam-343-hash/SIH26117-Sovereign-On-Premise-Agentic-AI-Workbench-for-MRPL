import os
import json
import httpx
from typing import AsyncGenerator

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
CHAT_MODEL = os.getenv("CHAT_MODEL", "qwen2.5:7b-instruct-q4_K_M")

async def stream_chat_completion(prompt: str, context_chunks: list[dict]) -> AsyncGenerator[str, None]:
    system_instruction = (
        "You are RefinaAI, an industrial intelligence assistant for refinery operations.\n"
        "Use ONLY the operational context provided below. If unsure, state that plant records "
        "do not contain the answer. Always cite sources precisely.\n\n"
        "CONTEXT CHUNKS:\n"
    )
    for idx, c in enumerate(context_chunks, start=1):
        system_instruction += f"[{idx}] (Doc: {c.get('filename')}, Page {c.get('page', 1)}): {c.get('text')}\n\n"

    payload = {
        "model": CHAT_MODEL,
        "messages": [
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": prompt}
        ],
        "stream": True,
        "options": {"temperature": 0.1, "top_p": 0.9},
        "keep_alive": -1
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        async with client.stream("POST", f"{OLLAMA_BASE_URL}/api/chat", json=payload) as response:
            if response.status_code != 200:
                yield f"data: {json.dumps({'error': f'LLM Gateway Error: {response.status_code}'})}\n\n"
                return
            async for line in response.aiter_lines():
                if line:
                    chunk = json.loads(line)
                    content = chunk.get("message", {}).get("content", "")
                    if content:
                        yield f"data: {json.dumps({'content': content})}\n\n"
                    if chunk.get("done", False):
                        yield f"data: {json.dumps({'done': True})}\n\n"
