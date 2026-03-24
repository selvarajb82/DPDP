import pytest
import os

os.environ.setdefault('DATABASE_URL', 'sqlite:///:memory:')
os.environ.setdefault('RAZORPAY_KEY_ID', 'rzp_test_key_id')
os.environ.setdefault('RAZORPAY_KEY_SECRET', 'test-razorpay-secret')
os.environ.setdefault('RAZORPAY_WEBHOOK_SECRET', 'test-webhook-secret')
os.environ.setdefault('OPENAI_API_KEY', 'test-openai-key')
os.environ.setdefault('N8N_PAYMENT_WEBHOOK_URL', 'http://test-n8n/payment')
os.environ.setdefault('N8N_REPORT_WEBHOOK_URL', 'http://test-n8n/report')
os.environ.setdefault('SECRET_KEY', 'test-secret')

from app import create_app
from app.database import Base, engine


@pytest.fixture(scope='session')
def app():
    app = create_app()
    app.config['TESTING'] = True
    with app.app_context():
        Base.metadata.create_all(bind=engine)
        yield app
        Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client(app):
    return app.test_client()


SAMPLE_ANSWERS = {
    "business_type": "SaaS",
    "collects_personal_data": "yes",
    "has_privacy_notice": "no",
    "has_consent_mechanism": "no",
    "data_retention_policy": "no",
    "processes_children_data": "no",
    "shares_data_third_parties": "yes",
    "has_dpo": "no",
    "data_breach_procedure": "no",
    "cross_border_transfer": "no",
    "user_deletion_requests": "no",
    "data_correction_mechanism": "no",
    "security_measures": "partial",
    "data_audit_logs": "no",
    "legal_basis_for_processing": "no",
}
