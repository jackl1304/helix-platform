import { Logger } from './logger.service';
import { z } from 'zod';

const logger = new Logger('RegulatoryUpdatesService');

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface RegulatoryUpdate {
  id: string;
  title: string;
  content: string;
  source: string;
  jurisdiction: string;
  type: 'regulation' | 'guidance' | 'warning' | 'approval' | 'recall';
  priority: 'low' | 'medium' | 'high' | 'critical';
  publishedDate: Date;
  effectiveDate?: Date;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  relatedDocuments?: string[];
  impactLevel?: 'low' | 'medium' | 'high' | 'critical';
}

export interface CreateRegulatoryUpdateData {
  title: string;
  content: string;
  source: string;
  jurisdiction: string;
  type: 'regulation' | 'guidance' | 'warning' | 'approval' | 'recall';
  priority: 'low' | 'medium' | 'high' | 'critical';
  publishedDate?: Date;
  effectiveDate?: Date;
  tenantId: string;
  tags?: string[];
  relatedDocuments?: string[];
  impactLevel?: 'low' | 'medium' | 'high' | 'critical';
}

export interface UpdateRegulatoryUpdateData {
  title?: string;
  content?: string;
  source?: string;
  jurisdiction?: string;
  type?: 'regulation' | 'guidance' | 'warning' | 'approval' | 'recall';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  publishedDate?: Date;
  effectiveDate?: Date;
  tags?: string[];
  relatedDocuments?: string[];
  impactLevel?: 'low' | 'medium' | 'high' | 'critical';
}

export interface ListRegulatoryUpdatesParams {
  tenantId: string;
  page: number;
  limit: number;
  jurisdiction?: string;
  type?: 'regulation' | 'guidance' | 'warning' | 'approval' | 'recall';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  search?: string;
  sortBy: 'publishedDate' | 'createdAt' | 'priority' | 'title';
  sortOrder: 'asc' | 'desc';
}

export interface RegulatoryUpdatesListResult {
  data: RegulatoryUpdate[];
  totalCount: number;
}

export interface RegulatoryUpdatesStats {
  total: number;
  byType: Record<string, number>;
  byJurisdiction: Record<string, number>;
  byPriority: Record<string, number>;
  recentCount: number;
  criticalCount: number;
}

// ==========================================
// SERVICE CLASS
// ==========================================

export class RegulatoryUpdateService {
  private regulatoryUpdates: Map<string, RegulatoryUpdate> = new Map();
  private tenantUpdates: Map<string, Set<string>> = new Map();

  constructor() {
    this.initializeMockData();
  }

  // ==========================================
  // CRUD OPERATIONS
  // ==========================================

  async list(params: ListRegulatoryUpdatesParams): Promise<RegulatoryUpdatesListResult> {
    try {
      const startTime = Date.now();
      
      logger.debug('Listing regulatory updates', { params });

      // Get tenant-specific updates
      const tenantUpdateIds = this.tenantUpdates.get(params.tenantId) || new Set();
      let updates = Array.from(tenantUpdateIds)
        .map(id => this.regulatoryUpdates.get(id))
        .filter((update): update is RegulatoryUpdate => update !== undefined);

      // Apply filters
      if (params.jurisdiction) {
        updates = updates.filter(update => 
          update.jurisdiction.toLowerCase().includes(params.jurisdiction!.toLowerCase())
        );
      }

      if (params.type) {
        updates = updates.filter(update => update.type === params.type);
      }

      if (params.priority) {
        updates = updates.filter(update => update.priority === params.priority);
      }

      if (params.search) {
        const searchLower = params.search.toLowerCase();
        updates = updates.filter(update => 
          update.title.toLowerCase().includes(searchLower) ||
          update.content.toLowerCase().includes(searchLower) ||
          update.source.toLowerCase().includes(searchLower)
        );
      }

      // Apply sorting
      updates.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (params.sortBy) {
          case 'publishedDate':
            aValue = a.publishedDate;
            bValue = b.publishedDate;
            break;
          case 'createdAt':
            aValue = a.createdAt;
            bValue = b.createdAt;
            break;
          case 'priority':
            const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            aValue = priorityOrder[a.priority];
            bValue = priorityOrder[b.priority];
            break;
          case 'title':
            aValue = a.title;
            bValue = b.title;
            break;
          default:
            aValue = a.publishedDate;
            bValue = b.publishedDate;
        }

        if (params.sortOrder === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });

      // Apply pagination
      const totalCount = updates.length;
      const startIndex = (params.page - 1) * params.limit;
      const endIndex = startIndex + params.limit;
      const paginatedUpdates = updates.slice(startIndex, endIndex);

      logger.performance('List regulatory updates', Date.now() - startTime, {
        tenantId: params.tenantId,
        totalCount,
        returnedCount: paginatedUpdates.length,
        page: params.page,
        limit: params.limit
      });

      return {
        data: paginatedUpdates,
        totalCount
      };

    } catch (error) {
      logger.error('Error listing regulatory updates', {
        error: error instanceof Error ? error.message : 'Unknown error',
        params
      });
      throw error;
    }
  }

  async getById(id: string, tenantId: string): Promise<RegulatoryUpdate | null> {
    try {
      logger.debug('Getting regulatory update by ID', { id, tenantId });

      const update = this.regulatoryUpdates.get(id);
      
      if (!update) {
        logger.warn('Regulatory update not found', { id, tenantId });
        return null;
      }

      // Verify tenant access
      if (update.tenantId !== tenantId) {
        logger.warn('Tenant access denied for regulatory update', { id, tenantId, updateTenantId: update.tenantId });
        return null;
      }

      return update;

    } catch (error) {
      logger.error('Error getting regulatory update by ID', {
        error: error instanceof Error ? error.message : 'Unknown error',
        id,
        tenantId
      });
      throw error;
    }
  }

  async create(data: CreateRegulatoryUpdateData): Promise<RegulatoryUpdate> {
    try {
      const startTime = Date.now();
      
      logger.info('Creating regulatory update', { 
        title: data.title,
        type: data.type,
        tenantId: data.tenantId
      });

      const id = this.generateId();
      const now = new Date();

      const regulatoryUpdate: RegulatoryUpdate = {
        id,
        title: data.title,
        content: data.content,
        source: data.source,
        jurisdiction: data.jurisdiction,
        type: data.type,
        priority: data.priority,
        publishedDate: data.publishedDate || now,
        effectiveDate: data.effectiveDate,
        tenantId: data.tenantId,
        createdAt: now,
        updatedAt: now,
        tags: data.tags || [],
        relatedDocuments: data.relatedDocuments || [],
        impactLevel: data.impactLevel || data.priority
      };

      // Store update
      this.regulatoryUpdates.set(id, regulatoryUpdate);
      
      // Add to tenant index
      if (!this.tenantUpdates.has(data.tenantId)) {
        this.tenantUpdates.set(data.tenantId, new Set());
      }
      this.tenantUpdates.get(data.tenantId)!.add(id);

      logger.performance('Create regulatory update', Date.now() - startTime, {
        id,
        tenantId: data.tenantId
      });

      logger.info('Regulatory update created successfully', { id, tenantId: data.tenantId });

      return regulatoryUpdate;

    } catch (error) {
      logger.error('Error creating regulatory update', {
        error: error instanceof Error ? error.message : 'Unknown error',
        data
      });
      throw error;
    }
  }

  async update(id: string, data: UpdateRegulatoryUpdateData): Promise<RegulatoryUpdate> {
    try {
      const startTime = Date.now();
      
      logger.info('Updating regulatory update', { id, updateFields: Object.keys(data) });

      const existingUpdate = this.regulatoryUpdates.get(id);
      
      if (!existingUpdate) {
        throw new Error(`Regulatory update with ID ${id} not found`);
      }

      // Verify tenant access
      if (existingUpdate.tenantId !== data.tenantId) {
        throw new Error('Tenant access denied');
      }

      // Update fields
      const updatedUpdate: RegulatoryUpdate = {
        ...existingUpdate,
        ...data,
        updatedAt: new Date()
      };

      // Store updated update
      this.regulatoryUpdates.set(id, updatedUpdate);

      logger.performance('Update regulatory update', Date.now() - startTime, {
        id,
        tenantId: data.tenantId
      });

      logger.info('Regulatory update updated successfully', { id, tenantId: data.tenantId });

      return updatedUpdate;

    } catch (error) {
      logger.error('Error updating regulatory update', {
        error: error instanceof Error ? error.message : 'Unknown error',
        id,
        data
      });
      throw error;
    }
  }

  async delete(id: string, tenantId: string): Promise<void> {
    try {
      const startTime = Date.now();
      
      logger.info('Deleting regulatory update', { id, tenantId });

      const existingUpdate = this.regulatoryUpdates.get(id);
      
      if (!existingUpdate) {
        throw new Error(`Regulatory update with ID ${id} not found`);
      }

      // Verify tenant access
      if (existingUpdate.tenantId !== tenantId) {
        throw new Error('Tenant access denied');
      }

      // Remove from storage
      this.regulatoryUpdates.delete(id);
      
      // Remove from tenant index
      const tenantUpdateIds = this.tenantUpdates.get(tenantId);
      if (tenantUpdateIds) {
        tenantUpdateIds.delete(id);
      }

      logger.performance('Delete regulatory update', Date.now() - startTime, {
        id,
        tenantId
      });

      logger.info('Regulatory update deleted successfully', { id, tenantId });

    } catch (error) {
      logger.error('Error deleting regulatory update', {
        error: error instanceof Error ? error.message : 'Unknown error',
        id,
        tenantId
      });
      throw error;
    }
  }

  // ==========================================
  // SPECIALIZED QUERIES
  // ==========================================

  async getRecent(tenantId: string, limit: number = 10): Promise<RegulatoryUpdate[]> {
    try {
      logger.debug('Getting recent regulatory updates', { tenantId, limit });

      const tenantUpdateIds = this.tenantUpdates.get(tenantId) || new Set();
      const updates = Array.from(tenantUpdateIds)
        .map(id => this.regulatoryUpdates.get(id))
        .filter((update): update is RegulatoryUpdate => update !== undefined)
        .sort((a, b) => b.publishedDate.getTime() - a.publishedDate.getTime())
        .slice(0, limit);

      return updates;

    } catch (error) {
      logger.error('Error getting recent regulatory updates', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tenantId,
        limit
      });
      throw error;
    }
  }

  async getStats(tenantId: string): Promise<RegulatoryUpdatesStats> {
    try {
      logger.debug('Getting regulatory updates stats', { tenantId });

      const tenantUpdateIds = this.tenantUpdates.get(tenantId) || new Set();
      const updates = Array.from(tenantUpdateIds)
        .map(id => this.regulatoryUpdates.get(id))
        .filter((update): update is RegulatoryUpdate => update !== undefined);

      const stats: RegulatoryUpdatesStats = {
        total: updates.length,
        byType: {},
        byJurisdiction: {},
        byPriority: {},
        recentCount: 0,
        criticalCount: 0
      };

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      updates.forEach(update => {
        // Count by type
        stats.byType[update.type] = (stats.byType[update.type] || 0) + 1;
        
        // Count by jurisdiction
        stats.byJurisdiction[update.jurisdiction] = (stats.byJurisdiction[update.jurisdiction] || 0) + 1;
        
        // Count by priority
        stats.byPriority[update.priority] = (stats.byPriority[update.priority] || 0) + 1;
        
        // Count recent (last 30 days)
        if (update.publishedDate >= thirtyDaysAgo) {
          stats.recentCount++;
        }
        
        // Count critical
        if (update.priority === 'critical') {
          stats.criticalCount++;
        }
      });

      return stats;

    } catch (error) {
      logger.error('Error getting regulatory updates stats', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tenantId
      });
      throw error;
    }
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  private generateId(): string {
    return 'reg_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private initializeMockData(): void {
    const mockUpdates: CreateRegulatoryUpdateData[] = [
      {
        title: 'FDA Updates 510(k) Guidance for AI/ML Medical Devices',
        content: 'The FDA has released updated guidance for 510(k) submissions involving artificial intelligence and machine learning components in medical devices. This guidance addresses the unique challenges and requirements for AI/ML-enabled devices.',
        source: 'FDA',
        jurisdiction: 'United States',
        type: 'guidance',
        priority: 'high',
        publishedDate: new Date('2024-01-15'),
        effectiveDate: new Date('2024-04-01'),
        tenantId: 'demo-medical-tech',
        tags: ['AI/ML', '510(k)', 'Medical Devices', 'FDA'],
        impactLevel: 'high'
      },
      {
        title: 'EU MDR Amendment for Software as Medical Device',
        content: 'The European Commission has published an amendment to the Medical Device Regulation (MDR) specifically addressing Software as a Medical Device (SaMD) requirements and classification criteria.',
        source: 'European Commission',
        jurisdiction: 'European Union',
        type: 'regulation',
        priority: 'critical',
        publishedDate: new Date('2024-01-10'),
        effectiveDate: new Date('2024-07-01'),
        tenantId: 'demo-medical-tech',
        tags: ['SaMD', 'MDR', 'EU', 'Software'],
        impactLevel: 'critical'
      },
      {
        title: 'BfArM Safety Alert: Cybersecurity in Medical Devices',
        content: 'The German Federal Institute for Drugs and Medical Devices (BfArM) has issued a safety alert regarding cybersecurity vulnerabilities in connected medical devices and the required mitigation measures.',
        source: 'BfArM',
        jurisdiction: 'Germany',
        type: 'warning',
        priority: 'high',
        publishedDate: new Date('2024-01-08'),
        tenantId: 'demo-medical-tech',
        tags: ['Cybersecurity', 'Connected Devices', 'BfArM', 'Germany'],
        impactLevel: 'high'
      }
    ];

    mockUpdates.forEach(updateData => {
      this.create(updateData).catch(error => {
        logger.error('Failed to create mock regulatory update', { error: error.message, updateData });
      });
    });

    logger.info('Mock regulatory updates data initialized', { count: mockUpdates.length });
  }
}
