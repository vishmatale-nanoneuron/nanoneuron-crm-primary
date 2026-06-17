"""GSTGuard AI engine — GST notice extraction, draft reply generation, CAI critique loop.

CAI critique checks coverage/tone/structure only — legal accuracy is the CA's sole responsibility.
Models: Claude Haiku for extraction + critique, Claude Sonnet for draft generation + revision.
"""
import json
import logging
import re
from typing import Optional

logger = logging.getLogger(__name__)

NOTICE_TYPES = ["ASMT-10", "DRC-01", "DRC-01A", "DRC-07", "GSTR-3A", "ADT-01", "GSTR_mismatch", "DRC-10"]

EXTRACTION_SYSTEM = """You are a GST compliance expert in India. Extract structured information from GST notices issued by tax authorities.

GST notice types:
- ASMT-10: Scrutiny of returns — discrepancies found during examination
- DRC-01: Show Cause Notice — formal demand for tax, interest, penalty
- DRC-01A: Intimation of tax ascertained — pre-SCN communication
- DRC-07: Summary of order — final order after adjudication
- GSTR-3A: Notice to non-filer of GSTR-3B return
- ADT-01: Notice for departmental audit
- GSTR_mismatch: Discrepancy between GSTR-2A and GSTR-3B
- DRC-10: Notice for recovery of dues

Return ONLY valid JSON. NEVER guess deadlines or demand amounts — use null if not found.

For field_sources, classify each field as:
- "found": value explicitly and unambiguously stated in the document
- "inferred": logically derived from context but not explicitly stated word-for-word
- "absent": field is not present in the document (value should be null)"""

EXTRACTION_USER_TMPL = """Extract all fields from this GST notice text. Return JSON exactly matching this schema:

{{
  "notice_type": "<one of: ASMT-10|DRC-01|DRC-01A|DRC-07|GSTR-3A|ADT-01|GSTR_mismatch|DRC-10|unknown>",
  "gstin": "<15-char GSTIN or null>",
  "taxpayer_name": "<business name or null>",
  "notice_number": "<notice reference number or null>",
  "notice_date": "<YYYY-MM-DD or null>",
  "deadline": "<YYYY-MM-DD reply deadline or null — ONLY if explicitly stated in the notice>",
  "demand_amount_inr": <integer rupees or null>,
  "period": "<tax period e.g. Apr 2023 - Mar 2024 or null>",
  "issues": ["<specific issue 1>", "<specific issue 2>"],
  "issuing_authority": "<officer name/designation or null>",
  "confidence": "<high|medium|low>",
  "field_sources": {{
    "gstin": "<found|inferred|absent>",
    "taxpayer_name": "<found|inferred|absent>",
    "notice_number": "<found|inferred|absent>",
    "notice_date": "<found|inferred|absent>",
    "deadline": "<found|inferred|absent>",
    "demand_amount_inr": "<found|inferred|absent>",
    "period": "<found|inferred|absent>"
  }}
}}

Notice text:
{text}"""

DRAFT_SYSTEM = """You are a senior GST compliance advocate helping CA firms draft formal replies to GST notices in India.
Your drafts are professional, cite correct CGST/IGST Act sections, and are structured in standard GST portal format.
Every draft must end with the accountability watermark exactly as specified."""

DRAFT_USER_TMPL = """Draft a formal reply letter for this GST notice. Use standard GST portal reply format.

Notice details:
- Type: {notice_type}
- Notice Number: {notice_number}
- Notice Date: {notice_date}
- GSTIN: {gstin}
- Taxpayer: {taxpayer_name}
- Period: {period}
- Demand Amount: {demand_amount}
- Issues raised: {issues}

Requirements:
1. Start with formal header:
   To: The Proper Officer
   GSTN: [Notice reference]
   Subject: Reply to {notice_type} Notice No. {notice_number} dated {notice_date}
   Reference: [GSTIN] — [Taxpayer name]

2. Respectful opening paragraph acknowledging receipt of notice

3. Point-by-point reply to EACH issue raised, with:
   - Factual explanation (do not admit liability)
   - Cite applicable CGST Act section (e.g., Section 73, Section 16, Rule 36(4))
   - Supporting document reference

4. Supporting documents list (numbered)

5. Closing paragraph requesting relief/redressal

6. Signature block placeholder:
   [CA Firm Name]
   [CA Registration Number]
   [Date]

End with this EXACT watermark on its own line:
---
PREPARED FOR CA REVIEW — Not valid without CA signature and filing on the GST portal.
---"""

CAI_CRITIQUE_SYSTEM = """You are a GST reply QA reviewer. You check draft replies for structural completeness and appropriate tone.
You do NOT verify legal accuracy or correctness of cited sections — that is the CA's sole responsibility.
Return ONLY valid JSON."""

CAI_CRITIQUE_USER_TMPL = """Check this GST draft reply against 5 structural criteria. Return ONLY valid JSON.

Issues listed in the notice that the draft MUST address:
{issues_list}

Draft reply:
{draft_text}

Criteria:
1. COVERAGE: Does the draft address each listed issue? List any issues not addressed.
2. TONE: Is it respectful but firm? Does it avoid any admission of liability?
3. STRUCTURE: Does it have To:/Subject:/Reference: header, a numbered supporting documents list, and a closing paragraph?
4. WATERMARK: Does it end with "PREPARED FOR CA REVIEW — Not valid without CA signature and filing on the GST portal."?
5. SUBSTANCE: Does each issue get at least one substantive paragraph (not a one-liner)?

Return JSON:
{{
  "approved": <true or false>,
  "missing_issues": [<list of issue texts NOT addressed in the draft; empty array if all covered>],
  "tone_ok": <true or false>,
  "structure_ok": <true or false>,
  "watermark_present": <true or false>,
  "notes": "<one-line: what to fix, or 'All criteria met'>"
}}"""

REVISION_USER_TMPL = """Revise this GST notice draft reply to fix the QA issues listed below.

QA notes: {critique_notes}
Missing issue coverage: {missing_issues}

Original draft:
{draft_text}

Produce a complete revised reply that addresses all QA findings. Keep all already-correct parts unchanged.
End with:
---
PREPARED FOR CA REVIEW — Not valid without CA signature and filing on the GST portal.
---"""

CA_ORIENTATION_SYSTEM = """You are preparing professional briefing notes for a Chartered Accountant reviewing a GST notice.
Write factual, concise orientation notes — NOT legal advice — to help the CA quickly understand the notice context.
Return ONLY valid JSON."""

CA_ORIENTATION_USER_TMPL = """Prepare a CA briefing for this GST notice situation.

Notice type: {notice_type}
Issues raised by the department: {issues}
Tax period: {period}
Demand amount: {demand_amount}

Return JSON:
{{
  "plain_summary": "<2 clear sentences: what the department found or scrutinised, what tax period, what they are asking the taxpayer to explain or pay>",
  "key_documents_to_gather": ["<specific document 1>", "<specific document 2>", "<specific document 3>", "<specific document 4>"],
  "ca_notes": "<one sentence: specific professional consideration the CA should be aware of for this notice type>"
}}"""


def _get_client():
    import anthropic
    from app.core.config import settings
    if not settings.ANTHROPIC_API_KEY:
        raise RuntimeError("ANTHROPIC_API_KEY not configured")
    return anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)


def _parse_json(raw: str) -> dict:
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw)


def extract_notice(text: str) -> dict:
    """Extract structured fields from raw notice text via Claude Haiku."""
    try:
        client = _get_client()
        msg = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=1200,
            system=EXTRACTION_SYSTEM,
            messages=[{"role": "user", "content": EXTRACTION_USER_TMPL.format(text=text[:8000])}],
        )
        return _parse_json(msg.content[0].text)
    except Exception as exc:
        logger.error("Notice extraction failed: %s", exc)
        return {
            "notice_type": "unknown", "gstin": None, "taxpayer_name": None,
            "notice_number": None, "notice_date": None, "deadline": None,
            "demand_amount_inr": None, "period": None, "issues": [],
            "issuing_authority": None, "confidence": "low", "field_sources": {},
        }


def _critique_draft(issues: list, draft_text: str) -> dict:
    """CAI critique pass — checks coverage, tone, structure. NOT legal accuracy."""
    try:
        client = _get_client()
        issues_list = "\n".join(f"- {i}" for i in issues) if issues else "(no specific issues extracted)"
        msg = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=512,
            system=CAI_CRITIQUE_SYSTEM,
            messages=[{"role": "user", "content": CAI_CRITIQUE_USER_TMPL.format(
                issues_list=issues_list, draft_text=draft_text[:5000]
            )}],
        )
        return _parse_json(msg.content[0].text)
    except Exception as exc:
        logger.error("CAI critique failed: %s", exc)
        return {"approved": True, "notes": "Critique skipped"}


def _revise_draft(draft_text: str, critique: dict) -> str:
    """Single revision pass to address CAI critique findings."""
    try:
        client = _get_client()
        missing = "\n".join(f"- {i}" for i in critique.get("missing_issues", [])) or "none"
        msg = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=3000,
            system=DRAFT_SYSTEM,
            messages=[{"role": "user", "content": REVISION_USER_TMPL.format(
                critique_notes=critique.get("notes", ""),
                missing_issues=missing,
                draft_text=draft_text,
            )}],
        )
        return msg.content[0].text.strip()
    except Exception as exc:
        logger.error("Draft revision failed: %s", exc)
        return draft_text


def _verify_draft_figures(draft_text: str, gstin: Optional[str], demand_amount_inr: Optional[int]) -> list:
    """Cross-check ₹ amounts and GSTINs cited in the draft against extracted notice fields.
    Returns transparency list for CA — never modifies the draft.
    """
    figures = []
    seen: set = set()
    for m in re.finditer(r'₹\s*[\d,]+(?:\.\d+)?|Rs\.?\s*[\d,]+(?:\.\d+)?', draft_text):
        cited = m.group().strip()
        clean_digits = re.sub(r'[^\d]', '', cited)
        if not clean_digits or int(clean_digits) < 1000:
            continue
        key = (cited, "amount")
        if key in seen:
            continue
        seen.add(key)
        status, note = "unverified", "Verify against notice PDF"
        if demand_amount_inr is not None:
            try:
                if int(clean_digits) == demand_amount_inr:
                    status, note = "verified", "Matches extracted demand amount"
            except (ValueError, OverflowError):
                pass
        figures.append({"figure": cited, "type": "amount", "status": status, "note": note})
    for m in re.finditer(r'\b[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]\b', draft_text):
        cited = m.group()
        key = (cited, "gstin")
        if key in seen:
            continue
        seen.add(key)
        status = "verified" if (gstin and cited == gstin) else "unverified"
        note = "Matches extracted GSTIN" if status == "verified" else "Verify against notice PDF"
        figures.append({"figure": cited, "type": "gstin", "status": status, "note": note})
    return figures


def generate_draft_reply(
    notice_type: str,
    notice_number: Optional[str],
    notice_date: Optional[str],
    gstin: Optional[str],
    taxpayer_name: Optional[str],
    period: Optional[str],
    demand_amount_inr: Optional[int],
    issues: list,
) -> dict:
    """Generate a formal draft reply with CAI self-critique loop.

    CAI loop checks coverage and tone only — legal accuracy is the CA's responsibility.
    Returns {draft_text, cai_notes, cai_revised, draft_figures}.
    """
    try:
        client = _get_client()
        issues_text = "\n".join(f"  {i+1}. {issue}" for i, issue in enumerate(issues)) if issues else "  (No specific issues extracted)"
        demand_text = f"₹{demand_amount_inr:,}" if demand_amount_inr else "Not specified"
        msg = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=3000,
            system=DRAFT_SYSTEM,
            messages=[{"role": "user", "content": DRAFT_USER_TMPL.format(
                notice_type=notice_type or "GST Notice",
                notice_number=notice_number or "N/A",
                notice_date=notice_date or "N/A",
                gstin=gstin or "N/A",
                taxpayer_name=taxpayer_name or "Taxpayer",
                period=period or "N/A",
                demand_amount=demand_text,
                issues=issues_text,
            )}],
        )
        draft_text = msg.content[0].text.strip()
    except Exception as exc:
        logger.error("Draft generation failed: %s", exc)
        draft_text = f"""Reply to {notice_type or 'GST'} Notice No. {notice_number or 'N/A'}

[DRAFT GENERATION FAILED — please retry or contact support]

---
PREPARED FOR CA REVIEW — Not valid without CA signature and filing on the GST portal.
---"""
        return {"draft_text": draft_text, "cai_notes": "Generation failed", "cai_revised": False, "draft_figures": []}

    critique = _critique_draft(issues, draft_text)
    cai_notes = critique.get("notes", "All criteria met")
    cai_revised = False

    if not critique.get("approved", True):
        revised = _revise_draft(draft_text, critique)
        if revised and revised != draft_text:
            draft_text = revised
            cai_revised = True

    draft_figures = _verify_draft_figures(draft_text, gstin, demand_amount_inr)
    return {"draft_text": draft_text, "cai_notes": cai_notes, "cai_revised": cai_revised, "draft_figures": draft_figures}


def generate_ca_orientation(
    notice_type: Optional[str],
    issues: list,
    period: Optional[str],
    demand_amount_inr: Optional[int],
) -> dict:
    """Generate plain-English CA briefing with key documents checklist."""
    try:
        client = _get_client()
        demand_text = f"₹{demand_amount_inr:,}" if demand_amount_inr else "Not specified"
        issues_text = "\n".join(f"- {i}" for i in issues) if issues else "(no specific issues extracted)"
        msg = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=600,
            system=CA_ORIENTATION_SYSTEM,
            messages=[{"role": "user", "content": CA_ORIENTATION_USER_TMPL.format(
                notice_type=notice_type or "GST Notice",
                issues=issues_text,
                period=period or "Not specified",
                demand_amount=demand_text,
            )}],
        )
        return _parse_json(msg.content[0].text)
    except Exception as exc:
        logger.error("CA orientation failed: %s", exc)
        return {"plain_summary": "Notice extracted. Please review the PDF for full context.", "key_documents_to_gather": [], "ca_notes": ""}
