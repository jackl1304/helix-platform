import { eq, and, desc, sql } from 'drizzle-orm';
import { getDatabase } from '../db';
import { regulatoryUpdates } from '../../../shared/schema';
import { Logger } from './logger.service';
const logger = new Logger('RegulatoryUpdatesService');
export class RegulatoryUpdatesService {
    async getAllRegulatoryUpdates(tenantId, limit, offset) {
        try {
            const db = getDatabase();
            if (!db) {
                logger.warn('Database not available, returning empty array');
                return [];
            }
            let query = db.select().from(regulatoryUpdates);
            if (tenantId) {
                query = query.where(eq(regulatoryUpdates.tenantId, tenantId));
            }
            query = query.orderBy(desc(regulatoryUpdates.publishedDate));
            if (limit) {
                query = query.limit(limit);
            }
            if (offset) {
                query = query.offset(offset);
            }
            const results = await query;
            logger.info(`Fetched ${results.length} regulatory updates from database`, {
                tenantId,
                limit,
                offset,
                count: results.length
            });
            return results.map(this.mapToRegulatoryUpdate);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : undefined;
            logger.error('Error fetching regulatory updates from database', {
                error: errorMessage,
                stack: errorStack,
                tenantId
            });
            if (errorMessage.includes('DATABASE_URL') || errorMessage.includes('connection') || errorMessage.includes('ECONNREFUSED')) {
                logger.error('Database connection error - check DATABASE_URL and ensure database is running');
                return [];
            }
            return [];
        }
    }
    async getRecentRegulatoryUpdates(tenantId, limit = 10) {
        return this.getAllRegulatoryUpdates(tenantId, limit, 0);
    }
    async getRegulatoryUpdateById(id, tenantId) {
        try {
            const db = getDatabase();
            if (!db) {
                return null;
            }
            let query = db.select().from(regulatoryUpdates).where(eq(regulatoryUpdates.id, id));
            if (tenantId) {
                query = query.where(and(eq(regulatoryUpdates.id, id), eq(regulatoryUpdates.tenantId, tenantId)));
            }
            const results = await query;
            if (results.length === 0) {
                return null;
            }
            return this.mapToRegulatoryUpdate(results[0]);
        }
        catch (error) {
            logger.error('Error fetching regulatory update by ID', {
                error: error instanceof Error ? error.message : 'Unknown error',
                id,
                tenantId
            });
            return null;
        }
    }
    async getRegulatoryUpdatesCount(tenantId) {
        try {
            const db = getDatabase();
            if (!db) {
                return 24;
            }
            let query = db.select({ count: sql `count(*)` }).from(regulatoryUpdates);
            if (tenantId) {
                query = query.where(eq(regulatoryUpdates.tenantId, tenantId));
            }
            const results = await query;
            return results[0]?.count || 0;
        }
        catch (error) {
            logger.error('Error counting regulatory updates', {
                error: error instanceof Error ? error.message : 'Unknown error',
                tenantId
            });
            return 0;
        }
    }
    mapToRegulatoryUpdate(row) {
        return {
            id: row.id,
            tenantId: row.tenant_id || row.tenantId,
            sourceId: row.source_id || row.sourceId,
            title: row.title,
            description: row.description,
            content: row.content,
            type: row.type,
            category: row.category,
            deviceType: row.device_type || row.deviceType,
            riskLevel: row.risk_level || row.riskLevel,
            therapeuticArea: row.therapeutic_area || row.therapeuticArea,
            documentUrl: row.document_url || row.documentUrl,
            documentId: row.document_id || row.documentId,
            publishedDate: row.published_date || row.publishedDate,
            effectiveDate: row.effective_date || row.effectiveDate,
            jurisdiction: row.jurisdiction,
            language: row.language,
            tags: row.tags || [],
            priority: row.priority,
            isProcessed: row.is_processed || row.isProcessed,
            processingNotes: row.processing_notes || row.processingNotes,
            metadata: row.metadata,
            createdAt: row.created_at || row.createdAt,
            updatedAt: row.updated_at || row.updatedAt,
        };
    }
    async list(options) {
        try {
            const db = getDatabase();
            const page = options.page || 1;
            const limit = options.limit || 20;
            const offset = (page - 1) * limit;
            let query = db.select().from(regulatoryUpdates);
            const countQuery = db.select({ count: sql `count(*)` }).from(regulatoryUpdates);
            if (options.tenantId) {
                query = query.where(eq(regulatoryUpdates.tenantId, options.tenantId));
                countQuery.where(eq(regulatoryUpdates.tenantId, options.tenantId));
            }
            const conditions = [];
            if (options.jurisdiction) {
                conditions.push(eq(regulatoryUpdates.jurisdiction, options.jurisdiction));
            }
            if (options.type) {
                conditions.push(eq(regulatoryUpdates.type, options.type));
            }
            if (conditions.length > 0) {
                query = query.where(and(...conditions));
                countQuery.where(and(...conditions));
            }
            const orderBy = options.sortBy === 'publishedDate' ? regulatoryUpdates.publishedDate :
                options.sortBy === 'createdAt' ? regulatoryUpdates.createdAt :
                    options.sortBy === 'priority' ? regulatoryUpdates.priority :
                        regulatoryUpdates.publishedDate;
            if (options.sortOrder === 'asc') {
                query = query.orderBy(orderBy);
            }
            else {
                query = query.orderBy(desc(orderBy));
            }
            query = query.limit(limit).offset(offset);
            const [results, countResult] = await Promise.all([
                query,
                countQuery
            ]);
            const totalCount = countResult[0]?.count || 0;
            logger.info(`Listed ${results.length} regulatory updates`, {
                tenantId: options.tenantId,
                page,
                limit,
                totalCount
            });
            return {
                data: results.map(this.mapToRegulatoryUpdate),
                totalCount,
                page,
                limit
            };
        }
        catch (error) {
            logger.error('Error listing regulatory updates', {
                error: error instanceof Error ? error.message : 'Unknown error',
                options
            });
            return { data: [], totalCount: 0, page: options.page || 1, limit: options.limit || 20 };
        }
    }
    async getRecent(tenantId, limit = 10) {
        return this.getRecentRegulatoryUpdates(tenantId, limit);
    }
    async getById(id, tenantId) {
        return this.getRegulatoryUpdateById(id, tenantId);
    }
    async create(data, tenantId) {
        throw new Error('Create not yet implemented');
    }
    async update(id, data, tenantId) {
        throw new Error('Update not yet implemented');
    }
    async delete(id, tenantId) {
        throw new Error('Delete not yet implemented');
    }
    async getStats(tenantId) {
        try {
            const count = await this.getRegulatoryUpdatesCount(tenantId);
            return {
                total: count,
                byType: {},
                byJurisdiction: {}
            };
        }
        catch (error) {
            logger.error('Error getting regulatory updates stats', {
                error: error instanceof Error ? error.message : 'Unknown error',
                tenantId
            });
            return { total: 0, byType: {}, byJurisdiction: {} };
        }
    }
}
export const regulatoryUpdatesService = new RegulatoryUpdatesService();
//# sourceMappingURL=regulatory-updates.service.js.map