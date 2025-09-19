# Helix Regulatory Intelligence Platform

## Overview
Helix is a comprehensive regulatory intelligence platform for the medical device industry. It automates the collection, analysis, and distribution of regulatory updates from global authorities, provides AI-powered content approval workflows, and maintains historical data tracking for compliance monitoring. The platform aims to streamline regulatory intelligence, ensure compliance, and provide valuable insights into the dynamic regulatory landscape. Its business vision includes ensuring compliance, providing valuable insights, and achieving 100% data quality, making it production-ready with advanced analytics and a polished user experience.

## Recent Changes (September 2025)

### 🎯 **CURSOR_READY** - Produktionsreife Version für Cursor IDE (16. September 2025)
**Vollständig optimierte, cursor-kompatible Version der Helix Plattform:**
- ✅ **Kritisches Caching-Problem behoben**: Tenant-Dashboard zeigt korrekte Zahlen (200 statt 3.719 Updates)
- ✅ **Frontend-Backend-Synchronisation**: Multi-Dashboard-Architektur korrekt implementiert
- ✅ **Professional Plan Limits**: Backend liefert 292 Records, Frontend begrenzt korrekt auf 200
- ✅ **Database-Konsistenz**: 292 unique records, perfekte Datenqualität, keine Duplikate
- ✅ **React Query Cache-Fix**: Alle Tenant-APIs verwenden staleTime: 0 für sofortige Updates
- ✅ **Code Quality**: Alle LSP-Diagnostikfehler behoben, sauberer TypeScript Code
- ✅ **Multi-API-Architektur**: Admin-Dashboard (/api/dashboard/stats) vs Tenant-Dashboard (/api/tenant/dashboard/stats)
- ✅ **Vollständiges Übersetzungssystem**: Komplettes Deutsch/Englisch Translation System mit useLanguage Hook
- ✅ **Customer Portal**: Funktionierender Kundenbereich mit allen Features und Berechtigungen
- ✅ **Live Updates**: Real-time Tenant-Permissions und Live-Synchronisation
- ✅ **Navigation**: Vollständig funktionierende Customer-Navigation mit Sprachumschaltung
- ✅ **Authentication**: Robuste Session-basierte Authentifizierung für Admin und Customer
- ✅ **Database**: Produktionsreife PostgreSQL-Integration mit Drizzle ORM
- ✅ **Performance**: Optimierte API-Calls und effiziente Datenverarbeitung
- ✅ **UI/UX**: Polierte Benutzeroberfläche mit modernem Design und Responsive Layout

### 🎯 **FINAL_V1** - Stabile Produktionsversion (3. September 2025)
**Vollständig funktionsfähige, produktionsreife Version der Helix Plattform:**
- ✅ Alle Kernfunktionen implementiert und getestet
- ✅ Vollständige Frontend-Backend-Integration
- ✅ Multi-Tenant-Architektur mit Subscription-Management

### Previous Updates (August 2025)
- **Multi-Tenant System**: Vollständige Implementierung der Tenant-Isolation mit abonnement-basiertem Dashboard (16. August 2025)
- **Subscription-Based Access**: Tenant-Dashboard zeigt nur Inhalte basierend auf Abonnement-Level (Basic/Professional/Enterprise)
- **Tenant Authentication**: Funktionierende Tenant-Anmeldung mit Demo-Credentials (admin@demo-medical.local/demo123)
- **Usage Limits**: Implementation von monatlichen Nutzungslimits und Feature-Beschränkungen je Abonnement
- **Isolated Dashboard**: Tenant-Dashboard ist vollständig getrennt vom Admin-Bereich mit eigener UI/UX
- **Deployment Fix**: Kritischer Deployment-Fehler behoben - Express app initialization komplett wiederhergestellt in server/index.ts (14. August 2025)
- **Production Build**: Build-Prozess funktioniert einwandfrei - dist/index.js wird korrekt generiert (995kb)
- **Server Startup**: Vollständige Express-Server-Konfiguration mit Middleware, CORS, Health-Check und graceful shutdown
- **Customer AI Insights**: Vollständig funktionsfähige KI-Insights API mit echten JSON-Daten implementiert
- **Code-Optimierung**: Umfassende Fehlerkorrektur und Optimierung durchgeführt (siehe Prüfungsbericht)
- **Drizzle ORM Migration**: Alle direkten SQL-Abfragen in Admin-Routen auf Drizzle ORM umgestellt
- **Produktionsreife Logging**: Konsistente Winston-Logger-Implementierung across alle Services
- **Dependency Updates**: Aktualisierte package.json mit neuesten Sicherheits-Updates
- **TypeScript Fixes**: Behebung aller kritischen TypeScript-Kompilierungsfehler

## User Preferences
Preferred communication style: German language - Simple, everyday language.

### Dokumentation
- Detaillierte Aufgabenaufstellungen für alle Seiten gewünscht
- Klare Priorisierung nach Implementierungsstand

### Cursor IDE Setup
- Projekt vollständig cursor-kompatibel vorbereitet (16. September 2025)
- Alle Dependencies korrekt konfiguriert
- TypeScript-Konfiguration optimiert
- LSP-Diagnostikfehler vollständig behoben
- Frontend-Backend-Caching-Probleme gelöst

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript (Strict Mode)
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite with ESBuild
- **Responsive Design**: Mobile-first approach
- **Code Quality**: ESLint with TypeScript rules, Prettier formatting
- **UI/UX Decisions**: Individual tab navigation for articles (Übersicht, Zusammenfassung, Vollständiger Inhalt, Finanzanalyse, KI-Analyse, Metadaten), device preview, accessibility tools (WCAG 2.1 AA Compliance), customization settings, premium executive dashboard look with gradient icons, live statistics, color-coded status badges, and comprehensive customer theme system with three color schemes (blue, purple, green) for personalized branding.

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM on Neon
- **TypeScript**: Full-stack TypeScript with shared schema definitions (Strict Mode)
- **Authentication**: Session-based
- **Logging**: Winston logger service
- **Error Handling**: Centralized error middleware
- **Validation**: Zod schemas for input validation
- **Security**: Rate limiting, input sanitization, security headers
- **API Design**: RESTful APIs with consistent JSON responses

### System Design
- **Core Services**: Clean Production Service, Data Collection Service, AI Approval System, Historical Data Management, AegisIntel Services Suite for AI-powered regulatory analysis.
- **Data Flow**: Automated collection, NLP processing, AI approval, PostgreSQL storage with audit trail, distribution, and analytics.
- **Key Features**: Multi-tenant SaaS architecture with subscription management and customer-specific dashboards, automated content categorization and evaluation using ML, intelligent categorization (device types, risk levels, compliance areas), real-time sentiment analysis, quality scoring, duplicate detection and cleanup, real-time monitoring, predictive analytics, data visualization, universal PDF export, comprehensive financial analysis (implementation costs, ROI, market impacts, risk assessments), advanced AI analysis (ML-based precedent analysis, success probabilities), intelligent search, color-coded hashtag system, comprehensive terminology compilation, global medical device approvals system, ongoing approvals management with project tracking, comprehensive customer portal theming system with three customizable color schemes (blue, purple, green), logo upload functionality, company branding customization, and full customer AI insights integration with real-time analysis capabilities.
- **Integration**: Secure connection to Pure Global's GRIP platform with encrypted credentials and automated data extraction.
- **Production Infrastructure**: Docker, Kubernetes, Prometheus, Grafana for automated deployment, health checks, and rollbacks.
- **Code Quality**: Comprehensive code optimization completed with Drizzle ORM migration, structured logging, and TypeScript error resolution. All admin routes converted from direct SQL to ORM for better maintainability and security.

## External Dependencies

### Database
- **Neon PostgreSQL**
- **Drizzle ORM**

### Email Services
- **Gmail SMTP** (deltawayshelixinfo@gmail.com) - Production Ready with App Password
- **Nodemailer** for Gmail integration
- **6 Professional Templates**: Onboarding, Offboarding, Billing, Alerts, Digest, Trial
- **SendGrid** (optional fallback)

### AI Services
- **Anthropic Claude**
- **Custom NLP Service**

### Data Sources
- **GRIP Global Intelligence Platform**
- **OpenFDA API** (510k, PMA, Recalls, Enforcement Actions)
- **MEDITECH FHIR API**
- **MEDITECH Device Registry**
- **MEDITECH Interoperability Services (IOPS)**
- **FDA Device Classification Database**
- **FDA UDI Database**
- **Web Scraping Framework** (BfArM, Swissmedic, Health Canada, MedTech newsletters)
- **Medical Design and Outsourcing**
- **Medtech Big 100 Companies**
- **JAMA Network**
- **Zühlke MedTech Case Studies**
- **Authentic Regulatory Data** (Australia TGA, IMDRF working groups, WHO GAMD indicators, FDA Cybersecurity, Post-Market Surveillance)

### Collaboration Tools
- **Pieces API**

### Frontend Libraries
- **React Ecosystem**
- **Radix UI primitives** with **shadcn/ui**
- **Recharts**
- **React Hook Form** with **Zod validation**