# 🌍 WELTWEITE REGULATORISCHE DATENQUELLEN FÜR HELIX PLATFORM

## 📊 ÜBERSICHT

Diese Dokumentation enthält eine umfassende Liste aller weltweiten regulatorischen Datenquellen für die Helix Regulatory Intelligence Platform, einschließlich APIs, Web-Scraping-Quellen und kostenpflichtiger Dienste.

---

## 🇺🇸 **USA - UNITED STATES**

### 1. **FDA (Food and Drug Administration)**

#### openFDA API
- **URL**: `https://api.fda.gov`
- **Typ**: Kostenlose öffentliche API
- **Kategorien**:
  - Medical Devices (`/device/510k.json`)
  - Drug Approvals (`/drug/drugsfda.json`)
  - Adverse Events (`/device/event.json`)
  - Recalls (`/device/recall.json`)
  - PMA Approvals (`/device/pma.json`)
  - Device Classification (`/device/classification.json`)
- **Rate Limits**: 240 requests/minute (ohne API-Key), 120.000 requests/day (mit API-Key)
- **Update-Frequenz**: Täglich
- **Synchronisation**: Alle 30 Minuten
- **API-Dokumentation**: https://open.fda.gov/apis/

#### FDA MAUDE Database (Medical Device Reporting)
- **URL**: `https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfmaude/search.cfm`
- **Typ**: Web-Scraping + CSV-Download
- **Kategorien**: Adverse Events, Device Problems
- **Update-Frequenz**: Wöchentlich
- **Synchronisation**: Alle 30 Minuten

#### FDA Establishment Registration & Device Listing
- **URL**: `https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfRL/rl.cfm`
- **Typ**: Web-Scraping
- **Kategorien**: Registered Establishments, Listed Devices
- **Update-Frequenz**: Täglich

### 2. **ClinicalTrials.gov**
- **URL**: `https://clinicaltrials.gov/api/v2/studies`
- **Typ**: Kostenlose öffentliche API
- **Kategorien**: Clinical Trials, Medical Device Studies
- **Rate Limits**: Unbegrenzt
- **Update-Frequenz**: Täglich
- **Synchronisation**: Alle 30 Minuten
- **API-Dokumentation**: https://clinicaltrials.gov/data-api/api

### 3. **CDER (Center for Drug Evaluation and Research)**
- **URL**: Web-Scraping von FDA-Website
- **Typ**: Web-Scraping
- **Kategorien**: Drug Approvals, Clinical Trials

---

## 🇪🇺 **EUROPA - EUROPEAN UNION**

### 4. **EMA (European Medicines Agency)**

#### EMA Public API
- **URL**: `https://www.ema.europa.eu/en/about-us/how-we-work/big-data/data-analysis-real-world-interrogation-network-darwin-eu`
- **Typ**: Öffentliche API (teilweise)
- **Kategorien**:
  - Medicine Approvals
  - Safety Updates
  - Regulatory Guidelines
- **Update-Frequenz**: Wöchentlich
- **Synchronisation**: Alle 30 Minuten

#### EUDAMED (European Database on Medical Devices)
- **URL**: `https://ec.europa.eu/tools/eudamed/#/screen/home`
- **Typ**: Web-Scraping (teilweise öffentlich)
- **Kategorien**: Medical Device Registrations, UDI Database
- **Update-Frequenz**: Täglich
- **Synchronisation**: Alle 30 Minuten

### 5. **MDR/IVDR Updates (EU)**
- **URL**: `https://ec.europa.eu/health/medical-devices_en`
- **Typ**: Web-Scraping + RSS Feeds
- **Kategorien**: MDR 2017/745, IVDR 2017/746
- **Update-Frequenz**: Bei Bedarf

---

## 🇩🇪 **DEUTSCHLAND - GERMANY**

### 6. **BfArM (Bundesinstitut für Arzneimittel und Medizinprodukte)**
- **URL**: `https://www.bfarm.de`
- **Typ**: Web-Scraping + Newsletter
- **Kategorien**:
  - Medizinprodukte-Zulassungen
  - Leitfäden und Bekanntmachungen
  - Rückrufe und Sicherheitsinformationen
- **Update-Frequenz**: Täglich
- **Synchronisation**: Alle 30 Minuten

### 7. **PEI (Paul-Ehrlich-Institut)**
- **URL**: `https://www.pei.de`
- **Typ**: Web-Scraping
- **Kategorien**: Impfstoffe, Sera, Blutprodukte
- **Update-Frequenz**: Wöchentlich

### 8. **DIMDI (Deutsches Institut für Medizinische Dokumentation)**
- **URL**: `https://www.dimdi.de`
- **Typ**: Web-Scraping
- **Kategorien**: Klassifikationen, Terminologien
- **Update-Frequenz**: Monatlich

---

## 🇨🇭 **SCHWEIZ - SWITZERLAND**

### 9. **Swissmedic**
- **URL**: `https://www.swissmedic.ch`
- **Typ**: Web-Scraping + Newsletter
- **Kategorien**:
  - Arzneimittel-Zulassungen
  - Medizinprodukte-Registrierungen
  - Sicherheitsinformationen
- **Update-Frequenz**: Täglich
- **Synchronisation**: Alle 30 Minuten

---

## 🇨🇦 **KANADA - CANADA**

### 10. **Health Canada**
- **URL**: `https://www.canada.ca/en/health-canada.html`
- **Typ**: Web-Scraping + Open Data API
- **Kategorien**:
  - Medical Device Licences
  - Drug Product Database
  - Recalls and Safety Alerts
- **Update-Frequenz**: Täglich
- **Synchronisation**: Alle 30 Minuten

#### Health Canada Open Data Portal
- **URL**: `https://open.canada.ca/data/en/dataset`
- **Typ**: Kostenlose API
- **Kategorien**: Medical Device Licences, Drug Products
- **API-Dokumentation**: https://open.canada.ca/data/en/dataset/

---

## 🇬🇧 **GROSSBRITANNIEN - UNITED KINGDOM**

### 11. **MHRA (Medicines and Healthcare products Regulatory Agency)**
- **URL**: `https://www.gov.uk/government/organisations/medicines-and-healthcare-products-regulatory-agency`
- **Typ**: Web-Scraping + API (teilweise)
- **Kategorien**:
  - Medical Device Registrations
  - Drug Approvals
  - Safety Alerts
- **Update-Frequenz**: Täglich
- **Synchronisation**: Alle 30 Minuten

---

## 🇦🇺 **AUSTRALIEN - AUSTRALIA**

### 12. **TGA (Therapeutic Goods Administration)**
- **URL**: `https://www.tga.gov.au`
- **Typ**: Web-Scraping + Database Downloads
- **Kategorien**:
  - Medical Device Registrations (ARTG)
  - Medicine Approvals
  - Recalls and Safety Information
- **Update-Frequenz**: Wöchentlich
- **Synchronisation**: Alle 30 Minuten

#### ARTG (Australian Register of Therapeutic Goods)
- **URL**: `https://www.tga.gov.au/artg`
- **Typ**: Downloadbare Datenbank
- **Kategorien**: Registered Medical Devices, Medicines

---

## 🇯🇵 **JAPAN**

### 13. **PMDA (Pharmaceuticals and Medical Devices Agency)**
- **URL**: `https://www.pmda.go.jp/english/`
- **Typ**: Web-Scraping (Englisch + Japanisch)
- **Kategorien**:
  - Medical Device Approvals
  - Pharmaceutical Approvals
  - Safety Information
- **Update-Frequenz**: Wöchentlich
- **Synchronisation**: Alle 30 Minuten

---

## 🇨🇳 **CHINA**

### 14. **NMPA (National Medical Products Administration)**
- **URL**: `https://www.nmpa.gov.cn`
- **Typ**: Web-Scraping (Chinesisch + Englisch)
- **Kategorien**:
  - Medical Device Registrations
  - Drug Approvals
  - Regulatory Guidelines
- **Update-Frequenz**: Wöchentlich
- **Synchronisation**: Alle 30 Minuten

---

## 🇰🇷 **SÜDKOREA - SOUTH KOREA**

### 15. **MFDS (Ministry of Food and Drug Safety)**
- **URL**: `https://www.mfds.go.kr/eng/`
- **Typ**: Web-Scraping
- **Kategorien**:
  - Medical Device Approvals
  - Pharmaceutical Approvals
  - Safety Alerts
- **Update-Frequenz**: Wöchentlich

---

## 🇮🇳 **INDIEN - INDIA**

### 16. **CDSCO (Central Drugs Standard Control Organisation)**
- **URL**: `https://cdsco.gov.in`
- **Typ**: Web-Scraping
- **Kategorien**:
  - Medical Device Approvals
  - Drug Approvals
  - Import Licences
- **Update-Frequenz**: Wöchentlich

---

## 🇧🇷 **BRASILIEN - BRAZIL**

### 17. **ANVISA (Agência Nacional de Vigilância Sanitária)**
- **URL**: `https://www.gov.br/anvisa`
- **Typ**: Web-Scraping + API (teilweise)
- **Kategorien**:
  - Medical Device Registrations
  - Drug Approvals
  - Safety Alerts
- **Update-Frequenz**: Wöchentlich
- **Synchronisation**: Alle 30 Minuten

---

## 🌐 **INTERNATIONALE ORGANISATIONEN**

### 18. **WHO (World Health Organization)**
- **URL**: `https://www.who.int`
- **Typ**: Web-Scraping + RSS Feeds
- **Kategorien**:
  - Global Health Alerts
  - Medical Device Pre-qualification
  - Regulatory Guidelines
- **Update-Frequenz**: Täglich
- **Synchronisation**: Alle 30 Minuten

### 19. **IMDRF (International Medical Device Regulators Forum)**
- **URL**: `http://www.imdrf.org`
- **Typ**: Web-Scraping + Document Downloads
- **Kategorien**:
  - Regulatory Harmonization
  - Guidance Documents
  - Working Group Reports
- **Update-Frequenz**: Monatlich

### 20. **ICH (International Council for Harmonisation)**
- **URL**: `https://www.ich.org`
- **Typ**: Web-Scraping + Document Downloads
- **Kategorien**:
  - Pharmaceutical Guidelines
  - Quality Standards
  - Safety Guidelines
- **Update-Frequenz**: Bei Bedarf

---

## 📰 **FACH-NEWSLETTER UND NEWS-QUELLEN**

### 21. **Regulatory Affairs Professionals Society (RAPS)**
- **URL**: `https://www.raps.org`
- **Typ**: Web-Scraping + Newsletter
- **Kategorien**: Regulatory News, Industry Updates
- **Update-Frequenz**: Täglich
- **Kosten**: Teilweise kostenpflichtig

### 22. **MedTech Dive**
- **URL**: `https://www.medtechdive.com`
- **Typ**: RSS Feed + Web-Scraping
- **Kategorien**: Medical Device News, Regulatory Updates
- **Update-Frequenz**: Täglich

### 23. **Regulatory Focus (RAPS)**
- **URL**: `https://www.raps.org/regulatory-focus`
- **Typ**: Web-Scraping + Newsletter
- **Kategorien**: Regulatory News, Expert Analysis
- **Update-Frequenz**: Täglich
- **Kosten**: Kostenpflichtig (Subscription)

### 24. **FDA Law Blog**
- **URL**: `https://www.fdalawblog.net`
- **Typ**: RSS Feed
- **Kategorien**: FDA Legal Updates, Regulatory Analysis
- **Update-Frequenz**: Wöchentlich

### 25. **EMA News**
- **URL**: `https://www.ema.europa.eu/en/news`
- **Typ**: RSS Feed + Web-Scraping
- **Kategorien**: EMA Announcements, Drug Approvals
- **Update-Frequenz**: Täglich

---

## 📊 **KOSTENPFLICHTIGE DATENQUELLEN (PREMIUM)**

### 26. **GlobalData Healthcare Intelligence**
- **URL**: `https://www.globaldata.com`
- **Typ**: Premium API
- **Kategorien**:
  - Regulatory Intelligence
  - Clinical Trials Database
  - Market Analysis
- **Kosten**: €50.000 - €150.000/Jahr
- **Update-Frequenz**: Täglich
- **Synchronisation**: Alle 30 Minuten

### 27. **Citeline (Pharma Intelligence)**
- **URL**: `https://citeline.pharmamedtechbi.com`
- **Typ**: Premium API
- **Kategorien**:
  - Regulatory Intelligence
  - Drug Development Database
  - Medical Device Approvals
- **Kosten**: €30.000 - €100.000/Jahr
- **Update-Frequenz**: Täglich

### 28. **Cortellis Regulatory Intelligence (Clarivate)**
- **URL**: `https://www.cortellis.com`
- **Typ**: Premium API
- **Kategorien**:
  - Global Regulatory Approvals
  - Clinical Trials
  - Regulatory Submissions
- **Kosten**: €40.000 - €120.000/Jahr
- **Update-Frequenz**: Täglich

### 29. **IQVIA Regulatory Intelligence**
- **URL**: `https://www.iqvia.com`
- **Typ**: Premium API
- **Kategorien**:
  - Global Regulatory Database
  - Market Access Intelligence
  - Compliance Monitoring
- **Kosten**: €60.000 - €200.000/Jahr
- **Update-Frequenz**: Täglich

### 30. **Evaluate Pharma / MedTech**
- **URL**: `https://www.evaluate.com`
- **Typ**: Premium API
- **Kategorien**:
  - Pharmaceutical & Medical Device Database
  - Market Forecasts
  - Pipeline Analysis
- **Kosten**: €25.000 - €80.000/Jahr
- **Update-Frequenz**: Wöchentlich

---

## 🔧 **IMPLEMENTIERTE SYNCHRONISATIONS-STRATEGIE**

### Synchronisations-Intervalle

```javascript
// 30-Minuten-Synchronisation
const SYNC_INTERVAL = 30 * 60 * 1000; // 30 Minuten in Millisekunden

// Kategorisierung nach Priorität
const PRIORITY_HIGH = 30 * 60 * 1000;     // 30 Minuten
const PRIORITY_MEDIUM = 60 * 60 * 1000;   // 60 Minuten
const PRIORITY_LOW = 120 * 60 * 1000;     // 120 Minuten
```

### Priorisierung der Quellen

**Hohe Priorität (30 Minuten)**:
- FDA openFDA API
- EMA Updates
- BfArM Deutschland
- Swissmedic
- Health Canada
- WHO Global Health Alerts

**Mittlere Priorität (60 Minuten)**:
- MHRA UK
- TGA Australia
- PMDA Japan
- Newsletter-Quellen
- Premium-Datenquellen

**Niedrige Priorität (120 Minuten)**:
- NMPA China
- MFDS Südkorea
- CDSCO Indien
- ANVISA Brasilien
- Fach-Newsletters

---

## 🚀 **NÄCHSTE IMPLEMENTIERUNGS-SCHRITTE**

1. **Phase 1: Kostenlose APIs implementieren**
   - openFDA
   - ClinicalTrials.gov
   - Health Canada Open Data
   - EMA (teilweise)

2. **Phase 2: Web-Scraping für wichtige Quellen**
   - BfArM Deutschland
   - Swissmedic
   - MHRA UK
   - TGA Australia

3. **Phase 3: Premium-Datenquellen evaluieren**
   - GlobalData Healthcare Intelligence
   - Citeline
   - Cortellis
   - IQVIA

4. **Phase 4: Asiatische Märkte**
   - PMDA Japan
   - NMPA China
   - MFDS Südkorea
   - CDSCO Indien

---

## 📈 **GEPLANTE COVERAGE**

| Region | Anzahl Quellen | Status | Priorität |
|--------|---------------|--------|-----------|
| USA | 3 | ✅ Implementiert | Hoch |
| EU | 2 | ✅ Implementiert | Hoch |
| Deutschland | 3 | 🔄 Teilweise | Hoch |
| Schweiz | 1 | 🔄 Teilweise | Hoch |
| Kanada | 1 | ✅ Implementiert | Hoch |
| UK | 1 | ⏳ Geplant | Mittel |
| Australien | 1 | ⏳ Geplant | Mittel |
| Japan | 1 | ⏳ Geplant | Mittel |
| China | 1 | ⏳ Geplant | Niedrig |
| Südkorea | 1 | ⏳ Geplant | Niedrig |
| Indien | 1 | ⏳ Geplant | Niedrig |
| Brasilien | 1 | ⏳ Geplant | Niedrig |
| WHO | 1 | ✅ Implementiert | Hoch |
| Premium-Quellen | 5 | 📋 Evaluierung | Hoch |

**Gesamt**: 30+ Datenquellen

---

## ⚙️ **TECHNISCHE IMPLEMENTIERUNG**

### API-Rate-Limiting

```javascript
const rateLimiter = {
  openFDA: {
    requestsPerMinute: 240,
    requestsPerDay: 120000
  },
  clinicalTrials: {
    requestsPerMinute: 1000,
    requestsPerDay: Infinity
  }
};
```

### Fehlerbehandlung

```javascript
const retryStrategy = {
  maxRetries: 3,
  backoffMultiplier: 2,
  initialDelay: 1000
};
```

### Caching

```javascript
const cacheStrategy = {
  highPriority: 30 * 60 * 1000,    // 30 Minuten
  mediumPriority: 60 * 60 * 1000,  // 60 Minuten
  lowPriority: 120 * 60 * 1000     // 120 Minuten
};
```

---

## 📝 **ZUSAMMENFASSUNG**

Die Helix Regulatory Intelligence Platform integriert:

- **30+ weltweite Datenquellen**
- **Synchronisation alle 30 Minuten** für kritische Quellen
- **Kostenlose APIs**: FDA, ClinicalTrials.gov, Health Canada
- **Web-Scraping**: BfArM, Swissmedic, MHRA, TGA
- **Premium-Optionen**: GlobalData, Citeline, Cortellis, IQVIA
- **Weltweite Abdeckung**: USA, EU, UK, Kanada, Schweiz, Australien, Japan, China, Indien, Brasilien

**Nächster Schritt**: Implementierung der Synchronisations-Engine im Backend!

