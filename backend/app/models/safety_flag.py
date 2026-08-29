from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field


class SafetyFlagRow(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    severity: str  # Critical | High | Medium | Low
    title: str
    source: str
    description: str
    status: str = "Open"  # Open | Under Review | Resolved
    created_at: datetime = Field(default_factory=datetime.utcnow)
