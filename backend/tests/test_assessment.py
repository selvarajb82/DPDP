import pytest
from unittest.mock import patch
from tests.conftest import SAMPLE_ANSWERS


def test_health(client):
    res = client.get('/api/health')
    assert res.status_code in (200, 503)
    data = res.get_json()
    assert data['status'] in ('healthy', 'degraded')


def test_start_assessment(client):
    res = client.post('/api/assessment/start', json={
        'email': 'test@example.com',
        'business_name': 'Test Corp',
        'answers': SAMPLE_ANSWERS,
    })
    assert res.status_code == 201
    data = res.get_json()
    assert 'assessment_id' in data
    assert 'session_token' in data


def test_start_assessment_missing_answers(client):
    res = client.post('/api/assessment/start', json={
        'email': 'test@example.com',
        'business_name': 'Test Corp',
    })
    assert res.status_code == 400


def test_start_assessment_email_optional(client):
    res = client.post('/api/assessment/start', json={
        'business_name': 'No Email Corp',
        'answers': {'q1': 'yes'},
    })
    assert res.status_code == 201


def test_get_assessment_not_found(client):
    import uuid
    fake_id = str(uuid.uuid4())
    res = client.get(f'/api/assessment/{fake_id}',
                     headers={'X-Session-Token': 'fake-token'})
    assert res.status_code == 404


@patch('app.routes.assessment.analyse_assessment')
def test_preview_assessment(mock_analyse, client):
    start_res = client.post('/api/assessment/start', json={
        'email': 'preview@example.com',
        'business_name': 'Preview Corp',
        'answers': SAMPLE_ANSWERS,
    })
    data = start_res.get_json()
    session_token = data['session_token']

    mock_analyse.return_value = {
        'risk_score': 45,
        'risk_level': 'High',
        'preview_summary': 'Your DPDP compliance has significant gaps.',
        'top_gaps': [
            {'title': 'No consent mechanism', 'severity': 'Critical',
             'dpdp_clause': 'Section 6', 'description': 'Missing consent'},
            {'title': 'Missing privacy notice', 'severity': 'High',
             'dpdp_clause': 'Section 5', 'description': 'No notice'},
            {'title': 'No data retention policy', 'severity': 'Medium',
             'dpdp_clause': 'Section 8', 'description': 'No policy'},
        ],
        'first_actions': [
            {'action': 'Implement consent banner', 'deadline': '30 days'},
            {'action': 'Draft privacy notice', 'deadline': '14 days'},
        ],
    }

    res = client.post('/api/assessment/preview',
                      headers={'X-Session-Token': session_token})

    assert res.status_code == 200
    result = res.get_json()
    assert 'risk_score' in result
    assert 'preview_data' in result
    assert result['risk_score'] == 45


def test_get_assessment_after_start(client):
    start_res = client.post('/api/assessment/start', json={
        'email': 'get@example.com',
        'business_name': 'Get Corp',
        'answers': SAMPLE_ANSWERS,
    })
    data = start_res.get_json()
    assessment_id = data['assessment_id']
    session_token = data['session_token']

    res = client.get(f'/api/assessment/{assessment_id}',
                     headers={'X-Session-Token': session_token})
    assert res.status_code == 200
    result = res.get_json()
    assert result['id'] == assessment_id
    assert result['status'] == 'pending'
