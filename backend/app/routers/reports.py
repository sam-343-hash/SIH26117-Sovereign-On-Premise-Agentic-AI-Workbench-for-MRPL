import io
from datetime import datetime
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from fastapi.responses import FileResponse
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas
from sqlmodel import Session, select
from app.database import get_session
from app.models.document import Document
from app.models.safety import SafetyFlagRow

router = APIRouter(tags=["Reports"])
PROJECT_ROOT = Path(__file__).resolve().parents[3]
REPORT_OUTPUT_DIR = PROJECT_ROOT / "runtime" / "reports"

def draw_wrapped(pdf, text, x, y, width, size=10):
    words = text.encode("ascii", "replace").decode("ascii").split()
    line = ""
    for word in words:
        candidate = f"{line} {word}".strip()
        if line and stringWidth(candidate, "Helvetica", size) > width:
            pdf.drawString(x, y, line); y -= size + 4; line = word
        else: line = candidate
    if line: pdf.drawString(x, y, line); y -= size + 4
    return y

@router.get("/download")
async def generate_live_pdf_report(inline: bool = Query(False), session: Session = Depends(get_session)):
    documents = list(session.exec(select(Document)).all())
    flags = list(session.exec(select(SafetyFlagRow).order_by(SafetyFlagRow.created_at.desc())).all())
    buffer = io.BytesIO(); pdf = canvas.Canvas(buffer, pagesize=A4, pageCompression=1)
    width, height = A4; y = height - 48
    pdf.setFillColorRGB(.06,.12,.20); pdf.setFont("Helvetica-Bold", 18); pdf.drawString(42, y, "RefinaAI Local Compliance Report")
    y -= 24; pdf.setFillColorRGB(.2,.2,.2); pdf.setFont("Helvetica", 9); pdf.drawString(42, y, f"Generated locally: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    y -= 30; pdf.setFillColorRGB(.06,.12,.20); pdf.setFont("Helvetica-Bold", 11); pdf.drawString(42, y, "Live Local Summary"); y -= 18
    summary = [("Documents indexed", str(sum(doc.status == "Indexed" for doc in documents))), ("Safety findings", str(len(flags))), ("Local AI", "Ollama + ChromaDB"), ("Mode", "Local/offline after setup")]
    for label, value in summary:
        pdf.setFillColorRGB(.12,.15,.2); pdf.rect(42, y - 4, width - 84, 18, fill=1, stroke=0)
        pdf.setFillColorRGB(1,1,1); pdf.setFont("Helvetica-Bold", 9); pdf.drawString(50, y + 2, label); pdf.setFont("Helvetica", 9); pdf.drawRightString(width - 50, y + 2, value); y -= 23
    y -= 8; pdf.setFillColorRGB(.06,.12,.20); pdf.setFont("Helvetica-Bold", 11); pdf.drawString(42, y, "Safety Findings"); y -= 18
    if not flags:
        pdf.setFillColorRGB(.2,.2,.2); pdf.setFont("Helvetica", 10); pdf.drawString(42, y, "No safety findings have been generated from locally indexed documents.")
    for flag in flags[:8]:
        if y < 100: pdf.showPage(); y = height - 48
        pdf.setFillColorRGB(.55,.05,.05); pdf.setFont("Helvetica-Bold", 10); pdf.drawString(42, y, f"[{flag.severity}] {flag.rule_id}"); y -= 15
        pdf.setFillColorRGB(.15,.15,.15); pdf.setFont("Helvetica", 9)
        y = draw_wrapped(pdf, f"Observed: {flag.observed_value} | Limit: {flag.standard_limit}", 42, y, int(width - 84), 9)
        y = draw_wrapped(pdf, f"Recommendation: {flag.recommendation}", 42, y, int(width - 84), 9); y -= 10
    pdf.setFont("Helvetica", 8); pdf.setFillColorRGB(.35,.35,.35); pdf.drawString(42, 28, "Demo report: verify safety-critical guidance against approved site procedures.")
    pdf.save(); data = buffer.getvalue(); buffer.close()
    if not data.startswith(b"%PDF"): raise HTTPException(status_code=500, detail="Report generation produced an invalid PDF.")
    REPORT_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    report_path = REPORT_OUTPUT_DIR / f"RefinaAI_Compliance_Report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    report_path.write_bytes(data)
    disposition = "inline" if inline else "attachment"
    return FileResponse(
        report_path,
        media_type="application/pdf",
        filename=report_path.name,
        content_disposition_type=disposition,
        headers={"Cache-Control": "no-store"},
    )
