import { Router } from 'express';
import { getEntries, getEntryById, createEntry, updateEntry, deleteEntry, getCategories } from '../controllers/project-notebook.controller';
import { tenantIsolationMiddleware, userAuthenticationMiddleware } from '../middleware/tenant-isolation';
import { apiRateLimit } from '../middleware/security';
import { Logger } from '../services/logger.service';
const logger = new Logger('ProjectNotebookRoutes');
const router = Router();
router.use(apiRateLimit);
router.use(tenantIsolationMiddleware);
router.use((req, res, next) => {
    if (req.method === 'GET') {
        next();
    }
    else {
        if (process.env.NODE_ENV === 'development') {
            if (!req.session?.user) {
                req.session = req.session || {};
                req.session.user = {
                    id: 'user-123',
                    email: 'dev@example.com',
                    name: 'Development User',
                    role: 'user',
                    tenantId: req.tenantId || 'demo-medical-tech',
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
            }
            req.user = req.session.user;
            next();
        }
        else {
            userAuthenticationMiddleware(req, res, next);
        }
    }
});
router.get('/entries', getEntries);
router.get('/entries/:id', getEntryById);
router.post('/entries', createEntry);
router.put('/entries/:id', updateEntry);
router.delete('/entries/:id', deleteEntry);
router.get('/categories', getCategories);
export default router;
//# sourceMappingURL=project-notebook.routes.js.map