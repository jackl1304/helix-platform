import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import { createServer, Server } from 'http';
import { Logger } from './services/logger.service';
import {
  corsOptions,
  securityHeaders,
  securityMiddleware,
  errorHandler,
  notFoundHandler,
  authRateLimit,
  apiRateLimit
} from './middleware/security';
import { requestLogger } from './services/logger.service';

// Import routes
import regulatoryUpdatesRoutes from './routes/regulatory-updates.routes';

const logger = new Logger('App');

// ==========================================
// EXPRESS APPLICATION SETUP
// ==========================================

export function createApp(): Application {
  const app: Application = express();

  // ==========================================
  // TRUST PROXY (for rate limiting and IP detection)
  // ==========================================
  app.set('trust proxy', 1);

  // ==========================================
  // SECURITY MIDDLEWARE (Order matters!)
  // ==========================================
  
  // 1. Security headers
  app.use(securityHeaders);
  
  // 2. CORS configuration
  app.use(cors(corsOptions));
  
  // 3. Compression
  app.use(compression());
  
  // 4. Body parsing
  app.use(express.json({ 
    limit: '10mb',
    verify: (req, res, buf) => {
      try {
        JSON.parse(buf.toString());
      } catch (e) {
        res.status(400).json({
          success: false,
          error: 'Invalid JSON',
          message: 'Request body contains invalid JSON'
        });
      }
    }
  }));
  app.use(express.urlencoded({ 
    extended: true, 
    limit: '10mb',
    parameterLimit: 1000
  }));

  // 5. Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'strict'
    },
    name: 'helix.session' // Hide session cookie name
  }));

  // 6. Custom security middleware
  app.use(securityMiddleware);

  // 7. Request logging
  app.use(requestLogger);

  // ==========================================
  // HEALTH CHECK & SYSTEM INFO
  // ==========================================

  /**
   * GET /health
   * Health check endpoint for load balancers and monitoring
   */
  app.get('/health', (req: Request, res: Response) => {
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

  /**
   * GET /api/health
   * Detailed health check with service status
   */
  app.get('/api/health', async (req: Request, res: Response) => {
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
    } catch (error) {
      logger.error('Health check failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed'
      });
    }
  });

  /**
   * GET /api/system/info
   * System information endpoint
   */
  app.get('/api/system/info', (req: Request, res: Response) => {
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

  // ==========================================
  // API ROUTES
  // ==========================================

  // API versioning and rate limiting
  app.use('/api/v1', apiRateLimit);

  // Regulatory Updates API
  app.use('/api/v1/regulatory-updates', regulatoryUpdatesRoutes);

  // Future API routes will be added here
  // app.use('/api/v1/legal-cases', legalCasesRoutes);
  // app.use('/api/v1/data-sources', dataSourcesRoutes);
  // app.use('/api/v1/auth', authRoutes);

  // ==========================================
  // ROOT ENDPOINT
  // ==========================================

  /**
   * GET /
   * Root endpoint with API information
   */
  app.get('/', (req: Request, res: Response) => {
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

  // ==========================================
  // ERROR HANDLING MIDDLEWARE
  // ==========================================

  // 404 handler for API routes
  app.use('/api/*', notFoundHandler);

  // Global 404 handler
  app.use(notFoundHandler);

  // Global error handler
  app.use(errorHandler);

  // ==========================================
  // GRACEFUL SHUTDOWN
  // ==========================================

  const gracefulShutdown = (signal: string) => {
    logger.info(`Received ${signal}, starting graceful shutdown`);
    
    // Close HTTP server
    if (server) {
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    }
  };

  // Handle shutdown signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', { error: error.message, stack: error.stack });
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled promise rejection', { reason, promise });
    process.exit(1);
  });

  logger.info('Express application configured successfully');
  return app;
}

// ==========================================
// HEALTH CHECK FUNCTIONS
// ==========================================

async function checkDatabaseHealth(): Promise<'healthy' | 'unhealthy'> {
  try {
    // TODO: Implement actual database health check
    // For now, return healthy
    return 'healthy';
  } catch (error) {
    logger.error('Database health check failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    return 'unhealthy';
  }
}

async function checkRedisHealth(): Promise<'healthy' | 'unhealthy'> {
  try {
    // TODO: Implement actual Redis health check
    // For now, return healthy
    return 'healthy';
  } catch (error) {
    logger.error('Redis health check failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    return 'unhealthy';
  }
}

async function checkExternalAPIsHealth(): Promise<'healthy' | 'unhealthy'> {
  try {
    // TODO: Implement actual external API health checks
    // For now, return healthy
    return 'healthy';
  } catch (error) {
    logger.error('External APIs health check failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    return 'unhealthy';
  }
}

// ==========================================
// SERVER CREATION
// ==========================================

export function createServer(): Server {
  const app = createApp();
  return createServer(app);
}

export default createApp;
