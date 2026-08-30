import os
import json
import httpx
from pydantic import BaseModel, Field
from sqlmodel import Session
from app.database import engine
from app.models.safety import SafetyFlagRow

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
SAFETY_MODEL = os.getenv("CHAT_MODEL", "qwen2.5:7b-instruct-q4_K_M")

class SafetyReportItem(BaseModel):
    has_violation: bool
    rule_id: str = Field(description="Rule code")
    parameter: str = Field(description="Parameter checked")
    observed_value: str = Field(description="Observed value")
    standard_limit: str = Field(description="Standard limit")
    severity: str = Field(description="Severity")
    recommendation: str = Field(description="Recommendation")

SAFETY_PROMPT = """Analyze this refinery operational context against industrial safety protocols:
MANDATORY REFINERY RULES:
1. [OISD-106]: Maximum Operating Pressure on Crude Distillation Units must not exceed 3.5 bar.
2. [OSHA-1910]: Confined space entries require dual sign-off from Plant Manager and Safety Officer.
3. [API-RP-55]: H2S concentration exceeding 10 ppm mandates immediate evacuation and SCBA deployment.
4. [ASME-B31]: Hydrocarbon flare lines require quarterly thickness inspections (min wall 4.5mm).

Return ONLY valid JSON:
{{
  "has_violation": true/false,
  "rule_id": "string",
  "parameter": "string",
  "observed_value": "string",
  "standard_limit": "string",
  "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "NONE",
  "recommendation": "string"
}}

<document_context>
{context}
</document_context>
"""

async def evaluate_safety_rules(document_id: int, chunks: list[dict]):
    async with httpx.AsyncClient(timeout=45.0) as client:
        for chunk in chunks[:10]:
            rendered = SAFETY_PROMPT.format(context=chunk["text"])
            try:
                resp = await client.post(
                    f"{OLLAMA_BASE_URL}/api/generate",
                    json={
                        "model": SAFETY_MODEL,
                        "prompt": rendered,
                        "format": "json",
                        "stream": False,
                        "options": {"temperature": 0.0}
                    }
                )
                data = json.loads(resp.json()["response"])
                parsed = SafetyReportItem(**data)
                if parsed.has_violation and parsed.severity != "NONE":
                    with Session(engine) as session:
                        flag = SafetyFlagRow(
                            document_id=document_id,
                            rule_id=parsed.rule_id,
                            parameter=parsed.parameter,
                            observed_value=parsed.observed_value,
                            standard_limit=parsed.standard_limit,
                            severity=parsed.severity,
                            recommendation=parsed.recommendation,
                            chunk_text=chunk["text"][:300],
                            page_number=chunk["page"]
                        )
                        session.add(flag)
                        session.commit()
            except Exception as parse_err:
                print(f"[SAFETY AUDIT SKIP/PARSE]: {parse_err}")
