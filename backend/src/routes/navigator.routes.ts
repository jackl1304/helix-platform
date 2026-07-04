import { Router, Request, Response } from 'express';
import { Logger } from '../services/logger.service';
import { tenantIsolationMiddleware } from '../middleware/tenant-isolation';

const router = Router();
const logger = new Logger('Navigator-Routes');

// Apply tenant isolation middleware to all routes
router.use(tenantIsolationMiddleware);

/**
 * POST /api/navigator/start-project
 * Generate a project plan based on product idea
 */
router.post('/start-project', async (req: Request, res: Response) => {
  try {
    const { productIdea } = req.body;
    
    if (!productIdea || typeof productIdea !== 'string' || productIdea.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: 'Product idea is required'
      });
      return;
    }

    logger.info('Project plan generation requested', { productIdea: productIdea.substring(0, 100) });

    // Mock project plan generation
    // In production, this would call an AI service
    const projectPlan = {
      productIdea: productIdea.trim(),
      generatedAt: new Date().toISOString(),
      phases: [
        {
          title: 'Phase 1: Konzept & Planung',
          description: 'Initiale Produktkonzeption und regulatorische Planung',
          tasks: [
            'Produktkonzept definieren',
            'Regulatorische Anforderungen analysieren',
            'Marktanalyse durchführen',
            'Projektteam zusammenstellen'
          ],
          relevantDocuments: [
            { title: 'ISO 14971:2019 - Risk Management', type: 'Standard', url: 'https://www.iso.org/standard/72704.html' },
            { title: 'MDR 2017/745', type: 'Regulation', url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32017R0745' }
          ],
          templates: [
            { title: 'Projektplan-Vorlage', type: 'Template', url: '/templates/project-plan' }
          ]
        },
        {
          title: 'Phase 2: Entwicklung & Design',
          description: 'Produktentwicklung und Design-Validierung',
          tasks: [
            'Design-Spezifikationen erstellen',
            'Prototypen entwickeln',
            'Design-Reviews durchführen',
            'Design-Validierung planen'
          ],
          relevantDocuments: [
            { title: 'ISO 13485:2016 - Quality Management', type: 'Standard', url: 'https://www.iso.org/standard/59752.html' }
          ],
          templates: [
            { title: 'Design-Dokumentation-Vorlage', type: 'Template', url: '/templates/design-documentation' }
          ]
        },
        {
          title: 'Phase 3: Testing & Validierung',
          description: 'Produkttests und Validierung',
          tasks: [
            'Test-Plan erstellen',
            'Produkttests durchführen',
            'Validierungsstudien planen',
            'Test-Ergebnisse dokumentieren'
          ],
          relevantDocuments: [
            { title: 'ISO 10993-1:2018 - Biological Evaluation', type: 'Standard', url: 'https://www.iso.org/standard/68936.html' }
          ],
          templates: [
            { title: 'Test-Protokoll-Vorlage', type: 'Template', url: '/templates/test-protocol' }
          ]
        },
        {
          title: 'Phase 4: Zulassung & Markteinführung',
          description: 'Regulatorische Zulassung und Markteinführung',
          tasks: [
            'Zulassungsantrag vorbereiten',
            'Dokumentation zusammenstellen',
            'Zulassungsbehörde kontaktieren',
            'Markteinführung planen'
          ],
          relevantDocuments: [
            { title: 'FDA 510(k) Guidance', type: 'Guidance', url: 'https://www.fda.gov/medical-devices/premarket-submissions' }
          ],
          templates: [
            { title: 'Zulassungsantrag-Vorlage', type: 'Template', url: '/templates/submission' }
          ]
        }
      ]
    };

    res.json({
      success: true,
      data: projectPlan,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error generating project plan', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Failed to generate project plan'
    });
  }
});

export default router;

