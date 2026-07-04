import { Request, Response } from 'express';
import { ProjectNotebookService } from '../services/project-notebook.service';
import { Logger } from '../services/logger.service';
import { TenantRequest } from '../middleware/tenant-isolation';

const logger = new Logger('ProjectNotebookController');
const projectNotebookService = new ProjectNotebookService();

/**
 * GET /api/project-notebook/entries
 * Get all project notebook entries for the current tenant
 */
export async function getEntries(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId || 'demo-medical-tech';
    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;
    
    const entries = await projectNotebookService.getEntries(tenantId, category, search);
    
    res.json(entries);
  } catch (error) {
    logger.error('Error in getEntries', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(500).json({ 
      error: 'Failed to fetch project notebook entries',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * GET /api/project-notebook/entries/:id
 * Get a single entry by ID
 */
export async function getEntryById(req: TenantRequest, res: Response) {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId || 'demo-medical-tech';
    
    const entry = await projectNotebookService.getEntryById(id, tenantId);
    
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    
    res.json(entry);
  } catch (error) {
    logger.error('Error in getEntryById', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(500).json({ 
      error: 'Failed to fetch project notebook entry',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * POST /api/project-notebook/entries
 * Create a new entry
 */
export async function createEntry(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId || 'demo-medical-tech';
    const userId = (req as any).user?.id;
    
    const entry = await projectNotebookService.createEntry(req.body, tenantId, userId);
    
    res.status(201).json(entry);
  } catch (error) {
    logger.error('Error in createEntry', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(500).json({ 
      error: 'Failed to create project notebook entry',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * PUT /api/project-notebook/entries/:id
 * Update an existing entry
 */
export async function updateEntry(req: TenantRequest, res: Response) {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId || 'demo-medical-tech';
    
    const entry = await projectNotebookService.updateEntry(id, req.body, tenantId);
    
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    
    res.json(entry);
  } catch (error) {
    logger.error('Error in updateEntry', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(500).json({ 
      error: 'Failed to update project notebook entry',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * DELETE /api/project-notebook/entries/:id
 * Delete an entry
 */
export async function deleteEntry(req: TenantRequest, res: Response) {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId || 'demo-medical-tech';
    
    await projectNotebookService.deleteEntry(id, tenantId);
    
    res.status(204).send();
  } catch (error) {
    logger.error('Error in deleteEntry', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(500).json({ 
      error: 'Failed to delete project notebook entry',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * GET /api/project-notebook/categories
 * Get categories with entry counts
 */
export async function getCategories(req: TenantRequest, res: Response) {
  try {
    const tenantId = req.tenantId || 'demo-medical-tech';
    
    const categories = await projectNotebookService.getCategories(tenantId);
    
    res.json(categories);
  } catch (error) {
    logger.error('Error in getCategories', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(500).json({ 
      error: 'Failed to fetch categories',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

