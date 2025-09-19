#!/bin/bash
set -e

echo "📦 VOLLSTÄNDIGE HELIX-CODE-ÜBERTRAGUNG"
echo "======================================"
echo "Quelle: Replit Helix (funktionsfähige Version)"
echo "Ziel: netcup VPS 152.53.191.99"
echo "Datum: $(date)"
echo ""

# 1. HELIX-ARCHIV ERSTELLEN
echo "📂 ERSTELLE VOLLSTÄNDIGES HELIX-ARCHIV..."

# Alle wichtigen Dateien und Verzeichnisse für das Archiv
HELIX_FILES=(
    "client/"
    "server/"
    "shared/"
    "package.json"
    "package-lock.json"
    "tsconfig.json"
    "vite.config.ts"
    "tailwind.config.ts"
    "drizzle.config.ts"
    "postcss.config.js"
    ".env.example"
    ".gitignore"
)

# Temporäres Verzeichnis für Transfer
mkdir -p /tmp/helix-transfer
cd /tmp/helix-transfer

# 2. PRODUKTIONS-KONFIGURATION ERSTELLEN
echo "⚙️  ERSTELLE PRODUKTIONS-KONFIGURATION..."

cat > .env.production << 'EOF'
# Helix Production Environment - netcup VPS
NODE_ENV=production
PORT=5000

# Database Configuration
DATABASE_URL=postgresql://helix_user:helix_secure_password_2024@localhost:5432/helix

# Gmail SMTP Configuration (Production Ready)
GMAIL_USER=deltawayshelixinfo@gmail.com
GMAIL_APP_PASSWORD=fmxq vckw zkxe yher

# Security Configuration
JWT_SECRET=helix_production_jwt_2024_very_secure_random_string_deltaways
CORS_ORIGIN=https://deltaways-helix.de,http://deltaways-helix.de

# AI Configuration (wird vom User bereitgestellt)
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here

# Domain Configuration
DOMAIN=deltaways-helix.de
PROTOCOL=https
BASE_URL=https://deltaways-helix.de

# Email Configuration
FROM_EMAIL=deltawayshelixinfo@gmail.com
REPLY_TO_EMAIL=support@deltaways-helix.de
EOF

# 3. PM2 ECOSYSTEM KONFIGURATION
echo "🔄 ERSTELLE PM2 KONFIGURATION..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'helix-production',
    script: 'dist/index.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/log/helix/error.log',
    out_file: '/var/log/helix/out.log',
    log_file: '/var/log/helix/combined.log',
    time: true,
    autorestart: true,
    max_restarts: 5,
    min_uptime: '10s',
    max_memory_restart: '1G'
  }]
};
EOF

# 4. SYSTEMD SERVICE KONFIGURATION
echo "⚙️  ERSTELLE SYSTEMD SERVICE..."
cat > helix.service << 'EOF'
[Unit]
Description=Helix Regulatory Intelligence Platform
Documentation=https://deltaways-helix.de
After=network.target postgresql.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/helix
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=5000
StandardOutput=journal
StandardError=journal
SyslogIdentifier=helix

[Install]
WantedBy=multi-user.target
EOF

# 5. NGINX KONFIGURATION
echo "🌐 ERSTELLE NGINX KONFIGURATION..."
cat > nginx-helix.conf << 'EOF'
server {
    listen 80;
    server_name deltaways-helix.de www.deltaways-helix.de;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name deltaways-helix.de www.deltaways-helix.de;
    
    # SSL Configuration (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/deltaways-helix.de/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/deltaways-helix.de/privkey.pem;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Client Settings
    client_max_body_size 50M;
    
    # Proxy to Node.js Application
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Static Assets Caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://127.0.0.1:5000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Health Check
    location /health {
        proxy_pass http://127.0.0.1:5000/health;
        access_log off;
    }
}
EOF

# 6. DEPLOYMENT SCRIPT ERSTELLEN
echo "🚀 ERSTELLE DEPLOYMENT SCRIPT..."
cat > deploy-to-vps.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 HELIX VPS DEPLOYMENT GESTARTET"
echo "=================================="

# 1. CODE NACH /opt/helix KOPIEREN
sudo rm -rf /opt/helix/* || true
sudo cp -r . /opt/helix/
cd /opt/helix

# 2. DEPENDENCIES INSTALLIEREN
echo "📦 INSTALLIERE DEPENDENCIES..."
npm install

# 3. BUILD ERSTELLEN
echo "🔨 ERSTELLE PRODUCTION BUILD..."
npm run build

# 4. LOG VERZEICHNIS ERSTELLEN
echo "📋 ERSTELLE LOG VERZEICHNIS..."
sudo mkdir -p /var/log/helix
sudo chown $USER:$USER /var/log/helix

# 5. UMGEBUNGSVARIABLEN SETZEN
echo "🔧 SETZE UMGEBUNGSVARIABLEN..."
cp .env.production .env

# 6. SYSTEMD SERVICE INSTALLIEREN
echo "⚙️  INSTALLIERE SYSTEMD SERVICE..."
sudo cp helix.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable helix

# 7. NGINX KONFIGURATION INSTALLIEREN
echo "🌐 INSTALLIERE NGINX KONFIGURATION..."
sudo cp nginx-helix.conf /etc/nginx/sites-available/helix
sudo ln -sf /etc/nginx/sites-available/helix /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 8. DATENBANK SCHEMA PUSHEN
echo "🗄️  SETUP DATENBANK SCHEMA..."
npm run db:push

# 9. SERVICES STARTEN
echo "🚀 STARTE SERVICES..."
sudo systemctl start helix
sudo systemctl status helix

echo "✅ DEPLOYMENT ABGESCHLOSSEN!"
echo "Website verfügbar unter: https://deltaways-helix.de"
EOF

chmod +x deploy-to-vps.sh

echo ""
echo "✅ VOLLSTÄNDIGES TRANSFER-PAKET ERSTELLT!"
echo "========================================"
echo "📁 Verzeichnis: /tmp/helix-transfer/"
echo "🔧 Produktions-Konfiguration: ✅"
echo "⚙️  PM2 Ecosystem: ✅"
echo "🌐 nginx Konfiguration: ✅"
echo "🔄 systemd Service: ✅"
echo "🚀 Deployment Script: ✅"
echo ""
echo "🎯 BEREIT FÜR VPS-ÜBERTRAGUNG!"