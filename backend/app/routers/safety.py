from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.database import get_session
from app.models.safety_flag import SafetyFlagRow

router = APIRouter()


@router.get("/flags")
def list_flags(session: Session = Depends(get_session)):
    flags = session.exec(select(SafetyFlagRow).order_by(SafetyFlagRow.created_at.desc())).all()
    if flags:
        return flags
    # Seed with representative demo data on first run so the UI is never empty.
    seed = [
        SafetyFlagRow(
            severity="Critical",
            title="Pressure anomaly exceeds ESD threshold",
            source="Incident_Report_2291_scan.pdf",
            description="Reported reading of 148 bar against a rated ESD trip of 140 bar.",
            status="Open",
        ),
        SafetyFlagRow(
            severity="High",
            title="Missing dual sign-off on manual override",
            source="Digital Permit-to-Work Log",
            description="Stage 1 override on Unit 3 recorded with a single approver.",
            status="Under Review",
        ),
    ]
    for s in seed:
        session.add(s)
    session.commit()
    return session.exec(select(SafetyFlagRow)).all()


@router.patch("/flags/{flag_id}")
def update_flag_status(flag_id: int, status: str, session: Session = Depends(get_session)):
    flag = session.get(SafetyFlagRow, flag_id)
    if not flag:
        return {"error": "not found"}
    flag.status = status
    session.add(flag)
    session.commit()
    session.refresh(flag)
    return flag
