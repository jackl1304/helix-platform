# MedTech Data Platform

Eine umfassende, moderne Plattform für die Verwaltung und Analyse von MedTech-Daten aus über 400 regulatorischen Quellen weltweit.

## 🚀 Features

### Backend (FastAPI)
- **Moderne API-Architektur**: RESTful APIs mit FastAPI und Pydantic
- **Umfassende Datenmodelle**: Hierarchische Struktur für MedTech-Daten
- **Mehrfache Datenvalidierung**: Robuste Validierung mit Zod und Pydantic
- **Echtzeitdaten**: Integration von 400+ regulatorischen Quellen
- **Sicherheit**: OWASP-konforme Sicherheitsmaßnahmen
- **Monitoring**: Prometheus, Grafana und ELK Stack Integration
- **Caching**: Redis-basiertes Caching für optimale Performance
- **Background Tasks**: Celery für asynchrone Verarbeitung

### Frontend (React)
- **Moderne UI**: React 18 mit Tailwind CSS und shadcn/ui
- **State Management**: TanStack Query für optimale Datenverwaltung
- **Routing**: Wouter für client-side Routing
- **Internationalisierung**: Mehrsprachige Unterstützung
- **Responsive Design**: Mobile-first Ansatz
- **Accessibility**: WCAG-konforme Barrierefreiheit
- **Performance**: Lazy Loading und Code Splitting

### Datenintegration
- **400+ Quellen**: FDA, EMA, BfArM, Health Canada, TGA, PMDA, MHRA, ANVISA, HSA
- **Echtzeit-Scraping**: Automatische Datenaktualisierung
- **Datenbereinigung**: Intelligente Duplikaterkennung und -bereinigung
- **Datenanreicherung**: Kontextuelle Analyse und Risikobewertung
- **Caching**: Intelligentes Caching für optimale Performance

### Monitoring & Observability
- **Prometheus**: Metriken-Sammlung und -Überwachung
- **Grafana**: Dashboards und Visualisierung
- **ELK Stack**: Zentralisierte Protokollierung
- **Jaeger**: Distributed Tracing
- **Health Checks**: Automatische Gesundheitsüberprüfung

## 📋 Voraussetzungen

### Systemanforderungen
- **Docker**: Version 20.10 oder höher
- **Docker Compose**: Version 2.0 oder höher
- **Node.js**: Version 18 oder höher (für lokale Entwicklung)
- **Python**: Version 3.11 oder höher (für lokale Entwicklung)
- **Git**: Für Versionskontrolle

### Mindestressourcen
- **RAM**: 8GB (empfohlen: 16GB)
- **CPU**: 4 Kerne (empfohlen: 8 Kerne)
- **Speicher**: 50GB freier Speicherplatz
- **Netzwerk**: Stabile Internetverbindung

## 🛠️ Installation

### Schnellstart mit Docker

1. **Repository klonen**:
   ```bash
   git clone https://github.com/your-org/medtech-platform.git
   cd medtech-platform
   ```

2. **Setup-Skript ausführen**:
   
   **Linux/macOS**:
   ```bash
   chmod +x scripts/setup.sh
   ./scripts/setup.sh setup
   ```
   
   **Windows PowerShell**:
   ```powershell
   .\scripts\setup.ps1 setup
   ```

3. **Services starten**:
   ```bash
   docker-compose up -d
   ```

### Manuelle Installation

#### Backend Setup

1. **Python-Umgebung einrichten**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Linux/macOS
   # oder
   venv\Scripts\activate     # Windows
   ```

2. **Abhängigkeiten installieren**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Umgebungsvariablen konfigurieren**:
   ```bash
   cp .env.example .env
   # Bearbeiten Sie .env mit Ihren Einstellungen
   ```

4. **Datenbank migrieren**:
   ```bash
   alembic upgrade head
   ```

5. **Backend starten**:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

#### Frontend Setup

1. **Node.js-Abhängigkeiten installieren**:
   ```bash
   cd frontend
   npm install
   ```

2. **Umgebungsvariablen konfigurieren**:
   ```bash
   cp .env.example .env
   # Bearbeiten Sie .env mit Ihren Einstellungen
   ```

3. **Frontend starten**:
   ```bash
   npm run dev
   ```

## 🐳 Docker-Container

### Services

| Service | Port | Beschreibung |
|---------|------|--------------|
| Frontend | 3000 | React-Anwendung |
| Backend | 8000 | FastAPI-API |
| Database | 5432 | PostgreSQL |
| Redis | 6379 | Cache und Session Store |
| Nginx | 80/443 | Reverse Proxy |
| Prometheus | 9090 | Metriken-Sammlung |
| Grafana | 3001 | Dashboards |
| Elasticsearch | 9200 | Such-Engine |
| Kibana | 5601 | Log-Visualisierung |
| Jaeger | 16686 | Distributed Tracing |
| MinIO | 9000/9001 | Objekt-Speicher |
| Flower | 5555 | Celery-Monitoring |

### Container-Management

```bash
# Alle Services starten
docker-compose up -d

# Services stoppen
docker-compose down

# Services neu starten
docker-compose restart

# Logs anzeigen
docker-compose logs -f [service-name]

# Container-Status prüfen
docker-compose ps

# Images neu bauen
docker-compose build

# Volumes löschen
docker-compose down -v
```

## 🔧 Konfiguration

### Umgebungsvariablen

#### Backend (.env)
```env
# Datenbank
DATABASE_URL=postgresql://postgres:password@localhost:5432/medtech_db

# Redis
REDIS_URL=redis://localhost:6379

# FastAPI
ENVIRONMENT=development
DEBUG=True
SECRET_KEY=your-secret-key-here

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Monitoring
ENABLE_METRICS=True
METRICS_PORT=8001
```

#### Frontend (.env)
```env
# API
REACT_APP_API_URL=http://localhost:8000
REACT_APP_ENVIRONMENT=development

# Features
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_MONITORING=false
```

### Datenbank-Konfiguration

Die Plattform verwendet PostgreSQL mit folgenden Standardeinstellungen:

- **Host**: localhost
- **Port**: 5432
- **Datenbank**: medtech_db
- **Benutzer**: postgres
- **Passwort**: password

### Redis-Konfiguration

Redis wird für Caching und Session-Management verwendet:

- **Host**: localhost
- **Port**: 6379
- **Passwort**: password

## 🧪 Testing

### Backend-Tests

```bash
cd backend

# Alle Tests ausführen
pytest

# Mit Coverage
pytest --cov=app --cov-report=html

# Spezifische Tests
pytest tests/test_approvals.py

# Linting
flake8 app/ tests/
black app/ tests/
isort app/ tests/

# Type Checking
mypy app/
```

### Frontend-Tests

```bash
cd frontend

# Alle Tests ausführen
npm test

# Mit Coverage
npm run test:coverage

# Linting
npm run lint

# Type Checking
npm run type-check
```

### Integration-Tests

```bash
# E2E-Tests mit Cypress
npm run test:e2e

# API-Tests
npm run test:api
```

## 📊 Monitoring

### Prometheus

Prometheus sammelt Metriken von allen Services:
- **URL**: http://localhost:9090
- **Metriken**: HTTP-Requests, Datenbank-Performance, System-Ressourcen

### Grafana

Grafana bietet Dashboards für die Visualisierung:
- **URL**: http://localhost:3001
- **Benutzer**: admin
- **Passwort**: admin

### ELK Stack

Zentralisierte Protokollierung und Analyse:
- **Elasticsearch**: http://localhost:9200
- **Kibana**: http://localhost:5601

### Jaeger

Distributed Tracing für Microservices:
- **URL**: http://localhost:16686

## 🔒 Sicherheit

### Authentifizierung

Die Plattform unterstützt verschiedene Authentifizierungsmethoden:

- **JWT-Token**: Stateless Authentifizierung
- **OAuth2**: Integration mit externen Providern
- **Session-basiert**: Traditionelle Session-Verwaltung

### Autorisierung

Rollenbasierte Zugriffskontrolle (RBAC):

- **Admin**: Vollzugriff auf alle Funktionen
- **Editor**: Bearbeitung von Daten
- **Viewer**: Nur Lesezugriff
- **API-User**: Programmatischer Zugriff

### Sicherheitsmaßnahmen

- **HTTPS**: SSL/TLS-Verschlüsselung
- **CORS**: Konfigurierbare Cross-Origin-Richtlinien
- **Rate Limiting**: Schutz vor Missbrauch
- **Input Validation**: Umfassende Eingabevalidierung
- **SQL Injection Protection**: Parametrisierte Abfragen
- **XSS Protection**: Content Security Policy

## 🚀 Deployment

### Produktions-Deployment

1. **Umgebungsvariablen konfigurieren**:
   ```bash
   cp .env.production .env
   # Produktionseinstellungen bearbeiten
   ```

2. **SSL-Zertifikate einrichten**:
   ```bash
   mkdir ssl
   # Zertifikate in ssl/ ablegen
   ```

3. **Produktions-Build**:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### CI/CD-Pipeline

Die Plattform verwendet GitHub Actions für CI/CD:

- **Automatische Tests**: Bei jedem Push/PR
- **Security Scanning**: Trivy für Vulnerabilities
- **Docker Builds**: Automatische Image-Erstellung
- **Deployment**: Automatisches Deployment nach Tests

### Skalierung

#### Horizontal Scaling

```bash
# Mehr Backend-Instanzen
docker-compose up -d --scale backend=3

# Load Balancer konfigurieren
# Nginx-Konfiguration anpassen
```

#### Vertical Scaling

```bash
# Ressourcen-Limits in docker-compose.yml anpassen
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
```

## 📚 API-Dokumentation

### OpenAPI/Swagger

- **Development**: http://localhost:8000/docs
- **Production**: https://api.medtech-platform.com/docs

### API-Endpunkte

#### Approvals
- `GET /api/v1/approvals` - Alle Zulassungen abrufen
- `POST /api/v1/approvals` - Neue Zulassung erstellen
- `GET /api/v1/approvals/{id}` - Spezifische Zulassung abrufen
- `PUT /api/v1/approvals/{id}` - Zulassung aktualisieren
- `DELETE /api/v1/approvals/{id}` - Zulassung löschen

#### Regulatory Updates
- `GET /api/v1/regulatory-updates` - Regulatorische Updates
- `GET /api/v1/regulatory-updates/{id}` - Spezifisches Update

#### Data Sources
- `GET /api/v1/data-sources` - Alle Datenquellen
- `POST /api/v1/data-sources` - Neue Datenquelle hinzufügen

### Authentifizierung

```bash
# Token abrufen
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@medtech.com", "password": "admin123"}'

# Authentifizierte Anfrage
curl -X GET "http://localhost:8000/api/v1/approvals" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔧 Entwicklung

### Entwicklungsumgebung

1. **Code-Formatierung**:
   ```bash
   # Backend
   black app/ tests/
   isort app/ tests/
   
   # Frontend
   npm run format
   ```

2. **Pre-commit Hooks**:
   ```bash
   pre-commit install
   ```

3. **IDE-Konfiguration**:
   - VS Code mit Extensions für Python, TypeScript, Docker
   - PyCharm für Backend-Entwicklung
   - WebStorm für Frontend-Entwicklung

### Code-Struktur

```
medtech-platform/
├── backend/                 # FastAPI Backend
│   ├── app/
│   │   ├── api/            # API-Endpunkte
│   │   ├── core/           # Kern-Konfiguration
│   │   ├── models/         # Datenmodelle
│   │   ├── services/       # Geschäftslogik
│   │   └── utils/          # Hilfsfunktionen
│   ├── tests/              # Tests
│   └── requirements.txt    # Python-Abhängigkeiten
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/     # React-Komponenten
│   │   ├── pages/          # Seiten
│   │   ├── hooks/          # Custom Hooks
│   │   ├── services/       # API-Services
│   │   └── utils/          # Hilfsfunktionen
│   ├── public/             # Statische Dateien
│   └── package.json        # Node.js-Abhängigkeiten
├── docker-compose.yml      # Docker-Services
├── nginx/                  # Nginx-Konfiguration
├── monitoring/             # Monitoring-Konfiguration
└── scripts/                # Setup-Skripte
```

### Git-Workflow

1. **Feature-Branch erstellen**:
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Änderungen committen**:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

3. **Pull Request erstellen**:
   ```bash
   git push origin feature/new-feature
   ```

4. **Code Review und Merge**

### Debugging

#### Backend-Debugging

```bash
# Debug-Modus aktivieren
export DEBUG=True

# Logs anzeigen
docker-compose logs -f backend

# In Container einsteigen
docker-compose exec backend bash
```

#### Frontend-Debugging

```bash
# Development-Server mit Debug-Info
npm run dev

# Browser DevTools verwenden
# React DevTools Extension installieren
```

## 🐛 Troubleshooting

### Häufige Probleme

#### Docker-Probleme

```bash
# Container-Status prüfen
docker-compose ps

# Logs anzeigen
docker-compose logs [service-name]

# Container neu starten
docker-compose restart [service-name]

# Images neu bauen
docker-compose build --no-cache [service-name]
```

#### Datenbank-Probleme

```bash
# Datenbank-Verbindung testen
docker-compose exec db psql -U postgres -d medtech_db

# Migrations ausführen
docker-compose exec backend alembic upgrade head

# Datenbank zurücksetzen
docker-compose down -v
docker-compose up -d
```

#### Frontend-Probleme

```bash
# Node-Modules neu installieren
cd frontend
rm -rf node_modules package-lock.json
npm install

# Build-Cache löschen
npm run clean
npm run build
```

### Logs und Monitoring

```bash
# Alle Logs anzeigen
docker-compose logs -f

# Spezifische Service-Logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Log-Level ändern
# In .env: LOG_LEVEL=DEBUG
```

### Performance-Optimierung

#### Backend-Optimierung

```bash
# Worker-Anzahl anpassen
# In docker-compose.yml:
command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4

# Cache-Konfiguration
# Redis-Memory erhöhen
```

#### Frontend-Optimierung

```bash
# Bundle-Analyse
npm run build:analyze

# Code-Splitting optimieren
# Lazy Loading implementieren
```

## 📈 Performance

### Benchmarks

- **API-Response**: < 200ms (95th percentile)
- **Frontend-Load**: < 2s (First Contentful Paint)
- **Database-Queries**: < 50ms (Average)
- **Cache-Hit-Rate**: > 90%

### Optimierungen

- **Database Indexing**: Optimierte Indizes für häufige Abfragen
- **Query Optimization**: Effiziente SQL-Abfragen
- **Caching Strategy**: Multi-Level-Caching
- **CDN Integration**: Statische Assets über CDN
- **Image Optimization**: WebP-Format und Lazy Loading

## 🔄 Updates und Wartung

### Regelmäßige Wartung

```bash
# Dependencies aktualisieren
# Backend
cd backend
pip list --outdated
pip install -r requirements.txt --upgrade

# Frontend
cd frontend
npm update
npm audit fix
```

### Backup-Strategie

```bash
# Datenbank-Backup
docker-compose exec db pg_dump -U postgres medtech_db > backup.sql

# Automatische Backups
# Cron-Job einrichten
0 2 * * * /path/to/backup-script.sh
```

### Sicherheits-Updates

```bash
# Security-Scan ausführen
npm audit
pip-audit

# Docker-Images aktualisieren
docker-compose pull
docker-compose up -d
```

## 🤝 Contributing

### Beitragen

1. **Fork des Repositories**
2. **Feature-Branch erstellen**
3. **Änderungen implementieren**
4. **Tests schreiben**
5. **Pull Request erstellen**

### Code-Standards

- **Python**: PEP 8, Black, isort
- **TypeScript**: ESLint, Prettier
- **Git**: Conventional Commits
- **Tests**: > 95% Coverage

### Dokumentation

- **Code-Kommentare**: Umfassende Dokumentation
- **API-Docs**: OpenAPI/Swagger
- **README**: Aktuelle Anleitungen
- **Changelog**: Versionshistorie

## 📄 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert. Siehe [LICENSE](LICENSE) für Details.

## 🆘 Support

### Hilfe erhalten

- **Issues**: GitHub Issues für Bug-Reports
- **Discussions**: GitHub Discussions für Fragen
- **Documentation**: Umfassende Dokumentation
- **Community**: Discord-Server für Community-Support

### Kontakt

- **E-Mail**: support@medtech-platform.com
- **Website**: https://medtech-platform.com
- **GitHub**: https://github.com/your-org/medtech-platform

## 🙏 Danksagungen

- **FastAPI**: Für das hervorragende Web-Framework
- **React**: Für die moderne Frontend-Bibliothek
- **PostgreSQL**: Für die robuste Datenbank
- **Docker**: Für die Containerisierung
- **Open Source Community**: Für die zahlreichen Tools und Bibliotheken

---

**MedTech Data Platform** - Moderne, skalierbare und sichere Plattform für MedTech-Datenmanagement.

*Letzte Aktualisierung: $(date)*#   h e l i x - p l a t f o r m  
 #   h e l i x - p l a t f o r m  
 