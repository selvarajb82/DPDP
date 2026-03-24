import logging
import requests
from app.config import Config

logger = logging.getLogger(__name__)


def trigger_payment_confirmation(email: str, business_name: str, amount: int) -> None:
    """Trigger n8n payment confirmation email workflow."""
    if not Config.N8N_PAYMENT_WEBHOOK:
        logger.warning("N8N_PAYMENT_WEBHOOK not configured — skipping payment confirmation email")
        return

    payload = {
        "email": email,
        "business_name": business_name,
        "amount": f"\u20b9{amount // 100}",
    }
    try:
        response = requests.post(Config.N8N_PAYMENT_WEBHOOK, json=payload, timeout=5)
        response.raise_for_status()
        logger.info("Payment confirmation email triggered for: %s", email)
    except Exception as e:
        logger.error("Failed to trigger payment confirmation email: %s", e)


def trigger_report_ready_email(assessment_id: str) -> None:
    """Trigger n8n report-ready email workflow after full report is generated."""
    if not Config.N8N_REPORT_WEBHOOK:
        logger.warning("N8N_REPORT_WEBHOOK not configured — skipping report ready email")
        return

    from app.database import SessionLocal
    from app.models.assessment import get_assessment_by_id
    from app.models.report import get_report_by_assessment_id

    db = SessionLocal()
    try:
        assessment = get_assessment_by_id(db, assessment_id)
        report = get_report_by_assessment_id(db, assessment_id)

        if not assessment or not report:
            logger.error("Cannot send report email — assessment or report not found: %s", assessment_id)
            return

        payload = {
            "email": assessment.email,
            "business_name": assessment.business_name,
            "report_link": f"{Config.FRONTEND_URL}/report/{report.access_token}",
        }
        response = requests.post(Config.N8N_REPORT_WEBHOOK, json=payload, timeout=5)
        response.raise_for_status()
        logger.info("Report ready email triggered for assessment: %s", assessment_id)
    except Exception as e:
        logger.error("Failed to trigger report ready email: %s", e)
    finally:
        db.close()
