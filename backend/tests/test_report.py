import secrets as secrets_module
import pytest
from unittest.mock import patch


def _create_assessment(db):
    from app.models.assessment import Assessment
    assessment = Assessment(
        session_token=secrets_module.token_urlsafe(16),
        answers={'q1': 'yes'},
        status='pending',
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)
    return assessment


def test_report_not_found(client):
    res = client.get('/api/report/nonexistent-token')
    assert res.status_code == 404


def test_report_not_paid(client):
    from app.database import SessionLocal
    from app.models.report import Report

    db = SessionLocal()
    try:
        assessment = _create_assessment(db)
        token = secrets_module.token_urlsafe(16)
        report = Report(
            access_token=token,
            assessment_id=assessment.id,
            risk_score=50,
            is_paid=False,
        )
        db.add(report)
        db.commit()
    finally:
        db.close()

    res = client.get(f'/api/report/{token}')
    assert res.status_code == 403


def test_report_still_generating(client):
    from app.database import SessionLocal
    from app.models.report import Report

    db = SessionLocal()
    try:
        assessment = _create_assessment(db)
        token = secrets_module.token_urlsafe(16)
        report = Report(
            access_token=token,
            assessment_id=assessment.id,
            risk_score=50,
            is_paid=True,
            full_data=None,
        )
        db.add(report)
        db.commit()
    finally:
        db.close()

    res = client.get(f'/api/report/{token}')
    assert res.status_code == 202
    data = res.get_json()
    assert data['status'] == 'generating'


def test_report_ready(client):
    from app.database import SessionLocal
    from app.models.report import Report

    db = SessionLocal()
    try:
        assessment = _create_assessment(db)
        token = secrets_module.token_urlsafe(16)
        full_data = {
            'executive_summary': 'Test summary',
            'score_breakdown': {'consent': 40, 'transparency': 60},
            'all_gaps': [],
            'action_plan': [],
            'compliant_areas': [],
        }
        report = Report(
            access_token=token,
            assessment_id=assessment.id,
            risk_score=55,
            is_paid=True,
            full_data=full_data,
        )
        db.add(report)
        db.commit()
    finally:
        db.close()

    res = client.get(f'/api/report/{token}')
    assert res.status_code == 200
    data = res.get_json()
    assert data['risk_score'] == 55
    assert 'full_data' in data


def test_pdf_download_not_paid(client):
    from app.database import SessionLocal
    from app.models.report import Report

    db = SessionLocal()
    try:
        assessment = _create_assessment(db)
        token = secrets_module.token_urlsafe(16)
        report = Report(
            access_token=token,
            assessment_id=assessment.id,
            risk_score=50,
            is_paid=False,
        )
        db.add(report)
        db.commit()
    finally:
        db.close()

    res = client.get(f'/api/report/{token}/pdf')
    assert res.status_code == 403
