#!/bin/bash
set -e

echo "🧹 HELIX VPS TOTAL CLEANUP"
echo "========================="
echo "ACHTUNG: Entfernt ALLE Helix-Reste vom VPS!"
echo "VPS wird für frische Installation vorbereitet"
echo "Datum: $(date)"
echo ""

# Farben für bessere Lesbarkeit
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${RED}⚠️  WARNUNG: ALLE HELIX-DATEN WERDEN GELÖSCHT!${NC}"
echo "Fortsetzung in 5 Sekunden..."
sleep 5

# 1. ALLE HELIX SERVICES STOPPEN
echo -e "${BLUE}🛑 SCHRITT 1: Services stoppen...${NC}"
systemctl stop helix 2>/dev/null || echo "helix service nicht gefunden"
systemctl stop helix-production 2>/dev/null || echo "helix-production service nicht gefunden"  
systemctl stop nginx 2>/dev/null || echo "nginx nicht gestoppt"
systemctl stop postgresql 2>/dev/null || echo "postgresql nicht gestoppt"

# Services deaktivieren
systemctl disable helix 2>/dev/null || echo "helix nicht deaktiviert"
systemctl disable helix-production 2>/dev/null || echo "helix-production nicht deaktiviert"

echo -e "${GREEN}✅ Services gestoppt${NC}"

# 2. ALLE RUNNING PROCESSES KILLEN
echo -e "${BLUE}💀 SCHRITT 2: Prozesse beenden...${NC}"
pkill -f "node.*helix" 2>/dev/null || echo "Keine node helix Prozesse"
pkill -f "node.*index" 2>/dev/null || echo "Keine node index Prozesse"
pkill -f "npm.*dev" 2>/dev/null || echo "Keine npm dev Prozesse"
pkill -f "PORT=3000" 2>/dev/null || echo "Keine Port 3000 Prozesse"
pkill -f "PORT=5000" 2>/dev/null || echo "Keine Port 5000 Prozesse"

echo -e "${GREEN}✅ Prozesse beendet${NC}"

# 3. SYSTEMD SERVICE FILES ENTFERNEN
echo -e "${BLUE}⚙️ SCHRITT 3: Service-Dateien entfernen...${NC}"
rm -f /etc/systemd/system/helix.service
rm -f /etc/systemd/system/helix-production.service
rm -f /etc/systemd/system/helix-*.service
systemctl daemon-reload

echo -e "${GREEN}✅ Service-Dateien entfernt${NC}"

# 4. ALLE HELIX VERZEICHNISSE ENTFERNEN
echo -e "${BLUE}📁 SCHRITT 4: Verzeichnisse löschen...${NC}"
rm -rf /opt/helix
rm -rf /opt/helix-production  
rm -rf /opt/helix*
rm -rf /var/www/helix*
rm -rf /home/helix*

# Temporäre Dateien
rm -f /tmp/helix*
rm -f /tmp/*helix*

echo -e "${GREEN}✅ Verzeichnisse entfernt${NC}"

# 5. POSTGRESQL KOMPLETT SÄUBERN
echo -e "${BLUE}🗄️ SCHRITT 5: PostgreSQL säubern...${NC}"
systemctl start postgresql 2>/dev/null || echo "PostgreSQL start fehlgeschlagen"

# Alle helix-bezogenen Datenbanken löschen
sudo -u postgres dropdb helix 2>/dev/null || echo "DB helix nicht gefunden"
sudo -u postgres dropdb helix_production 2>/dev/null || echo "DB helix_production nicht gefunden"
sudo -u postgres dropdb helix_dev 2>/dev/null || echo "DB helix_dev nicht gefunden"
sudo -u postgres dropdb helix_test 2>/dev/null || echo "DB helix_test nicht gefunden"

# Alle helix-bezogenen User löschen
sudo -u postgres dropuser helix 2>/dev/null || echo "User helix nicht gefunden"
sudo -u postgres dropuser helix_user 2>/dev/null || echo "User helix_user nicht gefunden"
sudo -u postgres dropuser helix_production 2>/dev/null || echo "User helix_production nicht gefunden"

echo -e "${GREEN}✅ PostgreSQL gesäubert${NC}"

# 6. NGINX KONFIGURATIONEN ENTFERNEN
echo -e "${BLUE}🌐 SCHRITT 6: nginx säubern...${NC}"
rm -f /etc/nginx/sites-available/helix*
rm -f /etc/nginx/sites-available/deltaways-helix*
rm -f /etc/nginx/sites-enabled/helix*
rm -f /etc/nginx/sites-enabled/deltaways-helix*

# nginx Standard-Konfiguration wiederherstellen
if [ ! -f /etc/nginx/sites-enabled/default ]; then
    ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default 2>/dev/null || echo "Default nginx site nicht verfügbar"
fi

nginx -t 2>/dev/null || echo "nginx Konfiguration hat Probleme"
systemctl restart nginx 2>/dev/null || echo "nginx restart fehlgeschlagen"

echo -e "${GREEN}✅ nginx gesäubert${NC}"

# 7. LOG-DATEIEN SÄUBERN
echo -e "${BLUE}📋 SCHRITT 7: Logs säubern...${NC}"
journalctl --vacuum-time=1d 2>/dev/null || echo "journalctl vacuum fehlgeschlagen"

# Log-Dateien löschen
rm -f /var/log/nginx/*helix*
rm -f /var/log/helix*
rm -f /var/log/*helix*

echo -e "${GREEN}✅ Logs gesäubert${NC}"

# 8. PORTS FREIGEBEN
echo -e "${BLUE}🔌 SCHRITT 8: Ports überprüfen...${NC}"
echo "Ports vor Cleanup:"
netstat -tlnp | grep -E ":(3000|5000|80|443)" || echo "Keine relevanten Ports belegt"

# Prozesse auf kritischen Ports beenden
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "Port 3000 bereits frei"
lsof -ti:5000 | xargs kill -9 2>/dev/null || echo "Port 5000 bereits frei"

echo "Ports nach Cleanup:"
netstat -tlnp | grep -E ":(3000|5000|80|443)" || echo "Ports erfolgreich freigegeben"

echo -e "${GREEN}✅ Ports freigegeben${NC}"

# 9. CRON JOBS ENTFERNEN
echo -e "${BLUE}⏰ SCHRITT 9: Cron Jobs säubern...${NC}"
(crontab -l 2>/dev/null | grep -v helix) | crontab - 2>/dev/null || echo "Keine helix cron jobs"

echo -e "${GREEN}✅ Cron Jobs gesäubert${NC}"

# 10. FINAL VERIFICATION
echo -e "${BLUE}🔍 SCHRITT 10: Verifikation...${NC}"
echo ""
echo "Services Status:"
systemctl is-active helix 2>/dev/null || echo "✅ helix service nicht aktiv"
systemctl is-active helix-production 2>/dev/null || echo "✅ helix-production service nicht aktiv"

echo ""
echo "Verzeichnisse:"
ls -la /opt/ | grep helix || echo "✅ Keine helix Verzeichnisse in /opt"

echo ""
echo "PostgreSQL:"
sudo -u postgres psql -c "\l" 2>/dev/null | grep helix || echo "✅ Keine helix Datenbanken"

echo ""
echo "nginx Sites:"
ls -la /etc/nginx/sites-enabled/ | grep helix || echo "✅ Keine helix nginx sites"

echo ""
echo "Aktive Ports:"
netstat -tlnp | grep -E ":(3000|5000)" || echo "✅ Ports 3000 und 5000 sind frei"

echo ""
echo -e "${GREEN}🎉 VPS TOTAL CLEANUP ABGESCHLOSSEN!${NC}"
echo "========================================"
echo -e "${BLUE}✨ VPS ist jetzt komplett sauber und bereit für frische Installation!${NC}"
echo ""
echo -e "${YELLOW}NÄCHSTE SCHRITTE:${NC}"
echo "1. ✅ Cleanup abgeschlossen"
echo "2. 📦 Helix-Archive hochladen"  
echo "3. 🚀 Bewährte gestrige Installation ausführen"
echo "4. 🌐 http://deltaways-helix.de testen"
echo ""
echo -e "${GREEN}Der VPS ist jetzt bereit für eine frische, saubere Helix-Installation!${NC}"