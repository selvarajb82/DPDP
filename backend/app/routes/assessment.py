import secrets
import logging
from flask import Blueprint, request, jsonify
from app.database import SessionLocal
from app.models.assessment import (
    create_assessment,
    get_assessment_by_token,
    get_assessment_by_id,
    update_assessment_status,
)
from app.models.report import create_report, get_report_by_assessment_id
from app.services.claude_service import analyse_assessment
from app import limiter

logger = logging.getLogger(__name__)
assessment_bp = Blueprint("assessment", __name__)


def _get_session_token() -> str | None:
    """Extract session token from header or request body."""
    token = request.headers.get("X-Session-Token")
    if token:
        return token
    if request.is_json:
        data = request.get_json(silent=True) or {}
        return data.get("session_token")
    return None


@assessment_bp.post("/start")
def start_assessment():
    """
    POST /api/assessment/start
    Body: { answers: {...}, email: str (optional), business_name: str (optional) }
    Returns: { session_token, assessment_id, status }
    """
    data = request.get_json(silent=True)
    if not data or not data.get("answers"):
        return jsonify({"error": "answers field is required"}), 400

    session_token = secrets.token_urlsafe(48)

    db = SessionLocal()
    try:
        assessment = create_assessment(
            db=db,
            session_token=session_token,
            answers=data["answers"],
            email=data.get("email"),
            business_name=data.get("business_name"),
        )
        return jsonify({
            "session_token": session_token,
            "assessment_id": str(assessment.id),
            "status": assessment.status,
        }), 201
    except Exception as e:
        logger.error("Error creating assessment: %s", e)
        return jsonify({"error": "Failed to create assessment"}), 500
    finally:
        db.close()


@assessment_bp.post("/preview")
@limiter.limit("10 per hour")
def get_preview():
    """
    POST /api/assessment/preview
    Header: X-Session-Token: <token>
    Returns: { risk_score, preview_data, access_token, is_paid }
    Rate limited: 10 per hour per IP.
    """
    session_token = _get_session_token()
    if not session_token:
        return jsonify({"error": "X-Session-Token header required"}), 401

    db = SessionLocal()
    try:
        assessment = get_assessment_by_token(db, session_token)
        if not assessment:
            return jsonify({"error": "Assessment not found"}), 404

        # Return existing report if preview already generated
        existing_report = get_report_by_assessment_id(db, str(assessment.id))
        if existing_report:
            return jsonify({
                "risk_score": existing_report.risk_score,
                "preview_data": existing_report.preview_data,
                "access_token": existing_report.access_token,
                "is_paid": existing_report.is_paid,
            }), 200

        answers = assessment.answers or {}
        business_type = answers.get("business_type", "Unknown")

        try:
            result = analyse_assessment(
                business_name=assessment.business_name or "Unknown Business",
                business_type=business_type,
                answers=answers,
            )
        except ValueError as e:
            logger.error("Claude analysis failed: %s", e)
            return jsonify({"error": "Analysis failed — please try again"}), 502

        preview_data = {
            "risk_level": result["risk_level"],
            "top_gaps": result["top_gaps"],
            "first_actions": result["first_actions"],
            "preview_summary": result["preview_summary"],
        }
        report = create_report(db, str(assessment.id), result["risk_score"], preview_data)
        update_assessment_status(db, str(assessment.id), "previewed")

        return jsonify({
            "risk_score": report.risk_score,
            "preview_data": report.preview_data,
            "access_token": report.access_token,
            "is_paid": report.is_paid,
        }), 200

    except Exception as e:
        logger.error("Error generating preview: %s", e)
        return jsonify({"error": "Internal server error"}), 500
    finally:
        db.close()


@assessment_bp.get("/<assessment_id>")
def get_assessment_status(assessment_id: str):
    """
    GET /api/assessment/:id
    Header: X-Session-Token: <token>
    Returns assessment status and report info.
    """
    session_token = request.headers.get("X-Session-Token")
    if not session_token:
        return jsonify({"error": "X-Session-Token header required"}), 401

    db = SessionLocal()
    try:
        assessment = get_assessment_by_id(db, assessment_id)
        if not assessment:
            return jsonify({"error": "Assessment not found"}), 404

        if assessment.session_token != session_token:
            return jsonify({"error": "Unauthorized"}), 401

        report = get_report_by_assessment_id(db, assessment_id)
        return jsonify({
            "id": str(assessment.id),
            "status": assessment.status,
            "has_report": report is not None,
            "is_paid": report.is_paid if report else False,
            "access_token": report.access_token if (report and report.is_paid) else None,
        }), 200
    finally:
        db.close()
