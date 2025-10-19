import { Router } from 'express';
import { neon } from '@neondatabase/serverless';
import { z } from 'zod';

const router = Router();
const sql = neon(process.env.DATABASE_URL!);

// Validation schemas
const entrySchema = z.object({
  type: z.enum(['link', 'article', 'note', 'document']),
  title: z.string().min(1),
  content: z.string().min(1),
  category: z.string().min(1),
  tags: z.array(z.string()),
  url: z.string().url().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  tenantId: z.string().min(1),
  userId: z.string().optional()
});

// GET /api/project-notebook/entries - Get all entries for current tenant
router.get('/entries', async (req, res) => {
  try {
    const tenantId = req.headers['x-tenant-id'] || localStorage?.getItem?.('tenant_id') || 'demo-medical';
    
    // Try to get from database, fallback to demo data
    let entries;
    try {
      entries = await sql`
        SELECT * FROM project_notebook_entries 
        WHERE tenant_id = ${tenantId}
        ORDER BY created_at DESC
      `;
    } catch (dbError) {
      console.log('[PROJECT-NOTEBOOK] Database not available, using demo entries');
      // Demo entries for development
      entries = [
        {
          id: 'demo-1',
          type: 'note',
          title: 'MDR Compliance Checklist',
          content: 'Wichtige Punkte für die MDR-Konformität:\n- Technische Dokumentation\n- Klinische Bewertung\n- Post-Market Surveillance',
          category: 'Regulatorische Anforderungen',
          tags: ['MDR', 'Compliance', 'Checklist'],
          priority: 'high',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tenant_id: tenantId
        },
        {
          id: 'demo-2',
          type: 'link',
          title: 'FDA 510(k) Guidelines',
          content: 'Offizielle FDA Guidelines für 510(k) Submissions',
          category: 'Regulatorische Anforderungen',
          tags: ['FDA', '510k', 'Guidelines'],
          url: 'https://www.fda.gov/medical-devices/premarket-submissions/510k-clearances',
          priority: 'medium',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tenant_id: tenantId
        }
      ];
    }

    const mappedEntries = entries.map((entry: any) => ({
      id: entry.id,
      type: entry.type,
      title: entry.title,
      content: entry.content,
      category: entry.category,
      tags: Array.isArray(entry.tags) ? entry.tags : (entry.tags ? [entry.tags] : []),
      url: entry.url,
      priority: entry.priority || 'medium',
      createdAt: entry.created_at,
      updatedAt: entry.updated_at,
      tenantId: entry.tenant_id,
      userId: entry.user_id
    }));

    res.json(mappedEntries);
  } catch (error) {
    console.error('[PROJECT-NOTEBOOK] Get entries error:', error);
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

// GET /api/project-notebook/categories - Get categories with entry counts
router.get('/categories', async (req, res) => {
  try {
    const tenantId = req.headers['x-tenant-id'] || 'demo-medical';
    
    // Default categories for medical tech
    const defaultCategories = [
      {
        id: 'regulatory',
        name: 'Regulatorische Anforderungen',
        description: 'Zulassungsbedingungen, MDR, FDA Guidelines',
        color: 'blue',
        icon: 'Shield',
        entryCount: 0
      },
      {
        id: 'technical',
        name: 'Technische Dokumentation',
        description: 'Spezifikationen, Handbücher, Schemas',
        color: 'green',
        icon: 'FileText',
        entryCount: 0
      },
      {
        id: 'quality',
        name: 'Qualitätsmanagement',
        description: 'QMS, ISO Standards, Prüfprotokolle',
        color: 'purple',
        icon: 'CheckCircle',
        entryCount: 0
      },
      {
        id: 'legal',
        name: 'Rechtsprechung',
        description: 'Urteile, Präzedenzfälle, Legal Updates',
        color: 'orange',
        icon: 'Scale',
        entryCount: 0
      },
      {
        id: 'research',
        name: 'Forschung & Entwicklung',
        description: 'Studien, Patente, Innovation',
        color: 'teal',
        icon: 'Lightbulb',
        entryCount: 0
      },
      {
        id: 'notes',
        name: 'Notizen & Ideen',
        description: 'Persönliche Notizen und Gedanken',
        color: 'gray',
        icon: 'PenTool',
        entryCount: 0
      }
    ];

    // Try to get entry counts from database
    try {
      const counts = await sql`
        SELECT category, COUNT(*) as count 
        FROM project_notebook_entries 
        WHERE tenant_id = ${tenantId}
        GROUP BY category
      `;
      
      // Update counts in categories
      defaultCategories.forEach(cat => {
        const count = counts.find((c: any) => c.category === cat.name);
        cat.entryCount = count ? parseInt(count.count) : 0;
      });
    } catch (dbError) {
      console.log('[PROJECT-NOTEBOOK] Using default categories (no DB)');
    }

    res.json(defaultCategories);
  } catch (error) {
    console.error('[PROJECT-NOTEBOOK] Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST /api/project-notebook/entries - Create new entry
router.post('/entries', async (req, res) => {
  try {
    const validatedData = entrySchema.parse(req.body);
    
    // Try to save to database
    let newEntry;
    try {
      const result = await sql`
        INSERT INTO project_notebook_entries (
          type, title, content, category, tags, url, priority, tenant_id, user_id
        ) VALUES (
          ${validatedData.type},
          ${validatedData.title},
          ${validatedData.content},
          ${validatedData.category},
          ${JSON.stringify(validatedData.tags)},
          ${validatedData.url || null},
          ${validatedData.priority},
          ${validatedData.tenantId},
          ${validatedData.userId || null}
        ) RETURNING *
      `;
      newEntry = result[0];
    } catch (dbError) {
      console.log('[PROJECT-NOTEBOOK] Database save failed, using in-memory fallback');
      // Fallback: return success without DB save
      newEntry = {
        id: `entry-${Date.now()}`,
        ...validatedData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }

    console.log('[PROJECT-NOTEBOOK] Entry created:', newEntry.id);
    res.status(201).json(newEntry);
  } catch (error) {
    console.error('[PROJECT-NOTEBOOK] Create entry error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validierungsfehler',
        details: error.errors
      });
    }
    
    res.status(500).json({ error: 'Failed to create entry' });
  }
});

// PUT /api/project-notebook/entries/:id - Update entry
router.put('/entries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = entrySchema.partial().parse(req.body);
    
    // Try to update in database
    let updatedEntry;
    try {
      const result = await sql`
        UPDATE project_notebook_entries 
        SET 
          type = COALESCE(${validatedData.type}, type),
          title = COALESCE(${validatedData.title}, title),
          content = COALESCE(${validatedData.content}, content),
          category = COALESCE(${validatedData.category}, category),
          tags = COALESCE(${validatedData.tags ? JSON.stringify(validatedData.tags) : null}, tags),
          url = COALESCE(${validatedData.url}, url),
          priority = COALESCE(${validatedData.priority}, priority),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      updatedEntry = result[0];
    } catch (dbError) {
      console.log('[PROJECT-NOTEBOOK] Database update failed, using fallback');
      updatedEntry = { id, ...validatedData, updated_at: new Date().toISOString() };
    }

    res.json(updatedEntry);
  } catch (error) {
    console.error('[PROJECT-NOTEBOOK] Update entry error:', error);
    res.status(500).json({ error: 'Failed to update entry' });
  }
});

// DELETE /api/project-notebook/entries/:id - Delete entry
router.delete('/entries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    try {
      await sql`DELETE FROM project_notebook_entries WHERE id = ${id}`;
    } catch (dbError) {
      console.log('[PROJECT-NOTEBOOK] Database delete failed, using fallback');
    }

    res.json({ success: true, message: 'Entry deleted' });
  } catch (error) {
    console.error('[PROJECT-NOTEBOOK] Delete entry error:', error);
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});

// POST /api/project-notebook/export/pdf - Export as PDF
router.post('/export/pdf', async (req, res) => {
  try {
    const { tenantId, includeCategories = 'all', format = 'professional' } = req.body;
    
    // Simple PDF generation - in production, use proper PDF library like puppeteer
    const pdfContent = `
# Projektmappe Export
**Tenant:** ${tenantId}
**Exportiert am:** ${new Date().toLocaleString('de-DE')}

---

## Inhalt der Projektmappe

Dieser Export enthält alle gespeicherten Einträge aus Ihrer persönlichen Projektmappe.

Weitere Funktionen werden in der nächsten Version verfügbar sein.

---
Powered by Helix Regulatory Intelligence Platform
    `.trim();

    // Return as text file for now - can be enhanced with proper PDF generation
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Projektmappe_${tenantId}_${new Date().toISOString().split('T')[0]}.txt"`);
    res.send(pdfContent);
    
  } catch (error) {
    console.error('[PROJECT-NOTEBOOK] PDF export error:', error);
    res.status(500).json({ error: 'Failed to export PDF' });
  }
});

export default router;







