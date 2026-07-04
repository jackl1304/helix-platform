import { Router, Request, Response } from 'express';
import { Logger } from '../services/logger.service';
import { tenantIsolationMiddleware } from '../middleware/tenant-isolation';

const router = Router();
const logger = new Logger('Approvals-Routes');

// Apply tenant isolation middleware to all routes
router.use(tenantIsolationMiddleware);

const mockPendingApprovals = [
  {
    id: '1',
    projectName: 'CardioMonitor Pro',
    regulatoryBody: 'FDA',
    submissionType: '510(k)',
    submissionDate: '2024-01-10',
    status: 'Under Review',
    expectedDecision: '2024-04-10',
    priority: 'High',
    progress: 65,
    reviewer: 'Dr. Johnson, FDA',
    lastUpdate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    projectName: 'ImplantGuard System',
    regulatoryBody: 'EMA',
    submissionType: 'CE Mark',
    submissionDate: '2024-02-15',
    status: 'Pending Documentation',
    expectedDecision: '2024-05-15',
    priority: 'Medium',
    progress: 40,
    reviewer: 'EMA Technical Team',
    lastUpdate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    projectName: 'NeuroStim Device',
    regulatoryBody: 'FDA',
    submissionType: 'PMA',
    submissionDate: '2023-11-20',
    status: 'Clinical Review',
    expectedDecision: '2024-08-20',
    priority: 'High',
    progress: 80,
    reviewer: 'FDA Clinical Team',
    lastUpdate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '4',
    projectName: 'DiagnoScan Imaging System',
    regulatoryBody: 'BfArM',
    submissionType: 'CE Mark',
    submissionDate: '2024-03-01',
    status: 'Technical Review',
    expectedDecision: '2024-06-01',
    priority: 'Medium',
    progress: 55,
    reviewer: 'BfArM Assessment Team',
    lastUpdate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '5',
    projectName: 'SmartInhaler Pro',
    regulatoryBody: 'FDA',
    submissionType: 'De Novo',
    submissionDate: '2024-02-20',
    status: 'Initial Review',
    expectedDecision: '2024-09-20',
    priority: 'High',
    progress: 25,
    reviewer: 'FDA Device Classification Team',
    lastUpdate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '6',
    projectName: 'RoboSurg Assistant',
    regulatoryBody: 'FDA',
    submissionType: 'PMA',
    submissionDate: '2023-09-15',
    status: 'Final Review',
    expectedDecision: '2024-05-15',
    priority: 'Critical',
    progress: 95,
    reviewer: 'FDA Senior Review Team',
    lastUpdate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

/**
 * GET /api/approvals/pending
 * Get pending approval applications
 */
router.get('/pending', async (req: Request, res: Response) => {
  try {
    logger.info('Pending approvals requested');
    
    res.json({
      success: true,
      data: mockPendingApprovals,
      count: mockPendingApprovals.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching pending approvals', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pending approvals',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/approvals
 * Get all approvals
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    logger.info('All approvals requested');
    
    res.json({
      success: true,
      data: mockPendingApprovals,
      count: mockPendingApprovals.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching approvals', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch approvals',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;

