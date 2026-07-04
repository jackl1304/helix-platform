import { eq, and, desc, sql } from 'drizzle-orm';
import { getDatabase } from '../db';
import { legalCases } from '../../../shared/schema';
import { Logger } from './logger.service';
const logger = new Logger('LegalCasesService');
export class LegalCasesService {
    async getAllLegalCases(tenantId) {
        try {
            const db = getDatabase();
            if (!db) {
                logger.warn('Database not available, returning empty array');
                return [];
            }
            let query = db.select().from(legalCases);
            if (tenantId) {
                query = query.where(eq(legalCases.tenantId, tenantId));
            }
            query = query.orderBy(desc(legalCases.decisionDate));
            const results = await query;
            logger.info(`Fetched ${results.length} legal cases from database`, {
                tenantId,
                count: results.length
            });
            return results.map(this.mapToLegalCase);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : undefined;
            logger.error('Error fetching legal cases from database', {
                error: errorMessage,
                stack: errorStack,
                tenantId
            });
            if (errorMessage.includes('DATABASE_URL') || errorMessage.includes('connection') || errorMessage.includes('ECONNREFUSED')) {
                logger.error('Database connection error - check DATABASE_URL and ensure database is running');
            }
            return [];
        }
    }
    async getLegalCaseById(id, tenantId) {
        try {
            const db = getDatabase();
            if (!db) {
                return null;
            }
            let query = db.select().from(legalCases).where(eq(legalCases.id, id));
            if (tenantId) {
                query = query.where(and(eq(legalCases.id, id), eq(legalCases.tenantId, tenantId)));
            }
            const results = await query;
            if (results.length === 0) {
                return null;
            }
            return this.mapToLegalCase(results[0]);
        }
        catch (error) {
            logger.error('Error fetching legal case by ID', {
                error: error instanceof Error ? error.message : 'Unknown error',
                id,
                tenantId
            });
            return null;
        }
    }
    async getLegalCasesCount(tenantId) {
        try {
            const db = getDatabase();
            if (!db) {
                return 65;
            }
            let query = db.select({ count: sql `count(*)` }).from(legalCases);
            if (tenantId) {
                query = query.where(eq(legalCases.tenantId, tenantId));
            }
            const results = await query;
            return results[0]?.count || 0;
        }
        catch (error) {
            logger.error('Error counting legal cases', {
                error: error instanceof Error ? error.message : 'Unknown error',
                tenantId
            });
            return 0;
        }
    }
    mapToLegalCase(row) {
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
//# sourceMappingURL=legal-cases.service.js.map