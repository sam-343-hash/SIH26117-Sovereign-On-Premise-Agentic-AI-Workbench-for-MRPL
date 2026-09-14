from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_admin_telemetry_endpoint():
    response = client.get("/api/admin/status")
    assert response.status_code in [200, 401, 403]

def test_rag_vector_query():
    response = client.post("/api/rag/search", json={"query": "column pressure limit", "limit": 2})
    assert response.status_code == 200
    data = response.json()
    assert "matches" in data or isinstance(data, list)

def test_live_pdf_generation_content_type():
    response = client.get("/api/reports/download")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert response.content.startswith(b"%PDF")
