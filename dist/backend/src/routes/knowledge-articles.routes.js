import { Router } from 'express';
import { Logger } from '../services/logger.service';
import { tenantIsolationMiddleware } from '../middleware/tenant-isolation';
const router = Router();
const logger = new Logger('KnowledgeArticles-Routes');
router.use(tenantIsolationMiddleware);
const mockKnowledgeArticles = [
    {
        id: 'ka_1',
        title: 'MDR 2017/745 - Medical Device Regulation',
        content: 'Die Medical Device Regulation (MDR) 2017/745 ist die neue EU-Verordnung für Medizinprodukte...',
        category: 'regulation',
        tags: ['MDR', 'EU', 'Regulation'],
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        authority: 'European Commission',
        region: 'EU',
        priority: 'high',
        language: 'de',
        summary: 'Überblick über die MDR 2017/745',
        source: 'EU Official Journal',
        url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32017R0745'
    },
    {
        id: 'ka_2',
        title: 'ISO 14971:2019 - Risk Management',
        content: 'ISO 14971:2019 beschreibt die Anwendung des Risikomanagements auf Medizinprodukte...',
        category: 'standard',
        tags: ['ISO', 'Risk Management', 'Standard'],
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        authority: 'ISO',
        region: 'Global',
        priority: 'high',
        language: 'de',
        summary: 'Überblick über ISO 14971:2019',
        source: 'ISO',
        url: 'https://www.iso.org/standard/72704.html'
    }
];
router.get('/', async (req, res) => {
    try {
        logger.info('Knowledge articles requested');
        res.json(mockKnowledgeArticles);
    }
    catch (error) {
        logger.error('Error fetching knowledge articles', {
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        res.status(500).json({
            success: false,
            error: 'Failed to fetch knowledge articles',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        logger.info(`Knowledge article requested: ${id}`);
        const article = mockKnowledgeArticles.find(ka => ka.id === id);
        if (!article) {
            res.status(404).json({
                success: false,
                error: 'Not found',
                message: 'Knowledge article not found'
            });
            return;
        }
        res.json(article);
    }
    catch (error) {
        logger.error('Error fetching knowledge article', {
            error: error instanceof Error ? error.message : 'Unknown error',
            id: req.params.id
        });
        res.status(500).json({
            success: false,
            error: 'Failed to fetch knowledge article',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
export default router;
//# sourceMappingURL=knowledge-articles.routes.js.map