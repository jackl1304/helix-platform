# MedTech Data Platform - Deployment Guide

Dieses Dokument beschreibt detailliert die Deployment-Strategien und -Prozeduren für die MedTech Data Platform.

## 📋 Inhaltsverzeichnis

1. [Übersicht](#übersicht)
2. [Deployment-Strategien](#deployment-strategien)
3. [Umgebungen](#umgebungen)
4. [Docker-Deployment](#docker-deployment)
5. [Kubernetes-Deployment](#kubernetes-deployment)
6. [Cloud-Deployment](#cloud-deployment)
7. [Monitoring und Logging](#monitoring-und-logging)
8. [Sicherheit](#sicherheit)
9. [Backup und Recovery](#backup-und-recovery)
10. [Troubleshooting](#troubleshooting)

## 🎯 Übersicht

Die MedTech Data Platform ist eine containerisierte Anwendung, die mit Docker und Docker Compose bereitgestellt werden kann. Sie unterstützt verschiedene Deployment-Szenarien von der lokalen Entwicklung bis zur Produktionsumgebung.

### Architektur-Übersicht

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (FastAPI)     │◄──►│   (PostgreSQL)  │
│   Port: 3000    │    │   Port: 8000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx         │    │   Redis         │    │   Monitoring    │
│   (Reverse      │    │   (Cache)       │    │   (Prometheus   │
│   Proxy)        │    │   Port: 6379    │    │   + Grafana)    │
│   Port: 80/443  │    └─────────────────┘    └─────────────────┘
└─────────────────┘
```

## 🚀 Deployment-Strategien

### 1. Docker Compose (Empfohlen für kleine bis mittlere Deployments)

**Vorteile:**
- Einfache Konfiguration
- Schnelle Bereitstellung
- Ideal für Single-Server-Deployments
- Gute Entwicklungsumgebung

**Nachteile:**
- Begrenzte Skalierbarkeit
- Keine automatische Failover-Funktionalität
- Manuelle Load-Balancing-Konfiguration

### 2. Kubernetes (Empfohlen für große, produktive Deployments)

**Vorteile:**
- Automatische Skalierung
- Self-Healing
- Load Balancing
- Rolling Updates
- Multi-Node-Deployments

**Nachteile:**
- Komplexere Konfiguration
- Höhere Lernkurve
- Ressourcenintensiver

### 3. Cloud-Managed Services

**Vorteile:**
- Vollständig verwaltet
- Automatische Skalierung
- Integrierte Monitoring-Tools
- Hohe Verfügbarkeit

**Nachteile:**
- Vendor Lock-in
- Höhere Kosten
- Weniger Kontrolle

## 🌍 Umgebungen

### Development
- **Zweck**: Lokale Entwicklung und Testing
- **Konfiguration**: Debug-Modus aktiviert, Hot-Reload
- **Daten**: Mock-Daten oder lokale Testdatenbank
- **Monitoring**: Basis-Monitoring

### Staging
- **Zweck**: Pre-Production-Testing
- **Konfiguration**: Produktionsähnlich, aber mit Testdaten
- **Daten**: Anonymisierte Produktionsdaten
- **Monitoring**: Vollständiges Monitoring

### Production
- **Zweck**: Live-System
- **Konfiguration**: Optimiert für Performance und Sicherheit
- **Daten**: Echte Produktionsdaten
- **Monitoring**: Umfassendes Monitoring und Alerting

## 🐳 Docker-Deployment

### Voraussetzungen

```bash
# Docker installieren
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Docker Compose installieren
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verifikation
docker --version
docker-compose --version
```

### Basis-Deployment

1. **Repository klonen**:
   ```bash
   git clone https://github.com/your-org/medtech-platform.git
   cd medtech-platform
   ```

2. **Umgebungsvariablen konfigurieren**:
   ```bash
   cp .env.example .env
   # Bearbeiten Sie .env mit Ihren Einstellungen
   ```

3. **Services starten**:
   ```bash
   docker-compose up -d
   ```

4. **Status prüfen**:
   ```bash
   docker-compose ps
   docker-compose logs -f
   ```

### Produktions-Deployment

1. **Produktions-Konfiguration**:
   ```bash
   cp docker-compose.prod.yml docker-compose.yml
   cp .env.production .env
   ```

2. **SSL-Zertifikate einrichten**:
   ```bash
   mkdir -p ssl
   # Zertifikate in ssl/ ablegen
   cp your-cert.pem ssl/cert.pem
   cp your-key.pem ssl/key.pem
   ```

3. **Produktions-Build**:
   ```bash
   docker-compose build --no-cache
   docker-compose up -d
   ```

4. **Health Checks**:
   ```bash
   curl -f http://localhost/health
   curl -f https://your-domain.com/health
   ```

### Skalierung

```bash
# Mehr Backend-Instanzen
docker-compose up -d --scale backend=3

# Load Balancer konfigurieren
# Nginx-Konfiguration anpassen für Load Balancing
```

### Update-Prozedur

```bash
# Neue Version deployen
git pull origin main
docker-compose build
docker-compose up -d

# Rollback bei Problemen
git checkout previous-version
docker-compose up -d
```

## ☸️ Kubernetes-Deployment

### Voraussetzungen

```bash
# kubectl installieren
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Minikube für lokale Entwicklung
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
```

### Kubernetes-Manifeste

#### Namespace
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: medtech-platform
```

#### ConfigMap
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: medtech-config
  namespace: medtech-platform
data:
  DATABASE_URL: "postgresql://postgres:password@postgres-service:5432/medtech_db"
  REDIS_URL: "redis://redis-service:6379"
  ENVIRONMENT: "production"
```

#### Secret
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: medtech-secrets
  namespace: medtech-platform
type: Opaque
data:
  SECRET_KEY: <base64-encoded-secret>
  POSTGRES_PASSWORD: <base64-encoded-password>
```

#### PostgreSQL Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: medtech-platform
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        env:
        - name: POSTGRES_DB
          value: "medtech_db"
        - name: POSTGRES_USER
          value: "postgres"
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: medtech-secrets
              key: POSTGRES_PASSWORD
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
      volumes:
      - name: postgres-storage
        persistentVolumeClaim:
          claimName: postgres-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: postgres-service
  namespace: medtech-platform
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
```

#### Backend Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: medtech-platform
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: medtech-backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            configMapKeyRef:
              name: medtech-config
              key: DATABASE_URL
        - name: SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: medtech-secrets
              key: SECRET_KEY
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: backend-service
  namespace: medtech-platform
spec:
  selector:
    app: backend
  ports:
  - port: 8000
    targetPort: 8000
  type: ClusterIP
```

#### Frontend Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: medtech-platform
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: medtech-frontend:latest
        ports:
        - containerPort: 3000
        env:
        - name: REACT_APP_API_URL
          value: "http://backend-service:8000"
---
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
  namespace: medtech-platform
spec:
  selector:
    app: frontend
  ports:
  - port: 3000
    targetPort: 3000
  type: ClusterIP
```

#### Ingress
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: medtech-ingress
  namespace: medtech-platform
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - medtech-platform.com
    secretName: medtech-tls
  rules:
  - host: medtech-platform.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 8000
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 3000
```

### Deployment-Befehle

```bash
# Namespace erstellen
kubectl apply -f k8s/namespace.yaml

# ConfigMap und Secret erstellen
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml

# Persistent Volume erstellen
kubectl apply -f k8s/pvc.yaml

# Services deployen
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/redis.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml

# Ingress konfigurieren
kubectl apply -f k8s/ingress.yaml

# Status prüfen
kubectl get pods -n medtech-platform
kubectl get services -n medtech-platform
kubectl get ingress -n medtech-platform
```

### Rolling Updates

```bash
# Neue Version deployen
kubectl set image deployment/backend backend=medtech-backend:v2.0.0 -n medtech-platform

# Update-Status verfolgen
kubectl rollout status deployment/backend -n medtech-platform

# Rollback bei Problemen
kubectl rollout undo deployment/backend -n medtech-platform
```

### Auto-Scaling

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
  namespace: medtech-platform
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

## ☁️ Cloud-Deployment

### AWS Deployment

#### ECS (Elastic Container Service)

1. **ECR Repository erstellen**:
   ```bash
   aws ecr create-repository --repository-name medtech-backend
   aws ecr create-repository --repository-name medtech-frontend
   ```

2. **Images pushen**:
   ```bash
   aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-west-2.amazonaws.com
   docker tag medtech-backend:latest 123456789012.dkr.ecr.us-west-2.amazonaws.com/medtech-backend:latest
   docker push 123456789012.dkr.ecr.us-west-2.amazonaws.com/medtech-backend:latest
   ```

3. **Task Definition**:
   ```json
   {
     "family": "medtech-backend",
     "networkMode": "awsvpc",
     "requiresCompatibilities": ["FARGATE"],
     "cpu": "512",
     "memory": "1024",
     "executionRoleArn": "arn:aws:iam::123456789012:role/ecsTaskExecutionRole",
     "containerDefinitions": [
       {
         "name": "backend",
         "image": "123456789012.dkr.ecr.us-west-2.amazonaws.com/medtech-backend:latest",
         "portMappings": [
           {
             "containerPort": 8000,
             "protocol": "tcp"
           }
         ],
         "environment": [
           {
             "name": "DATABASE_URL",
             "value": "postgresql://user:pass@rds-endpoint:5432/medtech_db"
           }
         ],
         "logConfiguration": {
           "logDriver": "awslogs",
           "options": {
             "awslogs-group": "/ecs/medtech-backend",
             "awslogs-region": "us-west-2",
             "awslogs-stream-prefix": "ecs"
           }
         }
       }
     ]
   }
   ```

#### RDS (Relational Database Service)

```bash
# PostgreSQL RDS Instance erstellen
aws rds create-db-instance \
  --db-instance-identifier medtech-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.4 \
  --master-username postgres \
  --master-user-password your-password \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-12345678 \
  --db-subnet-group-name medtech-subnet-group
```

#### Application Load Balancer

```bash
# ALB erstellen
aws elbv2 create-load-balancer \
  --name medtech-alb \
  --subnets subnet-12345678 subnet-87654321 \
  --security-groups sg-12345678
```

### Google Cloud Platform

#### Cloud Run

```bash
# Service deployen
gcloud run deploy medtech-backend \
  --image gcr.io/your-project/medtech-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL=postgresql://user:pass@/db?host=/cloudsql/your-project:us-central1:medtech-db
```

#### Cloud SQL

```bash
# PostgreSQL Instance erstellen
gcloud sql instances create medtech-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1
```

### Azure

#### Container Instances

```bash
# Container Group erstellen
az container create \
  --resource-group medtech-rg \
  --name medtech-backend \
  --image your-registry.azurecr.io/medtech-backend:latest \
  --cpu 1 \
  --memory 1 \
  --ports 8000 \
  --environment-variables DATABASE_URL=postgresql://user:pass@server:5432/db
```

## 📊 Monitoring und Logging

### Prometheus-Konfiguration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'medtech-backend'
    static_configs:
      - targets: ['backend:8000']
    metrics_path: '/metrics'
    scrape_interval: 10s
```

### Grafana-Dashboards

```json
{
  "dashboard": {
    "title": "MedTech Platform Dashboard",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{endpoint}}"
          }
        ]
      }
    ]
  }
}
```

### ELK Stack-Konfiguration

#### Elasticsearch
```yaml
# elasticsearch.yml
cluster.name: medtech-cluster
node.name: medtech-node-1
network.host: 0.0.0.0
discovery.type: single-node
```

#### Logstash
```ruby
# logstash.conf
input {
  beats {
    port => 5044
  }
}

filter {
  if [fields][service] == "medtech-backend" {
    grok {
      match => { "message" => "%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:level} %{GREEDYDATA:message}" }
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "medtech-logs-%{+YYYY.MM.dd}"
  }
}
```

### Alerting

#### Prometheus Alert Rules
```yaml
groups:
  - name: medtech-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"
```

## 🔒 Sicherheit

### SSL/TLS-Konfiguration

#### Nginx SSL-Konfiguration
```nginx
server {
    listen 443 ssl http2;
    server_name medtech-platform.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    location / {
        proxy_pass http://frontend-service:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Firewall-Konfiguration

```bash
# UFW (Ubuntu)
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable

# iptables
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
iptables -A INPUT -j DROP
```

### Secrets Management

#### Docker Secrets
```bash
# Secret erstellen
echo "your-secret-key" | docker secret create secret_key -
echo "your-db-password" | docker secret create db_password -

# In docker-compose.yml verwenden
services:
  backend:
    image: medtech-backend:latest
    secrets:
      - secret_key
      - db_password
    environment:
      - SECRET_KEY_FILE=/run/secrets/secret_key
      - DB_PASSWORD_FILE=/run/secrets/db_password

secrets:
  secret_key:
    external: true
  db_password:
    external: true
```

#### Kubernetes Secrets
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: medtech-secrets
type: Opaque
data:
  secret-key: <base64-encoded>
  db-password: <base64-encoded>
```

## 💾 Backup und Recovery

### Datenbank-Backup

#### Automatische Backups
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="medtech_db"

# Backup erstellen
docker-compose exec -T db pg_dump -U postgres $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Alte Backups löschen (älter als 30 Tage)
find $BACKUP_DIR -name "backup_*.sql" -mtime +30 -delete

# Upload zu S3 (optional)
aws s3 cp $BACKUP_DIR/backup_$DATE.sql s3://medtech-backups/
```

#### Cron-Job
```bash
# Crontab-Eintrag
0 2 * * * /path/to/backup.sh
```

### Disaster Recovery

#### Recovery-Prozedur
```bash
# 1. Services stoppen
docker-compose down

# 2. Datenbank zurücksetzen
docker-compose exec db dropdb -U postgres medtech_db
docker-compose exec db createdb -U postgres medtech_db

# 3. Backup wiederherstellen
docker-compose exec -T db psql -U postgres medtech_db < backup_20240101_020000.sql

# 4. Services starten
docker-compose up -d

# 5. Health Checks
curl -f http://localhost/health
```

### Multi-Region Deployment

#### Primary Region
```yaml
# docker-compose.primary.yml
services:
  backend:
    image: medtech-backend:latest
    environment:
      - DATABASE_URL=postgresql://user:pass@primary-db:5432/medtech_db
      - REDIS_URL=redis://primary-redis:6379
```

#### Secondary Region
```yaml
# docker-compose.secondary.yml
services:
  backend:
    image: medtech-backend:latest
    environment:
      - DATABASE_URL=postgresql://user:pass@secondary-db:5432/medtech_db
      - REDIS_URL=redis://secondary-redis:6379
```

## 🐛 Troubleshooting

### Häufige Probleme

#### Container startet nicht
```bash
# Logs anzeigen
docker-compose logs backend

# Container-Status prüfen
docker-compose ps

# In Container einsteigen
docker-compose exec backend bash
```

#### Datenbank-Verbindungsprobleme
```bash
# Datenbank-Status prüfen
docker-compose exec db pg_isready -U postgres

# Verbindung testen
docker-compose exec db psql -U postgres -d medtech_db -c "SELECT version();"

# Netzwerk prüfen
docker network ls
docker network inspect medtech-platform_default
```

#### Performance-Probleme
```bash
# Ressourcen-Nutzung prüfen
docker stats

# Container-Logs analysieren
docker-compose logs --tail=100 backend

# Datenbank-Performance
docker-compose exec db psql -U postgres -d medtech_db -c "SELECT * FROM pg_stat_activity;"
```

### Debugging-Tools

#### Health Checks
```bash
# Backend Health
curl -f http://localhost:8000/health

# Frontend Health
curl -f http://localhost:3000

# Database Health
docker-compose exec db pg_isready -U postgres

# Redis Health
docker-compose exec redis redis-cli ping
```

#### Monitoring-Commands
```bash
# Container-Ressourcen
docker stats --no-stream

# Logs in Echtzeit
docker-compose logs -f

# Netzwerk-Debugging
docker network inspect medtech-platform_default
```

### Log-Analyse

#### Log-Aggregation
```bash
# Alle Logs sammeln
docker-compose logs --timestamps > all_logs.txt

# Spezifische Service-Logs
docker-compose logs backend > backend_logs.txt

# Error-Logs filtern
docker-compose logs backend 2>&1 | grep -i error > error_logs.txt
```

#### Log-Parsing
```bash
# JSON-Logs parsen
docker-compose logs backend | jq '.'

# Zeitstempel extrahieren
docker-compose logs backend | grep -E '^\d{4}-\d{2}-\d{2}'

# Fehler zählen
docker-compose logs backend | grep -c "ERROR"
```

## 📈 Performance-Optimierung

### Backend-Optimierung

#### Worker-Konfiguration
```bash
# Mehr Worker für bessere Performance
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

#### Caching-Strategie
```python
# Redis-Caching
from functools import wraps
import redis

redis_client = redis.Redis(host='redis', port=6379, db=0)

def cache_result(expiration=3600):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            cache_key = f"{func.__name__}:{hash(str(args) + str(kwargs))}"
            cached_result = redis_client.get(cache_key)
            if cached_result:
                return json.loads(cached_result)
            result = func(*args, **kwargs)
            redis_client.setex(cache_key, expiration, json.dumps(result))
            return result
        return wrapper
    return decorator
```

### Frontend-Optimierung

#### Bundle-Optimierung
```javascript
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
};
```

#### Lazy Loading
```javascript
// React Lazy Loading
const LazyComponent = React.lazy(() => import('./LazyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}
```

### Datenbank-Optimierung

#### Index-Optimierung
```sql
-- Indizes für häufige Abfragen
CREATE INDEX idx_approvals_status ON approvals(status);
CREATE INDEX idx_approvals_region ON approvals(region);
CREATE INDEX idx_approvals_decision_date ON approvals(decision_date);

-- Composite Index
CREATE INDEX idx_approvals_status_region ON approvals(status, region);
```

#### Query-Optimierung
```sql
-- Effiziente Abfragen
EXPLAIN ANALYZE SELECT * FROM approvals 
WHERE status = 'approved' 
AND region = 'US' 
AND decision_date >= '2024-01-01';

-- Pagination
SELECT * FROM approvals 
ORDER BY decision_date DESC 
LIMIT 20 OFFSET 0;
```

## 🔄 CI/CD-Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build and push images
        run: |
          docker build -t medtech-backend ./backend
          docker build -t medtech-frontend ./frontend
          
      - name: Deploy to production
        run: |
          docker-compose -f docker-compose.prod.yml up -d
          
      - name: Health check
        run: |
          curl -f http://your-domain.com/health
```

### Deployment-Strategien

#### Blue-Green Deployment
```bash
# Green Environment starten
docker-compose -f docker-compose.green.yml up -d

# Health Check
curl -f http://green.your-domain.com/health

# Traffic umleiten (Load Balancer)
# Blue Environment stoppen
docker-compose -f docker-compose.blue.yml down
```

#### Rolling Updates
```bash
# Kubernetes Rolling Update
kubectl set image deployment/backend backend=medtech-backend:v2.0.0
kubectl rollout status deployment/backend
```

## 📋 Checkliste

### Pre-Deployment
- [ ] Code-Review abgeschlossen
- [ ] Tests bestanden
- [ ] Security-Scan durchgeführt
- [ ] Performance-Tests bestanden
- [ ] Backup erstellt
- [ ] Rollback-Plan vorbereitet

### Deployment
- [ ] Umgebungsvariablen konfiguriert
- [ ] SSL-Zertifikate gültig
- [ ] Datenbank-Migrationen vorbereitet
- [ ] Services gestartet
- [ ] Health Checks bestanden
- [ ] Monitoring aktiviert

### Post-Deployment
- [ ] Funktionalitätstests durchgeführt
- [ ] Performance-Metriken überwacht
- [ ] Logs überprüft
- [ ] Backup-Strategie getestet
- [ ] Dokumentation aktualisiert

---

**MedTech Data Platform Deployment Guide** - Umfassende Anleitung für die Bereitstellung der MedTech Data Platform in verschiedenen Umgebungen.

*Letzte Aktualisierung: $(date)*