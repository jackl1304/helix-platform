# Helix Platform - VS Code Package

## Übersicht
Dieses Paket enthält die komplette Helix Regulatory Intelligence Platform für die lokale Entwicklung mit VS Code.

## Enthaltene Dateien
- Vollständiger Quellcode (Frontend & Backend)
- Datenbank-Schema (helix_database_schema.sql)
- Konfigurationsdateien (package.json, tsconfig.json, vite.config.ts, etc.)
- Assets und Bilder
- Dokumentation
- Entwicklungsumgebung Setup

## Installation & Setup

### 1. Voraussetzungen
```bash
# Node.js (empfohlen: v18+)
# PostgreSQL-Datenbank
# Git
```

### 2. Dependencies installieren
```bash
npm install
```

### 3. Datenbank Setup
```bash
# Datenbank erstellen und Schema importieren
psql -U your_user -d your_database -f helix_database_schema.sql

# Drizzle Schema sync
npm run db:push
```

### 4. Environment Variables
Erstelle eine `.env` Datei:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/helix_db
NODE_ENV=development
```

### 5. Anwendung starten
```bash
# Development Server
npm run dev

# Build für Production
npm run build
```

## Projektstruktur
```
helix-platform/
├── client/           # Frontend (React + Vite)
├── server/           # Backend (Express)
├── shared/           # Gemeinsame Types & Schema
├── assets/           # Statische Assets
├── attached_assets/  # Benutzer-uploads
└── dist/            # Build Output
```

## Features
- Multi-Tenant Architektur
- Regulatory Intelligence
- Medical Device Standards
- Legal Cases Database
- FDA Data Integration
- Newsletter System
- Knowledge Base
- Analytics Dashboard

## API Endpoints
- `/api/health` - Health Check
- `/api/legal-cases` - Legal Cases
- `/api/regulatory-updates` - Regulatory Updates
- `/api/data-sources` - Data Sources
- `/api/medical-device-standards` - Standards
- `/api/feedback` - User Feedback

## Development Notes
- Database: PostgreSQL mit Drizzle ORM
- Frontend: React + TypeScript + Tailwind CSS
- Backend: Express.js + TypeScript
- Build Tool: Vite
- Testing: Jest (wenn konfiguriert)

## Deployment
Das System ist für VPS/Server Deployment vorbereitet mit:
- Nginx Reverse Proxy Konfiguration
- SSL/TLS Setup
- Systemd Service Files
- Automatische Backups

## Support
Bei Fragen zur Einrichtung siehe die anderen Markdown-Dateien in diesem Package.