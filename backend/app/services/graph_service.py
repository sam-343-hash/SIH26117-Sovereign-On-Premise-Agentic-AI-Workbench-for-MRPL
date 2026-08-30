import os
import json
import httpx
from sqlmodel import Session
from app.database import engine
from app.models.graph import GraphNode, GraphEdge

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
GRAPH_MODEL = os.getenv("CHAT_MODEL", "qwen2.5:7b-instruct-q4_K_M")

GRAPH_PROMPT = """Extract up to 4 key entities and their operational relationships from this text.
Allowed Categories: "EQUIPMENT", "CHEMICAL", "SAFETY_RULE", "METRIC".

Return ONLY valid JSON matching this structure:
{{
  "nodes": [
    {{"id": "CDU_01", "label": "Crude Distillation Unit", "category": "EQUIPMENT"}}
  ],
  "edges": [
    {{"source": "CDU_01", "target": "CRUDE_OIL", "relation": "PROCESSES"}}
  ]
}}

<document_context>
{context}
</document_context>
"""

async def extract_knowledge_graph(document_id: int, chunks: list[str]):
    sample_text = "\n".join(chunks[:3])
    async with httpx.AsyncClient(timeout=45.0) as client:
        try:
            resp = await client.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": GRAPH_MODEL,
                    "prompt": GRAPH_PROMPT.format(context=sample_text),
                    "format": "json",
                    "stream": False,
                    "options": {"temperature": 0.0}
                }
            )
            data = json.loads(resp.json()["response"])
            with Session(engine) as session:
                for node in data.get("nodes", []):
                    db_node = GraphNode(
                        id=node["id"],
                        label=node["label"],
                        category=node.get("category", "EQUIPMENT"),
                        document_id=document_id
                    )
                    session.merge(db_node)
                session.commit()

                for edge in data.get("edges", []):
                    db_edge = GraphEdge(
                        source=edge["source"],
                        target=edge["target"],
                        relation=edge.get("relation", "RELATES_TO"),
                        document_id=document_id
                    )
                    session.add(db_edge)
                session.commit()
        except Exception as e:
            print(f"[GRAPH EXTRACTION ERROR]: {e}")
