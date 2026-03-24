import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    # Database
    DATABASE_URL: str = os.environ["DATABASE_URL"]

    # Flask
    SECRET_KEY: str = os.environ.get("SECRET_KEY", "change-me-in-production")
    FLASK_ENV: str = os.environ.get("FLASK_ENV", "production")
    DEBUG: bool = os.environ.get("FLASK_ENV", "production") == "development"

    # URLs
    FRONTEND_URL: str = os.environ.get("FRONTEND_URL", "http://localhost:5173")
    BACKEND_URL: str = os.environ.get("BACKEND_URL", "http://localhost:5000")

    # Claude AI (disabled temporarily — using OpenAI)
    ANTHROPIC_API_KEY: str = os.environ.get("ANTHROPIC_API_KEY", "")
    CLAUDE_MODEL: str = os.environ.get("CLAUDE_MODEL", "claude-sonnet-4-20250514")

    # OpenAI (temporary fallback while Anthropic credits are being added)
    OPENAI_API_KEY: str = os.environ.get("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")

    # Razorpay
    RAZORPAY_KEY_ID: str = os.environ.get("RAZORPAY_KEY_ID", "")
    RAZORPAY_KEY_SECRET: str = os.environ.get("RAZORPAY_KEY_SECRET", "")
    RAZORPAY_WEBHOOK_SECRET: str = os.environ.get("RAZORPAY_WEBHOOK_SECRET", "")

    # n8n Webhooks
    N8N_PAYMENT_WEBHOOK: str = os.environ.get("N8N_PAYMENT_WEBHOOK_URL", "")
    N8N_REPORT_WEBHOOK: str = os.environ.get("N8N_REPORT_WEBHOOK_URL", "")

    # PDF storage
    PDF_STORAGE_PATH: str = os.environ.get("PDF_STORAGE_PATH", "/tmp/dpdp_reports")
