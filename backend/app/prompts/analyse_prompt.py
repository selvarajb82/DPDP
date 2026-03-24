"""
Preview analysis prompt — must respond in under 8 seconds.
Returns ONLY valid JSON. No markdown. No code fences.
"""

ANALYSE_SYSTEM = """You are a DPDP Act compliance expert. Analyse the provided business assessment
answers strictly against India's Digital Personal Data Protection Act 2023 and its Rules
activated November 14, 2025. Return ONLY valid JSON — no markdown, no explanation, no code fences."""

ANALYSE_USER = """Analyse this business for DPDP compliance:

Business Name: {business_name}
Business Type: {business_type}
Answers: {answers_json}

Return this EXACT JSON structure with no other text:
{{
  "risk_score": <integer 0-100, where 100 = fully non-compliant>,
  "risk_level": "<Critical|High|Medium|Low>",
  "top_gaps": [
    {{
      "title": "<short gap title>",
      "dpdp_clause": "<Section X of DPDP Act 2023>",
      "severity": "<Critical|High|Medium>",
      "description": "<2 sentence plain English explanation of the gap>"
    }}
  ],
  "first_actions": [
    {{
      "action": "<specific actionable step>",
      "deadline": "<immediate|30 days|90 days>"
    }}
  ],
  "preview_summary": "<3 sentence plain English overall compliance assessment>"
}}

RULES:
- top_gaps must have EXACTLY 3 items
- first_actions must have EXACTLY 2 items
- risk_score must be an integer between 0 and 100
- Return ONLY the JSON object, nothing else"""
