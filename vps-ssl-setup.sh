#!/bin/bash
set -e

echo "🔒 HELIX SSL-ZERTIFIKAT SETUP (LET'S ENCRYPT)"
echo "============================================"
echo "Domain: deltaways-helix.de"
echo "VPS: 152.53.191.99"
echo "SSL Provider: Let's Encrypt"
echo "Datum: $(date)"
echo ""

# 1. DOMAIN ERREICHBARKEIT PRÜFEN
echo "🌐 PRÜFE DOMAIN-ERREICHBARKEIT..."
echo "Teste DNS-Auflösung für deltaways-helix.de..."

# DNS Test
if nslookup deltaways-helix.de | grep -q "152.53.191.99"; then
    echo "✅ DNS A-Record korrekt: deltaways-helix.de → 152.53.191.99"
else
    echo "❌ DNS A-Record fehlt oder falsch!"
    echo "⚠️  Bitte DNS-Setup zuerst durchführen:"
    echo "   A-Record: @ → 152.53.191.99"
    echo "   A-Record: www → 152.53.191.99"
    exit 1
fi

# 2. HELIX SERVICE STARTEN (FÜR ACME CHALLENGE)
echo "🚀 STARTE HELIX SERVICE FÜR SSL-SETUP..."
sudo systemctl start helix
sleep 5

# Service Status prüfen
if sudo systemctl is-active --quiet helix; then
    echo "✅ Helix Service läuft auf Port 5000"
else
    echo "❌ Helix Service konnte nicht gestartet werden!"
    sudo journalctl -u helix --no-pager -n 20
    exit 1
fi

# 3. CERTBOT VERZEICHNIS VORBEREITEN
echo "📁 BEREITE CERTBOT VERZEICHNIS VOR..."
sudo mkdir -p /var/www/certbot
sudo chown -R www-data:www-data /var/www/certbot

# 4. NGINX NEUSTART FÜR ACME CHALLENGE
echo "🔄 STARTE NGINX FÜR ACME CHALLENGE..."
sudo systemctl restart nginx
sleep 3

# 5. HTTP-ERREICHBARKEIT TESTEN
echo "🧪 TESTE HTTP-ERREICHBARKEIT..."
if curl -f -s http://deltaways-helix.de/health > /dev/null 2>&1; then
    echo "✅ HTTP-Verbindung erfolgreich"
else
    echo "⚠️  HTTP-Verbindung nicht verfügbar - fortfahren mit SSL..."
fi

# 6. LET'S ENCRYPT ZERTIFIKAT BEANTRAGEN
echo "🔒 BEANTRAGE SSL-ZERTIFIKAT BEI LET'S ENCRYPT..."
sudo certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email deltawayshelixinfo@gmail.com \
    --agree-tos \
    --no-eff-email \
    --domains deltaways-helix.de,www.deltaways-helix.de \
    --non-interactive || {
    
    echo "⚠️  Webroot-Methode fehlgeschlagen, versuche Standalone..."
    
    # Helix temporär stoppen für Standalone
    sudo systemctl stop helix
    sudo systemctl stop nginx
    
    # Standalone Certbot
    sudo certbot certonly \
        --standalone \
        --email deltawayshelixinfo@gmail.com \
        --agree-tos \
        --no-eff-email \
        --domains deltaways-helix.de,www.deltaways-helix.de \
        --non-interactive
    
    # Services wieder starten
    sudo systemctl start nginx
    sudo systemctl start helix
}

# 7. SSL-ZERTIFIKAT ÜBERPRÜFEN
echo "🔍 ÜBERPRÜFE SSL-ZERTIFIKAT..."
if [ -f "/etc/letsencrypt/live/deltaways-helix.de/fullchain.pem" ]; then
    echo "✅ SSL-Zertifikat erfolgreich erstellt"
    sudo openssl x509 -in /etc/letsencrypt/live/deltaways-helix.de/cert.pem -text -noout | grep -A2 "Validity"
else
    echo "❌ SSL-Zertifikat konnte nicht erstellt werden!"
    exit 1
fi

# 8. NGINX KONFIGURATION FÜR SSL AKTUALISIEREN
echo "🔧 AKTUALISIERE NGINX SSL-KONFIGURATION..."
sudo tee /etc/nginx/sites-available/deltaways-helix.de > /dev/null << 'EOF'
# HTTP Server - Redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name deltaways-helix.de www.deltaways-helix.de;
    
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
    
    # Let's Encrypt SSL Certificates
    ssl_certificate /etc/letsencrypt/live/deltaways-helix.de/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/deltaways-helix.de/privkey.pem;
    
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
    
    # Main Application Proxy
    location / {
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
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Health Check
    location = /health {
        proxy_pass http://127.0.0.1:5000/health;
        access_log off;
    }
    
    # Static Assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://127.0.0.1:5000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Logs
    access_log /var/log/nginx/helix_access.log;
    error_log /var/log/nginx/helix_error.log;
}
EOF

# 9. NGINX KONFIGURATION TESTEN UND NEULADEN
echo "🧪 TESTE NGINX KONFIGURATION..."
sudo nginx -t

echo "🔄 LADE NGINX NEU..."
sudo systemctl reload nginx

# 10. AUTOMATISCHE ZERTIFIKAT-ERNEUERUNG EINRICHTEN
echo "🔄 RICHTE AUTOMATISCHE SSL-ERNEUERUNG EIN..."
echo "0 12 * * * /usr/bin/certbot renew --quiet && systemctl reload nginx" | sudo crontab -

# 11. HTTPS-VERBINDUNG TESTEN
echo "🔒 TESTE HTTPS-VERBINDUNG..."
sleep 5

if curl -f -s https://deltaways-helix.de/health > /dev/null 2>&1; then
    echo "✅ HTTPS-Verbindung erfolgreich!"
else
    echo "⚠️  HTTPS-Verbindung noch nicht verfügbar (DNS-Propagation?)"
fi

echo ""
echo "✅ SSL-SETUP ABGESCHLOSSEN!"
echo "=========================="
echo "🔒 SSL-Zertifikat: ✅ Let's Encrypt"
echo "📅 Gültigkeit: 90 Tage (automatische Erneuerung)"
echo "🌐 HTTPS-Domain: https://deltaways-helix.de"
echo "🔄 Automatische Erneuerung: ✅ täglich 12:00"
echo "🔧 nginx SSL-Konfiguration: ✅ aktualisiert"
echo ""
echo "🎯 SSL BEREIT FÜR VOLLSTÄNDIGEN TEST!"