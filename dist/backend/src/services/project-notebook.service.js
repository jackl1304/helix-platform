import { eq, and, desc, sql, like, or } from 'drizzle-orm';
import { getDatabase } from '../db';
import { projectNotebookEntries } from '../../../shared/schema';
import { Logger } from './logger.service';
import { nanoid } from 'nanoid';
const logger = new Logger('ProjectNotebookService');
const DEFAULT_CATEGORIES = [
    {
        name: 'Regulatorische Anforderungen',
        description: 'Zulassungsbedingungen, MDR, FDA Guidelines',
        color: 'blue',
        icon: 'Shield'
    },
    {
        name: 'Technische Dokumentation',
        description: 'Spezifikationen, Handbücher, Schemas',
        color: 'green',
        icon: 'FileText'
    },
    {
        name: 'Qualitätsmanagement',
        description: 'QMS, ISO Standards, Prüfprotokolle',
        color: 'purple',
        icon: 'CheckCircle'
    },
    {
        name: 'Rechtsprechung',
        description: 'Urteile, Präzedenzfälle, Legal Updates',
        color: 'orange',
        icon: 'Scale'
    },
    {
        name: 'Forschung & Entwicklung',
        description: 'Studien, Patente, Innovation',
        color: 'teal',
        icon: 'Lightbulb'
    },
    {
        name: 'Notizen & Ideen',
        description: 'Persönliche Notizen und Gedanken',
        color: 'gray',
        icon: 'PenTool'
    }
];
export class ProjectNotebookService {
    async getEntries(tenantId, category, search) {
        try {
            const db = getDatabase();
            if (!db) {
                logger.warn('Database not available, returning empty array');
                return [];
            }
            let query = db.select().from(projectNotebookEntries);
            query = query.where(eq(projectNotebookEntries.tenantId, tenantId));
            if (category && category !== 'all') {
                query = query.where(and(eq(projectNotebookEntries.tenantId, tenantId), eq(projectNotebookEntries.category, category)));
            }
            if (search) {
                query = query.where(and(eq(projectNotebookEntries.tenantId, tenantId), or(like(projectNotebookEntries.title, `%${search}%`), like(projectNotebookEntries.content, `%${search}%`))));
            }
            query = query.orderBy(desc(projectNotebookEntries.updatedAt));
            const results = await query;
            logger.info(`Fetched ${results.length} project notebook entries`, {
                tenantId,
                category,
                search,
                count: results.length
            });
            return results.map(this.mapToProjectEntry);
        }
        catch (error) {
            logger.error('Error fetching project notebook entries', {
                error: error instanceof Error ? error.message : 'Unknown error',
                tenantId
            });
            return [];
        }
    }
    async getEntryById(id, tenantId) {
        try {
            const db = getDatabase();
            if (!db) {
                logger.warn('Database not available');
                return null;
            }
            const result = await db.select()
                .from(projectNotebookEntries)
                .where(and(eq(projectNotebookEntries.id, id), eq(projectNotebookEntries.tenantId, tenantId)))
                .limit(1);
            if (result.length === 0) {
                return null;
            }
            return this.mapToProjectEntry(result[0]);
        }
        catch (error) {
            logger.error('Error fetching project notebook entry', {
                error: error instanceof Error ? error.message : 'Unknown error',
                id,
                tenantId
            });
            return null;
        }
    }
    async createEntry(entry, tenantId, userId) {
        try {
            const db = getDatabase();
            if (!db) {
                throw new Error('Database not available');
            }
            const id = nanoid();
            const now = new Date();
            const newEntry = {
                id,
                tenantId,
                userId: userId || null,
                type: entry.type || 'note',
                title: entry.title || '',
                content: entry.content || '',
                category: entry.category || 'Notizen & Ideen',
                tags: entry.tags || [],
                url: entry.url || null,
                sourceType: entry.sourceType || null,
                priority: entry.priority || 'medium',
                createdAt: now,
                updatedAt: now
            };
            await db.insert(projectNotebookEntries).values(newEntry);
            logger.info('Created project notebook entry', { id, tenantId });
            return this.mapToProjectEntry(newEntry);
        }
        catch (error) {
            logger.error('Error creating project notebook entry', {
                error: error instanceof Error ? error.message : 'Unknown error',
                tenantId
            });
            throw error;
        }
    }
    async updateEntry(id, entry, tenantId) {
        try {
            const db = getDatabase();
            if (!db) {
                throw new Error('Database not available');
            }
            const updateData = {
                updatedAt: new Date()
            };
            if (entry.title !== undefined)
                updateData.title = entry.title;
            if (entry.content !== undefined)
                updateData.content = entry.content;
            if (entry.category !== undefined)
                updateData.category = entry.category;
            if (entry.tags !== undefined)
                updateData.tags = entry.tags;
            if (entry.url !== undefined)
                updateData.url = entry.url;
            if (entry.sourceType !== undefined)
                updateData.sourceType = entry.sourceType;
            if (entry.priority !== undefined)
                updateData.priority = entry.priority;
            if (entry.type !== undefined)
                updateData.type = entry.type;
            await db.update(projectNotebookEntries)
                .set(updateData)
                .where(and(eq(projectNotebookEntries.id, id), eq(projectNotebookEntries.tenantId, tenantId)));
            logger.info('Updated project notebook entry', { id, tenantId });
            return await this.getEntryById(id, tenantId);
        }
        catch (error) {
            logger.error('Error updating project notebook entry', {
                error: error instanceof Error ? error.message : 'Unknown error',
                id,
                tenantId
            });
            throw error;
        }
    }
    async deleteEntry(id, tenantId) {
        try {
            const db = getDatabase();
            if (!db) {
                throw new Error('Database not available');
            }
            await db.delete(projectNotebookEntries)
                .where(and(eq(projectNotebookEntries.id, id), eq(projectNotebookEntries.tenantId, tenantId)));
            logger.info('Deleted project notebook entry', { id, tenantId });
            return true;
        }
        catch (error) {
            logger.error('Error deleting project notebook entry', {
                error: error instanceof Error ? error.message : 'Unknown error',
                id,
                tenantId
            });
            throw error;
        }
    }
    async getCategories(tenantId) {
        try {
            const db = getDatabase();
            if (!db) {
                return DEFAULT_CATEGORIES.map((cat, idx) => ({
                    ...cat,
                    id: `default-${idx}`,
                    entryCount: 0
                }));
            }
            const counts = await db.select({
                category: projectNotebookEntries.category,
                count: sql `count(*)::int`
            })
                .from(projectNotebookEntries)
                .where(eq(projectNotebookEntries.tenantId, tenantId))
                .groupBy(projectNotebookEntries.category);
            const countMap = new Map();
            counts.forEach(c => {
                if (c.category) {
                    countMap.set(c.category, c.count);
                }
            });
            return DEFAULT_CATEGORIES.map((cat, idx) => ({
                ...cat,
                id: `default-${idx}`,
                entryCount: countMap.get(cat.name) || 0
            }));
        }
        catch (error) {
            logger.error('Error fetching categories', {
                error: error instanceof Error ? error.message : 'Unknown error',
                tenantId
            });
            return DEFAULT_CATEGORIES.map((cat, idx) => ({
                ...cat,
                id: `default-${idx}`,
                entryCount: 0
            }));
        }
    }
    mapToProjectEntry(row) {
        return {
            id: row.id,
            type: row.type,
            title: row.title || '',
            content: row.content || '',
            category: row.category || 'Notizen & Ideen',
            tags: Array.isArray(row.tags) ? row.tags : [],
            url: row.url || undefined,
            sourceType: row.sourceType || undefined,
            priority: (row.priority || 'medium'),
            createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : new Date().toISOString(),
            updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : new Date().toISOString(),
            tenantId: row.tenantId || '',
            userId: row.userId || undefined
        };
    }
}
//# sourceMappingURL=project-notebook.service.js.map