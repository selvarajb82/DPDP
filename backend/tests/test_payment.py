import json
import hmac
import hashlib
import pytest
from unittest.mock import patch
from tests.conftest import SAMPLE_ANSWERS


def _start_assessment(client, email='pay@example.com', business='Pay Corp'):
    res = client.post('/api/assessment/start', json={
        'email': email,
        'business_name': business,
        'answers': SAMPLE_ANSWERS,
    })
    data = res.get_json()
    return data['assessment_id'], data['session_token']


def _razorpay_sig(payload_bytes: bytes, secret: str) -> str:
    return hmac.new(
        secret.encode('utf-8'),
        payload_bytes,
        hashlib.sha256,
    ).hexdigest()


@patch('app.routes.payment.create_razorpay_order')
def test_create_order(mock_order, client):
    _, session_token = _start_assessment(client)

    mock_order.return_value = {
        'id': 'order_test123',
        'amount': 99900,
        'currency': 'INR',
    }

    res = client.post(
        '/api/payment/create-order',
        json={'email': 'pay@example.com'},
        headers={'X-Session-Token': session_token},
    )

    assert res.status_code == 200
    result = res.get_json()
    assert result['order_id'] == 'order_test123'
    assert result['amount'] == 99900
    assert result['currency'] == 'INR'
    assert result['key_id'] == 'rzp_test_key_id'


def test_create_order_missing_token(client):
    res = client.post('/api/payment/create-order', json={})
    assert res.status_code == 401


@patch('app.routes.payment.generate_full_report')
@patch('app.routes.payment.trigger_payment_confirmation')
@patch('app.routes.payment.verify_payment_signature')
def test_verify_payment(mock_sig, mock_email, mock_report, client):
    _, session_token = _start_assessment(client, 'verify@example.com', 'Verify Corp')

    mock_sig.return_value = True
    mock_report.return_value = None
    mock_email.return_value = None

    res = client.post(
        '/api/payment/verify',
        json={
            'razorpay_order_id': 'order_test123',
            'razorpay_payment_id': 'pay_test123',
            'razorpay_signature': 'valid_signature',
        },
        headers={'X-Session-Token': session_token},
    )

    assert res.status_code == 200
    result = res.get_json()
    assert 'access_token' in result


def test_verify_payment_missing_fields(client):
    _, session_token = _start_assessment(client, 'missing@example.com', 'Missing Corp')
    res = client.post(
        '/api/payment/verify',
        json={},
        headers={'X-Session-Token': session_token},
    )
    assert res.status_code == 400


@patch('app.routes.payment.generate_full_report')
@patch('app.routes.payment.trigger_payment_confirmation')
def test_webhook_valid_signature(mock_email, mock_report, client):
    assessment_id, _ = _start_assessment(client, 'webhook@example.com', 'Webhook Corp')

    mock_report.return_value = None
    mock_email.return_value = None

    payload = {
        'event': 'payment.captured',
        'payload': {
            'payment': {
                'entity': {
                    'id': 'pay_webhook123',
                    'order_id': 'order_webhook123',
                    'notes': {'assessment_id': assessment_id},
                }
            }
        }
    }
    payload_bytes = json.dumps(payload).encode('utf-8')
    sig = _razorpay_sig(payload_bytes, 'test-webhook-secret')

    res = client.post(
        '/api/payment/webhook',
        data=payload_bytes,
        content_type='application/json',
        headers={'X-Razorpay-Signature': sig},
    )

    assert res.status_code == 200


def test_webhook_invalid_signature(client):
    payload = json.dumps({'event': 'payment.captured'}).encode()
    res = client.post(
        '/api/payment/webhook',
        data=payload,
        content_type='application/json',
        headers={'X-Razorpay-Signature': 'bad-signature'},
    )
    assert res.status_code == 403


def test_webhook_missing_signature(client):
    payload = json.dumps({'event': 'payment.captured'}).encode()
    res = client.post(
        '/api/payment/webhook',
        data=payload,
        content_type='application/json',
    )
    assert res.status_code == 403
