# Sidebar-Links Test-Anleitung

## ✅ Vorbereitung

1. **Backend starten:**
   ```powershell
   cd backend
   npm run dev
   ```
   Das Backend sollte auf `http://localhost:3000` laufen.

2. **Frontend starten (separates Terminal):**
   ```powershell
   npm run dev
   ```
   Das Frontend sollte auf `http://localhost:5173` laufen.

## 🔍 Test-Plan: Jeden Sidebar-Link prüfen

### COMPLIANCE & REGULIERUNG

#### 1. Regulatory Intelligence (`/regulatory-updates`)
- **Klick:** Sidebar → COMPLIANCE & REGULIERUNG → Regulatory Intelligence
- **Erwartet:** Seite lädt, zeigt regulatorische Updates
- **API-Call:** `GET /api/regulatory-updates?limit=5000`
- **Prüfen:**
  - ✅ Seite lädt ohne Fehler
  - ✅ Browser-Konsole: Keine Fehler
  - ✅ Network-Tab: API-Antwort ist JSON (nicht HTML)
  - ✅ Daten werden angezeigt

#### 2. Rechtsprechung (`/rechtsprechung`)
- **Klick:** Sidebar → COMPLIANCE & REGULIERUNG → Rechtsprechung
- **Erwartet:** Seite lädt, zeigt Rechtsfälle
- **API-Call:** `GET /api/legal-cases`
- **Prüfen:**
  - ✅ Seite lädt ohne Fehler
  - ✅ Browser-Konsole: Keine Fehler
  - ✅ Network-Tab: API-Antwort ist JSON
  - ✅ Rechtsfälle werden angezeigt

### ZULASSUNGEN

#### 3. FDA Device Data (`/fda-data`)
- **Klick:** Sidebar → ZULASSUNGEN → FDA Device Data
- **Erwartet:** Seite lädt, zeigt FDA-Daten
- **API-Calls:** 
  - `GET /api/fda/approvals`
  - `GET /api/fda/events`
  - `GET /api/fda/recalls`
  - `GET /api/fda/all`
- **Prüfen:**
  - ✅ Seite lädt ohne Fehler
  - ✅ Browser-Konsole: Keine Fehler
  - ✅ Network-Tab: Alle API-Antworten sind JSON
  - ✅ FDA-Daten werden angezeigt

### STANDARDS & NORMEN

#### 4. ISO Standards (`/iso-standards`)
- **Klick:** Sidebar → STANDARDS & NORMEN → ISO Standards
- **Erwartet:** Seite lädt, zeigt ISO-Standards
- **API-Call:** Keine (statische Daten)
- **Prüfen:**
  - ✅ Seite lädt ohne Fehler
  - ✅ ISO-Standards werden angezeigt

#### 5. Entwicklung (`/product-development-navigator`)
- **Klick:** Sidebar → STANDARDS & NORMEN → Entwicklung
- **Erwartet:** Seite lädt, zeigt Product Development Navigator
- **API-Call:** `POST /api/navigator/start-project` (bei Generierung)
- **Prüfen:**
  - ✅ Seite lädt ohne Fehler
  - ✅ Formular funktioniert
  - ✅ API-Antwort ist JSON

#### 6. Project Kickstarter (`/project-kickstarter`)
- **Klick:** Sidebar → STANDARDS & NORMEN → Entwicklung → Project Kickstarter
- **Erwartet:** Seite lädt
- **Prüfen:**
  - ✅ Seite lädt ohne Fehler

#### 7. Projektmappe (`/project-notebook`)
- **Klick:** Sidebar → STANDARDS & NORMEN → Entwicklung → Projektmappe
- **Erwartet:** Seite lädt
- **Prüfen:**
  - ✅ Seite lädt ohne Fehler

### ERWEITERT

#### 8. Analytics (`/analytics`)
- **Klick:** Sidebar → ERWEITERT → Analytics
- **Erwartet:** Seite lädt, zeigt Analytics
- **API-Call:** `GET /api/dashboard/stats`
- **Prüfen:**
  - ✅ Seite lädt ohne Fehler
  - ✅ API-Antwort ist JSON
  - ✅ Analytics-Daten werden angezeigt

#### 9. Data Collection (`/data-collection`)
- **Klick:** Sidebar → ERWEITERT → Data Collection
- **Erwartet:** Seite lädt
- **API-Call:** `GET /api/data-sources`
- **Prüfen:**
  - ✅ Seite lädt ohne Fehler
  - ✅ API-Antwort ist JSON
  - ✅ Data Sources werden angezeigt

#### 10. Knowledge Base (`/knowledge-base`)
- **Klick:** Sidebar → ERWEITERT → Knowledge Base
- **Erwartet:** Seite lädt
- **API-Call:** `GET /api/knowledge-articles`
- **Prüfen:**
  - ✅ Seite lädt ohne Fehler
  - ✅ API-Antwort ist JSON
  - ✅ Knowledge Articles werden angezeigt

## 🔧 Browser-Konsole prüfen

1. **F12 drücken** → Console-Tab öffnen
2. **Prüfen auf:**
   - ❌ Rote Fehler (Errors)
   - ⚠️ Gelbe Warnungen (Warnings)
   - ✅ Keine 404-Fehler für API-Calls
   - ✅ Keine 500-Fehler für API-Calls

## 🌐 Network-Tab prüfen

1. **F12 drücken** → Network-Tab öffnen
2. **Für jeden API-Call prüfen:**
   - ✅ Status: 200 (OK)
   - ✅ Content-Type: `application/json` (nicht `text/html`)
   - ✅ Response: JSON-Format (nicht HTML)

## 📋 Checkliste

- [ ] Backend läuft auf `localhost:3000`
- [ ] Frontend läuft auf `localhost:5173`
- [ ] Alle Sidebar-Links getestet
- [ ] Browser-Konsole: Keine Fehler
- [ ] Network-Tab: Alle API-Antworten sind JSON
- [ ] Alle Seiten laden korrekt
- [ ] Daten werden angezeigt

## 🐛 Bekannte Probleme & Lösungen

### Problem: "Die Verbindung mit dem Remoteserver kann nicht hergestellt werden"
- **Lösung:** Backend ist nicht gestartet → `cd backend && npm run dev`

### Problem: API-Antwort ist HTML statt JSON
- **Lösung:** Route fehlt oder ist falsch konfiguriert → Prüfe `backend/src/app.ts`

### Problem: 404-Fehler für API-Call
- **Lösung:** Route fehlt → Prüfe ob Route in `backend/src/app.ts` registriert ist

### Problem: 500-Fehler für API-Call
- **Lösung:** Backend-Fehler → Prüfe Backend-Logs

