import { Router } from 'express';
import {
  listRegulatoryUpdates,
  getRegulatoryUpdate,
  createRegulatoryUpdate,
  updateRegulatoryUpdate,
  deleteRegulatoryUpdate,
  getRecentRegulatoryUpdates,
  getRegulatoryUpdatesStats
} from '../controllers/regulatory-updates.controller';
import {
  tenantIsolationMiddleware,
  userAuthenticationMiddleware,
  requireRole
} from '../middleware/tenant-isolation';
import {
  authRateLimit,
  apiRateLimit,
  validateRequest,
  RegulatoryUpdateSchemas
} from '../middleware/security';
import { Logger } from '../services/logger.service';

const logger = new Logger('RegulatoryUpdatesRoutes');
const router = Router();

// ==========================================
// ROUTE CONFIGURATION
// ==========================================

// Apply rate limiting to all routes
router.use(apiRateLimit);

// Apply tenant isolation middleware to all routes
router.use(tenantIsolationMiddleware);

// Apply authentication middleware to all routes except list and get
router.use((req, res, next) => {
  if (req.method === 'GET' && (req.path === '/' || req.path === '/recent' || req.path === '/stats')) {
    // Public read access for list, recent, and stats
    next();
  } else {
    // Authentication required for create, update, delete operations
    userAuthenticationMiddleware(req, res, next);
  }
});

// ==========================================
// PUBLIC ROUTES (Read-only)
// ==========================================

/**
 * GET /api/v1/regulatory-updates
 * List regulatory updates with filtering and pagination
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 * - jurisdiction: Filter by jurisdiction
 * - type: Filter by type (regulation, guidance, warning, approval, recall)
 * - priority: Filter by priority (low, medium, high, critical)
 * - search: Search in title, content, and source
 * - sortBy: Sort field (publishedDate, createdAt, priority, title)
 * - sortOrder: Sort order (asc, desc)
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": [...],
 *   "pagination": {...},
 *   "filters": {...}
 * }
 */
router.get('/', listRegulatoryUpdates);

/**
 * GET /api/v1/regulatory-updates/recent
 * Get recent regulatory updates
 * 
 * Query Parameters:
 * - limit: Number of recent updates (default: 10, max: 50)
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": [...],
 *   "count": number
 * }
 */
router.get('/recent', getRecentRegulatoryUpdates);

/**
 * GET /api/v1/regulatory-updates/stats
 * Get regulatory updates statistics
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "total": number,
 *     "byType": {...},
 *     "byJurisdiction": {...},
 *     "byPriority": {...},
 *     "recentCount": number,
 *     "criticalCount": number
 *   }
 * }
 */
router.get('/stats', getRegulatoryUpdatesStats);

/**
 * GET /api/v1/regulatory-updates/:id
 * Get a specific regulatory update by ID
 * 
 * Path Parameters:
 * - id: Regulatory update UUID
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {...}
 * }
 * 
 * Error Responses:
 * - 400: Invalid ID format
 * - 404: Regulatory update not found
 * - 500: Internal server error
 */
router.get('/:id', getRegulatoryUpdate);

// ==========================================
// PROTECTED ROUTES (Authentication Required)
// ==========================================

/**
 * POST /api/v1/regulatory-updates
 * Create a new regulatory update
 * 
 * Request Body:
 * {
 *   "title": string (required, max 500 chars),
 *   "content": string (required, max 10000 chars),
 *   "source": string (required, max 200 chars),
 *   "jurisdiction": string (required, max 100 chars),
 *   "type": "regulation" | "guidance" | "warning" | "approval" | "recall" (required),
 *   "priority": "low" | "medium" | "high" | "critical" (default: "medium"),
 *   "publishedDate": string (ISO date, optional),
 *   "effectiveDate": string (ISO date, optional),
 *   "tags": string[] (optional),
 *   "relatedDocuments": string[] (optional),
 *   "impactLevel": "low" | "medium" | "high" | "critical" (optional)
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {...},
 *   "message": "Regulatory update created successfully"
 * }
 * 
 * Error Responses:
 * - 400: Validation failed
 * - 401: Authentication required
 * - 403: Insufficient permissions
 * - 500: Internal server error
 */
router.post(
  '/',
  requireRole(['admin', 'user']), // Only admin and user roles can create
  validateRequest(RegulatoryUpdateSchemas.create),
  createRegulatoryUpdate
);

/**
 * PUT /api/v1/regulatory-updates/:id
 * Update an existing regulatory update
 * 
 * Path Parameters:
 * - id: Regulatory update UUID
 * 
 * Request Body:
 * {
 *   "title": string (optional, max 500 chars),
 *   "content": string (optional, max 10000 chars),
 *   "source": string (optional, max 200 chars),
 *   "jurisdiction": string (optional, max 100 chars),
 *   "type": "regulation" | "guidance" | "warning" | "approval" | "recall" (optional),
 *   "priority": "low" | "medium" | "high" | "critical" (optional),
 *   "publishedDate": string (ISO date, optional),
 *   "effectiveDate": string (ISO date, optional),
 *   "tags": string[] (optional),
 *   "relatedDocuments": string[] (optional),
 *   "impactLevel": "low" | "medium" | "high" | "critical" (optional)
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {...},
 *   "message": "Regulatory update updated successfully"
 * }
 * 
 * Error Responses:
 * - 400: Validation failed or invalid ID format
 * - 401: Authentication required
 * - 403: Insufficient permissions
 * - 404: Regulatory update not found
 * - 500: Internal server error
 */
router.put(
  '/:id',
  requireRole(['admin', 'user']), // Only admin and user roles can update
  validateRequest(RegulatoryUpdateSchemas.update),
  updateRegulatoryUpdate
);

/**
 * DELETE /api/v1/regulatory-updates/:id
 * Delete a regulatory update
 * 
 * Path Parameters:
 * - id: Regulatory update UUID
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Regulatory update deleted successfully"
 * }
 * 
 * Error Responses:
 * - 400: Invalid ID format
 * - 401: Authentication required
 * - 403: Insufficient permissions (only admin can delete)
 * - 404: Regulatory update not found
 * - 500: Internal server error
 */
router.delete(
  '/:id',
  requireRole(['admin']), // Only admin role can delete
  deleteRegulatoryUpdate
);

// ==========================================
// ROUTE LOGGING
// ==========================================

// Log all requests to regulatory updates routes
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

// ==========================================
// ERROR HANDLING
// ==========================================

// Handle 405 Method Not Allowed
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
