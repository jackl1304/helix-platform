import { ProjectNotebookService } from '../services/project-notebook.service';
import { Logger } from '../services/logger.service';
const logger = new Logger('ProjectNotebookController');
const projectNotebookService = new ProjectNotebookService();
export async function getEntries(req, res) {
    try {
        const tenantId = req.tenantId || 'demo-medical-tech';
        const category = req.query.category;
        const search = req.query.search;
        const entries = await projectNotebookService.getEntries(tenantId, category, search);
        res.json(entries);
    }
    catch (error) {
        logger.error('Error in getEntries', {
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        res.status(500).json({
            error: 'Failed to fetch project notebook entries',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
export async function getEntryById(req, res) {
    try {
        const { id } = req.params;
        const tenantId = req.tenantId || 'demo-medical-tech';
        const entry = await projectNotebookService.getEntryById(id, tenantId);
        if (!entry) {
            return res.status(404).json({ error: 'Entry not found' });
        }
        res.json(entry);
    }
    catch (error) {
        logger.error('Error in getEntryById', {
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        res.status(500).json({
            error: 'Failed to fetch project notebook entry',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
export async function createEntry(req, res) {
    try {
        const tenantId = req.tenantId || 'demo-medical-tech';
        const userId = req.user?.id;
        const entry = await projectNotebookService.createEntry(req.body, tenantId, userId);
        res.status(201).json(entry);
    }
    catch (error) {
        logger.error('Error in createEntry', {
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        res.status(500).json({
            error: 'Failed to create project notebook entry',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
export async function updateEntry(req, res) {
    try {
        const { id } = req.params;
        const tenantId = req.tenantId || 'demo-medical-tech';
        const entry = await projectNotebookService.updateEntry(id, req.body, tenantId);
        if (!entry) {
            return res.status(404).json({ error: 'Entry not found' });
        }
        res.json(entry);
    }
    catch (error) {
        logger.error('Error in updateEntry', {
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        res.status(500).json({
            error: 'Failed to update project notebook entry',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
export async function deleteEntry(req, res) {
    try {
        const { id } = req.params;
        const tenantId = req.tenantId || 'demo-medical-tech';
        await projectNotebookService.deleteEntry(id, tenantId);
        res.status(204).send();
    }
    catch (error) {
        logger.error('Error in deleteEntry', {
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        res.status(500).json({
            error: 'Failed to delete project notebook entry',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
export async function getCategories(req, res) {
    try {
        const tenantId = req.tenantId || 'demo-medical-tech';
        const categories = await projectNotebookService.getCategories(tenantId);
        res.json(categories);
    }
    catch (error) {
        logger.error('Error in getCategories', {
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        res.status(500).json({
            error: 'Failed to fetch categories',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
//# sourceMappingURL=project-notebook.controller.js.map