import json
import logging
from app.config import Config

logger = logging.getLogger(__name__)

_client = None


def _get_client():
    global _client
    if _client is None:
        from openai import OpenAI
        _client = OpenAI(api_key=Config.OPENAI_API_KEY)
    return _client


def _chat(system: str, user: str, max_tokens: int) -> str:
    """Call OpenAI chat completion and return raw text."""
    client = _get_client()
    response = client.chat.completions.create(
        model=Config.OPENAI_MODEL,
        max_tokens=max_tokens,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        response_format={"type": "json_object"},
    )
    return response.choices[0].message.content.strip()


def analyse_assessment(business_name: str, business_type: str, answers: dict) -> dict:
    """
    Call OpenAI to generate the free preview analysis.
    Returns parsed JSON dict with risk_score, risk_level, top_gaps, first_actions, preview_summary.
    Raises ValueError if response is invalid JSON.
    """
    from app.prompts.analyse_prompt import ANALYSE_SYSTEM, ANALYSE_USER

    user_message = ANALYSE_USER.format(
        business_name=business_name or "Unknown Business",
        business_type=business_type or "Unknown",
        answers_json=json.dumps(answers, indent=2),
    )

    logger.info("Calling OpenAI for preview analysis: %s", business_name)
    raw = _chat(ANALYSE_SYSTEM, user_message, max_tokens=1024)
    logger.info("OpenAI preview response received (%d chars)", len(raw))

    try:
        result = json.loads(raw)
    except json.JSONDecodeError as e:
        logger.error("OpenAI returned invalid JSON for preview: %s", raw[:200])
        raise ValueError(f"OpenAI returned invalid JSON: {e}") from e

    required = ["risk_score", "risk_level", "top_gaps", "first_actions", "preview_summary"]
    for field in required:
        if field not in result:
            raise ValueError(f"Response missing required field: {field}")

    if len(result.get("top_gaps", [])) != 3:
        raise ValueError("Response must have exactly 3 top_gaps")
    if len(result.get("first_actions", [])) != 2:
        raise ValueError("Response must have exactly 2 first_actions")

    return result


def generate_full_report(assessment_id: str) -> None:
    """
    Generate the full compliance report after payment.
    ALWAYS called in a background thread — can take up to 30 seconds.
    Updates the report in the database when complete.
    """
    from app.database import SessionLocal
    from app.models.assessment import get_assessment_by_id, update_assessment_status
    from app.models.report import get_report_by_assessment_id, update_report_full_data
    from app.prompts.report_prompt import REPORT_SYSTEM, REPORT_USER
    from app.services.email_service import trigger_report_ready_email

    db = SessionLocal()
    try:
        assessment = get_assessment_by_id(db, assessment_id)
        if not assessment:
            logger.error("Assessment not found for full report: %s", assessment_id)
            return

        report = get_report_by_assessment_id(db, assessment_id)
        if not report:
            logger.error("Report not found for assessment: %s", assessment_id)
            return

        answers = assessment.answers or {}
        business_name = assessment.business_name or "Unknown Business"
        business_type = answers.get("business_type", "Unknown")

        user_message = REPORT_USER.format(
            business_name=business_name,
            business_type=business_type,
            risk_score=report.risk_score,
            answers_json=json.dumps(answers, indent=2),
        )

        logger.info("Generating full report for assessment: %s", assessment_id)
        raw = _chat(REPORT_SYSTEM, user_message, max_tokens=4096)
        full_data = json.loads(raw)

        update_report_full_data(db, str(report.id), full_data)
        update_assessment_status(db, assessment_id, "completed")
        logger.info("Full report generated and saved for assessment: %s", assessment_id)

        trigger_report_ready_email(assessment_id)

    except Exception as e:
        logger.error("Error generating full report for %s: %s", assessment_id, str(e))
    finally:
        db.close()
