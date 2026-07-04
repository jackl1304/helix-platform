import { Router, Request, Response } from 'express';
import { Logger } from '../services/logger.service';
import { tenantIsolationMiddleware } from '../middleware/tenant-isolation';

const router = Router();
const logger = new Logger('DataSources-Routes');

// Apply tenant isolation middleware to all routes
router.use(tenantIsolationMiddleware);

// ==========================================
// MOCK DATA (Placeholder)
// ==========================================

const mockDataSources = [
  {
    id: 'ds_1',
    name: 'FDA News & Updates',
    type: 'regulatory',
    category: 'regulatory',
    region: 'US',
    endpoint: 'https://www.fda.gov/news-events/fda-newsroom',
    description: 'FDA News and Updates',
    status: 'active',
    lastSync: new Date().toISOString(),
    syncFrequency: 'hourly',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ds_2',
    name: 'EMA News',
    type: 'regulatory',
    category: 'regulatory',
    region: 'EU',
    endpoint: 'https://www.ema.europa.eu/en/news',
    description: 'EMA News and Updates',
    status: 'active',
    lastSync: new Date().toISOString(),
    syncFrequency: 'hourly',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// ==========================================
// ROUTES
// ==========================================

/**
 * GET /api/data-sources
 * Get all data sources
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    logger.info('Data sources requested');
    
    res.json(mockDataSources);
  } catch (error) {
    logger.error('Error fetching data sources', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch data sources',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/data-sources/:id
 * Get a specific data source by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    logger.info(`Data source requested: ${id}`);
    
    const dataSource = mockDataSources.find(ds => ds.id === id);
    
    if (!dataSource) {
      res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Data source not found'
      });
      return;
    }
    
    res.json(dataSource);
  } catch (error) {
    logger.error('Error fetching data source', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id
    });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch data source',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;

