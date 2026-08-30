from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

class SafetyFlagRow(SQLModel, table=True):
    __tablename__ = "safety_flags"

    id: Optional[int] = Field(default=None, primary_key=True)
    document_id: int = Field(foreign_key="documents.id", index=True)
    rule_id: str = Field(index=True)
    parameter: str
    observed_value: str
    standard_limit: str
    severity: str = Field(index=True)
    recommendation: str
    chunk_text: str
    page_number: int = Field(default=1)
    created_at: datetime = Field(default_factory=datetime.utcnow)
