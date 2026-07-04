import { Router } from 'express';
import { listRegulatoryUpdates, getRegulatoryUpdate, createRegulatoryUpdate, updateRegulatoryUpdate, deleteRegulatoryUpdate, getRecentRegulatoryUpdates, getRegulatoryUpdatesStats } from '../controllers/regulatory-updates.controller';
import { tenantIsolationMiddleware, userAuthenticationMiddleware, requireRole } from '../middleware/tenant-isolation';
import { apiRateLimit, validateRequest, RegulatoryUpdateSchemas } from '../middleware/security';
import { Logger } from '../services/logger.service';
const logger = new Logger('RegulatoryUpdatesRoutes');
const router = Router();
router.use(apiRateLimit);
router.use(tenantIsolationMiddleware);
router.use((req, res, next) => {
    if (req.method === 'GET' && (req.path === '/' || req.path === '/recent' || req.path === '/stats')) {
        next();
    }
    else {
        userAuthenticationMiddleware(req, res, next);
    }
});
router.get('/', listRegulatoryUpdates);
router.get('/recent', getRecentRegulatoryUpdates);
router.get('/stats', getRegulatoryUpdatesStats);
router.get('/:id', getRegulatoryUpdate);
router.post('/', requireRole(['admin', 'user']), validateRequest(RegulatoryUpdateSchemas.create), createRegulatoryUpdate);
router.put('/:id', requireRole(['admin', 'user']), validateRequest(RegulatoryUpdateSchemas.update), updateRegulatoryUpdate);
router.delete('/:id', requireRole(['admin']), deleteRegulatoryUpdate);
router.use((req, res, next) => {
    logger.info(`Regulatory updates route accessed: ${req.method} ${req.path}`, {
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        tenantId: req.tenantId,
        userId: req.userId
    });
    next();
});
router.use((req, res) => {
    logger.warn(`Method not allowed: ${req.method} ${req.path}`, {
        method: req.method,
        path: req.path,
        ip: req.ip,
        tenantId: req.tenantId
    });
    res.status(405).json({
        success: false,
        error: 'Method not allowed',
        message: `${req.method} method is not allowed for this endpoint`,
        allowedMethods: ['GET', 'POST', 'PUT', 'DELETE']
    });
});
export default router;
//# sourceMappingURL=regulatory-updates.routes.js.map