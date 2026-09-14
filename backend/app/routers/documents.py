import shutil
from pathlib import Path
from fastapi import APIRouter, BackgroundTasks, HTTPException, UploadFile, status, Depends
from sqlmodel import Session, select
from app.database import get_session
from app.models.document import Document
from app.services.rag_service import process_document_pipeline

router = APIRouter(tags=["Documents"])
UPLOAD_DIR = Path("./uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
MAX_FILE_SIZE = 15 * 1024 * 1024

@router.post("/upload", status_code=status.HTTP_202_ACCEPTED)
async def upload_document(
    file: UploadFile,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session)
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="A file name is required.")
    safe_filename = Path(file.filename).name
    if not safe_filename.lower().endswith((".pdf", ".docx", ".txt")):
        raise HTTPException(status_code=400, detail="Unsupported format. Upload a PDF, DOCX, or TXT file.")

    file_path = UPLOAD_DIR / safe_filename
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except OSError as exc:
        raise HTTPException(status_code=500, detail="Could not save the uploaded file.") from exc

    if file_path.stat().st_size > MAX_FILE_SIZE:
        file_path.unlink()
        raise HTTPException(status_code=400, detail="File exceeds 15MB.")

    doc = Document(
        filename=safe_filename,
        file_path=str(file_path),
        file_size_bytes=file_path.stat().st_size,
        status="Processing"
    )
    session.add(doc)
    session.commit()
    session.refresh(doc)

    background_tasks.add_task(process_document_pipeline, doc.id, str(file_path))
    return {"message": "Processing", "document_id": doc.id, "status": "Processing"}

@router.get("")
def list_documents(session: Session = Depends(get_session)):
    return session.exec(select(Document).order_by(Document.created_at.desc())).all()
