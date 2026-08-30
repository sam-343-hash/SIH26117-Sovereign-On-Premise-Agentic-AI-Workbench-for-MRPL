import os
import chromadb
import pypdf
import docx
import httpx
from sqlmodel import Session
from app.database import engine
from app.models.document import Document
from app.services.safety_service import evaluate_safety_rules
from app.services.graph_service import extract_knowledge_graph

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
EMBED_MODEL = os.getenv("EMBED_MODEL", "nomic-embed-text")
CHROMA_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")

chroma_client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)
collection = chroma_client.get_or_create_collection(
    name="refinery_docs",
    metadata={"hnsw:space": "cosine"}
)

async def get_embeddings(texts: list[str]) -> list[list[float]]:
    embeddings = []
    async with httpx.AsyncClient(timeout=30.0) as client:
        for text in texts:
            resp = await client.post(
                f"{OLLAMA_BASE_URL}/api/embeddings",
                json={"model": EMBED_MODEL, "prompt": text}
            )
            embeddings.append(resp.json()["embedding"])
    return embeddings

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 100) -> list[str]:
    words = text.split()
    chunks = []
    for i in range(0, len(words), chunk_size - overlap):
        chunk = " ".join(words[i:i + chunk_size])
        if chunk:
            chunks.append(chunk)
    return chunks

async def process_document_pipeline(document_id: int, file_path: str):
    try:
        extracted_pages = []
        if file_path.endswith(".pdf"):
            reader = pypdf.PdfReader(file_path)
            for idx, page in enumerate(reader.pages, start=1):
                extracted_pages.append((idx, page.extract_text() or ""))
        elif file_path.endswith(".docx"):
            doc = docx.Document(file_path)
            full_text = "\n".join([p.text for p in doc.paragraphs])
            extracted_pages.append((1, full_text))
        else:
            with open(file_path, "r", encoding="utf-8") as f:
                extracted_pages.append((1, f.read()))

        all_chunks = []
        metadatas = []
        ids = []

        with Session(engine) as session:
            doc_record = session.get(Document, document_id)
            filename = doc_record.filename if doc_record else "unknown"

        for page_num, page_text in extracted_pages:
            chunks = chunk_text(page_text)
            for c_idx, chunk in enumerate(chunks):
                chunk_id = f"doc_{document_id}_p{page_num}_c{c_idx}"
                all_chunks.append(chunk)
                ids.append(chunk_id)
                metadatas.append({
                    "document_id": document_id,
                    "filename": filename,
                    "page": page_num,
                    "text": chunk
                })

        if all_chunks:
            vectors = await get_embeddings(all_chunks)
            collection.add(
                ids=ids,
                embeddings=vectors,
                metadatas=metadatas,
                documents=all_chunks
            )

        await evaluate_safety_rules(document_id, metadatas)
        await extract_knowledge_graph(document_id, all_chunks)

        with Session(engine) as session:
            doc_record = session.get(Document, document_id)
            if doc_record:
                doc_record.status = "Indexed"
                doc_record.total_pages = len(extracted_pages)
                doc_record.chunk_count = len(all_chunks)
                session.add(doc_record)
                session.commit()

    except Exception as e:
        with Session(engine) as session:
            doc_record = session.get(Document, document_id)
            if doc_record:
                doc_record.status = "Failed"
                session.add(doc_record)
                session.commit()
        print(f"[INGESTION ERROR] Doc {document_id}: {e}")

async def query_rag(query: str, n_results: int = 4) -> list[dict]:
    query_vec = (await get_embeddings([query]))[0]
    results = collection.query(query_embeddings=[query_vec], n_results=n_results)
    hits = []
    if results and results.get("metadatas"):
        for meta in results["metadatas"][0]:
            hits.append(meta)
    return hits
