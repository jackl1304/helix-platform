import { Router } from 'express';
import { Logger } from '../services/logger.service';
import { tenantIsolationMiddleware } from '../middleware/tenant-isolation';
import { dashboardService } from '../services/dashboard.service';
const router = Router();
const logger = new Logger('Dashboard-Routes');
router.use(tenantIsolationMiddleware);
router.get('/stats', async (req, res) => {
    try {
        const tenantId = req.tenantId;
        logger.info('Dashboard stats requested', { tenantId });
        const stats = await dashboardService.getDashboardStats(tenantId);
        const response = {
            ...stats,
            recentActivity: [
                { type: 'FDA Approval', count: 3, timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
                { type: 'Regulatory Update', count: stats.totalUpdates, timestamp: new Date().toISOString() },
                { type: 'Legal Case', count: stats.totalLegalCases, timestamp: new Date().toISOString() }
            ],
            compliance: {
                score: 98,
                status: 'excellent',
                lastAudit: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            }
        };
        logger.info('Dashboard stats calculated', { tenantId, stats: response });
        res.json({
            success: true,
            data: response,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        logger.error('Error fetching dashboard stats', {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
        res.status(500).json({
            success: false,
            error: 'Failed to fetch dashboard stats',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
export default router;
//# sourceMappingURL=dashboard.routes.js.map