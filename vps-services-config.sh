#!/bin/bash
set -e

echo "⚙️  HELIX SERVICES KONFIGURATION GESTARTET"
echo "========================================"
echo "VPS: 152.53.191.99"
echo "Domain: deltaways-helix.de"
echo "Services: systemd + nginx"
echo "Datum: $(date)"
echo ""

# 1. SYSTEMD SERVICE KONFIGURATION ERSTELLEN
echo "🔄 ERSTELLE SYSTEMD SERVICE KONFIGURATION..."
sudo tee /etc/systemd/system/helix.service > /dev/null << 'EOF'
[Unit]
Description=Helix Regulatory Intelligence Platform
Documentation=https://deltaways-helix.de
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=root
Group=root
WorkingDirectory=/opt/helix
ExecStart=/usr/bin/node dist/index.js
ExecReload=/bin/kill -HUP $MAINPID
KillMode=mixed
KillSignal=SIGINT
TimeoutStopSec=5
Restart=always
RestartSec=10
StartLimitInterval=60s
StartLimitBurst=3

# Environment Variables
Environment=NODE_ENV=production
Environment=PORT=5000
Environment=DATABASE_URL=postgresql://helix_user:helix_secure_password_2024@localhost:5432/helix

# Logging Configuration
StandardOutput=journal
StandardError=journal
SyslogIdentifier=helix

# Security Settings
NoNewPrivileges=yes
PrivateTmp=yes

# Resource Limits
LimitNOFILE=65535
MemoryLimit=2G

[Install]
WantedBy=multi-user.target
EOF

# 2. SYSTEMD DAEMON NEULADEN
echo "🔄 LADE SYSTEMD DAEMON NEU..."
sudo systemctl daemon-reload

# 3. HELIX SERVICE AKTIVIEREN
echo "✅ AKTIVIERE HELIX SERVICE..."
sudo systemctl enable helix

# 4. NGINX KONFIGURATION FÜR DELTAWAYS-HELIX.DE ERSTELLEN
echo "🌐 ERSTELLE NGINX KONFIGURATION..."
sudo tee /etc/nginx/sites-available/deltaways-helix.de > /dev/null << 'EOF'
# HTTP Server - Redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name deltaways-helix.de www.deltaways-helix.de;
    
    # Security Headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    
    # Let's Encrypt Certificate Challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
        allow all;
    }
    
    # Redirect all HTTP to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS Server - Main Helix Application
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name deltaways-helix.de www.deltaways-helix.de;
    
    # SSL Configuration (wird später durch Let's Encrypt ersetzt)
    ssl_certificate /etc/ssl/certs/ssl-cert-snakeoil.pem;
    ssl_certificate_key /etc/ssl/private/ssl-cert-snakeoil.key;
    
    # Modern SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_stapling on;
    ssl_stapling_verify on;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;" always;
    
    # Compression Settings
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/xml+rss
        application/javascript
        application/json
        application/xml
        image/svg+xml;
    
    # Client Upload Settings
    client_max_body_size 50M;
    client_body_timeout 60s;
    client_header_timeout 60s;
    
    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=helix_api:10m rate=10r/s;
    
    # Main Application Proxy
    location / {
        # Rate limiting for API endpoints
        location /api/ {
            limit_req zone=helix_api burst=20 nodelay;
            proxy_pass http://127.0.0.1:5000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header X-Forwarded-Host $host;
            proxy_cache_bypass $http_upgrade;
            
            # API Timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }
        
        # General application proxy
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Standard Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Static Assets Optimization
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|map)$ {
        proxy_pass http://127.0.0.1:5000;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # Health Check Endpoint (no rate limiting)
    location = /health {
        proxy_pass http://127.0.0.1:5000/health;
        access_log off;
    }
    
    # Admin Panel (additional security)
    location /admin {
        # Optional: IP whitelist for admin access
        # allow 192.168.1.0/24;
        # deny all;
        
        proxy_pass http://127.0.0.1:5000/admin;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Logs
    access_log /var/log/nginx/helix_access.log;
    error_log /var/log/nginx/helix_error.log;
}
EOF

# 5. NGINX KONFIGURATION AKTIVIEREN
echo "🔗 AKTIVIERE NGINX SITE..."
sudo ln -sf /etc/nginx/sites-available/deltaways-helix.de /etc/nginx/sites-enabled/

# 6. STANDARD NGINX SITE DEAKTIVIEREN
echo "❌ DEAKTIVIERE STANDARD NGINX SITE..."
sudo rm -f /etc/nginx/sites-enabled/default

# 7. NGINX KONFIGURATION TESTEN
echo "🧪 TESTE NGINX KONFIGURATION..."
sudo nginx -t

# 8. CERTBOT VERZEICHNIS ERSTELLEN
echo "📁 ERSTELLE CERTBOT VERZEICHNIS..."
sudo mkdir -p /var/www/certbot

# 9. LOG-VERZEICHNISSE ERSTELLEN
echo "📋 ERSTELLE LOG-VERZEICHNISSE..."
sudo mkdir -p /var/log/helix
sudo chown $USER:$USER /var/log/helix

# 10. SERVICES NEUSTARTEN
echo "🔄 STARTE SERVICES NEU..."
sudo systemctl reload nginx
echo "nginx neu geladen ✅"

# 11. SERVICE STATUS ÜBERPRÜFEN
echo ""
echo "✅ SERVICES KONFIGURATION ABGESCHLOSSEN!"
echo "========================================"
echo "🔄 systemd Service:"
echo "   - helix.service: $(sudo systemctl is-enabled helix)"
echo "   - Status: Bereit zum Start"
echo "   - Arbeitsverzeichnis: /opt/helix"
echo "   - Port: 5000"
echo ""
echo "🌐 nginx Konfiguration:"
echo "   - Site: deltaways-helix.de"
echo "   - HTTP → HTTPS Redirect: ✅"
echo "   - SSL Bereit für Let's Encrypt: ✅"
echo "   - Proxy zu localhost:5000: ✅"
echo "   - Rate Limiting: ✅ (10 req/s für APIs)"
echo "   - Security Headers: ✅"
echo "   - Gzip Compression: ✅"
echo ""
echo "📋 Logs:"
echo "   - Helix App: journalctl -u helix -f"
echo "   - nginx Access: /var/log/nginx/helix_access.log"
echo "   - nginx Error: /var/log/nginx/helix_error.log"
echo ""
echo "🎯 SERVICES BEREIT FÜR DOMAIN-SETUP!"