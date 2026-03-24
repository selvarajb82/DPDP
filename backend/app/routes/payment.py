import logging
from threading import Thread
from flask import Blueprint, request, jsonify
from app.config import Config
from app.database import SessionLocal
from app.models.assessment import get_assessment_by_token, get_assessment_by_id, update_assessment_status
from app.models.payment import create_payment, mark_payment_success
from app.models.report import mark_report_paid
from app.services.razorpay_service import (
    create_razorpay_order,
    verify_payment_signature,
    verify_webhook_signature,
)
from app.services.claude_service import generate_full_report
from app.services.email_service import trigger_payment_confirmation

logger = logging.getLogger(__name__)
payment_bp = Blueprint("payment", __name__)


@payment_bp.post("/create-order")
def create_order():
    """
    POST /api/payment/create-order
    Header: X-Session-Token: <token>
    Body: { email: str } (optional)
    Returns: { order_id, amount, currency, key_id }
    """
    if not Config.RAZORPAY_KEY_ID or not Config.RAZORPAY_KEY_SECRET:
        logger.warning("Payment creation attempted but Razorpay is not configured")
        return jsonify({"error": "Payments not available yet — coming soon"}), 503

    session_token = request.headers.get("X-Session-Token")
    if not session_token:
        return jsonify({"error": "X-Session-Token header required"}), 401

    data = request.get_json(silent=True) or {}

    db = SessionLocal()
    try:
        assessment = get_assessment_by_token(db, session_token)
        if not assessment:
            return jsonify({"error": "Assessment not found"}), 404

        email = data.get("email") or assessment.email or ""
        if data.get("email") and not assessment.email:
            assessment.email = data["email"]
            db.commit()

        try:
            order = create_razorpay_order(str(assessment.id))
        except Exception as e:
            logger.error("Razorpay order creation failed: %s", e)
            return jsonify({"error": "Payment provider error — please try again"}), 502

        create_payment(db, str(assessment.id))

        return jsonify({
            "order_id": order["id"],
            "amount": order["amount"],
            "currency": order["currency"],
            "key_id": Config.RAZORPAY_KEY_ID,
            "email": email,
        }), 200

    except Exception as e:
        logger.error("Error creating order: %s", e)
        return jsonify({"error": "Internal server error"}), 500
    finally:
        db.close()


@payment_bp.post("/verify")
def verify_payment():
    """
    POST /api/payment/verify
    Called by frontend after Razorpay checkout success.
    Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
    Returns: { access_token } on success.
    """
    data = request.get_json(silent=True) or {}
    order_id = data.get("razorpay_order_id", "")
    payment_id = data.get("razorpay_payment_id", "")
    signature = data.get("razorpay_signature", "")

    if not all([order_id, payment_id, signature]):
        return jsonify({"error": "Missing payment fields"}), 400

    if not verify_payment_signature(order_id, payment_id, signature):
        logger.warning("Invalid Razorpay payment signature for order: %s", order_id)
        return jsonify({"error": "Invalid payment signature"}), 401

    session_token = request.headers.get("X-Session-Token")
    if not session_token:
        return jsonify({"error": "X-Session-Token header required"}), 401

    db = SessionLocal()
    try:
        assessment = get_assessment_by_token(db, session_token)
        if not assessment:
            return jsonify({"error": "Assessment not found"}), 404

        assessment_id = str(assessment.id)

        mark_payment_success(db, assessment_id, payment_id, data)
        report = mark_report_paid(db, assessment_id)
        update_assessment_status(db, assessment_id, "paid")

        access_token = report.access_token if report else None
        email = assessment.email
        business_name = assessment.business_name or "Unknown"

    finally:
        db.close()

    # Generate full report in background
    Thread(target=generate_full_report, args=(assessment_id,), daemon=True).start()

    # Trigger n8n payment confirmation email
    if email:
        Thread(
            target=trigger_payment_confirmation,
            args=(email, business_name, 1000),
            daemon=True,
        ).start()

    logger.info("Payment verified for assessment: %s", assessment_id)
    return jsonify({"access_token": access_token}), 200


@payment_bp.post("/webhook")
def razorpay_webhook():
    """
    POST /api/payment/webhook
    Razorpay webhook handler.
    CRITICAL: Verify HMAC signature BEFORE processing anything.
    Header: X-Razorpay-Signature
    """
    payload_bytes = request.get_data()
    signature = request.headers.get("X-Razorpay-Signature", "")

    # STEP 1: Verify signature first — always
    if not verify_webhook_signature(payload_bytes, signature):
        logger.warning("Invalid Razorpay webhook signature received")
        return jsonify({"error": "Invalid signature"}), 403

    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid payload"}), 400

    event = data.get("event")
    logger.info("Razorpay webhook received: %s", event)

    # Webhook is a secondary confirmation — primary flow is via /verify endpoint
    # Only process if payment not already marked (idempotency guard)
    if event == "payment.captured":
        try:
            payment_entity = data["payload"]["payment"]["entity"]
            payment_id = payment_entity["id"]
            order_id = payment_entity.get("order_id", "")
            notes = payment_entity.get("notes", {})
            assessment_id = notes.get("assessment_id")

            if not assessment_id:
                logger.warning("Webhook missing assessment_id in notes for payment: %s", payment_id)
                return jsonify({"received": True}), 200

            db = SessionLocal()
            try:
                from app.models.payment import get_payment_by_assessment
                existing = get_payment_by_assessment(db, assessment_id)
                if existing and existing.status == "success":
                    logger.info("Payment already processed via /verify for assessment: %s", assessment_id)
                    return jsonify({"received": True}), 200

                mark_payment_success(db, assessment_id, payment_id, data)
                report = mark_report_paid(db, assessment_id)
                update_assessment_status(db, assessment_id, "paid")

                assessment = get_assessment_by_id(db, assessment_id)
                email = assessment.email if assessment else None
                business_name = assessment.business_name if assessment else "Unknown"

            finally:
                db.close()

            Thread(target=generate_full_report, args=(assessment_id,), daemon=True).start()

            if email:
                Thread(
                    target=trigger_payment_confirmation,
                    args=(email, business_name, 99900),
                    daemon=True,
                ).start()

            logger.info("Webhook payment processed for assessment: %s", assessment_id)

        except (KeyError, TypeError) as e:
            logger.error("Webhook payload missing expected fields: %s", e)
            return jsonify({"received": True, "warning": "Payload structure unexpected"}), 200

    return jsonify({"received": True}), 200
