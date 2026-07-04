import { Router } from 'express';
import {
  getEntries,
  getEntryById,
  createEntry,
  updateEntry,
  deleteEntry,
  getCategories
} from '../controllers/project-notebook.controller';
import {
  tenantIsolationMiddleware,
  userAuthenticationMiddleware
} from '../middleware/tenant-isolation';
import {
  apiRateLimit
} from '../middleware/security';
import { Logger } from '../services/logger.service';

const logger = new Logger('ProjectNotebookRoutes');
const router = Router();

// ==========================================
// ROUTE CONFIGURATION
// ==========================================

// Apply rate limiting to all routes
router.use(apiRateLimit);

// Apply tenant isolation middleware to all routes
router.use(tenantIsolationMiddleware);

// Apply authentication middleware to all routes except GET
router.use((req, res, next) => {
  if (req.method === 'GET') {
    // Public read access
    next();
  } else {
    // In development, allow requests without authentication
    if (process.env.NODE_ENV === 'development') {
      // Set a mock user for development
      if (!(req.session as any)?.user) {
        (req.session as any) = (req.session as any) || {};
        (req.session as any).user = {
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
      (req as any).user = (req.session as any).user;
      next();
    } else {
      // Authentication required for create, update, delete operations in production
      userAuthenticationMiddleware(req, res, next);
    }
  }
});

// ==========================================
// ROUTES
// ==========================================

/**
 * GET /api/project-notebook/entries
 * Get all project notebook entries
 */
router.get('/entries', getEntries);

/**
 * GET /api/project-notebook/entries/:id
 * Get a single entry by ID
 */
router.get('/entries/:id', getEntryById);

/**
 * POST /api/project-notebook/entries
 * Create a new entry
 */
router.post('/entries', createEntry);

/**
 * PUT /api/project-notebook/entries/:id
 * Update an existing entry
 */
router.put('/entries/:id', updateEntry);

/**
 * DELETE /api/project-notebook/entries/:id
 * Delete an entry
 */
router.delete('/entries/:id', deleteEntry);

/**
 * GET /api/project-notebook/categories
 * Get categories with entry counts
 */
router.get('/categories', getCategories);

export default router;

