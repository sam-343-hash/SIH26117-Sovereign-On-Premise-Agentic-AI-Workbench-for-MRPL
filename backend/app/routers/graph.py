from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.database import get_session
from app.models.graph import GraphNode, GraphEdge

router = APIRouter(prefix="/api/graph", tags=["Knowledge Graph"])

@router.get("")
def get_graph(session: Session = Depends(get_session)):
    nodes = session.exec(select(GraphNode)).all()
    edges = session.exec(select(GraphEdge)).all()
    return {
        "nodes": [{"id": n.id, "label": n.label, "category": n.category} for n in nodes],
        "edges": [{"source": e.source, "target": e.target, "relation": e.relation} for e in edges]
    }
