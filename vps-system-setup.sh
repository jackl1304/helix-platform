#!/bin/bash
set -e

echo "🚀 NETCUP VPS SYSTEM-INSTALLATION GESTARTET"
echo "==========================================="
echo "VPS: 152.53.191.99"
echo "Datum: $(date)"
echo ""

# 1. SYSTEM AKTUALISIEREN
echo "📦 AKTUALISIERE SYSTEM-PAKETE..."
sudo apt update
sudo apt upgrade -y

# 2. GRUNDLEGENDE PAKETE INSTALLIEREN
echo "🛠️  INSTALLIERE GRUNDLEGENDE PAKETE..."
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# 3. NODE.JS LTS INSTALLIEREN (v20)
echo "🟢 INSTALLIERE NODE.JS LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
echo "Node.js Version: $(node --version)"
echo "npm Version: $(npm --version)"

# 4. POSTGRESQL INSTALLIEREN
echo "🐘 INSTALLIERE POSTGRESQL..."
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 5. NGINX INSTALLIEREN
echo "🌐 INSTALLIERE NGINX..."
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# 6. PM2 GLOBAL INSTALLIEREN
echo "⚙️  INSTALLIERE PM2 PROCESS MANAGER..."
sudo npm install -g pm2
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u root --hp /root

# 7. UFW FIREWALL KONFIGURIEREN
echo "🔥 KONFIGURIERE FIREWALL..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 5000/tcp
sudo ufw --force enable

# 8. HELIX VERZEICHNIS ERSTELLEN
echo "📁 ERSTELLE HELIX VERZEICHNIS..."
sudo mkdir -p /opt/helix
sudo chown $USER:$USER /opt/helix

# 9. POSTGRESQL DATENBANK UND USER ERSTELLEN
echo "🗄️  KONFIGURIERE POSTGRESQL..."
sudo -u postgres psql -c "CREATE DATABASE helix;"
sudo -u postgres psql -c "CREATE USER helix_user WITH ENCRYPTED PASSWORD 'helix_secure_password_2024';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE helix TO helix_user;"
sudo -u postgres psql -c "ALTER USER helix_user CREATEDB;"

# 10. CERTBOT FÜR SSL INSTALLIEREN
echo "🔒 INSTALLIERE CERTBOT FÜR SSL..."
sudo apt install -y certbot python3-certbot-nginx

# 11. SYSTEM-INFORMATIONEN ANZEIGEN
echo ""
echo "✅ SYSTEM-INSTALLATION ABGESCHLOSSEN!"
echo "======================================="
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "PostgreSQL: $(sudo -u postgres psql -c 'SELECT version();' | head -3 | tail -1)"
echo "nginx: $(nginx -v 2>&1)"
echo "PM2: $(pm2 --version)"
echo ""
echo "🗄️  DATENBANK KONFIGURATION:"
echo "Database: helix"
echo "User: helix_user"
echo "Host: localhost"
echo "Port: 5432"
echo ""
echo "🔌 OFFENE PORTS:"
echo "22 (SSH), 80 (HTTP), 443 (HTTPS), 5000 (Helix App)"
echo ""
echo "📁 HELIX VERZEICHNIS: /opt/helix"
echo ""
echo "🎯 SYSTEM BEREIT FÜR HELIX-INSTALLATION!"