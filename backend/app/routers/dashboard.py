from collections import Counter
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.database import get_session
from app.models.document import Document
from app.models.graph import GraphEdge, GraphNode
from app.models.safety import SafetyFlagRow

router = APIRouter(tags=["Dashboard"])

@router.get("/summary")
def get_dashboard_summary(session: Session = Depends(get_session)):
    """Live local summary for the dashboard; no external service is used."""
    documents = list(session.exec(select(Document).order_by(Document.created_at.desc())).all())
    flags = list(session.exec(select(SafetyFlagRow).order_by(SafetyFlagRow.created_at.desc())).all())
    today = datetime.utcnow().date()
    uploads_by_day = Counter(document.created_at.date() for document in documents)
    trend = [{"day": (today - timedelta(days=offset)).strftime("%a"), "documents": uploads_by_day[today - timedelta(days=offset)]} for offset in range(6, -1, -1)]
    severity_counts = Counter(flag.severity.upper() for flag in flags)
    critical, high = severity_counts["CRITICAL"], severity_counts["HIGH"]
    activity = [{"id": f"document-{doc.id}", "actor": "Document Intake", "action": "indexed" if doc.status == "Indexed" else doc.status.lower(), "target": doc.filename, "time": doc.created_at.isoformat()} for doc in documents[:5]]
    activity.extend({"id": f"flag-{flag.id}", "actor": "Safety Agent", "action": "flagged", "target": f"{flag.rule_id}: {flag.observed_value}", "time": flag.created_at.isoformat()} for flag in flags[:5])
    return {
        "documents_total": len(documents), "documents_indexed": sum(doc.status == "Indexed" for doc in documents),
        "documents_processing": sum(doc.status == "Processing" for doc in documents), "safety_flags_total": len(flags),
        "critical_flags": critical, "graph_nodes": len(list(session.exec(select(GraphNode)).all())),
        "graph_edges": len(list(session.exec(select(GraphEdge)).all())), "trend": trend,
        "risk_split": [{"name": "Critical", "value": critical, "color": "#e5484d"}, {"name": "High", "value": high, "color": "#f5b942"}, {"name": "Other", "value": max(0, len(flags) - critical - high), "color": "#3fd8c4"}],
        "activity": sorted(activity, key=lambda item: item["time"], reverse=True)[:6],
    }
