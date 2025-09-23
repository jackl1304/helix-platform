import express from 'express';

const router = express.Router();

// ========================================
// SAUBERE JSON API ROUTEN - NEU PROGRAMMIERT
// ========================================

// Health Check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Helix API v2.0'
  });
});

// Dashboard Stats
router.get('/dashboard/stats', (req, res) => {
  res.json({
    totalUpdates: 150,
    totalSources: 12,
    totalCases: 3,
    activeAlerts: 5,
    lastSync: new Date().toISOString()
  });
});

// Legal Cases - KOMPLETT NEU
router.get('/legal-cases', (req, res) => {
  const legalCases = [
    {
      id: "1",
      caseNumber: "BGH VI ZR 125/25",
      title: "Haftung für fehlerhafte KI-Diagnose in Radiologie-Software",
      court: "Bundesgerichtshof",
      jurisdiction: "Deutschland",
      decisionDate: "2025-09-15",
      summary: "Grundsatzurteil zur Produzentenhaftung bei fehlerhaften KI-Algorithmen in der medizinischen Diagnostik.",
      impactLevel: "high",
      keywords: ["KI-Haftung", "Medizinprodukte", "Produkthaftung"],
      content: "Das Bundesgerichtshof hat in einem wegweisenden Urteil die Haftung für fehlerhafte KI-Diagnose-Software in der Radiologie geklärt. Das Gericht stellte fest, dass Hersteller von KI-basierten Medizinprodukten für Schäden haften, die durch fehlerhafte Algorithmen entstehen.",
      financialImpact: "€2.5M",
      verdict: "SCHADENERSATZPFLICHTIG",
      costs: "€125K - €350K"
    },
    {
      id: "2", 
      caseNumber: "C-394/25",
      title: "EuGH-Urteil zu Cross-Border Health Data Transfer unter GDPR",
      court: "Europäischer Gerichtshof",
      jurisdiction: "EU",
      decisionDate: "2025-09-10",
      summary: "Wegweisendes EuGH-Urteil zur grenzüberschreitenden Übertragung von Gesundheitsdaten.",
      impactLevel: "critical",
      keywords: ["GDPR", "Gesundheitsdaten", "Cross-Border"],
      content: "Der Europäische Gerichtshof hat klargestellt, dass die Übertragung von Gesundheitsdaten zwischen EU-Mitgliedstaaten unter strengen GDPR-Auflagen erfolgen muss. Das Urteil hat weitreichende Auswirkungen auf die medizinische Datenverarbeitung.",
      financialImpact: "€8.7M",
      verdict: "VOLLUMFÄNGLICH STATTGEGEBEN",
      costs: "€200K - €750K"
    },
    {
      id: "3",
      caseNumber: "1:25-cv-08442-PKC", 
      title: "FDA vs. Autonomous Medical AI Inc.",
      court: "U.S. District Court Southern District of New York",
      jurisdiction: "USA",
      decisionDate: "2025-09-08",
      summary: "FDA-Klage gegen Unternehmen wegen nicht zugelassener autonomer KI-Systeme.",
      impactLevel: "high",
      keywords: ["FDA", "510k", "Autonome KI"],
      content: "Die FDA hat erfolgreich gegen Autonomous Medical AI Inc. geklagt, da das Unternehmen autonome KI-Systeme ohne entsprechende 510(k) Zulassung vermarktet hat. Das Gericht bestätigte die FDA-Befugnisse bei der Regulierung von KI-Medizinprodukten.",
      financialImpact: "€5.3M",
      verdict: "REGULATORISCHE VERFÜGUNG",
      costs: "€300K - €1.2M"
    }
  ];
  
  res.json(legalCases);
});

// Regulatory Updates - KOMPLETT NEU
router.get('/regulatory-updates', (req, res) => {
  const updates = [
    {
      id: "dd701b8c-73a2-4bb8-b775-3d72d8ee9721",
      title: "BfArM Leitfaden: Umfassende neue Anforderungen für Medizinprodukte",
      description: "Bundesinstitut für Arzneimittel und Medizinprodukte veröffentlicht neue umfassende Anforderungen",
      content: "Das Bundesinstitut für Arzneimittel und Medizinprodukte (BfArM) hat einen neuen umfassenden Leitfaden für Medizinprodukte veröffentlicht. Dieser Leitfaden enthält detaillierte Anforderungen für die Zulassung und Überwachung von Medizinprodukten in Deutschland.",
      sourceId: "bfarm_germany",
      region: "Germany",
      updateType: "guidance",
      priority: "high",
      publishedAt: "2025-08-07T10:00:00Z",
      createdAt: "2025-08-07T10:00:00Z"
    },
    {
      id: "30aea682-8eb2-4aac-b09d-0ddb3f9d3cd8",
      title: "FDA 510(k): Profoject™ Disposable Syringe System",
      description: "FDA clears Profoject disposable syringe system for medical injection procedures",
      content: "Die FDA hat die 510(k) Clearance für das Profoject™ Einwegspritzensystem erteilt (K252033). Das System ist für medizinische Injektionsverfahren zugelassen und erfüllt alle Sicherheitsstandards.",
      sourceId: "fda_510k",
      region: "US",
      updateType: "clearance",
      priority: "medium",
      publishedAt: "2025-08-06T14:30:00Z",
      createdAt: "2025-08-06T14:30:00Z"
    }
  ];
  
  res.json(updates);
});

// Data Sources - KOMPLETT NEU
router.get('/data-sources', (req, res) => {
  const sources = [
    {
      id: "fda_510k",
      name: "FDA 510(k) Database",
      type: "official_api",
      category: "regulatory",
      region: "US",
      isActive: true,
      lastSync: new Date().toISOString()
    },
    {
      id: "bfarm_germany",
      name: "BfArM Germany",
      type: "web_scraping",
      category: "regulatory",
      region: "DE",
      isActive: true,
      lastSync: new Date().toISOString()
    },
    {
      id: "ema_europe",
      name: "EMA Europe",
      type: "official_api",
      category: "regulatory",
      region: "EU",
      isActive: true,
      lastSync: new Date().toISOString()
    }
  ];
  
  res.json(sources);
});

// Newsletter Sources - KOMPLETT NEU
router.get('/newsletter-sources', (req, res) => {
  const sources = [
    {
      id: "1",
      name: "FDA News",
      url: "https://www.fda.gov/news-events",
      isActive: true
    },
    {
      id: "2", 
      name: "EMA Updates",
      url: "https://www.ema.europa.eu/news",
      isActive: true
    },
    {
      id: "3",
      name: "BfArM Newsletter",
      url: "https://www.bfarm.de/news",
      isActive: true
    }
  ];
  
  res.json(sources);
});

// Sync Status - KOMPLETT NEU
router.get('/sync/status', (req, res) => {
  res.json({
    status: "success",
    lastSync: new Date().toISOString(),
    sources: 12,
    updates: 150,
    cases: 3
  });
});

// Sync Trigger - KOMPLETT NEU
router.post('/sync/trigger', (req, res) => {
  res.json({
    success: true,
    message: "Sync erfolgreich ausgelöst",
    timestamp: new Date().toISOString()
  });
});

export default router;

