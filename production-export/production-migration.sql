-- ====================================
-- HELIX PRODUCTION DATABASE MIGRATION
-- Export aus Development Database
-- Datum: $(date)
-- ====================================

-- Data Sources (72 aktive Quellen)
BEGIN;

-- Lösche existierende Daten falls vorhanden
TRUNCATE TABLE data_sources, regulatory_updates, legal_cases, approvals RESTART IDENTITY CASCADE;

-- Exportiere alle Data Sources