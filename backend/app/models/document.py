from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field


class Document(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    doc_type: str  # "PDF" | "DOCX" | "Scan"
    pages: int = 0
    size_label: str = "—"
    status: str = "Queued"  # Queued | Processing | Indexed | Failed
    file_path: str
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
