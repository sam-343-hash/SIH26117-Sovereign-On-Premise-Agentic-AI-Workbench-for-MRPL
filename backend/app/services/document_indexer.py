from pathlib import Path

from docx import Document as DocxDocument
from pypdf import PdfReader

from app.models.document import Document
from app.services.rag_service import index_chunks

CHUNK_TOKENS = 500
CHUNK_OVERLAP = 100


def _extract_pdf(path: Path) -> tuple[list[dict], int]:
    reader = PdfReader(str(path))
    pages = []
    for page_number, page in enumerate(reader.pages, start=1):
        text = page.extract_text() or ""
        if text.strip():
            pages.append({"page": page_number, "text": text})
    return pages, len(reader.pages)


def _extract_docx(path: Path) -> tuple[list[dict], int]:
    document = DocxDocument(str(path))
    paragraphs = [paragraph.text.strip() for paragraph in document.paragraphs if paragraph.text.strip()]
    text = "\n".join(paragraphs)
    return ([{"page": 1, "text": text}] if text else []), 1


def extract_text(path: str, doc_type: str) -> tuple[list[dict], int]:
    file_path = Path(path)
    suffix = file_path.suffix.lower()

    if suffix == ".pdf" or doc_type == "PDF":
        return _extract_pdf(file_path)
    if suffix == ".docx" or doc_type == "DOCX":
        return _extract_docx(file_path)

    raise ValueError("Only text PDFs and DOCX files are supported in this MVP indexing path.")


def chunk_pages(pages: list[dict]) -> list[dict]:
    chunks = []
    chunk_index = 0

    for page in pages:
        words = page["text"].split()
        start = 0
        while start < len(words):
            end = min(start + CHUNK_TOKENS, len(words))
            chunk_words = words[start:end]
            if chunk_words:
                chunks.append(
                    {
                        "chunk_index": chunk_index,
                        "page": page["page"],
                        "text": " ".join(chunk_words),
                    }
                )
                chunk_index += 1

            if end == len(words):
                break
            start = max(end - CHUNK_OVERLAP, start + 1)

    return chunks


def index_document(document: Document) -> tuple[int, int, list[dict]]:
    pages, page_count = extract_text(document.file_path, document.doc_type)
    chunks = chunk_pages(pages)
    indexed_count = index_chunks(document.id, document.name, chunks)

    if indexed_count == 0:
        raise ValueError("No extractable text chunks were found.")

    return page_count, indexed_count, chunks
