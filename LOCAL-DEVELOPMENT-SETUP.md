# Lokale Entwicklung - Setup-Anleitung

Diese Anleitung hilft dabei, die lokale Entwicklungsumgebung einzurichten und den HTTP 500 Fehler zu beheben.

## Problem

Die lokale Version zeigt einen HTTP 500 Fehler bei `/api/regulatory-updates`, während die Produktivversion funktioniert. Dies liegt meist an:
- Fehlenden Datenbank-Daten (Seed-Daten)
- Nicht initialisierter Datenbank
- Fehlenden Umgebungsvariablen

## 🚀 Schnellstart: Neon.tech Cloud-Datenbank (EMPFOHLEN)

**Keine lokale PostgreSQL-Installation nötig!**

1. **Neon.tech Account erstellen:** https://neon.tech (kostenlos)
2. **Neues Projekt erstellen** (Region: Frankfurt)
3. **Connection String kopieren**
4. **In .env einfügen:**
   ```env
   DATABASE_URL="postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require"
   ```
5. **Schema & Daten einspielen:**
   ```bash
   npm run db:push
   npm run db:seed:all
   ```
6. **Server starten:**
   ```bash
   npm run dev
   ```

**📖 Detaillierte Anleitung:** Siehe `NEON-DATABASE-SETUP.md`

## Alternative: Lokale PostgreSQL-Installation

### 1. Umgebungsvariablen einrichten

Erstelle eine `.env` Datei im Root-Verzeichnis (basierend auf `env.example`):

```bash
cp env.example .env
```

**Wichtigste Variablen:**
- `DATABASE_URL`: PostgreSQL-Verbindungsstring (z.B. `postgresql://user:pass@localhost:5432/helix`)
- `NODE_ENV=development`
- `PORT=3000`

### 2. Datenbank-Schema erstellen

Falls die Datenbank noch nicht existiert oder das Schema nicht initialisiert ist:

```bash
npm run db:push
```

Dies erstellt alle benötigten Tabellen basierend auf dem Drizzle-Schema.

### 3. Seed-Daten einspielen

Führe die Seed-Scripts aus, um Sample-Daten zu erstellen:

**Regulatory Updates (~100 Updates):**
```bash
npm run db:seed
```

**Legal Cases (~65 Cases):**
```bash
npm run db:seed:legal
```

**Alle Seed-Daten auf einmal:**
```bash
npm run db:seed:all
```

Die Scripts erstellen:
- **Regulatory Updates:** 10 detaillierte Sample-Updates (FDA, EMA, MHRA, etc.) + 90 zusätzliche Updates
- **Legal Cases:** 5 detaillierte Sample-Fälle (BGH, EuGH, OLG, etc.) + 60 zusätzliche Fälle
- Alle Daten sind dem Tenant `demo-medical-tech` zugeordnet

### 4. Backend-Server starten

```bash
npm run dev:server
```

Oder Frontend und Backend zusammen:

```bash
npm run dev
```

### 5. Frontend starten (falls nicht bereits gestartet)

```bash
npm run dev:client
```

## Verifizierung

### Datenbank-Verbindung testen

```bash
# Prüfe, ob DATABASE_URL gesetzt ist
echo $DATABASE_URL

# Oder in PowerShell:
$env:DATABASE_URL
```

### Seed-Daten prüfen

Nach dem Ausführen von `npm run db:seed` sollten in der Konsole Meldungen wie diese erscheinen:

```
✅ Successfully seeded 100 regulatory updates
```

### API testen

Öffne im Browser:
- `http://localhost:5173/regulatory-updates` - Sollte jetzt Daten anzeigen
- `http://localhost:3000/api/regulatory-updates` - Sollte JSON mit Updates zurückgeben

## Fehlerbehebung

### HTTP 500 Fehler bleibt bestehen

1. **Backend-Logs prüfen:**
   - Öffne das Terminal, in dem der Backend-Server läuft
   - Lade die Seite neu und beobachte die Logs
   - Suche nach Fehlermeldungen wie "DATABASE_URL not set" oder "connection refused"

2. **Datenbank-Verbindung prüfen:**
   ```bash
   # Teste die Datenbank-Verbindung
   npm run db:seed
   ```
   Falls dies fehlschlägt, prüfe die `DATABASE_URL` in der `.env` Datei.

3. **Datenbank-Schema prüfen:**
   ```bash
   # Stelle sicher, dass das Schema existiert
   npm run db:push
   ```

4. **Service-Fehlerbehandlung:**
   Der Service gibt jetzt leere Arrays zurück statt Fehler zu werfen, wenn die Datenbank nicht verfügbar ist. Dies ermöglicht es dem Frontend, zumindest zu laden (auch wenn keine Daten angezeigt werden).

### Keine Daten werden angezeigt

1. **Prüfe, ob Seed-Daten existieren:**
   ```bash
   npm run db:seed
   ```
   Das Script überspringt das Seeding, wenn bereits Daten vorhanden sind.

2. **Prüfe Tenant-ID:**
   - Die Seed-Daten sind dem Tenant `demo-medical-tech` zugeordnet
   - Das Middleware setzt automatisch diese Tenant-ID für GET-Requests

3. **Prüfe Backend-Logs:**
   - Suche nach "Listed X regulatory updates"
   - Falls X = 0, wurden keine Daten gefunden

## Nächste Schritte

Nach erfolgreichem Setup sollten:
- ✅ Die Seite `/regulatory-updates` ohne Fehler laden
- ✅ ~100 Regulatory Updates angezeigt werden
- ✅ Filter und Suche funktionieren
- ✅ Pagination funktioniert

## Weitere Informationen

- **Backend-Logs:** Alle Fehler werden im Logger ausgegeben
- **Datenbank-Schema:** Siehe `shared/schema.ts`
- **Service-Implementierung:** Siehe `backend/src/services/regulatory-updates.service.ts`
- **Controller:** Siehe `backend/src/controllers/regulatory-updates.controller.ts`

