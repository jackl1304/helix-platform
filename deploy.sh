#!/bin/bash

# Helix Platform Deployment Script
# Vollautomatisches Deployment für Produktionsumgebungen

set -e  # Exit bei Fehlern

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging-Funktion
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Konfiguration
APP_NAME="helix-platform"
APP_VERSION=$(git describe --tags --always --dirty 2>/dev/null || echo "dev-$(date +%Y%m%d-%H%M%S)")
DEPLOY_ENV=${DEPLOY_ENV:-production}
BACKUP_DIR="/backups/helix"
LOG_FILE="/var/log/helix-deploy.log"

# Deployment-Funktionen
check_prerequisites() {
    log "Prüfe Voraussetzungen..."
    
    # Prüfe Docker
    if ! command -v docker &> /dev/null; then
        error "Docker ist nicht installiert"
        exit 1
    fi
    
    # Prüfe Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose ist nicht installiert"
        exit 1
    fi
    
    # Prüfe .env Datei
    if [ ! -f .env ]; then
        error ".env Datei nicht gefunden. Kopiere env.example zu .env"
        exit 1
    fi
    
    # Prüfe notwendige Umgebungsvariablen
    required_vars=("DATABASE_URL" "SESSION_SECRET")
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            error "Umgebungsvariable $var ist nicht gesetzt"
            exit 1
        fi
    done
    
    success "Alle Voraussetzungen erfüllt"
}

backup_database() {
    log "Erstelle Datenbank-Backup..."
    
    mkdir -p "$BACKUP_DIR"
    BACKUP_FILE="$BACKUP_DIR/helix-backup-$(date +%Y%m%d-%H%M%S).sql"
    
    # Extrahiere Datenbank-Credentials aus DATABASE_URL
    DB_URL="$DATABASE_URL"
    DB_NAME=$(echo $DB_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
    
    if pg_dump "$DATABASE_URL" > "$BACKUP_FILE"; then
        success "Backup erstellt: $BACKUP_FILE"
        
        # Komprimiere Backup
        gzip "$BACKUP_FILE"
        success "Backup komprimiert: $BACKUP_FILE.gz"
        
        # Lösche alte Backups (älter als 30 Tage)
        find "$BACKUP_DIR" -name "helix-backup-*.sql.gz" -mtime +30 -delete
        log "Alte Backups gelöscht"
    else
        error "Backup fehlgeschlagen"
        exit 1
    fi
}

run_tests() {
    log "Führe Tests aus..."
    
    # Installiere Test-Dependencies
    npm ci
    
    # Führe Tests aus
    if npm run test:all; then
        success "Alle Tests bestanden"
    else
        error "Tests fehlgeschlagen"
        exit 1
    fi
    
    # Prüfe Test-Coverage
    if npm run test:coverage; then
        success "Test-Coverage generiert"
    else
        warning "Test-Coverage konnte nicht generiert werden"
    fi
}

build_application() {
    log "Baue Anwendung..."
    
    # Installiere Dependencies
    npm ci --only=production
    
    # Baue Frontend
    if npm run build; then
        success "Frontend erfolgreich gebaut"
    else
        error "Frontend-Build fehlgeschlagen"
        exit 1
    fi
    
    # Baue Backend
    if npm run check; then
        success "TypeScript-Check erfolgreich"
    else
        error "TypeScript-Check fehlgeschlagen"
        exit 1
    fi
}

deploy_application() {
    log "Starte Deployment..."
    
    # Stoppe alte Container
    docker-compose down --remove-orphans || true
    
    # Lösche alte Images
    docker image prune -f
    
    # Baue neue Images
    if docker-compose build --no-cache; then
        success "Docker-Images erfolgreich gebaut"
    else
        error "Docker-Build fehlgeschlagen"
        exit 1
    fi
    
    # Starte Services
    if docker-compose up -d; then
        success "Services erfolgreich gestartet"
    else
        error "Service-Start fehlgeschlagen"
        exit 1
    fi
    
    # Warte auf Health Checks
    log "Warte auf Health Checks..."
    sleep 30
    
    # Prüfe Health Status
    if curl -f http://localhost/api/health > /dev/null 2>&1; then
        success "Health Check erfolgreich"
    else
        error "Health Check fehlgeschlagen"
        docker-compose logs
        exit 1
    fi
}

run_database_migrations() {
    log "Führe Datenbank-Migrationen aus..."
    
    # Warte auf Datenbank
    log "Warte auf Datenbank..."
    sleep 10
    
    # Führe Migrationen aus
    if docker-compose exec -T helix-app npm run db:push; then
        success "Datenbank-Migrationen erfolgreich"
    else
        error "Datenbank-Migrationen fehlgeschlagen"
        exit 1
    fi
    
    # Optimiere Datenbank
    if docker-compose exec -T helix-app npm run db:optimize; then
        success "Datenbank-Optimierung erfolgreich"
    else
        warning "Datenbank-Optimierung fehlgeschlagen"
    fi
}

setup_monitoring() {
    log "Richte Monitoring ein..."
    
    # Starte Monitoring-Services
    docker-compose up -d prometheus grafana
    
    # Warte auf Services
    sleep 15
    
    # Prüfe Prometheus
    if curl -f http://localhost:9090/-/healthy > /dev/null 2>&1; then
        success "Prometheus erfolgreich gestartet"
    else
        warning "Prometheus konnte nicht gestartet werden"
    fi
    
    # Prüfe Grafana
    if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
        success "Grafana erfolgreich gestartet"
    else
        warning "Grafana konnte nicht gestartet werden"
    fi
}

cleanup() {
    log "Führe Cleanup durch..."
    
    # Lösche alte Docker-Images
    docker image prune -f
    
    # Lösche alte Container
    docker container prune -f
    
    # Lösche alte Volumes (vorsichtig!)
    # docker volume prune -f
    
    success "Cleanup abgeschlossen"
}

show_status() {
    log "Deployment-Status:"
    echo ""
    
    # Container-Status
    echo "Container-Status:"
    docker-compose ps
    
    echo ""
    
    # Service-URLs
    echo "Service-URLs:"
    echo "  Application: http://localhost"
    echo "  API Health:  http://localhost/api/health"
    echo "  Prometheus:  http://localhost:9090"
    echo "  Grafana:     http://localhost:3001"
    
    echo ""
    
    # Logs
    echo "Letzte Logs:"
    docker-compose logs --tail=20 helix-app
}

rollback() {
    error "Führe Rollback durch..."
    
    # Stoppe aktuelle Container
    docker-compose down
    
    # Starte vorherige Version (falls verfügbar)
    if [ -f docker-compose.backup.yml ]; then
        docker-compose -f docker-compose.backup.yml up -d
        success "Rollback erfolgreich"
    else
        error "Keine Backup-Version verfügbar"
        exit 1
    fi
}

# Hauptfunktion
main() {
    log "Starte Helix Platform Deployment v$APP_VERSION"
    log "Umgebung: $DEPLOY_ENV"
    
    case "${1:-deploy}" in
        "deploy")
            check_prerequisites
            backup_database
            run_tests
            build_application
            deploy_application
            run_database_migrations
            setup_monitoring
            cleanup
            show_status
            success "Deployment erfolgreich abgeschlossen!"
            ;;
        "rollback")
            rollback
            ;;
        "status")
            show_status
            ;;
        "test")
            run_tests
            ;;
        "build")
            build_application
            ;;
        "backup")
            backup_database
            ;;
        *)
            echo "Verwendung: $0 {deploy|rollback|status|test|build|backup}"
            exit 1
            ;;
    esac
}

# Fehlerbehandlung
trap 'error "Deployment fehlgeschlagen in Zeile $LINENO"' ERR

# Führe Hauptfunktion aus
main "$@"
