-- OpsOracle AI — Initial Schema
-- Uses ops_ prefix to avoid conflicts with existing Nanoneuron CRM tables

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS ops_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ops_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES ops_users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    extracted_text TEXT,
    rows_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ops_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES ops_reports(id) ON DELETE CASCADE,
    risk_score INTEGER DEFAULT 0,
    delay_probability INTEGER DEFAULT 0,
    inventory_risk INTEGER DEFAULT 0,
    bottleneck_summary TEXT,
    executive_summary TEXT,
    recommendations TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ops_reports_user_id ON ops_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_ops_insights_report_id ON ops_insights(report_id);
