import hashlib
import math
import os
from typing import Any

import chromadb
import ollama

CHROMA_PATH = os.getenv("CHROMA_PATH", "./chroma_db")
CHROMA_COLLECTION = os.getenv("CHROMA_COLLECTION", "refinaai_docs")
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_EMBED_MODEL = os.getenv("OLLAMA_EMBED_MODEL", "nomic-embed-text")
FALLBACK_DIMENSIONS = 384

_client = chromadb.PersistentClient(path=CHROMA_PATH)
_collection = _client.get_or_create_collection(CHROMA_COLLECTION)


def _fallback_embedding(text: str) -> list[float]:
    values = [0.0] * FALLBACK_DIMENSIONS
    tokens = text.lower().split()
    for token in tokens:
        digest = hashlib.sha256(token.encode("utf-8")).digest()
        index = int.from_bytes(digest[:4], "big") % FALLBACK_DIMENSIONS
        sign = 1.0 if digest[4] % 2 == 0 else -1.0
        values[index] += sign

    norm = math.sqrt(sum(value * value for value in values)) or 1.0
    return [value / norm for value in values]


def embed_text(text: str) -> tuple[list[float], str]:
    client = ollama.Client(host=OLLAMA_HOST)
    try:
        response = client.embeddings(model=OLLAMA_EMBED_MODEL, prompt=text)
        return response["embedding"], OLLAMA_EMBED_MODEL
    except Exception:
        return _fallback_embedding(text), "local-hash-fallback"


def index_chunks(document_id: int, document_name: str, chunks: list[dict[str, Any]]) -> int:
    if not chunks:
        return 0

    ids = []
    documents = []
    embeddings = []
    metadatas = []

    for chunk in chunks:
        text = chunk["text"].strip()
        if not text:
            continue

        embedding, provider = embed_text(text)
        chunk_index = chunk["chunk_index"]
        ids.append(f"doc-{document_id}-chunk-{chunk_index}")
        documents.append(text)
        embeddings.append(embedding)
        metadatas.append(
            {
                "document_id": document_id,
                "source": document_name,
                "page": chunk.get("page") or 1,
                "chunk_index": chunk_index,
                "embedding_provider": provider,
            }
        )

    if not ids:
        return 0

    _collection.upsert(ids=ids, documents=documents, embeddings=embeddings, metadatas=metadatas)
    return len(ids)


def search(query: str, k: int = 5):
    embedding, _provider = embed_text(query)
    try:
        results = _collection.query(query_embeddings=[embedding], n_results=k)
    except Exception:
        if len(embedding) == FALLBACK_DIMENSIONS:
            return []
        results = _collection.query(query_embeddings=[_fallback_embedding(query)], n_results=k)

    documents = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]
    distances = results.get("distances", [[]])[0]
    ids = results.get("ids", [[]])[0]

    matches = []
    for result_id, document, metadata, distance in zip(ids, documents, metadatas, distances):
        score = 1.0 / (1.0 + max(0.0, float(distance)))
        matches.append(
            {
                "id": result_id,
                "doc": metadata.get("source", "Unknown document"),
                "page": metadata.get("page", 1),
                "snippet": document,
                "score": round(score, 3),
            }
        )

    return matches
