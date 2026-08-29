"""
Phase 2: keyword-overlap stub over an in-memory corpus so /api/rag/search
returns something real to render.

Phase 4: replace with ChromaDB similarity search, e.g.

    import chromadb
    from chromadb.utils import embedding_functions

    client = chromadb.PersistentClient(path="./chroma_db")
    embed_fn = embedding_functions.OllamaEmbeddingFunction(
        url="http://localhost:11434/api/embeddings", model_name="nomic-embed-text"
    )
    collection = client.get_or_create_collection("refinaai_docs", embedding_function=embed_fn)

    def search(query: str, k: int = 5):
        results = collection.query(query_texts=[query], n_results=k)
        return [
            {"doc": m["source"], "page": m["page"], "snippet": d, "score": 1 - dist}
            for d, m, dist in zip(
                results["documents"][0], results["metadatas"][0], results["distances"][0]
            )
        ]
"""

_MOCK_CORPUS = [
    {
        "doc": "Unit3_ESD_Procedure.pdf",
        "page": 4,
        "snippet": "Upon detection of over-pressure, the primary interlock isolates feed valves FV-101/102 within 2 seconds, followed by controlled depressurization to the flare header.",
    },
    {
        "doc": "Refinery_Safety_Manual_v4.pdf",
        "page": 118,
        "snippet": "Dual sign-off is mandatory for any manual override of ESD stage 1 or stage 3, logged via the digital permit-to-work system.",
    },
    {
        "doc": "Pipeline_Corrosion_Study.pdf",
        "page": 33,
        "snippet": "Localized pitting corrosion observed near weld joints correlates with H2S concentration above 40 ppm over sustained exposure windows.",
    },
]


def search(query: str, k: int = 5):
    query_terms = set(query.lower().split())
    scored = []
    for entry in _MOCK_CORPUS:
        overlap = len(query_terms & set(entry["snippet"].lower().split()))
        score = min(0.99, 0.55 + overlap * 0.08)
        scored.append({**entry, "score": round(score, 2)})
    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:k]
