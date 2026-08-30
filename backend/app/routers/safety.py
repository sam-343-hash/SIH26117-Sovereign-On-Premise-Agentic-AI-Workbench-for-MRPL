from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.database import get_session
from app.models.safety import SafetyFlagRow

router = APIRouter(prefix="/api/safety", tags=["Safety"])

@router.get("/flags")
def get_safety_flags(session: Session = Depends(get_session)):
    return session.exec(select(SafetyFlagRow).order_by(SafetyFlagRow.created_at.desc())).all()
