import { Request, Response } from 'express';
import { z } from 'zod';
import { RegulatoryUpdateService } from '../services/regulatory-updates.service';
import { Logger } from '../services/logger.service';
import { TenantRequest } from '../middleware/tenant-isolation';
import { validateRequest, RegulatoryUpdateSchemas } from '../middleware/security';

const logger = new Logger('RegulatoryUpdatesController');
const regulatoryUpdateService = new RegulatoryUpdateService();

// ==========================================
// VALIDATION SCHEMAS
// ==========================================

const QuerySchemas = {
  list: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
    jurisdiction: z.string().optional(),
    type: z.enum(['regulation', 'guidance', 'warning', 'approval', 'recall']).optional(),
    priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    search: z.string().optional(),
    sortBy: z.enum(['publishedDate', 'createdAt', 'priority', 'title']).default('publishedDate'),
    sortOrder: z.enum(['asc', 'desc']).default('desc')
  }),

  getById: z.object({
    id: z.string().uuid('Invalid regulatory update ID format')
  }),

  update: z.object({
    id: z.string().uuid('Invalid regulatory update ID format'),
    body: RegulatoryUpdateSchemas.update
  }),

  delete: z.object({
    id: z.string().uuid('Invalid regulatory update ID format')
  })
};

// ==========================================
// CONTROLLER METHODS
// ==========================================

/**
 * GET /api/v1/regulatory-updates
 * List regulatory updates with filtering and pagination
 */
export const listRegulatoryUpdates = async (req: TenantRequest, res: Response): Promise<void> => {
  try {
    const startTime = Date.now();
    
    // Validate query parameters
    const query = QuerySchemas.list.parse(req.query);
    
    // Add tenant filter
    const tenantId = req.tenantId!;
    
    logger.info(`Listing regulatory updates for tenant: ${tenantId}`, {
      tenantId,
      query,
      userId: req.userId
    });

    // Get regulatory updates from service
    const result = await regulatoryUpdateService.list({
      tenantId,
      ...query
    });

    // Log performance
    logger.performance('List regulatory updates', Date.now() - startTime, {
      tenantId,
      count: result.data.length,
      totalCount: result.totalCount,
      page: query.page,
      limit: query.limit
    });

    res.json({
      success: true,
      data: result.data,
      pagination: {
        page: query.page,
        limit: query.limit,
        totalCount: result.totalCount,
        totalPages: Math.ceil(result.totalCount / query.limit),
        hasNext: query.page < Math.ceil(result.totalCount / query.limit),
        hasPrev: query.page > 1
      },
      filters: {
        jurisdiction: query.jurisdiction,
        type: query.type,
        priority: query.priority,
        search: query.search
      }
    });

  } catch (error) {
    logger.error('Error listing regulatory updates', {
      error: error instanceof Error ? error.message : 'Unknown error',
      tenantId: req.tenantId,
      userId: req.userId,
      query: req.query
    });

    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: 'Invalid query parameters',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch regulatory updates'
    });
  }
};

/**
 * GET /api/v1/regulatory-updates/:id
 * Get a specific regulatory update by ID
 */
export const getRegulatoryUpdate = async (req: TenantRequest, res: Response): Promise<void> => {
  try {
    const startTime = Date.now();
    
    // Validate parameters
    const { id } = QuerySchemas.getById.parse(req.params);
    const tenantId = req.tenantId!;

    logger.info(`Getting regulatory update: ${id} for tenant: ${tenantId}`, {
      id,
      tenantId,
      userId: req.userId
    });

    // Get regulatory update from service
    const regulatoryUpdate = await regulatoryUpdateService.getById(id, tenantId);

    if (!regulatoryUpdate) {
      logger.warn(`Regulatory update not found: ${id}`, {
        id,
        tenantId,
        userId: req.userId
      });
      res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Regulatory update not found'
      });
      return;
    }

    // Log performance
    logger.performance('Get regulatory update', Date.now() - startTime, {
      id,
      tenantId
    });

    res.json({
      success: true,
      data: regulatoryUpdate
    });

  } catch (error) {
    logger.error('Error getting regulatory update', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id,
      tenantId: req.tenantId,
      userId: req.userId
    });

    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: 'Invalid regulatory update ID format',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch regulatory update'
    });
  }
};

/**
 * POST /api/v1/regulatory-updates
 * Create a new regulatory update
 */
export const createRegulatoryUpdate = async (req: TenantRequest, res: Response): Promise<void> => {
  try {
    const startTime = Date.now();
    
    // Validate request body
    const createData = RegulatoryUpdateSchemas.create.parse(req.body);
    const tenantId = req.tenantId!;

    logger.info(`Creating regulatory update for tenant: ${tenantId}`, {
      tenantId,
      userId: req.userId,
      title: createData.title,
      type: createData.type
    });

    // Create regulatory update
    const regulatoryUpdate = await regulatoryUpdateService.create({
      ...createData,
      tenantId
    });

    // Log performance
    logger.performance('Create regulatory update', Date.now() - startTime, {
      id: regulatoryUpdate.id,
      tenantId
    });

    res.status(201).json({
      success: true,
      data: regulatoryUpdate,
      message: 'Regulatory update created successfully'
    });

  } catch (error) {
    logger.error('Error creating regulatory update', {
      error: error instanceof Error ? error.message : 'Unknown error',
      tenantId: req.tenantId,
      userId: req.userId,
      body: req.body
    });

    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: 'Invalid regulatory update data',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to create regulatory update'
    });
  }
};

/**
 * PUT /api/v1/regulatory-updates/:id
 * Update an existing regulatory update
 */
export const updateRegulatoryUpdate = async (req: TenantRequest, res: Response): Promise<void> => {
  try {
    const startTime = Date.now();
    
    // Validate parameters and body
    const { id, body } = QuerySchemas.update.parse({
      id: req.params.id,
      body: req.body
    });
    const tenantId = req.tenantId!;

    logger.info(`Updating regulatory update: ${id} for tenant: ${tenantId}`, {
      id,
      tenantId,
      userId: req.userId,
      updateFields: Object.keys(body)
    });

    // Check if regulatory update exists and belongs to tenant
    const existingUpdate = await regulatoryUpdateService.getById(id, tenantId);
    if (!existingUpdate) {
      logger.warn(`Regulatory update not found for update: ${id}`, {
        id,
        tenantId,
        userId: req.userId
      });
      res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Regulatory update not found'
      });
      return;
    }

    // Update regulatory update
    const updatedUpdate = await regulatoryUpdateService.update(id, {
      ...body,
      tenantId
    });

    // Log performance
    logger.performance('Update regulatory update', Date.now() - startTime, {
      id,
      tenantId
    });

    res.json({
      success: true,
      data: updatedUpdate,
      message: 'Regulatory update updated successfully'
    });

  } catch (error) {
    logger.error('Error updating regulatory update', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id,
      tenantId: req.tenantId,
      userId: req.userId,
      body: req.body
    });

    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: 'Invalid update data',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to update regulatory update'
    });
  }
};

/**
 * DELETE /api/v1/regulatory-updates/:id
 * Delete a regulatory update
 */
export const deleteRegulatoryUpdate = async (req: TenantRequest, res: Response): Promise<void> => {
  try {
    const startTime = Date.now();
    
    // Validate parameters
    const { id } = QuerySchemas.delete.parse(req.params);
    const tenantId = req.tenantId!;

    logger.info(`Deleting regulatory update: ${id} for tenant: ${tenantId}`, {
      id,
      tenantId,
      userId: req.userId
    });

    // Check if regulatory update exists and belongs to tenant
    const existingUpdate = await regulatoryUpdateService.getById(id, tenantId);
    if (!existingUpdate) {
      logger.warn(`Regulatory update not found for deletion: ${id}`, {
        id,
        tenantId,
        userId: req.userId
      });
      res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Regulatory update not found'
      });
      return;
    }

    // Delete regulatory update
    await regulatoryUpdateService.delete(id, tenantId);

    // Log performance
    logger.performance('Delete regulatory update', Date.now() - startTime, {
      id,
      tenantId
    });

    res.json({
      success: true,
      message: 'Regulatory update deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting regulatory update', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id,
      tenantId: req.tenantId,
      userId: req.userId
    });

    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: 'Invalid regulatory update ID format',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to delete regulatory update'
    });
  }
};

/**
 * GET /api/v1/regulatory-updates/recent
 * Get recent regulatory updates
 */
export const getRecentRegulatoryUpdates = async (req: TenantRequest, res: Response): Promise<void> => {
  try {
    const startTime = Date.now();
    
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const tenantId = req.tenantId!;

    logger.info(`Getting recent regulatory updates for tenant: ${tenantId}`, {
      tenantId,
      userId: req.userId,
      limit
    });

    // Get recent regulatory updates
    const result = await regulatoryUpdateService.getRecent(tenantId, limit);

    // Log performance
    logger.performance('Get recent regulatory updates', Date.now() - startTime, {
      tenantId,
      count: result.length,
      limit
    });

    res.json({
      success: true,
      data: result,
      count: result.length
    });

  } catch (error) {
    logger.error('Error getting recent regulatory updates', {
      error: error instanceof Error ? error.message : 'Unknown error',
      tenantId: req.tenantId,
      userId: req.userId
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch recent regulatory updates'
    });
  }
};

/**
 * GET /api/v1/regulatory-updates/stats
 * Get regulatory updates statistics
 */
export const getRegulatoryUpdatesStats = async (req: TenantRequest, res: Response): Promise<void> => {
  try {
    const startTime = Date.now();
    
    const tenantId = req.tenantId!;

    logger.info(`Getting regulatory updates stats for tenant: ${tenantId}`, {
      tenantId,
      userId: req.userId
    });

    // Get statistics
    const stats = await regulatoryUpdateService.getStats(tenantId);

    // Log performance
    logger.performance('Get regulatory updates stats', Date.now() - startTime, {
      tenantId
    });

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    logger.error('Error getting regulatory updates stats', {
      error: error instanceof Error ? error.message : 'Unknown error',
      tenantId: req.tenantId,
      userId: req.userId
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch regulatory updates statistics'
    });
  }
};
