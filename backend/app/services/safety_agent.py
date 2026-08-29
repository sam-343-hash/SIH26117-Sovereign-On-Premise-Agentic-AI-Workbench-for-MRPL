import json
import os
import re
from typing import Any

import ollama
from langchain_core.prompts import PromptTemplate

from app.models.document import Document
from app.models.safety_flag import SafetyFlagRow

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_CHAT_MODEL = os.getenv("OLLAMA_CHAT_MODEL", "qwen3:14b")

SAFETY_RULES = [
    {
        "id": "pressure-threshold",
        "severity": "Critical",
        "title": "Pressure anomaly exceeds ESD threshold",
        "policy": "Flag any operating pressure above 140 bar or language indicating an ESD pressure trip was exceeded.",
    },
    {
        "id": "dual-signoff",
        "severity": "High",
        "title": "Missing dual sign-off on manual override",
        "policy": "Flag any manual ESD override, bypass, or permit action that has only one approver or no dual sign-off evidence.",
    },
    {
        "id": "ppe-sampling",
        "severity": "Medium",
        "title": "PPE requirement missing from sampling step",
        "policy": "Flag refinery sampling steps that do not mention face shield, gloves, and flame resistant PPE.",
    },
]

SAFETY_PROMPT = PromptTemplate.from_template(
    """You are RefinaAI Safety Agent.
Return strict JSON only with keys: violation (boolean), severity, title, description.

Rule:
{policy}

Document: {document_name}
Page: {page}
Chunk:
{chunk_text}
"""
)


def _fallback_rule_check(rule: dict[str, str], document: Document, chunk: dict[str, Any]) -> SafetyFlagRow | None:
    text = chunk["text"]
    lowered = text.lower()

    if rule["id"] == "pressure-threshold":
        pressure_values = [int(value) for value in re.findall(r"(\d+)\s*bar", lowered)]
        if any(value > 140 for value in pressure_values) or "above 140 bar" in lowered:
            return SafetyFlagRow(
                severity=rule["severity"],
                title=rule["title"],
                source=document.name,
                description=f"Page {chunk.get('page', 1)} references pressure above the 140 bar ESD threshold.",
            )

    if rule["id"] == "dual-signoff":
        override_terms = ("manual override", "bypass", "single approver", "one approver")
        if any(term in lowered for term in override_terms) and not any(
            term in lowered for term in ("dual sign-off", "dual signoff", "two approvers")
        ):
            return SafetyFlagRow(
                severity=rule["severity"],
                title=rule["title"],
                source=document.name,
                description=f"Page {chunk.get('page', 1)} mentions an override without clear dual sign-off evidence.",
            )

    if rule["id"] == "ppe-sampling" and "sampling" in lowered:
        required_terms = ("face shield", "gloves", "flame resistant")
        if not all(term in lowered for term in required_terms):
            return SafetyFlagRow(
                severity=rule["severity"],
                title=rule["title"],
                source=document.name,
                description=f"Page {chunk.get('page', 1)} describes sampling without the full PPE set.",
            )

    return None


def _model_rule_check(rule: dict[str, str], document: Document, chunk: dict[str, Any]) -> SafetyFlagRow | None:
    client = ollama.Client(host=OLLAMA_HOST)
    prompt = SAFETY_PROMPT.format(
        policy=rule["policy"],
        document_name=document.name,
        page=chunk.get("page", 1),
        chunk_text=chunk["text"],
    )
    response = client.chat(
        model=OLLAMA_CHAT_MODEL,
        messages=[{"role": "user", "content": prompt}],
        format="json",
        options={"temperature": 0.0},
    )
    payload = json.loads(response["message"]["content"])
    if not payload.get("violation"):
        return None

    return SafetyFlagRow(
        severity=payload.get("severity") or rule["severity"],
        title=payload.get("title") or rule["title"],
        source=document.name,
        description=payload.get("description") or f"Page {chunk.get('page', 1)} matched {rule['id']}.",
    )


def scan_document(document: Document, chunks: list[dict[str, Any]]) -> list[SafetyFlagRow]:
    flags = []
    seen = set()

    for chunk in chunks:
        for rule in SAFETY_RULES:
            try:
                flag = _model_rule_check(rule, document, chunk)
            except Exception:
                flag = _fallback_rule_check(rule, document, chunk)

            if not flag:
                continue

            key = (flag.title, flag.source, flag.description)
            if key in seen:
                continue
            seen.add(key)
            flags.append(flag)

    return flags
