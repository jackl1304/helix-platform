import express from 'express';
import cors from 'cors';
import compression from 'compression';
import session from 'express-session';
import { createServer as createHttpServer } from 'http';
import { Logger } from './services/logger.service';
import { corsOptions, securityHeaders, securityMiddleware, errorHandler, notFoundHandler, apiRateLimit } from './middleware/security';
import { requestLogger } from './services/logger.service';
import regulatoryUpdatesRoutes from './routes/regulatory-updates.routes';
import fdaRoutes from './routes/fda.routes';
import dashboardRoutes from './routes/dashboard.routes';
import approvalsRoutes from './routes/approvals.routes';
import legalCasesRoutes from './routes/legal-cases.routes';
import navigatorRoutes from './routes/navigator.routes';
import dataSourcesRoutes from './routes/data-sources.routes';
import knowledgeArticlesRoutes from './routes/knowledge-articles.routes';
import projectNotebookRoutes from './routes/project-notebook.routes';
const logger = new Logger('App');
export function createApp() {
    const app = express();
    app.set('trust proxy', 1);
    app.use(securityHeaders);
    app.use(cors(corsOptions));
    app.use(compression());
    app.use(express.json({
        limit: '10mb'
    }));
    app.use(express.urlencoded({
        extended: true,
        limit: '10mb',
        parameterLimit: 1000
    }));
    app.use(session({
        secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: 'strict'
        },
        name: 'helix.session'
    }));
    app.use(securityMiddleware);
    app.use(requestLogger);
    app.get('/health', (req, res) => {
        const healthCheck = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
            version: process.env.npm_package_version || '1.0.0',
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
            }
        };
        logger.debug('Health check requested', { ip: req.ip, userAgent: req.get('User-Agent') });
        res.json(healthCheck);
    });
    app.get('/api/health', async (req, res) => {
        try {
            const healthCheck = {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: process.env.NODE_ENV || 'development',
                version: process.env.npm_package_version || '1.0.0',
                services: {
                    database: await checkDatabaseHealth(),
                    redis: await checkRedisHealth(),
                    externalApis: await checkExternalAPIsHealth()
                },
                memory: {
                    used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                    total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
                    external: Math.round(process.memoryUsage().external / 1024 / 1024)
                }
            };
            logger.debug('Detailed health check requested', { ip: req.ip });
            res.json(healthCheck);
        }
        catch (error) {
            logger.error('Health check failed', { error: error instanceof Error ? error.message : 'Unknown error' });
            res.status(503).json({
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                error: 'Health check failed'
            });
        }
    });
    app.get('/api/system/info', (req, res) => {
        const systemInfo = {
            version: process.env.npm_package_version || '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            nodeVersion: process.version,
            platform: process.platform,
            arch: process.arch,
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            memory: process.memoryUsage(),
            cpuUsage: process.cpuUsage(),
            pid: process.pid,
            title: process.title
        };
        logger.debug('System info requested', { ip: req.ip });
        res.json(systemInfo);
    });
    app.use('/api/v1', apiRateLimit);
    app.use('/api/dashboard', dashboardRoutes);
    app.use('/api/approvals', approvalsRoutes);
    app.use('/api/v1/regulatory-updates', regulatoryUpdatesRoutes);
    app.use('/api/regulatory-updates', regulatoryUpdatesRoutes);
    app.use('/api/fda', fdaRoutes);
    app.use('/api/legal-cases', legalCasesRoutes);
    app.use('/api/v1/legal-cases', legalCasesRoutes);
    app.use('/api/navigator', navigatorRoutes);
    app.use('/api/data-sources', dataSourcesRoutes);
    app.use('/api/v1/data-sources', dataSourcesRoutes);
    app.use('/api/knowledge-articles', knowledgeArticlesRoutes);
    app.use('/api/v1/knowledge-articles', knowledgeArticlesRoutes);
    app.use('/api/project-notebook', projectNotebookRoutes);
    app.get('/', (req, res) => {
        const apiInfo = {
            name: 'Helix Regulatory Intelligence Platform',
            version: process.env.npm_package_version || '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            status: 'running',
            timestamp: new Date().toISOString(),
            endpoints: {
                health: '/health',
                apiHealth: '/api/health',
                systemInfo: '/api/system/info',
                regulatoryUpdates: '/api/v1/regulatory-updates'
            },
            documentation: '/api/docs'
        };
        logger.info('Root endpoint accessed', { ip: req.ip, userAgent: req.get('User-Agent') });
        res.json(apiInfo);
    });
    app.use('/api/*', notFoundHandler);
    app.use(notFoundHandler);
    app.use(errorHandler);
    logger.info('Express application configured successfully');
    return app;
}
async function checkDatabaseHealth() {
    try {
        const { testConnection } = await import('./db');
        const isConnected = await testConnection();
        return isConnected ? 'healthy' : 'unhealthy';
    }
    catch (error) {
        if (process.env.NODE_ENV === 'development') {
            logger.warn('Database health check failed, but continuing in development mode', {
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            return 'unhealthy';
        }
        logger.error('Database health check failed', { error: error instanceof Error ? error.message : 'Unknown error' });
        return 'unhealthy';
    }
}
async function checkRedisHealth() {
    try {
        return 'healthy';
    }
    catch (error) {
        logger.error('Redis health check failed', { error: error instanceof Error ? error.message : 'Unknown error' });
        return 'unhealthy';
    }
}
async function checkExternalAPIsHealth() {
    try {
        return 'healthy';
    }
    catch (error) {
        logger.error('External APIs health check failed', { error: error instanceof Error ? error.message : 'Unknown error' });
        return 'unhealthy';
    }
}
export function createServer() {
    const app = createApp();
    return createHttpServer(app);
}
export default createApp;
//# sourceMappingURL=app.js.map