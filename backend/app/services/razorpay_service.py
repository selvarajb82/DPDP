import hmac
import hashlib
import logging
import requests
from app.config import Config

logger = logging.getLogger(__name__)

RAZORPAY_API_BASE = "https://api.razorpay.com/v1"


def create_razorpay_order(assessment_id: str, amount_paise: int = 99900) -> dict:
    """
    Create a Razorpay order.
    Returns the Razorpay order object — use response['id'] as order_id for checkout.
    amount_paise: amount in paise (99900 = ₹999)
    """
    payload = {
        "amount": amount_paise,
        "currency": "INR",
        "receipt": f"dpdp_{assessment_id[:20]}",
        "notes": {
            "assessment_id": assessment_id,
        },
    }

    response = requests.post(
        f"{RAZORPAY_API_BASE}/orders",
        auth=(Config.RAZORPAY_KEY_ID, Config.RAZORPAY_KEY_SECRET),
        json=payload,
        timeout=10,
    )
    response.raise_for_status()
    logger.info("Razorpay order created for assessment: %s", assessment_id)
    return response.json()


def verify_payment_signature(order_id: str, payment_id: str, signature: str) -> bool:
    """
    Verify Razorpay payment signature after checkout success.
    Called by frontend after user completes payment.
    Signs: order_id + "|" + payment_id with RAZORPAY_KEY_SECRET.
    """
    message = f"{order_id}|{payment_id}"
    expected = hmac.new(
        Config.RAZORPAY_KEY_SECRET.encode("utf-8"),
        message.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, signature)


def verify_webhook_signature(payload: bytes, signature: str) -> bool:
    """
    Verify Razorpay webhook HMAC-SHA256 signature.
    Header: X-Razorpay-Signature
    MUST be called before processing any webhook payload.
    """
    if not Config.RAZORPAY_WEBHOOK_SECRET:
        logger.warning("RAZORPAY_WEBHOOK_SECRET not configured — skipping verification")
        return True  # Allow in dev if secret not set

    expected = hmac.new(
        Config.RAZORPAY_WEBHOOK_SECRET.encode("utf-8"),
        payload,
        hashlib.sha256,
    ).hexdigest()

    return hmac.compare_digest(expected, signature)
