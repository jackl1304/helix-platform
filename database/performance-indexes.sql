-- Performance-Optimierung für Helix Platform
-- Erstellt alle notwendigen Indizes für optimale Query-Performance

-- ==============================================
-- REGULATORY UPDATES OPTIMIERUNG
-- ==============================================

-- Index für Tenant-basierte Abfragen (am häufigsten verwendet)
CREATE INDEX IF NOT EXISTS idx_regulatory_updates_tenant_published 
ON regulatory_updates (tenant_id, published_date DESC);

-- Index für Source-basierte Abfragen
CREATE INDEX IF NOT EXISTS idx_regulatory_updates_source_published 
ON regulatory_updates (source_id, published_date DESC);

-- Index für Type-basierte Filterung
CREATE INDEX IF NOT EXISTS idx_regulatory_updates_type_tenant 
ON regulatory_updates (type, tenant_id, published_date DESC);

-- Index für Priority-basierte Abfragen
CREATE INDEX IF NOT EXISTS idx_regulatory_updates_priority_tenant 
ON regulatory_updates (priority, tenant_id, published_date DESC);

-- Composite Index für Dashboard-Abfragen
CREATE INDEX IF NOT EXISTS idx_regulatory_updates_dashboard 
ON regulatory_updates (tenant_id, is_processed, published_date DESC);

-- Index für Content-Suche (Full-Text Search)
CREATE INDEX IF NOT EXISTS idx_regulatory_updates_content_search 
ON regulatory_updates USING gin(to_tsvector('german', title || ' ' || coalesce(content, '')));

-- ==============================================
-- LEGAL CASES OPTIMIERUNG
-- ==============================================

-- Index für Tenant-basierte Abfragen
CREATE INDEX IF NOT EXISTS idx_legal_cases_tenant_decision 
ON legal_cases (tenant_id, decision_date DESC);

-- Index für Jurisdiction-basierte Abfragen
CREATE INDEX IF NOT EXISTS idx_legal_cases_jurisdiction_tenant 
ON legal_cases (jurisdiction, tenant_id, decision_date DESC);

-- Index für Court-basierte Abfragen
CREATE INDEX IF NOT EXISTS idx_legal_cases_court_tenant 
ON legal_cases (court, tenant_id, decision_date DESC);

-- Index für Impact Level
CREATE INDEX IF NOT EXISTS idx_legal_cases_impact_tenant 
ON legal_cases (impact_level, tenant_id, decision_date DESC);

-- Full-Text Search für Legal Cases
CREATE INDEX IF NOT EXISTS idx_legal_cases_content_search 
ON legal_cases USING gin(to_tsvector('german', title || ' ' || coalesce(summary, '') || ' ' || coalesce(content, '')));

-- ==============================================
-- DATA SOURCES OPTIMIERUNG
-- ==============================================

-- Index für aktive Data Sources
CREATE INDEX IF NOT EXISTS idx_data_sources_active_priority 
ON data_sources (is_active, priority, last_sync DESC);

-- Index für Country/Region-basierte Abfragen
CREATE INDEX IF NOT EXISTS idx_data_sources_country_region 
ON data_sources (country, region, is_active);

-- Index für Type-basierte Abfragen
CREATE INDEX IF NOT EXISTS idx_data_sources_type_active 
ON data_sources (type, is_active, priority);

-- ==============================================
-- USERS UND AUTHENTICATION OPTIMIERUNG
-- ==============================================

-- Index für Tenant-User-Lookups
CREATE INDEX IF NOT EXISTS idx_users_tenant_email 
ON users (tenant_id, email);

-- Index für Active Users
CREATE INDEX IF NOT EXISTS idx_users_active_tenant 
ON users (is_active, tenant_id, last_login DESC);

-- Index für Role-basierte Abfragen
CREATE INDEX IF NOT EXISTS idx_users_role_tenant 
ON users (role, tenant_id, is_active);

-- ==============================================
-- TENANT MANAGEMENT OPTIMIERUNG
-- ==============================================

-- Index für Tenant-Subdomain-Lookups
CREATE INDEX IF NOT EXISTS idx_tenants_subdomain_active 
ON tenants (subdomain, is_active);

-- Index für Custom Domain
CREATE INDEX IF NOT EXISTS idx_tenants_custom_domain 
ON tenants (custom_domain) WHERE custom_domain IS NOT NULL;

-- Index für Subscription Tier
CREATE INDEX IF NOT EXISTS idx_tenants_subscription_tier 
ON tenants (subscription_tier, is_active);

-- ==============================================
-- CHAT MESSAGES OPTIMIERUNG
-- ==============================================

-- Index für Tenant-Chat-Abfragen
CREATE INDEX IF NOT EXISTS idx_chat_messages_tenant_status 
ON chat_messages (tenant_id, status, created_at DESC);

-- Index für Message Type
CREATE INDEX IF NOT EXISTS idx_chat_messages_type_tenant 
ON chat_messages (message_type, tenant_id, created_at DESC);

-- Index für Priority-basierte Abfragen
CREATE INDEX IF NOT EXISTS idx_chat_messages_priority_tenant 
ON chat_messages (priority, tenant_id, status, created_at DESC);

-- ==============================================
-- FEEDBACK SYSTEM OPTIMIERUNG
-- ==============================================

-- Index für Tenant-Feedback
CREATE INDEX IF NOT EXISTS idx_feedback_tenant_status 
ON feedback (tenant_id, status, created_at DESC);

-- Index für Feedback Type
CREATE INDEX IF NOT EXISTS idx_feedback_type_tenant 
ON feedback (type, tenant_id, created_at DESC);

-- Index für Page-basierte Abfragen
CREATE INDEX IF NOT EXISTS idx_feedback_page_tenant 
ON feedback (page, tenant_id, created_at DESC);

-- ==============================================
-- SYNC RESULTS OPTIMIERUNG
-- ==============================================

-- Index für Data Source Sync Results
CREATE INDEX IF NOT EXISTS idx_sync_results_source_status 
ON sync_results (data_source_id, status, started_at DESC);

-- Index für Sync Type
CREATE INDEX IF NOT EXISTS idx_sync_results_type_started 
ON sync_results (sync_type, started_at DESC);

-- ==============================================
-- FDA DATA OPTIMIERUNG
-- ==============================================

-- FDA Drug Labels Indizes
CREATE INDEX IF NOT EXISTS idx_fda_drug_labels_tenant_application 
ON fda_drug_labels (tenant_id, application_number);

CREATE INDEX IF NOT EXISTS idx_fda_drug_labels_brand_tenant 
ON fda_drug_labels (brand_name, tenant_id);

CREATE INDEX IF NOT EXISTS idx_fda_drug_labels_generic_tenant 
ON fda_drug_labels (generic_name, tenant_id);

-- FDA Adverse Events Indizes
CREATE INDEX IF NOT EXISTS idx_fda_adverse_events_tenant_receipt 
ON fda_adverse_events (tenant_id, receipt_date DESC);

CREATE INDEX IF NOT EXISTS idx_fda_adverse_events_seriousness 
ON fda_adverse_events (seriousness, tenant_id, receipt_date DESC);

-- FDA Device Recalls Indizes
CREATE INDEX IF NOT EXISTS idx_fda_device_recalls_tenant_number 
ON fda_device_recalls (tenant_id, recall_number);

CREATE INDEX IF NOT EXISTS idx_fda_device_recalls_manufacturer_tenant 
ON fda_device_recalls (manufacturer, tenant_id, recall_initiation_date DESC);

-- ==============================================
-- PUBMED ARTICLES OPTIMIERUNG
-- ==============================================

-- Index für Tenant-PubMed-Abfragen
CREATE INDEX IF NOT EXISTS idx_pubmed_articles_tenant_published 
ON pubmed_articles (tenant_id, published_date DESC);

-- Index für Journal-basierte Abfragen
CREATE INDEX IF NOT EXISTS idx_pubmed_articles_journal_tenant 
ON pubmed_articles (journal, tenant_id, published_date DESC);

-- Index für Relevance Score
CREATE INDEX IF NOT EXISTS idx_pubmed_articles_relevance_tenant 
ON pubmed_articles (relevance_score DESC, tenant_id, published_date DESC);

-- Full-Text Search für PubMed
CREATE INDEX IF NOT EXISTS idx_pubmed_articles_content_search 
ON pubmed_articles USING gin(to_tsvector('english', title || ' ' || coalesce(abstract, '')));

-- ==============================================
-- CLINICAL TRIALS OPTIMIERUNG
-- ==============================================

-- Index für Tenant-Clinical-Trials
CREATE INDEX IF NOT EXISTS idx_clinical_trials_tenant_status 
ON clinical_trials (tenant_id, study_status, start_date DESC);

-- Index für Sponsor-basierte Abfragen
CREATE INDEX IF NOT EXISTS idx_clinical_trials_sponsor_tenant 
ON clinical_trials (sponsor, tenant_id, start_date DESC);

-- Index für Study Phase
CREATE INDEX IF NOT EXISTS idx_clinical_trials_phase_tenant 
ON clinical_trials (study_phase, tenant_id, start_date DESC);

-- ==============================================
-- ISO STANDARDS OPTIMIERUNG
-- ==============================================

-- Index für Tenant-ISO-Standards
CREATE INDEX IF NOT EXISTS idx_iso_standards_tenant_category 
ON iso_standards (tenant_id, category, status);

-- Index für Code-basierte Abfragen
CREATE INDEX IF NOT EXISTS idx_iso_standards_code_tenant 
ON iso_standards (code, tenant_id, status);

-- Index für Year-basierte Abfragen
CREATE INDEX IF NOT EXISTS idx_iso_standards_year_tenant 
ON iso_standards (year, tenant_id, status);

-- Full-Text Search für ISO Standards
CREATE INDEX IF NOT EXISTS idx_iso_standards_content_search 
ON iso_standards USING gin(to_tsvector('english', title || ' ' || coalesce(description, '')));

-- ==============================================
-- AI SUMMARIES OPTIMIERUNG
-- ==============================================

-- Index für Tenant-AI-Summaries
CREATE INDEX IF NOT EXISTS idx_ai_summaries_tenant_source 
ON ai_summaries (tenant_id, source_id, source_type);

-- Index für Summary Type
CREATE INDEX IF NOT EXISTS idx_ai_summaries_type_tenant 
ON ai_summaries (summary_type, tenant_id, created_at DESC);

-- Index für Status
CREATE INDEX IF NOT EXISTS idx_ai_summaries_status_tenant 
ON ai_summaries (status, tenant_id, created_at DESC);

-- ==============================================
-- WEBSITE ANALYTICS OPTIMIERUNG
-- ==============================================

-- Index für Tenant-Analytics
CREATE INDEX IF NOT EXISTS idx_analytics_tenant_page 
ON website_analytics (tenant_id, page, created_at DESC);

-- Index für Session-basierte Abfragen
CREATE INDEX IF NOT EXISTS idx_analytics_session_tenant 
ON website_analytics (session_id, tenant_id, created_at DESC);

-- Index für Country-basierte Abfragen
CREATE INDEX IF NOT EXISTS idx_analytics_country_tenant 
ON website_analytics (country, tenant_id, created_at DESC);

-- ==============================================
-- PARTIAL INDIZES FÜR BESSERE PERFORMANCE
-- ==============================================

-- Index nur für aktive Regulatory Updates
CREATE INDEX IF NOT EXISTS idx_regulatory_updates_active_only 
ON regulatory_updates (tenant_id, published_date DESC) 
WHERE is_processed = true;

-- Index nur für unverarbeitete Updates
CREATE INDEX IF NOT EXISTS idx_regulatory_updates_unprocessed 
ON regulatory_updates (tenant_id, created_at DESC) 
WHERE is_processed = false;

-- Index nur für kritische Legal Cases
CREATE INDEX IF NOT EXISTS idx_legal_cases_critical 
ON legal_cases (tenant_id, decision_date DESC) 
WHERE impact_level IN ('high', 'critical');

-- Index nur für offene Chat Messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_open 
ON chat_messages (tenant_id, created_at DESC) 
WHERE status = 'unread';

-- ==============================================
-- STATISTIKEN AKTUALISIEREN
-- ==============================================

-- Statistiken für alle Tabellen aktualisieren
ANALYZE regulatory_updates;
ANALYZE legal_cases;
ANALYZE data_sources;
ANALYZE users;
ANALYZE tenants;
ANALYZE chat_messages;
ANALYZE feedback;
ANALYZE sync_results;
ANALYZE fda_drug_labels;
ANALYZE fda_adverse_events;
ANALYZE fda_device_recalls;
ANALYZE pubmed_articles;
ANALYZE clinical_trials;
ANALYZE iso_standards;
ANALYZE ai_summaries;
ANALYZE website_analytics;

-- ==============================================
-- QUERY PERFORMANCE MONITORING
-- ==============================================

-- View für langsame Queries
CREATE OR REPLACE VIEW slow_queries AS
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows,
    100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements 
WHERE mean_time > 1000  -- Queries slower than 1 second
ORDER BY mean_time DESC;

-- View für Index-Nutzung
CREATE OR REPLACE VIEW index_usage AS
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE idx_scan = 0  -- Unused indexes
ORDER BY schemaname, tablename;

COMMENT ON DATABASE helix_platform IS 'Helix Regulatory Intelligence Platform - Optimized for Performance';
