import os
import re
import shutil
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlmodel import Session, select
from starlette.concurrency import run_in_threadpool

from app.database import get_session
from app.models.document import Document
from app.services.document_indexer import index_document
from app.services.safety_agent import scan_document

router = APIRouter()

UPLOAD_DIR = "uploaded_docs"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def _type_from_filename(filename: str) -> str:
    ext = filename.lower().rsplit(".", 1)[-1]
    if ext == "pdf":
        return "PDF"
    if ext in ("docx", "doc"):
        return "DOCX"
    return "Scan"


def _safe_filename(filename: str) -> str:
    name = os.path.basename(filename)
    name = re.sub(r"[^A-Za-z0-9._-]+", "_", name).strip("._")
    return name or "uploaded_document"


@router.get("/")
def list_documents(session: Session = Depends(get_session)):
    docs = session.exec(select(Document).order_by(Document.uploaded_at.desc())).all()
    return docs


@router.post("/upload")
async def upload_document(file: UploadFile = File(...), session: Session = Depends(get_session)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Uploaded file must have a filename.")

    filename = _safe_filename(file.filename)
    dest_path = os.path.join(UPLOAD_DIR, filename)
    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    size_bytes = os.path.getsize(dest_path)
    size_label = f"{size_bytes / (1024 * 1024):.1f} MB"

    doc = Document(
        name=filename,
        doc_type=_type_from_filename(filename),
        pages=0,
        size_label=size_label,
        status="Processing",
        file_path=dest_path,
    )
    session.add(doc)
    session.commit()
    session.refresh(doc)

    try:
        pages, _indexed_count, chunks = await run_in_threadpool(index_document, doc)
        safety_flags = await run_in_threadpool(scan_document, doc, chunks)
        doc.pages = pages
        doc.status = "Indexed"
        for flag in safety_flags:
            session.add(flag)
    except Exception:
        doc.status = "Failed"

    session.add(doc)
    session.commit()
    session.refresh(doc)
    return doc
