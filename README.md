# DPDP Compliance Checker

> AI-powered DPDP Act 2023 compliance tool for Indian startups. Get a free risk score in 5 minutes, unlock a full action plan for ₹999.

## How It Works

1. **Answer 15 questions** about your data practices
2. **Get instant risk score** — Claude AI analyses against DPDP Act 2023
3. **Pay ₹999** to unlock full report + PDF download

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Flask 3.0 + Python 3.11 |
| Frontend | React 18 + Vite + TailwindCSS |
| Database | PostgreSQL 15 |
| AI | Claude claude-sonnet-4-20250514 (Anthropic) |
| Payments | Dodo Payments (₹999 one-time) |
| PDF | WeasyPrint |
| Emails | n8n workflows |

## Quick Start (Local Dev)

```bash
# 1. Clone and configure
cp .env.example .env
# Edit .env with your API keys

# 2. Start with Docker
docker-compose -f docker-compose.dev.yml up

# Frontend: http://localhost:3000
# Backend:  http://localhost:5000
# API Docs: http://localhost:5000/api/health
```

## Manual Setup (Without Docker)

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create database
createdb dpdp_checker
psql dpdp_checker < ../database/schema.sql

# Run
flask --app run run --debug
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

See `.env.example` for all required variables. Key ones:

```
ANTHROPIC_API_KEY=sk-ant-...
DODO_API_KEY=...
DODO_WEBHOOK_SECRET=...
DPDP_PRODUCT_ID=...
DATABASE_URL=postgresql://...
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/assessment/start` | Start assessment |
| POST | `/api/assessment/preview` | Get AI risk score (rate limited: 10/hr) |
| GET | `/api/assessment/:id` | Check status |
| POST | `/api/payment/create` | Create Dodo payment link |
| POST | `/api/payment/webhook` | Dodo webhook (HMAC verified) |
| GET | `/api/report/:token` | Get full report (paid only) |
| GET | `/api/report/:token/pdf` | Download PDF (paid only) |

## n8n Email Workflows

Import the JSON files from `n8n/workflows/` into your n8n instance:
- `payment_confirmation.json` — sent when payment is confirmed
- `report_ready_email.json` — sent when Claude finishes the full report

Set `N8N_PAYMENT_WEBHOOK_URL` and `N8N_REPORT_WEBHOOK_URL` in `.env`.

## Production Deployment (Hostinger VPS)

```bash
# 1. SSH into VPS
# 2. Clone repo and set up .env
# 3. Update nginx/nginx.conf with your domain
# 4. Run with production compose
docker-compose up -d

# SSL (Certbot)
certbot --nginx -d yourdomain.com
```

## Running Tests

```bash
cd backend
pytest tests/ -v --cov=app --cov-report=term-missing
```

## Project Structure

```
dpdp-checker/
├── backend/
│   ├── app/
│   │   ├── __init__.py        # Flask app factory
│   │   ├── config.py          # Config from env
│   │   ├── database.py        # SQLAlchemy setup
│   │   ├── models/            # DB models
│   │   ├── routes/            # API blueprints
│   │   ├── services/          # Claude, Dodo, PDF, Email
│   │   └── prompts/           # Claude prompt templates
│   ├── tests/
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── components/        # UI components
│       ├── pages/             # Route pages
│       ├── hooks/             # useReport, useAssessment
│       └── api/               # Axios client
├── database/
│   └── schema.sql
├── nginx/
│   └── nginx.conf
├── n8n/workflows/
├── docker-compose.yml
└── .env.example
```
