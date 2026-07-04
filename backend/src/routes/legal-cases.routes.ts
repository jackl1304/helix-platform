import { Router, Request, Response } from 'express';
import { Logger } from '../services/logger.service';
import { tenantIsolationMiddleware } from '../middleware/tenant-isolation';
import { legalCasesService } from '../services/legal-cases.service';

const logger = new Logger('LegalCasesRoutes');
const router = Router();

// Apply tenant isolation middleware to all routes
router.use(tenantIsolationMiddleware);

// ==========================================
// ROUTES
// ==========================================

/**
 * GET /api/legal-cases
 * Get all legal cases from database
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || 'demo-medical-tech';
    logger.info('Legal cases requested', {
      tenantId,
      path: req.path
    });
    
    // Fetch real data from database
    const legalCases = await legalCasesService.getAllLegalCases(tenantId);
    
    // Handle empty results gracefully
    if (!legalCases || legalCases.length === 0) {
      logger.info('No legal cases found in database', { tenantId });
      return res.json({
        success: true,
        data: [],
        count: 0,
        timestamp: new Date().toISOString(),
        message: 'No legal cases found'
      });
    }
    
    // Transform to match frontend expectations
    const transformedCases = legalCases.map(case_ => ({
      id: case_.id,
      case_number: case_.caseNumber,
      caseNumber: case_.caseNumber,
      title: case_.title,
      court: case_.court,
      jurisdiction: case_.jurisdiction,
      decision_date: case_.decisionDate ? new Date(case_.decisionDate).toISOString().split('T')[0] : null,
      decisionDate: case_.decisionDate ? new Date(case_.decisionDate).toISOString().split('T')[0] : null,
      summary: case_.summary || '',
      content: case_.content || '',
      verdict: case_.verdict,
      damages: case_.damages,
      document_url: case_.documentUrl,
      documentUrl: case_.documentUrl,
      impact_level: case_.impactLevel || 'medium',
      impactLevel: case_.impactLevel || 'medium',
      keywords: case_.keywords || [],
      tags: case_.keywords || []
    }));
    
    logger.info(`Returning ${transformedCases.length} legal cases`, { tenantId });
    
    res.json({
      success: true,
      data: transformedCases,
      count: transformedCases.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    logger.error('Error fetching legal cases', { 
      error: errorMessage,
      stack: errorStack,
      tenantId: (req as any).tenantId
    });
    
    // Provide more detailed error message in development
    const isDevelopment = process.env.NODE_ENV === 'development';
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: errorMessage || 'Failed to fetch legal cases',
      ...(isDevelopment && {
        details: {
          stack: errorStack,
          tenantId: (req as any).tenantId || 'not set',
          errorType: error instanceof Error ? error.constructor.name : typeof error
        }
      })
    });
  }
});

/**
 * GET /api/legal-cases/:id
 * Get a specific legal case by ID from database
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = (req as any).tenantId;
    logger.info(`Legal case requested: ${id}`, { tenantId });
    
    const legalCase = await legalCasesService.getLegalCaseById(id, tenantId);
    
    if (!legalCase) {
      res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Legal case not found'
      });
      return;
    }
    
    // Transform to match frontend expectations
    const transformedCase = {
      id: legalCase.id,
      case_number: legalCase.caseNumber,
      caseNumber: legalCase.caseNumber,
      title: legalCase.title,
      court: legalCase.court,
      jurisdiction: legalCase.jurisdiction,
      decision_date: legalCase.decisionDate ? new Date(legalCase.decisionDate).toISOString().split('T')[0] : null,
      decisionDate: legalCase.decisionDate ? new Date(legalCase.decisionDate).toISOString().split('T')[0] : null,
      summary: legalCase.summary || '',
      content: legalCase.content || '',
      verdict: legalCase.verdict,
      damages: legalCase.damages,
      document_url: legalCase.documentUrl,
      documentUrl: legalCase.documentUrl,
      impact_level: legalCase.impactLevel || 'medium',
      impactLevel: legalCase.impactLevel || 'medium',
      keywords: legalCase.keywords || [],
      tags: legalCase.keywords || []
    };
    
    res.json(transformedCase);
  } catch (error) {
    logger.error('Error fetching legal case', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id
    });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch legal case',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;

