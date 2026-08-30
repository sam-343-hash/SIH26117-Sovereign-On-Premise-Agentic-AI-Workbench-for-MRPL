from typing import Optional
from sqlmodel import SQLModel, Field

class GraphNode(SQLModel, table=True):
    __tablename__ = "graph_nodes"

    id: str = Field(primary_key=True)
    label: str
    category: str = Field(index=True)
    document_id: int = Field(foreign_key="documents.id", index=True)

class GraphEdge(SQLModel, table=True):
    __tablename__ = "graph_edges"

    id: Optional[int] = Field(default=None, primary_key=True)
    source: str = Field(foreign_key="graph_nodes.id", index=True)
    target: str = Field(foreign_key="graph_nodes.id", index=True)
    relation: str
    document_id: int = Field(foreign_key="documents.id", index=True)
