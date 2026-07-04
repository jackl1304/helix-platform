import dotenv from 'dotenv';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from './app';
import { Logger } from './services/logger.service';
dotenv.config();
const logger = new Logger('Server');
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';
function validateEnvironment() {
    const requiredEnvVars = NODE_ENV === 'production'
        ? ['DATABASE_URL', 'SESSION_SECRET', 'JWT_SECRET']
        : ['SESSION_SECRET', 'JWT_SECRET'];
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    if (missingEnvVars.length > 0) {
        logger.error('Missing required environment variables', { missingEnvVars });
        process.exit(1);
    }
    if (NODE_ENV === 'development') {
        if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('dummy') || process.env.DATABASE_URL.includes('username:password')) {
            logger.warn('⚠️  No valid DATABASE_URL found - Server will run with mock data');
            logger.warn('   This is OK for development. Set DATABASE_URL for real database connection.');
        }
    }
    if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length < 32) {
        logger.warn('SESSION_SECRET should be at least 32 characters long for security');
    }
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
        logger.warn('JWT_SECRET should be at least 32 characters long for security');
    }
    logger.info('Environment validation completed', {
        nodeEnv: NODE_ENV,
        port: PORT,
        host: HOST,
        hasDatabase: !!(process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('dummy') && !process.env.DATABASE_URL.includes('username:password'))
    });
}
async function startServer() {
    try {
        validateEnvironment();
        const server = createServer();
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
            logger.info('Available endpoints:', {
                health: `http://${HOST}:${PORT}/health`,
                apiHealth: `http://${HOST}:${PORT}/api/health`,
                systemInfo: `http://${HOST}:${PORT}/api/system/info`,
                regulatoryUpdates: `http://${HOST}:${PORT}/api/v1/regulatory-updates`,
                root: `http://${HOST}:${PORT}/`
            });
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
        server.on('error', (error) => {
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
        server.on('close', () => {
            logger.info('Server closed');
        });
        logger.info('✅ Server startup completed successfully');
    }
    catch (error) {
        logger.error('❌ Server startup failed', {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
        process.exit(1);
    }
}
const isDirectRun = process.argv[1] ?
    resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url)) :
    false;
if (isDirectRun) {
    startServer().catch((error) => {
        logger.error('Failed to start server', {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
        process.exit(1);
    });
}
export default startServer;
//# sourceMappingURL=server.js.map