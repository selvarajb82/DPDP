"""
Full report generation prompt — can take up to 30 seconds.
Returns ONLY valid JSON. No markdown. No code fences.
Always run in a background thread after payment.
"""

REPORT_SYSTEM = """You are a senior DPDP Act compliance consultant. Generate a detailed, actionable
compliance report for an Indian business. Reference exact sections of the Digital Personal Data
Protection Act 2023. Be specific and practical. Return ONLY valid JSON — no markdown, no code fences."""

REPORT_USER = """Generate a complete DPDP compliance report for:

Business Name: {business_name}
Business Type: {business_type}
Risk Score (from preview): {risk_score}
All Assessment Answers: {answers_json}

Return this EXACT JSON structure with no other text:
{{
  "executive_summary": "<5 sentence summary of compliance status>",

  "score_breakdown": {{
    "data_collection": <0-100>,
    "data_storage": <0-100>,
    "data_sharing": <0-100>,
    "consent_management": <0-100>,
    "user_rights": <0-100>
  }},

  "all_gaps": [
    {{
      "title": "<gap title>",
      "dpdp_clause": "<exact Section reference>",
      "severity": "<Critical|High|Medium|Low>",
      "description": "<detailed explanation>",
      "business_impact": "<what happens if not fixed>",
      "remediation_steps": ["<step 1>", "<step 2>", "<step 3>"]
    }}
  ],

  "action_plan": [
    {{
      "priority": "<1|2|3|4>",
      "action": "<specific action to take>",
      "dpdp_clause": "<Section reference>",
      "deadline": "<immediate|30 days|90 days|6 months>",
      "effort": "<low|medium|high>",
      "template_text": "<optional ready-to-use text if applicable>"
    }}
  ],

  "compliant_areas": [
    {{
      "area": "<area name>",
      "description": "<what they are doing correctly>"
    }}
  ],

  "consent_notice_template": "<complete HTML ready-to-use consent notice>",
  "privacy_policy_additions": "<specific paragraphs to add to privacy policy>",
  "next_review_date": "<recommended date for next assessment in YYYY-MM-DD format>"
}}

Return ONLY the JSON object, nothing else."""
