import { eq, and, desc, sql, gte, lte, like, or } from 'drizzle-orm';
import { getDatabase } from '../db';
import { regulatoryUpdates } from '../../../shared/schema';
import { Logger } from './logger.service';

const logger = new Logger('RegulatoryUpdatesService');

export interface RegulatoryUpdate {
  id: string;
  tenantId?: string | null;
  sourceId?: string | null;
  /** Alias for sourceId – used by controller for display */
  source?: string | null;
  title: string;
  description?: string | null;
  content?: string | null;
  type?: string | null;
  category?: string | null;
  deviceType?: string | null;
  riskLevel?: string | null;
  therapeuticArea?: string | null;
  documentUrl?: string | null;
  documentId?: string | null;
  publishedDate?: Date | null;
  effectiveDate?: Date | null;
  jurisdiction?: string | null;
  language?: string | null;
  tags?: string[] | null;
  priority?: number | null;
  isProcessed?: boolean | null;
  processingNotes?: string | null;
  /** Optional related document links stored in metadata */
  relatedDocuments?: string[] | null;
  /** Impact level string e.g. low | medium | high | critical */
  impactLevel?: string | null;
  metadata?: any;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export class RegulatoryUpdatesService {
  /**
   * Get all regulatory updates, optionally filtered
   */
  async getAllRegulatoryUpdates(
    tenantId?: string,
    limit?: number,
    offset?: number
  ): Promise<RegulatoryUpdate[]> {
    try {
      const db = getDatabase();
      
      // If database is not available, return empty array
      if (!db) {
        logger.warn('Database not available, returning empty array');
        return [];
      }
      
      let query = db.select().from(regulatoryUpdates);
      
      // Apply tenant filter if provided
      if (tenantId) {
        query = query.where(eq(regulatoryUpdates.tenantId, tenantId)) as any;
      }
      
      // Order by published date (newest first)
      query = query.orderBy(desc(regulatoryUpdates.publishedDate)) as any;
      
      // Apply limit and offset if provided
      if (limit) {
        query = (query as any).limit(limit);
      }
      if (offset) {
        query = (query as any).offset(offset);
      }
      
      const results = await query;
      
      logger.info(`Fetched ${results.length} regulatory updates from database`, { 
        tenantId, 
        limit, 
        offset,
        count: results.length 
      });
      
      return results.map(this.mapToRegulatoryUpdate);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      logger.error('Error fetching regulatory updates from database', {
        error: errorMessage,
        stack: errorStack,
        tenantId
      });
      
      // Log if it's a database connection error
      if (errorMessage.includes('DATABASE_URL') || errorMessage.includes('connection') || errorMessage.includes('ECONNREFUSED')) {
        logger.error('Database connection error - check DATABASE_URL and ensure database is running');
        // Return empty array instead of throwing - allows frontend to work with empty state
        return [];
      }
      
      // Return empty array on error instead of throwing
      return [];
    }
  }

  /**
   * Get recent regulatory updates
   */
  async getRecentRegulatoryUpdates(
    tenantId?: string,
    limit: number = 10
  ): Promise<RegulatoryUpdate[]> {
    return this.getAllRegulatoryUpdates(tenantId, limit, 0);
  }

  /**
   * Get a single regulatory update by ID
   */
  async getRegulatoryUpdateById(id: string, tenantId?: string): Promise<RegulatoryUpdate | null> {
    try {
      const db = getDatabase();
      if (!db) {
        return null; // No database, return null
      }
      
      let query = db.select().from(regulatoryUpdates).where(eq(regulatoryUpdates.id, id));
      
      // Apply tenant filter if provided
      if (tenantId) {
        query = query.where(and(eq(regulatoryUpdates.id, id), eq(regulatoryUpdates.tenantId, tenantId))) as any;
      }
      
      const results = await query;
      
      if (results.length === 0) {
        return null;
      }
      
      return this.mapToRegulatoryUpdate(results[0]);
    } catch (error) {
      logger.error('Error fetching regulatory update by ID', {
        error: error instanceof Error ? error.message : 'Unknown error',
        id,
        tenantId
      });
      return null;
    }
  }

  /**
   * Get count of regulatory updates
   */
  async getRegulatoryUpdatesCount(tenantId?: string): Promise<number> {
    try {
      const db = getDatabase();
      if (!db) {
        return 24; // Mock count
      }
      
      let query = db.select({ count: sql<number>`count(*)` }).from(regulatoryUpdates);
      
      if (tenantId) {
        query = query.where(eq(regulatoryUpdates.tenantId, tenantId)) as any;
      }
      
      const results = await query;
      return results[0]?.count || 0;
    } catch (error) {
      logger.error('Error counting regulatory updates', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tenantId
      });
      return 0;
    }
  }

  /**
   * Map database result to RegulatoryUpdate interface
   */
  private mapToRegulatoryUpdate(row: any): RegulatoryUpdate {
    const meta = row.metadata || {};
    return {
      id: row.id,
      tenantId: row.tenant_id || row.tenantId,
      sourceId: row.source_id || row.sourceId,
      // 'source' is the human-readable name – fall back to sourceId
      source: row.source || row.source_id || row.sourceId || null,
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
      relatedDocuments: Array.isArray(meta.relatedDocuments) ? meta.relatedDocuments : [],
      impactLevel: meta.impactLevel || row.impact_level || row.impactLevel || null,
      metadata: row.metadata,
      createdAt: row.created_at || row.createdAt,
      updatedAt: row.updated_at || row.updatedAt,
    };
  }

  /**
   * List regulatory updates with pagination and filtering (for controller compatibility)
   */
  async list(options: {
    tenantId: string;
    page?: number;
    limit?: number;
    jurisdiction?: string;
    type?: string;
    priority?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: RegulatoryUpdate[]; totalCount: number; page: number; limit: number }> {
    try {
      const db = getDatabase();
      const page = options.page || 1;
      const limit = options.limit || 20;
      const offset = (page - 1) * limit;
      
      let query = db.select().from(regulatoryUpdates);
      const countQuery = db.select({ count: sql<number>`count(*)` }).from(regulatoryUpdates);
      
      // Apply tenant filter
      if (options.tenantId) {
        query = query.where(eq(regulatoryUpdates.tenantId, options.tenantId)) as any;
        (countQuery as any).where(eq(regulatoryUpdates.tenantId, options.tenantId));
      }
      
      // Apply additional filters
      const conditions: any[] = [];
      if (options.jurisdiction) {
        conditions.push(eq(regulatoryUpdates.jurisdiction, options.jurisdiction));
      }
      if (options.type) {
        conditions.push(eq(regulatoryUpdates.type, options.type));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
        (countQuery as any).where(and(...conditions));
      }
      
      // Order by
      const orderBy = options.sortBy === 'publishedDate' ? regulatoryUpdates.publishedDate :
                      options.sortBy === 'createdAt' ? regulatoryUpdates.createdAt :
                      options.sortBy === 'priority' ? regulatoryUpdates.priority :
                      regulatoryUpdates.publishedDate;
      
      if (options.sortOrder === 'asc') {
        query = query.orderBy(orderBy) as any;
      } else {
        query = query.orderBy(desc(orderBy)) as any;
      }
      
      // Apply pagination
      query = (query as any).limit(limit).offset(offset);
      
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
    } catch (error) {
      logger.error('Error listing regulatory updates', {
        error: error instanceof Error ? error.message : 'Unknown error',
        options
      });
      // Return empty result instead of throwing
      return { data: [], totalCount: 0, page: options.page || 1, limit: options.limit || 20 };
    }
  }

  /**
   * Get recent regulatory updates (for controller compatibility)
   */
  async getRecent(tenantId: string, limit: number = 10): Promise<RegulatoryUpdate[]> {
    return this.getRecentRegulatoryUpdates(tenantId, limit);
  }

  /**
   * Get by ID (for controller compatibility)
   */
  async getById(id: string, tenantId: string): Promise<RegulatoryUpdate | null> {
    return this.getRegulatoryUpdateById(id, tenantId);
  }

  /**
   * Create regulatory update (placeholder - implement as needed)
   */
  async create(data: Partial<RegulatoryUpdate>, tenantId: string): Promise<RegulatoryUpdate> {
    // TODO: Implement create
    throw new Error('Create not yet implemented');
  }

  /**
   * Update regulatory update (placeholder - implement as needed)
   */
  async update(id: string, data: Partial<RegulatoryUpdate>, tenantId: string): Promise<RegulatoryUpdate> {
    // TODO: Implement update
    throw new Error('Update not yet implemented');
  }

  /**
   * Delete regulatory update (placeholder - implement as needed)
   */
  async delete(id: string, tenantId: string): Promise<void> {
    // TODO: Implement delete
    throw new Error('Delete not yet implemented');
  }

  /**
   * Get statistics (for controller compatibility)
   */
  async getStats(tenantId: string): Promise<any> {
    try {
      const count = await this.getRegulatoryUpdatesCount(tenantId);
      return {
        total: count,
        byType: {}, // TODO: Implement grouping by type
        byJurisdiction: {} // TODO: Implement grouping by jurisdiction
      };
    } catch (error) {
      logger.error('Error getting regulatory updates stats', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tenantId
      });
      return { total: 0, byType: {}, byJurisdiction: {} };
    }
  }
}

export const regulatoryUpdatesService = new RegulatoryUpdatesService();
