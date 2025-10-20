import { Router } from 'express';
import { storage } from '../storage';
import { Logger } from '../services/logger.service';

const router = Router();
const logger = new Logger('ProjectWorkbench');

/**
 * Generiert eine strukturierte Projektmappe für eine Produktidee.
 * Durchsucht alle relevanten Datenquellen und ordnet sie den Entwicklungsphasen zu.
 */
router.post('/generate', async (req, res) => {
  const { productIdea } = req.body;

  if (!productIdea || typeof productIdea !== 'string') {
    return res.status(400).json({ error: 'Eine Produktidee (productIdea) als Text ist erforderlich.' });
  }

  logger.info(`Generiere Projektmappe für Idee: "${productIdea}"`);

  try {
    // 1. Daten aus allen Quellen abrufen
    const [regulatoryUpdates, legalCases, knowledgeArticles, dataSources] = await Promise.all([
      storage.getAllRegulatoryUpdates(500),
      storage.getAllLegalCases(),
      storage.getAllKnowledgeArticles(),
      storage.getAllDataSources(),
    ]);

    // 2. Keywords aus der Produktidee extrahieren (simple version)
    const ideaLower = productIdea.toLowerCase();
    const keywords = ideaLower.split(/\s+/).filter(kw => kw.length > 3);
    keywords.push(...getTopicKeywords(ideaLower));
    // NEU: Extrahiere Normen wie "iso 14971" oder "iec 62304" als ganze Phrasen
    const standardRegex = /(iso|iec|meddev)[\s-]?\d+/g;
    keywords.push(...(ideaLower.match(standardRegex) || []));

    // 3. Daten filtern und den Phasen zuordnen
    const filterByKeywords = (item: any) => {
      const content = `${item.title || ''} ${item.description || ''} ${item.content || ''} ${item.summary || ''} ${(item.tags || []).join(' ')}`.toLowerCase();
      return keywords.some(kw => content.includes(kw));
    };

    const projectMap = {
      ideaPhase: {
        title: 'Phase 1: Idee & Marktanalyse',
        description: 'Relevante Marktinformationen, bestehende Produkte und rechtliche Rahmenbedingungen.',
        marketAnalysis: knowledgeArticles.filter(filterByKeywords).filter(a => a.category === 'market_analysis'),
        competitorProducts: regulatoryUpdates.filter(filterByKeywords).filter(u => u.update_type === 'approval'),
      },
      developmentPhase: {
        title: 'Phase 2: Entwicklung & Design',
        description: 'Anwendbare Normen, technische Anforderungen und Design-Control-Dokumente.',
        relevantStandards: knowledgeArticles.filter(filterByKeywords).filter(a => a.category === 'standard'),
        templates: getDocumentTemplates('development'),
      },
      clinicalPhase: {
        title: 'Phase 3: Klinische Bewertung',
        description: 'Anforderungen an klinische Studien, Datenerhebung und ethische Richtlinien.',
        clinicalGuidance: regulatoryUpdates.filter(filterByKeywords).filter(u => u.update_type === 'guidance' && (u.title?.toLowerCase().includes('clinical') || u.content?.toLowerCase().includes('clinical'))),
        templates: getDocumentTemplates('clinical'),
      },
      regulatoryPhase: {
        title: 'Phase 4: Zulassung',
        description: 'Zulassungsrelevante Dokumente, Leitfäden und Formulare für Zielregionen.',
        submissionGuidance: regulatoryUpdates.filter(filterByKeywords).filter(u => u.update_type === 'guidance'),
        relevantLegalCases: legalCases.filter(filterByKeywords),
        templates: getDocumentTemplates('regulatory'),
      },
      postMarketPhase: {
        title: 'Phase 5: Post-Market Surveillance',
        description: 'Anforderungen an die Überwachung nach der Markteinführung.',
        postMarketGuidance: regulatoryUpdates.filter(filterByKeywords).filter(u => u.title?.toLowerCase().includes('post-market')),
        templates: getDocumentTemplates('post-market'),
      }
    };

    res.json({ success: true, projectMap });

  } catch (error) {
    logger.error('Fehler bei der Erstellung der Projektmappe', error);
    res.status(500).json({ error: 'Interne Serverfehler bei der Analyse.' });
  }
});

// Helper-Funktionen

function getTopicKeywords(idea: string): string[] {
  const topics: Record<string, string[]> = {
    'ki': ['ai', 'artificial intelligence', 'machine learning', 'ml', 'algorithmus'],
    'diagnose': ['diagnostic', 'diagnosis', 'erkennung', 'befundung'],
    'implantat': ['implant', 'implantable'],
    'software': ['samd', 'software as a medical device'],
    'samd': ['software', 'software as a medical device'],
    'kardio': ['cardiac', 'cardiology', 'herz', 'herz-kreislauf'],
    'qms': ['quality management system'],
    'qsr': ['quality system regulation'],
    'ivd': ['in-vitro', 'in vitro', 'diagnostikum'],
  };
  return Object.entries(topics).flatMap(([key, values]) => idea.includes(key) ? values : []);
}

function getDocumentTemplates(phase: string): any[] {
  const templates: Record<string, any[]> = {
    development: [
      { name: 'Software-Anforderungsspezifikation (SRS)', type: 'md', link: '/templates/software-requirements-specification.md' },
      { name: 'Anforderungs-Spezifikation (Lastenheft)', type: 'md', link: '/templates/anforderungsspezifikation.md' },
      { name: 'Risikomanagement-Plan (ISO 14971)', type: 'md', link: '/templates/risikomanagement-plan.md' },
      { name: 'Usability-Akte (IEC 62366)', type: 'md', link: '/templates/usability-akte-iec62366.md' },
      { name: 'Software-Lebenszyklus (IEC 62304)', type: 'md', link: '/templates/software-lifecycle-iec62304.md' },
    ],
    clinical: [
      { name: 'Klinischer Bewertungsplan (CEP)', type: 'md', link: '/templates/cep.md' },
      { name: 'Klinische Bewertung (MEDDEV 2.7/1 rev 4)', type: 'md', link: '/templates/klinische-bewertung-meddev.md' },
      { name: 'Plan zur klinischen Überwachung (PMCF-Plan)', type: 'md', link: '/templates/pmcf-plan.md' },
    ],
    regulatory: [
      { name: 'Konformitätserklärung (Declaration of Conformity)', type: 'md', link: '/templates/declaration-of-conformity.md' },
      { name: 'Datenschutz-Folgenabschätzung (DSFA)', type: 'md', link: '/templates/datenschutz-folgenabschaetzung.md' },
      { name: 'Vorlage: Technische Dokumentation (MDR)', type: 'md', link: '/templates/technische-dokumentation-mdr.md' },
      { name: 'Checkliste: Technische Dokumentation (MDR)', type: 'md', link: '/templates/td-checklist-mdr.md' },
      { name: '510(k) Submission-Vorlage', type: 'md', link: '/templates/510k-submission.md' },
    ],
    'post-market': [
      { name: 'PMCF-Bewertungsbericht', type: 'md', link: '/templates/pmcf-evaluation-report.md' },
      { name: 'Post-Market Surveillance (PMS) Plan', type: 'md', link: '/templates/pms-plan.md' },
      { name: 'PMS-Bericht (Klasse I)', type: 'md', link: '/templates/pms-report-class-i.md' },
      { name: 'Periodischer Sicherheitsbericht (PSUR)', type: 'md', link: '/templates/psur-bericht.md' },
    ]
  };
  return templates[phase] || [];
}

export default router;
