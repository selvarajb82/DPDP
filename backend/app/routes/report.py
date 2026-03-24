import logging
import os
from flask import Blueprint, request, jsonify, send_file
from app.database import SessionLocal
from app.models.report import get_report_by_access_token, update_report_pdf_path
from app.models.assessment import get_assessment_by_id

logger = logging.getLogger(__name__)
report_bp = Blueprint("report", __name__)


@report_bp.get("/<access_token>")
def get_report(access_token: str):
    """
    GET /api/report/:access_token
    Returns full report JSON if is_paid=True.
    Returns 403 if not paid. Returns 404 if token not found.
    Returns 202 if paid but full_data not ready yet.
    """
    db = SessionLocal()
    try:
        report = get_report_by_access_token(db, access_token)
        if not report:
            return jsonify({"error": "Report not found"}), 404

        if not report.is_paid:
            return jsonify({"error": "Payment required to access full report"}), 403

        if not report.full_data:
            return jsonify({
                "status": "generating",
                "message": "Your full report is being generated — please check back in 30 seconds",
                "risk_score": report.risk_score,
                "preview_data": report.preview_data,
                "is_paid": True,
            }), 202

        assessment = get_assessment_by_id(db, str(report.assessment_id))

        return jsonify({
            "id": str(report.id),
            "assessment_id": str(report.assessment_id),
            "business_name": assessment.business_name if assessment else None,
            "risk_score": report.risk_score,
            "preview_data": report.preview_data,
            "full_data": report.full_data,
            "is_paid": report.is_paid,
            "access_token": report.access_token,
            "created_at": report.created_at.isoformat() if report.created_at else None,
        }), 200

    finally:
        db.close()


@report_bp.get("/<access_token>/pdf")
def download_pdf(access_token: str):
    """
    GET /api/report/:access_token/pdf
    Stream PDF download. Generates on first request, caches on disk.
    Returns 403 if not paid. Returns 202 if report not ready yet.
    """
    db = SessionLocal()
    try:
        report = get_report_by_access_token(db, access_token)
        if not report:
            return jsonify({"error": "Report not found"}), 404

        if not report.is_paid:
            return jsonify({"error": "Payment required"}), 403

        if not report.full_data:
            return jsonify({"message": "Report is still being generated"}), 202

        # Return cached PDF if it exists
        if report.pdf_path and os.path.exists(report.pdf_path):
            assessment = get_assessment_by_id(db, str(report.assessment_id))
            business_slug = (
                (assessment.business_name or "business").replace(" ", "_").lower()
                if assessment else "report"
            )
            return send_file(
                report.pdf_path,
                as_attachment=True,
                download_name=f"dpdp_report_{business_slug}.pdf",
                mimetype="application/pdf",
            )

        # Generate PDF for first time
        assessment = get_assessment_by_id(db, str(report.assessment_id))
        business_name = assessment.business_name if assessment else "Unknown Business"

        try:
            from app.services.pdf_service import generate_pdf
            report_dict = {
                "id": str(report.id),
                "risk_score": report.risk_score,
                "full_data": report.full_data,
            }
            pdf_path = generate_pdf(report_dict, business_name)
            update_report_pdf_path(db, str(report.id), pdf_path)

            business_slug = business_name.replace(" ", "_").lower()
            return send_file(
                pdf_path,
                as_attachment=True,
                download_name=f"dpdp_report_{business_slug}.pdf",
                mimetype="application/pdf",
            )
        except Exception as e:
            logger.error("PDF generation failed: %s", e)
            return jsonify({"error": "PDF generation failed"}), 500

    finally:
        db.close()
