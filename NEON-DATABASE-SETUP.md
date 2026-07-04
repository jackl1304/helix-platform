# Neon.tech Datenbank Setup - Schnellstart

Diese Anleitung hilft dir, in 5 Minuten eine kostenlose PostgreSQL-Datenbank bei Neon.tech einzurichten.

## Schritt 1: Neon.tech Account erstellen

1. Gehe zu: **https://neon.tech**
2. Klicke auf **"Sign Up"** (kostenlos)
3. Melde dich mit GitHub, Google oder E-Mail an

## Schritt 2: Neues Projekt erstellen

1. Nach dem Login: Klicke auf **"Create a project"**
2. **Projektname:** z.B. `helix-platform-dev`
3. **Region:** Wähle **Frankfurt** (niedrigste Latenz für Deutschland)
4. **PostgreSQL Version:** Wähle **PostgreSQL 15** oder **16**
5. Klicke auf **"Create project"**

## Schritt 3: Connection String kopieren

1. Nach der Erstellung siehst du den **Connection String**
2. Er sieht so aus:
   ```
   postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```
3. **Kopiere diesen String** - du brauchst ihn gleich!

## Schritt 4: .env Datei erstellen

1. Im Projekt-Root-Verzeichnis: Erstelle eine `.env` Datei (falls nicht vorhanden)
2. Füge folgende Zeilen ein:

```env
# Neon.tech Database Connection
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require"

# Application Settings
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

# Tenant Configuration
DEFAULT_TENANT_ID=demo-medical-tech
DEFAULT_TENANT_SUBDOMAIN=demo-medical

# Session & Security (für lokale Entwicklung)
SESSION_SECRET=dev-session-secret-12345
JWT_SECRET=dev-jwt-secret-12345
```

**Wichtig:** Ersetze `DATABASE_URL` mit deinem kopierten Connection String von Neon!

## Schritt 5: Datenbank-Schema erstellen

Führe im Terminal aus:

```bash
npm run db:push
```

Dies erstellt alle benötigten Tabellen in deiner Neon-Datenbank.

## Schritt 6: Seed-Daten einspielen

Führe aus:

```bash
npm run db:seed:all
```

Dies erstellt:
- ~100 Regulatory Updates
- ~65 Legal Cases

## Schritt 7: Server neu starten

```bash
# Alle Prozesse beenden
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force

# Neu starten
npm run dev
```

## Schritt 8: Testen

Öffne im Browser:
- Frontend: `http://localhost:5173`
- Backend Health: `http://localhost:3000/health`
- Regulatory Updates: `http://localhost:5173/regulatory-updates`

## Troubleshooting

### "Connection refused" Fehler
- Prüfe, ob der Connection String korrekt in `.env` steht
- Stelle sicher, dass `sslmode=require` im Connection String enthalten ist
- Prüfe, ob die Neon-Datenbank aktiv ist (im Neon Dashboard)

### "Table does not exist" Fehler
- Führe `npm run db:push` erneut aus
- Prüfe im Neon Dashboard, ob die Tabellen erstellt wurden

### "No data" angezeigt
- Führe `npm run db:seed:all` aus
- Prüfe im Neon Dashboard, ob Daten in den Tabellen sind

## Neon Dashboard Features

Im Neon Dashboard kannst du:
- **SQL Editor** verwenden, um direkt SQL-Befehle auszuführen
- **Branches** erstellen (wie Git-Branches für Datenbanken)
- **Backups** einsehen
- **Connection Strings** verwalten

## Kostenlose Limits

- **0,5 GB Speicher** - mehr als genug für Entwicklung
- **10 Projekte** - kannst mehrere Test-Datenbanken erstellen
- **Automatisches Scale-to-Zero** - keine Kosten bei Inaktivität

## Nächste Schritte

Nach erfolgreichem Setup:
1. ✅ Datenbank läuft in der Cloud
2. ✅ Lokale Entwicklung funktioniert
3. ✅ Seed-Daten sind eingespielt
4. ✅ Alle API-Endpunkte funktionieren

Viel Erfolg! 🚀

