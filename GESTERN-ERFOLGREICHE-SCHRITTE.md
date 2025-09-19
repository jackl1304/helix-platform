# 🎯 GESTRIGE ERFOLGREICHE VPS-IMPLEMENTIERUNG (BEWÄHRT!)

## DIESE SCHRITTE HABEN GESTERN FUNKTIONIERT!

### SCHRITT 1: SSH-VERBINDUNG
```bash
ssh root@152.53.191.99
```

### SCHRITT 2: SYSTEM CLEANUP
```bash
systemctl stop helix nginx 2>/dev/null || true
rm -rf /opt/helix
rm -f /etc/systemd/system/helix.service
systemctl daemon-reload
```

### SCHRITT 3: POSTGRESQL SETUP
```bash
systemctl start postgresql
systemctl enable postgresql

# Database erstellen
sudo -u postgres dropdb helix --if-exists
sudo -u postgres dropuser helix --if-exists
sudo -u postgres createdb helix
sudo -u postgres createuser helix
sudo -u postgres psql -c "ALTER USER helix PASSWORD 'helix123';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE helix TO helix;"
```

### SCHRITT 4: HELIX-CODE INSTALLIEREN
```bash
mkdir -p /opt/helix
cd /opt/helix

# KRITISCH: Archive von Replit hochladen
# scp helix-complete-system.tar.gz root@152.53.191.99:/tmp/
tar -xzf /tmp/helix-complete-system.tar.gz

# Dependencies (wichtig: diese genauen Pakete!)
npm install express pg cors helmet winston --production
```

### SCHRITT 5: NGINX KONFIGURATION (PORT 3000!)
```bash
cat > /etc/nginx/sites-available/helix << 'EOF'
server {
    listen 80;
    server_name deltaways-helix.de www.deltaways-helix.de 152.53.191.99;
    
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Aktivieren
ln -sf /etc/nginx/sites-available/helix /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

### SCHRITT 6: HELIX SERVICE (PORT 3000!)
```bash
cat > /etc/systemd/system/helix.service << 'EOF'
[Unit]
Description=Helix Platform
After=postgresql.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/helix
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=DATABASE_URL=postgresql://helix:helix123@localhost:5432/helix
ExecStart=/usr/bin/node index.js
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Service starten
systemctl daemon-reload
systemctl enable helix
systemctl start helix
```

### SCHRITT 7: TESTS
```bash
# Status prüfen
systemctl status helix
systemctl status nginx

# Lokale Tests
curl -I http://localhost:3000
curl -I http://localhost

# Logs
journalctl -u helix -f
```

## WARUM HEUTIGE SCRIPTS FEHLSCHLAGEN:

1. **FALSCHER PORT:** 5000 statt 3000
2. **FALSCHER SERVICE NAME:** helix-production statt helix  
3. **FALSCHES VERZEICHNIS:** /opt/helix-production statt /opt/helix
4. **CODE FEHLT:** Archive wurden nicht hochgeladen

## SOFORTIGE LÖSUNG:

1. **SSH:** `ssh root@152.53.191.99`
2. **Archive hochladen:** `scp helix-complete-system.tar.gz root@152.53.191.99:/tmp/`
3. **Diese bewährten Schritte ausführen**
4. **Testen:** http://deltaways-helix.de

**Diese Schritte haben gestern funktioniert und werden wieder funktionieren!**