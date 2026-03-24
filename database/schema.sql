-- AI DPDP Compliance Readiness Checker — PostgreSQL 15 Schema

CREATE TABLE IF NOT EXISTS assessments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_token   VARCHAR(64) UNIQUE NOT NULL,
    email           VARCHAR(255),
    business_name   VARCHAR(255),
    answers         JSONB NOT NULL DEFAULT '{}',
    status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'previewed', 'paid', 'completed')),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_assessments_session_token ON assessments(session_token);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON assessments(status);

CREATE TABLE IF NOT EXISTS reports (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id   UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    risk_score      INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
    preview_data    JSONB,
    full_data       JSONB,
    pdf_path        VARCHAR(500),
    access_token    VARCHAR(64) UNIQUE,
    is_paid         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reports_assessment_id ON reports(assessment_id);
CREATE INDEX IF NOT EXISTS idx_reports_access_token ON reports(access_token);
CREATE INDEX IF NOT EXISTS idx_reports_is_paid ON reports(is_paid);

CREATE TABLE IF NOT EXISTS payments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id   UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    razorpay_payment_id VARCHAR(255) UNIQUE,
    amount          INTEGER NOT NULL,
    currency        VARCHAR(10) NOT NULL DEFAULT 'INR',
    status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'success', 'failed')),
    webhook_payload JSONB,
    paid_at         TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_payments_assessment_id ON payments(assessment_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_payment_id ON payments(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

CREATE TABLE IF NOT EXISTS email_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id   UUID REFERENCES assessments(id) ON DELETE SET NULL,
    email           VARCHAR(255),
    type            VARCHAR(50) NOT NULL
                    CHECK (type IN ('report_ready', 'payment_confirm', 'report_link')),
    sent_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_email_logs_assessment_id ON email_logs(assessment_id);

-- Auto-update updated_at for assessments
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_assessments_updated_at
    BEFORE UPDATE ON assessments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
