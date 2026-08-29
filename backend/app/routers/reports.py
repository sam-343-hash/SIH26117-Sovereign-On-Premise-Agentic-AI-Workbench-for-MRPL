from pydantic import BaseModel
from fastapi import APIRouter

router = APIRouter()


class ReportRequest(BaseModel):
    template_id: str
    date_range: str = "Last 7 days"
    format: str = "PDF"


@router.post("/generate")
def generate_report(req: ReportRequest):
    # Phase 7 hook: pull relevant safety flags + rag hits for the date
    # range, prompt Qwen3 to draft the report body, then render to the
    # requested format (markdown -> PDF via the pdf skill / weasyprint).
    return {
        "template_id": req.template_id,
        "status": "ready",
        "pages": 4,
        "download_url": f"/api/reports/download/{req.template_id}.{req.format.lower()}",
    }
