import { eq, and, desc, sql } from 'drizzle-orm';
import { getDatabase } from '../db';
import { legalCases } from '../../../shared/schema';
import { Logger } from './logger.service';

const logger = new Logger('LegalCasesService');

export interface LegalCase {
  id: string;
  tenantId?: string | null;
  caseNumber?: string | null;
  title: string;
  court: string;
  jurisdiction: string;
  decisionDate?: Date | null;
  summary?: string | null;
  content?: string | null;
  verdict?: string | null;
  damages?: string | null;
  documentUrl?: string | null;
  impactLevel?: string | null;
  keywords?: string[] | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export class LegalCasesService {
  /**
   * Get all legal cases, optionally filtered by tenant
   */
  async getAllLegalCases(tenantId?: string): Promise<LegalCase[]> {
    try {
      const db = getDatabase();
      
      // If database is not available, return empty array
      if (!db) {
        logger.warn('Database not available, returning empty array');
        return [];
      }
      
      let query = db.select().from(legalCases);
      
      // Apply tenant filter if provided
      if (tenantId) {
        query = query.where(eq(legalCases.tenantId, tenantId)) as any;
      }
      
      // Order by decision date (newest first)
      query = query.orderBy(desc(legalCases.decisionDate)) as any;
      
      const results = await query;
      
      logger.info(`Fetched ${results.length} legal cases from database`, { 
        tenantId,
        count: results.length 
      });
      
      return results.map(this.mapToLegalCase);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      logger.error('Error fetching legal cases from database', {
        error: errorMessage,
        stack: errorStack,
        tenantId
      });
      
      // Log if it's a database connection error
      if (errorMessage.includes('DATABASE_URL') || errorMessage.includes('connection') || errorMessage.includes('ECONNREFUSED')) {
        logger.error('Database connection error - check DATABASE_URL and ensure database is running');
      }
      
      // Return empty array on error instead of throwing
      // This allows the API to still respond, but frontend should handle empty results
      return [];
    }
  }

  /**
   * Get a single legal case by ID
   */
  async getLegalCaseById(id: string, tenantId?: string): Promise<LegalCase | null> {
    try {
      const db = getDatabase();
      if (!db) {
        return null; // No database, return null
      }
      
      let query = db.select().from(legalCases).where(eq(legalCases.id, id));
      
      // Apply tenant filter if provided
      if (tenantId) {
        query = query.where(and(eq(legalCases.id, id), eq(legalCases.tenantId, tenantId))) as any;
      }
      
      const results = await query;
      
      if (results.length === 0) {
        return null;
      }
      
      return this.mapToLegalCase(results[0]);
    } catch (error) {
      logger.error('Error fetching legal case by ID', {
        error: error instanceof Error ? error.message : 'Unknown error',
        id,
        tenantId
      });
      return null;
    }
  }

  /**
   * Get count of legal cases
   */
  async getLegalCasesCount(tenantId?: string): Promise<number> {
    try {
      const db = getDatabase();
      if (!db) {
        return 65; // Mock count
      }
      
      let query = db.select({ count: sql<number>`count(*)` }).from(legalCases);
      
      if (tenantId) {
        query = query.where(eq(legalCases.tenantId, tenantId)) as any;
      }
      
      const results = await query;
      return results[0]?.count || 0;
    } catch (error) {
      logger.error('Error counting legal cases', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tenantId
      });
      return 0;
    }
  }

  /**
   * Map database result to LegalCase interface
   */
  private mapToLegalCase(row: any): LegalCase {
    return {
      id: row.id,
      tenantId: row.tenant_id || row.tenantId,
      caseNumber: row.case_number || row.caseNumber,
      title: row.title,
      court: row.court,
      jurisdiction: row.jurisdiction,
      decisionDate: row.decision_date || row.decisionDate,
      summary: row.summary,
      content: row.content,
      verdict: row.verdict,
      damages: row.damages,
      documentUrl: row.document_url || row.documentUrl,
      impactLevel: row.impact_level || row.impactLevel,
      keywords: row.keywords || [],
      createdAt: row.created_at || row.createdAt,
      updatedAt: row.updated_at || row.updatedAt,
    };
  }
}

export const legalCasesService = new LegalCasesService();

