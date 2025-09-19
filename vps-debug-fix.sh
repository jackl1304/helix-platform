#!/bin/bash
set -e

echo "🔍 HELIX VPS DEBUG & FIX SCRIPT"
echo "==============================="
echo "Problem: deltaways-helix.de nicht erreichbar"
echo "Lösung: Services debuggen und neu starten"
echo "Datum: $(date)"
echo ""

# 1. DNS-PROPAGATION TESTEN
echo "🌐 TESTE DNS-PROPAGATION..."
if command -v nslookup >/dev/null 2>&1; then
    echo "DNS-Auflösung für deltaways-helix.de:"
    nslookup deltaways-helix.de
else
    echo "nslookup nicht verfügbar - verwende ping"
    ping -c 1 deltaways-helix.de 2>/dev/null || echo "❌ DNS nicht erreichbar"
fi

# 2. VPS-VERBINDUNG TESTEN  
echo ""
echo "🔌 TESTE VPS-VERBINDUNG..."
if ping -c 3 152.53.191.99 >/dev/null 2>&1; then
    echo "✅ VPS 152.53.191.99 ist erreichbar"
else
    echo "❌ VPS nicht erreichbar - Netzwerkproblem!"
fi

# 3. SERVICES STATUS ÜBERPRÜFEN
echo ""
echo "⚙️  ÜBERPRÜFE SERVICES STATUS..."

echo "PostgreSQL Status:"
sudo systemctl status postgresql --no-pager -l || echo "❌ PostgreSQL Problem"

echo "nginx Status:"  
sudo systemctl status nginx --no-pager -l || echo "❌ nginx Problem"

echo "Helix Service Status:"
sudo systemctl status helix --no-pager -l || echo "❌ Helix Service Problem"

# 4. PORTS ÜBERPRÜFEN
echo ""
echo "🔌 ÜBERPRÜFE OFFENE PORTS..."
echo "Port 80 (HTTP):"
sudo netstat -tlnp | grep :80 || echo "❌ Port 80 nicht offen"

echo "Port 443 (HTTPS):"  
sudo netstat -tlnp | grep :443 || echo "❌ Port 443 nicht offen"

echo "Port 5000 (Helix App):"
sudo netstat -tlnp | grep :5000 || echo "❌ Port 5000 nicht offen"

# 5. NGINX LOGS ÜBERPRÜFEN
echo ""
echo "📋 NGINX ERROR LOGS:"
sudo tail -n 10 /var/log/nginx/error.log 2>/dev/null || echo "Keine nginx error logs"

echo "📋 NGINX ACCESS LOGS:" 
sudo tail -n 10 /var/log/nginx/access.log 2>/dev/null || echo "Keine nginx access logs"

# 6. HELIX LOGS ÜBERPRÜFEN
echo ""
echo "📋 HELIX SERVICE LOGS:"
sudo journalctl -u helix --no-pager -n 20 || echo "Keine Helix logs verfügbar"

# 7. SCHNELLE FIXES DURCHFÜHREN
echo ""
echo "🔧 FÜHRE SCHNELLE FIXES DURCH..."

# PostgreSQL sicherstellen
echo "Starte PostgreSQL..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

# nginx Konfiguration testen
echo "Teste nginx Konfiguration..."
sudo nginx -t || {
    echo "❌ nginx Konfigurationsfehler!"
    echo "Erstelle Standard-Konfiguration..."
    
    # Backup der fehlerhaften Konfiguration
    sudo cp /etc/nginx/sites-available/deltaways-helix.de /etc/nginx/sites-available/deltaways-helix.de.backup 2>/dev/null || true
    
    # Einfache funktionierende Konfiguration erstellen
    sudo tee /etc/nginx/sites-available/deltaways-helix.de > /dev/null << 'EOF'
server {
    listen 80;
    server_name deltaways-helix.de www.deltaways-helix.de;
    
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
    
    # nginx neu laden
    sudo nginx -t && sudo systemctl reload nginx
}

# Helix Service erstellen falls nicht vorhanden
if [ ! -f "/etc/systemd/system/helix.service" ]; then
    echo "Erstelle helix.service..."
    sudo tee /etc/systemd/system/helix.service > /dev/null << 'EOF'
[Unit]
Description=Helix Regulatory Intelligence Platform
After=network.target postgresql.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/helix
ExecStart=/usr/bin/node dist/index.js
Restart=always
Environment=NODE_ENV=production
Environment=PORT=5000

[Install]
WantedBy=multi-user.target
EOF
    
    sudo systemctl daemon-reload
    sudo systemctl enable helix
fi

# Services neu starten
echo "Starte alle Services neu..."
sudo systemctl restart postgresql
sudo systemctl restart nginx  
sudo systemctl restart helix

# 8. FINAL TEST
echo ""
echo "🧪 FINAL CONNECTION TEST..."
sleep 5

echo "Teste lokale Verbindung:"
curl -I http://localhost:5000 2>/dev/null || echo "❌ Lokale Helix-App nicht erreichbar"

echo "Teste nginx Proxy:"
curl -I http://localhost 2>/dev/null || echo "❌ nginx Proxy nicht erreichbar"

echo ""
echo "✅ DEBUG & FIX ABGESCHLOSSEN!"
echo "==============================" 
echo "Nächste Schritte:"
echo "1. Teste https://deltaways-helix.de im Browser"
echo "2. Falls immer noch Probleme: Logs überprüfen"
echo "3. Bei SSL-Problemen: Certbot erneut ausführen"
echo ""