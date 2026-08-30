from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

class Document(SQLModel, table=True):
    __tablename__ = "documents"

    id: Optional[int] = Field(default=None, primary_key=True)
    filename: str = Field(index=True)
    file_path: str
    file_size_bytes: int
    total_pages: int = Field(default=1)
    chunk_count: int = Field(default=0)
    status: str = Field(default="Processing")
    created_at: datetime = Field(default_factory=datetime.utcnow)
