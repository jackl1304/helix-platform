#!/bin/bash
echo "🚀 HELIX VPS SETUP - Manuell auf dem VPS ausführen"
echo "📦 Dieses Script auf dem VPS ausführen, NACHDEM Archive hochgeladen wurde"

# Farben für bessere Lesbarkeit
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Basis-Informationen
echo -e "${BLUE}📋 Setup Information:${NC}"
echo "   📁 Archiv: /tmp/helix-complete-system.tar.gz"
echo "   🎯 Ziel: /opt/helix-production"
echo "   🌐 Domain: deltaways-helix.de"
echo ""

# Schritt 1: System Update
echo -e "${BLUE}📋 Schritt 1: System Update...${NC}"
apt update && apt upgrade -y
apt install -y nginx postgresql postgresql-contrib nodejs npm git curl unzip

# Schritt 2: PostgreSQL Setup
echo -e "${BLUE}🗄️ Schritt 2: PostgreSQL Setup...${NC}"
systemctl start postgresql
systemctl enable postgresql

# Database und User erstellen
sudo -u postgres psql -c "CREATE DATABASE helix;" 2>/dev/null || echo "Database bereits vorhanden"
sudo -u postgres psql -c "CREATE USER helix WITH ENCRYPTED PASSWORD 'helix123';" 2>/dev/null || echo "User bereits vorhanden"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE helix TO helix;"

# Schritt 3: Archiv extrahieren
echo -e "${BLUE}📦 Schritt 3: Helix System extrahieren...${NC}"
rm -rf /opt/helix-production
mkdir -p /opt/helix-production
cd /opt/helix-production

# Archive prüfen
if [ ! -f "/tmp/helix-complete-system.tar.gz" ]; then
    echo -e "${RED}❌ Archiv nicht gefunden: /tmp/helix-complete-system.tar.gz${NC}"
    echo "💡 Laden Sie zuerst das Archiv hoch:"
    echo "   scp helix-complete-system.tar.gz root@152.53.191.99:/tmp/"
    exit 1
fi

# Extrahieren
echo "📦 Extrahiere Archiv..."
tar -xzf /tmp/helix-complete-system.tar.gz -C /opt/helix-production/

# Dateien organisieren
if [ -d "dist" ]; then
    mv dist/* .
    rm -rf dist
fi

# Schritt 4: Datenbank importieren
echo -e "${BLUE}🗄️ Schritt 4: Datenbank importieren...${NC}"
if [ -f "helix-production-database.sql" ]; then
    PGPASSWORD=helix123 psql -h localhost -U helix -d helix < helix-production-database.sql
    echo -e "${GREEN}✅ Datenbank erfolgreich importiert${NC}"
else
    echo -e "${RED}❌ Datenbank-Datei nicht gefunden${NC}"
fi

# Schritt 5: Node.js Dependencies
echo -e "${BLUE}📦 Schritt 5: Node.js Dependencies installieren...${NC}"
cat > package.json << 'EOF'
{
  "name": "helix-production",
  "version": "1.0.0",
  "description": "Helix Regulatory Intelligence Platform - Production",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.24.3",
    "bcryptjs": "^2.4.3",
    "compression": "^1.7.4",
    "cors": "^2.8.5",
    "drizzle-orm": "^0.31.2",
    "express": "^4.19.2",
    "express-rate-limit": "^7.2.0",
    "express-session": "^1.18.0",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "nodemailer": "^6.9.13",
    "pg": "^8.12.0",
    "winston": "^3.13.0",
    "zod": "^3.23.8"
  }
}
EOF

npm install --production

# Schritt 6: Nginx Configuration
echo -e "${BLUE}🌐 Schritt 6: Nginx konfigurieren...${NC}"
cat > /etc/nginx/sites-available/helix << 'EOF'
server {
    listen 80;
    server_name deltaways-helix.de www.deltaways-helix.de 152.53.191.99;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Main App
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static Assets
    location /assets/ {
        proxy_pass http://localhost:3000/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API Routes
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
}
EOF

# Nginx aktivieren
ln -sf /etc/nginx/sites-available/helix /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# Schritt 7: Systemd Service
echo -e "${BLUE}⚙️ Schritt 7: Systemd Service einrichten...${NC}"
cat > /etc/systemd/system/helix-production.service << 'EOF'
[Unit]
Description=Helix Regulatory Intelligence Platform - Production
After=network.target postgresql.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/helix-production
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=DATABASE_URL=postgresql://helix:helix123@localhost:5432/helix
ExecStart=/usr/bin/node index.js
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=helix-production

[Install]
WantedBy=multi-user.target
EOF

# Service starten
systemctl daemon-reload
systemctl enable helix-production
systemctl start helix-production

# Status Check
echo ""
echo -e "${GREEN}🎉 HELIX SETUP ABGESCHLOSSEN!${NC}"
echo ""
echo -e "${BLUE}📊 Status Check:${NC}"
systemctl status helix-production --no-pager -l

echo ""
echo -e "${GREEN}✅ Ihre Helix App ist jetzt live unter:${NC}"
echo "   🌐 http://deltaways-helix.de"
echo "   🌐 http://www.deltaways-helix.de"
echo "   🌐 http://152.53.191.99"
echo ""
echo -e "${BLUE}🔧 Management Befehle:${NC}"
echo "   systemctl status helix-production"
echo "   systemctl restart helix-production"
echo "   systemctl logs helix-production"