import os
import logging
from app.config import Config

logger = logging.getLogger(__name__)


def _build_html(report_data: dict, business_name: str) -> str:
    """Build styled HTML for PDF generation from report JSON data."""
    full = report_data.get("full_data", {}) or {}
    risk_score = report_data.get("risk_score", 0)
    score_breakdown = full.get("score_breakdown", {})
    all_gaps = full.get("all_gaps", [])
    action_plan = full.get("action_plan", [])
    compliant_areas = full.get("compliant_areas", [])
    executive_summary = full.get("executive_summary", "")
    consent_notice = full.get("consent_notice_template", "")
    privacy_additions = full.get("privacy_policy_additions", "")

    severity_colors = {
        "Critical": "#dc2626",
        "High": "#ea580c",
        "Medium": "#ca8a04",
        "Low": "#16a34a",
    }

    gaps_html = ""
    for gap in all_gaps:
        color = severity_colors.get(gap.get("severity", "Low"), "#6b7280")
        steps = "".join(f"<li>{s}</li>" for s in gap.get("remediation_steps", []))
        gaps_html += f"""
        <div class="gap-item">
            <div class="gap-header">
                <span class="severity-badge" style="background:{color}">{gap.get('severity','')}</span>
                <strong>{gap.get('title','')}</strong>
                <span class="clause">{gap.get('dpdp_clause','')}</span>
            </div>
            <p>{gap.get('description','')}</p>
            <p><strong>Business Impact:</strong> {gap.get('business_impact','')}</p>
            <ul>{steps}</ul>
        </div>"""

    actions_html = ""
    for action in action_plan:
        template = action.get('template_text', '')
        template_block = f"<div class='template-text'><em>Template:</em><br>{template}</div>" if template else ""
        actions_html += f"""
        <div class="action-item">
            <span class="priority-badge">Priority {action.get('priority','')}</span>
            <strong>{action.get('action','')}</strong>
            <span class="deadline">{action.get('deadline','')} &middot; {action.get('effort','')} effort</span>
            <div class="clause-ref">{action.get('dpdp_clause','')}</div>
            {template_block}
        </div>"""

    breakdown_html = "".join(
        f"<div class='score-row'><span>{k.replace('_',' ').title()}</span>"
        f"<div class='bar'><div class='fill' style='width:{v}%'></div></div>"
        f"<span>{v}</span></div>"
        for k, v in score_breakdown.items()
    )

    compliant_html = "".join(
        f"<div class='compliant-item'><strong>{c.get('area','')}</strong>"
        f"<p>{c.get('description','')}</p></div>"
        for c in compliant_areas
    )

    return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body {{ font-family: Arial, sans-serif; font-size: 12px; color: #1f2937; margin: 0; padding: 20px; }}
  h1 {{ color: #1e40af; font-size: 22px; border-bottom: 2px solid #1e40af; padding-bottom: 8px; }}
  h2 {{ color: #1e40af; font-size: 16px; margin-top: 24px; }}
  .gap-item, .action-item {{ border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; margin: 8px 0; }}
  .gap-header {{ display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }}
  .severity-badge {{ padding: 2px 8px; border-radius: 12px; color: white; font-size: 10px; font-weight: bold; }}
  .priority-badge {{ padding: 2px 8px; border-radius: 12px; background: #1e40af; color: white; font-size: 10px; margin-right: 8px; }}
  .clause {{ font-size: 10px; color: #6b7280; }}
  .deadline {{ font-size: 10px; color: #6b7280; display: block; margin-top: 4px; }}
  .clause-ref {{ font-size: 10px; color: #6b7280; margin-top: 4px; }}
  .score-row {{ display: flex; align-items: center; gap: 8px; margin: 4px 0; }}
  .bar {{ flex: 1; height: 8px; background: #e5e7eb; border-radius: 4px; }}
  .fill {{ height: 100%; background: #1e40af; border-radius: 4px; }}
  .compliant-item {{ background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px; margin: 6px 0; }}
  .consent-box {{ background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 12px; font-size: 11px; }}
  .template-text {{ background: #f8fafc; border-left: 3px solid #1e40af; padding: 8px; margin-top: 8px; font-size: 11px; color: #374151; }}
  .footer {{ margin-top: 32px; font-size: 10px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 8px; }}
</style>
</head>
<body>
  <h1>DPDP Compliance Report &mdash; {business_name}</h1>
  <p><strong>Overall Risk Score:</strong> <span style="color:#dc2626;font-size:18px;font-weight:bold">{risk_score}/100</span></p>
  <h2>Executive Summary</h2>
  <p>{executive_summary}</p>
  <h2>Score Breakdown</h2>
  {breakdown_html}
  <h2>Compliance Gaps</h2>
  {gaps_html}
  <h2>Action Plan</h2>
  {actions_html}
  <h2>What You're Doing Right</h2>
  {compliant_html}
  <h2>Consent Notice Template</h2>
  <div class="consent-box">{consent_notice}</div>
  <h2>Privacy Policy Additions</h2>
  <div class="consent-box">{privacy_additions}</div>
  <div class="footer">
    Generated by AI DPDP Compliance Readiness Checker &middot;
    Digital Personal Data Protection Act, 2023 &amp; DPDP Rules, 2025
  </div>
</body>
</html>"""


def generate_pdf(report_data: dict, business_name: str) -> str:
    """
    Generate a PDF from report data using WeasyPrint.
    Returns the absolute path to the saved PDF file.
    """
    try:
        from weasyprint import HTML
    except ImportError as e:
        logger.error("WeasyPrint not installed: %s", e)
        raise

    os.makedirs(Config.PDF_STORAGE_PATH, exist_ok=True)

    report_id = str(report_data.get("id", "unknown"))
    pdf_path = os.path.join(Config.PDF_STORAGE_PATH, f"dpdp_report_{report_id}.pdf")

    html_content = _build_html(report_data, business_name)
    HTML(string=html_content).write_pdf(pdf_path)

    logger.info("PDF generated: %s", pdf_path)
    return pdf_path
