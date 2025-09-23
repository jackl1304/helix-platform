import dotenv from 'dotenv';
import { createServer } from './app';
import { Logger } from './services/logger.service';

// Load environment variables
dotenv.config();

const logger = new Logger('Server');

// ==========================================
// CONFIGURATION
// ==========================================

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';

// ==========================================
// VALIDATE ENVIRONMENT
// ==========================================

function validateEnvironment(): void {
  const requiredEnvVars = [
    'DATABASE_URL',
    'SESSION_SECRET',
    'JWT_SECRET'
  ];

  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

  if (missingEnvVars.length > 0) {
    logger.error('Missing required environment variables', { missingEnvVars });
    process.exit(1);
  }

  // Validate session secret strength
  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length < 32) {
    logger.warn('SESSION_SECRET should be at least 32 characters long for security');
  }

  // Validate JWT secret strength
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    logger.warn('JWT_SECRET should be at least 32 characters long for security');
  }

  logger.info('Environment validation completed', {
    nodeEnv: NODE_ENV,
    port: PORT,
    host: HOST
  });
}

// ==========================================
// SERVER STARTUP
// ==========================================

async function startServer(): Promise<void> {
  try {
    // Validate environment
    validateEnvironment();

    // Create HTTP server
    const server = createServer();

    // Start listening
    server.listen(PORT, HOST, () => {
      logger.info('🚀 Helix Regulatory Intelligence Platform Server Started', {
        port: PORT,
        host: HOST,
        environment: NODE_ENV,
        nodeVersion: process.version,
        pid: process.pid,
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
        }
      });

      // Log available endpoints
      logger.info('Available endpoints:', {
        health: `http://${HOST}:${PORT}/health`,
        apiHealth: `http://${HOST}:${PORT}/api/health`,
        systemInfo: `http://${HOST}:${PORT}/api/system/info`,
        regulatoryUpdates: `http://${HOST}:${PORT}/api/v1/regulatory-updates`,
        root: `http://${HOST}:${PORT}/`
      });

      // Development-specific logging
      if (NODE_ENV === 'development') {
        logger.info('🔧 Development mode enabled', {
          features: [
            'Detailed error messages',
            'Request logging',
            'Hot reload support',
            'Debug logging'
          ]
        });
      }

      // Production-specific logging
      if (NODE_ENV === 'production') {
        logger.info('🏭 Production mode enabled', {
          features: [
            'Security headers',
            'Rate limiting',
            'Compression',
            'Error sanitization'
          ]
        });
      }
    });

    // Handle server errors
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

      switch (error.code) {
        case 'EACCES':
          logger.error(`${bind} requires elevated privileges`, { error: error.message });
          process.exit(1);
          break;
        case 'EADDRINUSE':
          logger.error(`${bind} is already in use`, { error: error.message });
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

    // Handle server close
    server.on('close', () => {
      logger.info('Server closed');
    });

    // Log startup completion
    logger.info('✅ Server startup completed successfully');

  } catch (error) {
    logger.error('❌ Server startup failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    process.exit(1);
  }
}

// ==========================================
// START SERVER
// ==========================================

// Only start server if this file is run directly
if (require.main === module) {
  startServer().catch((error) => {
    logger.error('Failed to start server', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    process.exit(1);
  });
}

export default startServer;
