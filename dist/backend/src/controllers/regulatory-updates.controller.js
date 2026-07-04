import { z } from 'zod';
import { RegulatoryUpdatesService } from '../services/regulatory-updates.service';
import { Logger } from '../services/logger.service';
import { RegulatoryUpdateSchemas } from '../middleware/security';
const logger = new Logger('RegulatoryUpdatesController');
const regulatoryUpdateService = new RegulatoryUpdatesService();
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
export const listRegulatoryUpdates = async (req, res) => {
    try {
        const startTime = Date.now();
        const query = QuerySchemas.list.parse(req.query);
        const tenantId = req.tenantId || 'demo-medical-tech';
        logger.info(`Listing regulatory updates for tenant: ${tenantId}`, {
            tenantId,
            query,
            userId: req.userId
        });
        const result = await regulatoryUpdateService.list({
            tenantId,
            ...query
        });
        logger.performance('List regulatory updates', Date.now() - startTime, {
            tenantId,
            count: result.data.length,
            totalCount: result.totalCount,
            page: query.page,
            limit: query.limit
        });
        const transformedData = result.data.map(update => {
            try {
                return {
                    id: update.id || '',
                    title: update.title || 'Ohne Titel',
                    summary: update.content || '',
                    description: update.content || '',
                    content: update.content || '',
                    authority: update.source || 'Unknown',
                    source: update.source || 'Unknown',
                    source_id: update.source || 'Unknown',
                    region: update.jurisdiction || 'Global',
                    jurisdiction: update.jurisdiction || 'Global',
                    country: update.jurisdiction || 'Global',
                    published_at: update.publishedDate ? update.publishedDate.toISOString() : new Date().toISOString(),
                    publishedDate: update.publishedDate ? update.publishedDate.toISOString() : new Date().toISOString(),
                    created_at: update.createdAt ? update.createdAt.toISOString() : new Date().toISOString(),
                    createdAt: update.createdAt ? update.createdAt.toISOString() : new Date().toISOString(),
                    priority: update.priority || 'medium',
                    category: update.type || 'general',
                    type: update.type || 'general',
                    url: undefined,
                    source_url: undefined,
                    status: undefined,
                    tags: update.tags || [],
                    relatedDocuments: update.relatedDocuments || [],
                    impactLevel: update.impactLevel,
                    effectiveDate: update.effectiveDate ? update.effectiveDate.toISOString() : undefined,
                    tenantId: update.tenantId || tenantId,
                    updatedAt: update.updatedAt ? update.updatedAt.toISOString() : new Date().toISOString()
                };
            }
            catch (transformError) {
                logger.error('Error transforming regulatory update', {
                    error: transformError instanceof Error ? transformError.message : 'Unknown error',
                    updateId: update.id
                });
                return {
                    id: update.id || '',
                    title: update.title || 'Ohne Titel',
                    summary: '',
                    description: '',
                    content: '',
                    authority: 'Unknown',
                    source: 'Unknown',
                    source_id: 'Unknown',
                    region: 'Global',
                    jurisdiction: 'Global',
                    country: 'Global',
                    published_at: new Date().toISOString(),
                    publishedDate: new Date().toISOString(),
                    created_at: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                    priority: 'medium',
                    category: 'general',
                    type: 'general',
                    url: undefined,
                    source_url: undefined,
                    status: undefined,
                    tags: [],
                    relatedDocuments: [],
                    impactLevel: undefined,
                    effectiveDate: undefined,
                    tenantId: tenantId,
                    updatedAt: new Date().toISOString()
                };
            }
        });
        res.json({
            success: true,
            data: transformedData,
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
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : undefined;
        logger.error('Error listing regulatory updates', {
            error: errorMessage,
            stack: errorStack,
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
        const isDevelopment = process.env.NODE_ENV === 'development';
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: errorMessage || 'Failed to fetch regulatory updates',
            ...(isDevelopment && {
                details: {
                    stack: errorStack,
                    tenantId: req.tenantId || 'not set',
                    query: req.query,
                    errorType: error instanceof Error ? error.constructor.name : typeof error
                }
            })
        });
    }
};
export const getRegulatoryUpdate = async (req, res) => {
    try {
        const startTime = Date.now();
        const { id } = QuerySchemas.getById.parse(req.params);
        const tenantId = req.tenantId;
        logger.info(`Getting regulatory update: ${id} for tenant: ${tenantId}`, {
            id,
            tenantId,
            userId: req.userId
        });
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
        const transformedData = {
            id: regulatoryUpdate.id,
            title: regulatoryUpdate.title,
            summary: regulatoryUpdate.content,
            description: regulatoryUpdate.content,
            content: regulatoryUpdate.content,
            authority: regulatoryUpdate.source,
            source: regulatoryUpdate.source,
            source_id: regulatoryUpdate.source,
            region: regulatoryUpdate.jurisdiction,
            jurisdiction: regulatoryUpdate.jurisdiction,
            country: regulatoryUpdate.jurisdiction,
            published_at: regulatoryUpdate.publishedDate.toISOString(),
            publishedDate: regulatoryUpdate.publishedDate.toISOString(),
            created_at: regulatoryUpdate.createdAt.toISOString(),
            createdAt: regulatoryUpdate.createdAt.toISOString(),
            priority: regulatoryUpdate.priority,
            category: regulatoryUpdate.type,
            type: regulatoryUpdate.type,
            url: undefined,
            source_url: undefined,
            status: undefined,
            tags: regulatoryUpdate.tags || [],
            relatedDocuments: regulatoryUpdate.relatedDocuments || [],
            impactLevel: regulatoryUpdate.impactLevel,
            effectiveDate: regulatoryUpdate.effectiveDate?.toISOString(),
            tenantId: regulatoryUpdate.tenantId,
            updatedAt: regulatoryUpdate.updatedAt.toISOString()
        };
        logger.performance('Get regulatory update', Date.now() - startTime, {
            id,
            tenantId
        });
        res.json({
            success: true,
            data: transformedData
        });
    }
    catch (error) {
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
export const createRegulatoryUpdate = async (req, res) => {
    try {
        const startTime = Date.now();
        const createData = RegulatoryUpdateSchemas.create.parse(req.body);
        const tenantId = req.tenantId;
        logger.info(`Creating regulatory update for tenant: ${tenantId}`, {
            tenantId,
            userId: req.userId,
            title: createData.title,
            type: createData.type
        });
        const regulatoryUpdate = await regulatoryUpdateService.create({
            ...createData,
            tenantId
        });
        logger.performance('Create regulatory update', Date.now() - startTime, {
            id: regulatoryUpdate.id,
            tenantId
        });
        res.status(201).json({
            success: true,
            data: regulatoryUpdate,
            message: 'Regulatory update created successfully'
        });
    }
    catch (error) {
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
export const updateRegulatoryUpdate = async (req, res) => {
    try {
        const startTime = Date.now();
        const { id, body } = QuerySchemas.update.parse({
            id: req.params.id,
            body: req.body
        });
        const tenantId = req.tenantId;
        logger.info(`Updating regulatory update: ${id} for tenant: ${tenantId}`, {
            id,
            tenantId,
            userId: req.userId,
            updateFields: Object.keys(body)
        });
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
        const updatedUpdate = await regulatoryUpdateService.update(id, body, tenantId);
        logger.performance('Update regulatory update', Date.now() - startTime, {
            id,
            tenantId
        });
        res.json({
            success: true,
            data: updatedUpdate,
            message: 'Regulatory update updated successfully'
        });
    }
    catch (error) {
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
export const deleteRegulatoryUpdate = async (req, res) => {
    try {
        const startTime = Date.now();
        const { id } = QuerySchemas.delete.parse(req.params);
        const tenantId = req.tenantId;
        logger.info(`Deleting regulatory update: ${id} for tenant: ${tenantId}`, {
            id,
            tenantId,
            userId: req.userId
        });
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
        await regulatoryUpdateService.delete(id, tenantId);
        logger.performance('Delete regulatory update', Date.now() - startTime, {
            id,
            tenantId
        });
        res.json({
            success: true,
            message: 'Regulatory update deleted successfully'
        });
    }
    catch (error) {
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
export const getRecentRegulatoryUpdates = async (req, res) => {
    try {
        const startTime = Date.now();
        const limit = Math.min(parseInt(req.query.limit) || 10, 50);
        const tenantId = req.tenantId;
        logger.info(`Getting recent regulatory updates for tenant: ${tenantId}`, {
            tenantId,
            userId: req.userId,
            limit
        });
        const result = await regulatoryUpdateService.getRecent(tenantId, limit);
        const transformedData = result.map(update => {
            try {
                return {
                    id: update.id || '',
                    title: update.title || 'Ohne Titel',
                    summary: update.content || '',
                    description: update.content || '',
                    content: update.content || '',
                    authority: update.source || 'Unknown',
                    source: update.source || 'Unknown',
                    source_id: update.source || 'Unknown',
                    region: update.jurisdiction || 'Global',
                    jurisdiction: update.jurisdiction || 'Global',
                    country: update.jurisdiction || 'Global',
                    published_at: update.publishedDate ? update.publishedDate.toISOString() : new Date().toISOString(),
                    publishedDate: update.publishedDate ? update.publishedDate.toISOString() : new Date().toISOString(),
                    created_at: update.createdAt ? update.createdAt.toISOString() : new Date().toISOString(),
                    createdAt: update.createdAt ? update.createdAt.toISOString() : new Date().toISOString(),
                    priority: update.priority || 'medium',
                    category: update.type || 'general',
                    type: update.type || 'general',
                    url: undefined,
                    source_url: undefined,
                    status: undefined,
                    tags: update.tags || [],
                    relatedDocuments: update.relatedDocuments || [],
                    impactLevel: update.impactLevel,
                    effectiveDate: update.effectiveDate ? update.effectiveDate.toISOString() : undefined,
                    tenantId: update.tenantId || tenantId,
                    updatedAt: update.updatedAt ? update.updatedAt.toISOString() : new Date().toISOString()
                };
            }
            catch (transformError) {
                logger.error('Error transforming regulatory update', {
                    error: transformError instanceof Error ? transformError.message : 'Unknown error',
                    updateId: update.id
                });
                return {
                    id: update.id || '',
                    title: update.title || 'Ohne Titel',
                    summary: '',
                    description: '',
                    content: '',
                    authority: 'Unknown',
                    source: 'Unknown',
                    source_id: 'Unknown',
                    region: 'Global',
                    jurisdiction: 'Global',
                    country: 'Global',
                    published_at: new Date().toISOString(),
                    publishedDate: new Date().toISOString(),
                    created_at: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                    priority: 'medium',
                    category: 'general',
                    type: 'general',
                    url: undefined,
                    source_url: undefined,
                    status: undefined,
                    tags: [],
                    relatedDocuments: [],
                    impactLevel: undefined,
                    effectiveDate: undefined,
                    tenantId: tenantId,
                    updatedAt: new Date().toISOString()
                };
            }
        });
        logger.performance('Get recent regulatory updates', Date.now() - startTime, {
            tenantId,
            count: result.length,
            limit
        });
        res.json({
            success: true,
            data: transformedData,
            count: transformedData.length
        });
    }
    catch (error) {
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
export const getRegulatoryUpdatesStats = async (req, res) => {
    try {
        const startTime = Date.now();
        const tenantId = req.tenantId;
        logger.info(`Getting regulatory updates stats for tenant: ${tenantId}`, {
            tenantId,
            userId: req.userId
        });
        const stats = await regulatoryUpdateService.getStats(tenantId);
        logger.performance('Get regulatory updates stats', Date.now() - startTime, {
            tenantId
        });
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
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
//# sourceMappingURL=regulatory-updates.controller.js.map