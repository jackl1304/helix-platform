-- MedTech Data Platform Database Initialization Script
-- This script sets up the initial database schema and data

-- Create database if it doesn't exist
-- Note: This is handled by the POSTGRES_DB environment variable

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create custom types
CREATE TYPE approval_status AS ENUM ('approved', 'pending', 'submitted', 'rejected', 'withdrawn');
CREATE TYPE approval_type AS ENUM ('fda_510k', 'pma', 'ce_mark', 'mdr', 'ivd', 'iso', 'other');
CREATE TYPE region_type AS ENUM ('US', 'EU', 'Germany', 'Global', 'APAC', 'Canada', 'Australia', 'Japan', 'UK', 'Brazil', 'Singapore');
CREATE TYPE authority_type AS ENUM ('FDA', 'EMA', 'BfArM', 'ISO', 'IEC', 'Other', 'Health Canada', 'TGA', 'PMDA', 'MHRA', 'ANVISA', 'HSA');
CREATE TYPE priority_type AS ENUM ('high', 'medium', 'low');
CREATE TYPE device_class_type AS ENUM ('I', 'II', 'IIa', 'IIb', 'III', 'IVD', 'N/A');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_superuser BOOLEAN DEFAULT FALSE,
    permissions TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create data_sources table
CREATE TABLE IF NOT EXISTS data_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    type authority_type NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    last_synced TIMESTAMP WITH TIME ZONE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create approvals table
CREATE TABLE IF NOT EXISTS approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    approval_type approval_type NOT NULL,
    status approval_status NOT NULL,
    region region_type NOT NULL,
    authority authority_type NOT NULL,
    applicant_name VARCHAR(255),
    reference_number VARCHAR(255),
    device_class device_class_type,
    submitted_date TIMESTAMP WITH TIME ZONE,
    decision_date TIMESTAMP WITH TIME ZONE,
    summary TEXT,
    full_text TEXT,
    url TEXT,
    priority priority_type DEFAULT 'medium',
    category VARCHAR(100) DEFAULT 'device',
    tags TEXT[] DEFAULT '{}',
    attachments TEXT[] DEFAULT '{}',
    related_documents TEXT[] DEFAULT '{}',
    detailed_analysis JSONB,
    metadata JSONB,
    data_source_id UUID REFERENCES data_sources(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create regulatory_updates table
CREATE TABLE IF NOT EXISTS regulatory_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    source VARCHAR(255) NOT NULL,
    url TEXT,
    published_date TIMESTAMP WITH TIME ZONE,
    category VARCHAR(100),
    tags TEXT[] DEFAULT '{}',
    metadata JSONB,
    data_source_id UUID REFERENCES data_sources(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create knowledge_articles table
CREATE TABLE IF NOT EXISTS knowledge_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    tags TEXT[] DEFAULT '{}',
    author VARCHAR(255),
    published_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_published BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status);
CREATE INDEX IF NOT EXISTS idx_approvals_approval_type ON approvals(approval_type);
CREATE INDEX IF NOT EXISTS idx_approvals_region ON approvals(region);
CREATE INDEX IF NOT EXISTS idx_approvals_authority ON approvals(authority);
CREATE INDEX IF NOT EXISTS idx_approvals_priority ON approvals(priority);
CREATE INDEX IF NOT EXISTS idx_approvals_decision_date ON approvals(decision_date);
CREATE INDEX IF NOT EXISTS idx_approvals_created_at ON approvals(created_at);
CREATE INDEX IF NOT EXISTS idx_approvals_title_gin ON approvals USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_approvals_summary_gin ON approvals USING gin(to_tsvector('english', summary));
CREATE INDEX IF NOT EXISTS idx_approvals_full_text_gin ON approvals USING gin(to_tsvector('english', full_text));
CREATE INDEX IF NOT EXISTS idx_approvals_tags_gin ON approvals USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_approvals_metadata_gin ON approvals USING gin(metadata);

CREATE INDEX IF NOT EXISTS idx_regulatory_updates_source ON regulatory_updates(source);
CREATE INDEX IF NOT EXISTS idx_regulatory_updates_category ON regulatory_updates(category);
CREATE INDEX IF NOT EXISTS idx_regulatory_updates_published_date ON regulatory_updates(published_date);
CREATE INDEX IF NOT EXISTS idx_regulatory_updates_title_gin ON regulatory_updates USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_regulatory_updates_content_gin ON regulatory_updates USING gin(to_tsvector('english', content));

CREATE INDEX IF NOT EXISTS idx_knowledge_articles_category ON knowledge_articles(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_published ON knowledge_articles(is_published);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_title_gin ON knowledge_articles USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_content_gin ON knowledge_articles USING gin(to_tsvector('english', content));

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_data_sources_updated_at BEFORE UPDATE ON data_sources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_approvals_updated_at BEFORE UPDATE ON approvals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_regulatory_updates_updated_at BEFORE UPDATE ON regulatory_updates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_articles_updated_at BEFORE UPDATE ON knowledge_articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial data sources
INSERT INTO data_sources (name, url, type, status, description) VALUES
('FDA 510(k) Database', 'https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpmn/pmn.cfm', 'FDA', 'active', 'FDA 510(k) Premarket Notification Database'),
('FDA PMA Database', 'https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpma/pma.cfm', 'FDA', 'active', 'FDA Premarket Approval Database'),
('EMA Database', 'https://www.ema.europa.eu/en/medicines', 'EMA', 'active', 'European Medicines Agency Database'),
('BfArM Database', 'https://www.bfarm.de/EN/BfArM/Tasks/Medical-devices/_node.html', 'BfArM', 'active', 'German Federal Institute for Drugs and Medical Devices'),
('Health Canada Database', 'https://www.canada.ca/en/health-canada/services/drugs-health-products/medical-devices.html', 'Health Canada', 'active', 'Health Canada Medical Devices Database'),
('TGA Database', 'https://www.tga.gov.au/medical-devices', 'TGA', 'active', 'Therapeutic Goods Administration Database'),
('PMDA Database', 'https://www.pmda.go.jp/english/review-services/outline/0004.html', 'PMDA', 'active', 'Pharmaceuticals and Medical Devices Agency Database'),
('MHRA Database', 'https://www.gov.uk/government/organisations/medicines-and-healthcare-products-regulatory-agency', 'MHRA', 'active', 'Medicines and Healthcare products Regulatory Agency Database'),
('ANVISA Database', 'https://www.gov.br/anvisa/pt-br/assuntos/medicamentos', 'ANVISA', 'active', 'Brazilian Health Regulatory Agency Database'),
('HSA Database', 'https://www.hsa.gov.sg/medical-devices', 'HSA', 'active', 'Health Sciences Authority Database')
ON CONFLICT (name) DO NOTHING;

-- Insert initial admin user (password: admin123)
INSERT INTO users (email, name, password_hash, is_active, is_superuser, permissions) VALUES
('admin@medtech.com', 'Admin User', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXz6/9Z5q5e2', TRUE, TRUE, ARRAY['read_approvals', 'write_approvals', 'admin'])
ON CONFLICT (email) DO NOTHING;

-- Insert sample knowledge articles
INSERT INTO knowledge_articles (title, content, category, tags, author, is_published) VALUES
('FDA 510(k) Submission Guide', 'Comprehensive guide for FDA 510(k) submissions including requirements, timelines, and best practices.', 'Regulatory Guidance', ARRAY['FDA', '510k', 'submission', 'guide'], 'Admin User', TRUE),
('EU MDR Compliance Checklist', 'Step-by-step checklist for EU Medical Device Regulation compliance.', 'Regulatory Guidance', ARRAY['EU', 'MDR', 'compliance', 'checklist'], 'Admin User', TRUE),
('Quality Management System Setup', 'Guide to setting up a Quality Management System for medical device manufacturers.', 'Quality Management', ARRAY['QMS', 'quality', 'management', 'system'], 'Admin User', TRUE),
('Risk Management for Medical Devices', 'Overview of risk management principles and implementation for medical devices.', 'Risk Management', ARRAY['risk', 'management', 'medical', 'devices'], 'Admin User', TRUE),
('Clinical Evaluation Requirements', 'Understanding clinical evaluation requirements for medical device approvals.', 'Clinical Affairs', ARRAY['clinical', 'evaluation', 'requirements', 'medical'], 'Admin User', TRUE)
ON CONFLICT DO NOTHING;

-- Create views for common queries
CREATE OR REPLACE VIEW approval_summary AS
SELECT 
    a.id,
    a.title,
    a.approval_type,
    a.status,
    a.region,
    a.authority,
    a.applicant_name,
    a.reference_number,
    a.decision_date,
    a.priority,
    a.created_at,
    ds.name as data_source_name
FROM approvals a
LEFT JOIN data_sources ds ON a.data_source_id = ds.id;

CREATE OR REPLACE VIEW approval_statistics AS
SELECT 
    COUNT(*) as total_approvals,
    COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
    COUNT(*) FILTER (WHERE status = 'submitted') as submitted_count,
    COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
    COUNT(*) FILTER (WHERE status = 'withdrawn') as withdrawn_count,
    COUNT(DISTINCT region) as region_count,
    COUNT(DISTINCT authority) as authority_count,
    COUNT(DISTINCT approval_type) as type_count
FROM approvals;

-- Create functions for common operations
CREATE OR REPLACE FUNCTION search_approvals(search_term TEXT)
RETURNS TABLE (
    id UUID,
    title TEXT,
    approval_type approval_type,
    status approval_status,
    region region_type,
    authority authority_type,
    applicant_name VARCHAR(255),
    reference_number VARCHAR(255),
    decision_date TIMESTAMP WITH TIME ZONE,
    priority priority_type,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.title,
        a.approval_type,
        a.status,
        a.region,
        a.authority,
        a.applicant_name,
        a.reference_number,
        a.decision_date,
        a.priority,
        a.created_at
    FROM approvals a
    WHERE 
        to_tsvector('english', a.title || ' ' || COALESCE(a.summary, '') || ' ' || COALESCE(a.applicant_name, '')) @@ plainto_tsquery('english', search_term)
        OR a.reference_number ILIKE '%' || search_term || '%'
    ORDER BY a.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO postgres;

-- Create a read-only user for monitoring
CREATE USER medtech_readonly WITH PASSWORD 'readonly_password';
GRANT CONNECT ON DATABASE medtech_db TO medtech_readonly;
GRANT USAGE ON SCHEMA public TO medtech_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO medtech_readonly;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO medtech_readonly;
