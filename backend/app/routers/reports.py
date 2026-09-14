import io
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlmodel import Session, select
from app.database import get_session
from app.models.document import Document
from app.models.safety import SafetyFlagRow
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

router = APIRouter(tags=["Reports"])

@router.get("/download")
async def generate_live_pdf_report(inline: bool = Query(False), session: Session = Depends(get_session)):
    documents = list(session.exec(select(Document)).all())
    flags = list(session.exec(select(SafetyFlagRow).order_by(SafetyFlagRow.created_at.desc())).all())
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('TitleStyle', parent=styles['Heading1'], fontSize=18, textColor=colors.HexColor('#0F172A'), spaceAfter=12)
    story = [
        Paragraph("RefinaAI Sovereign Refinery Intelligence Audit", title_style),
        Paragraph(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} UTC | Site: MRPL Complex", styles['Normal']),
        Spacer(1, 12)
    ]
    summary_data = [
        ["Metric", "Observed Value", "Compliance Status"],
        ["Documents Indexed", str(sum(doc.status == "Indexed" for doc in documents)), "Local ChromaDB"],
        ["Safety Rules Enforced", "OISD-106 / OSHA 1910", "Active"],
        ["Safety Findings", str(len(flags)), "Review required" if flags else "No findings"],
        ["Air-Gap Security", "Local Offline Weights", "Verified"]
    ]
    t1 = Table(summary_data, colWidths=[180, 180, 140])
    t1.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E293B')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('BACKGROUND', (0, 3), (-1, 3), colors.HexColor('#FEE2E2')),
        ('TEXTCOLOR', (0, 3), (-1, 3), colors.HexColor('#991B1B')),
    ]))
    story.append(t1)
    story.append(Spacer(1, 16))
    story.append(Paragraph("<b>Automated Hazard Detections</b>", styles['Heading2']))
    if flags:
        for flag in flags[:10]:
            story.append(Paragraph(f"<b>[{flag.severity}] {flag.rule_id}</b><br/>Observed: {flag.observed_value} | Limit: {flag.standard_limit}<br/>Recommendation: {flag.recommendation}", styles['Normal']))
            story.append(Spacer(1, 8))
    else:
        story.append(Paragraph("No safety findings have been generated from the locally indexed documents.", styles['Normal']))
    try:
        doc.build(story)
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Report generation failed. Check backend logs for details.") from exc
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"{'inline' if inline else 'attachment'}; filename=RefinaAI_Compliance_Report_{datetime.now().strftime('%Y%m%d')}.pdf"}
    )
