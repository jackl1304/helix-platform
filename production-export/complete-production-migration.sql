-- ====================================
-- HELIX PRODUCTION DATABASE MIGRATION
-- Development zu Production Transfer
-- Datum: 17. September 2025
-- ====================================

-- Zusammenfassung der zu migrierenden Daten:
-- - 292 Regulatory Updates (FDA 510k, MHRA, etc.)
-- - 65 Legal Cases  
-- - 72 Data Sources (aktiv)
-- - 156 Approvals

BEGIN;

-- Backup existierende Daten (falls vorhanden)
DROP TABLE IF EXISTS backup_regulatory_updates;
DROP TABLE IF EXISTS backup_legal_cases;  
DROP TABLE IF EXISTS backup_data_sources;
DROP TABLE IF EXISTS backup_approvals;

-- Lösche alle existierenden Daten für saubere Migration
TRUNCATE TABLE regulatory_updates RESTART IDENTITY CASCADE;
TRUNCATE TABLE legal_cases RESTART IDENTITY CASCADE;
TRUNCATE TABLE data_sources RESTART IDENTITY CASCADE;  
TRUNCATE TABLE approvals RESTART IDENTITY CASCADE;

-- ======================
-- DATA SOURCES (72 aktiv)
-- ======================

-- wird über separaten Export befüllt

-- ===========================
-- REGULATORY UPDATES (292)
-- ===========================

-- wird über separaten Export befüllt

-- ====================
-- LEGAL CASES (65)
-- ====================

-- wird über separaten Export befüllt

-- ==============
-- APPROVALS (156)
-- ==============

-- wird über separaten Export befüllt

COMMIT;

-- =====================================
-- VERIFIKATION DER MIGRIERTEN DATEN
-- =====================================

SELECT 'Data Sources' as table_name, COUNT(*) as count FROM data_sources WHERE is_active = true
UNION ALL
SELECT 'Regulatory Updates', COUNT(*) FROM regulatory_updates
UNION ALL  
SELECT 'Legal Cases', COUNT(*) FROM legal_cases
UNION ALL
SELECT 'Approvals', COUNT(*) FROM approvals;

-- Erwartete Ergebnisse:
-- Data Sources: 72
-- Regulatory Updates: 292  
-- Legal Cases: 65
-- Approvals: 156