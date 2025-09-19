#!/bin/bash
set -e

echo "🔥 NETCUP VPS KOMPLETT-SÄUBERUNG GESTARTET"
echo "==========================================="
echo "VPS: 152.53.191.99"
echo "Datum: $(date)"
echo ""

# 1. ALLE HELIX SERVICES STOPPEN
echo "⏹️  STOPPE ALLE HELIX SERVICES..."
sudo systemctl stop helix || echo "Helix service war bereits gestoppt"
sudo systemctl disable helix || echo "Helix service war bereits deaktiviert"
sudo systemctl stop nginx || echo "Nginx war bereits gestoppt"
sudo systemctl stop postgresql || echo "PostgreSQL war bereits gestoppt"

# 2. SYSTEMD SERVICE DATEIEN LÖSCHEN
echo "🗑️  LÖSCHE SYSTEMD SERVICE DATEIEN..."
sudo rm -f /etc/systemd/system/helix.service
sudo systemctl daemon-reload

# 3. ALLE HELIX VERZEICHNISSE LÖSCHEN
echo "🗂️  LÖSCHE ALLE HELIX VERZEICHNISSE..."
sudo rm -rf /opt/helix/
sudo rm -rf /root/helix/
sudo rm -rf /root/helix-standards/
sudo rm -rf /home/*/helix*
sudo rm -rf /var/www/helix/

# 4. NGINX KONFIGURATION SÄUBERN
echo "🌐 SÄUBERE NGINX KONFIGURATION..."
sudo rm -f /etc/nginx/sites-enabled/helix
sudo rm -f /etc/nginx/sites-available/helix
sudo rm -f /etc/nginx/sites-enabled/deltaways-helix*
sudo rm -f /etc/nginx/sites-available/deltaways-helix*

# 5. POSTGRESQL DATENBANK KOMPLETT ZURÜCKSETZEN
echo "🗄️  SETZE POSTGRESQL DATENBANK ZURÜCK..."
sudo systemctl start postgresql
sudo -u postgres psql -c "DROP DATABASE IF EXISTS helix;" || echo "Helix DB existierte nicht"
sudo -u postgres psql -c "DROP USER IF EXISTS helix_user;" || echo "Helix User existierte nicht"
sudo systemctl stop postgresql

# 6. LOGS SÄUBERN
echo "📋 SÄUBERE LOG-DATEIEN..."
sudo rm -f /var/log/helix*
sudo journalctl --vacuum-time=1d

# 7. PROZESSE KILLEN
echo "⚡ STOPPE ALLE HELIX PROZESSE..."
sudo pkill -f helix || echo "Keine Helix-Prozesse gefunden"
sudo pkill -f node.*helix || echo "Keine Node Helix-Prozesse gefunden"

# 8. PORTS FREIGEBEN
echo "🔌 ÜBERPRÜFE PORT-NUTZUNG..."
sudo netstat -tlnp | grep :5000 | awk '{print $7}' | cut -d'/' -f1 | xargs -r sudo kill || echo "Port 5000 war frei"
sudo netstat -tlnp | grep :3000 | awk '{print $7}' | cut -d'/' -f1 | xargs -r sudo kill || echo "Port 3000 war frei"

# 9. TEMPORÄRE DATEIEN SÄUBERN
echo "🧹 SÄUBERE TEMPORÄRE DATEIEN..."
sudo rm -rf /tmp/helix*
sudo rm -rf /tmp/*helix*

# 10. FIREWALL REGELN ZURÜCKSETZEN (OPTIONAL)
echo "🔥 SETZE FIREWALL ZURÜCK..."
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

echo ""
echo "✅ VPS KOMPLETT-SÄUBERUNG ABGESCHLOSSEN!"
echo "========================================="
echo "Der VPS ist jetzt sauber für Neuinstallation bereit."
echo "Alle Helix-Komponenten wurden vollständig entfernt."
echo ""