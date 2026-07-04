import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../../shared/schema";
import { Logger } from './services/logger.service';
const logger = new Logger('Database');
neonConfig.webSocketConstructor = ws;
let pool = null;
let db = null;
export function getDatabase() {
    if (db) {
        return db;
    }
    const DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL || DATABASE_URL.includes('dummy') || DATABASE_URL.includes('username:password')) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error("DATABASE_URL must be set in production. Did you forget to provision a database?");
        }
        logger.warn('⚠️  No valid DATABASE_URL - Running in mock data mode');
        return null;
    }
    try {
        logger.info('Initializing database connection...');
        pool = new Pool({ connectionString: DATABASE_URL });
        db = drizzle({ client: pool, schema });
        logger.info('Database connection initialized successfully');
        return db;
    }
    catch (error) {
        logger.error('Failed to initialize database connection', {
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        if (process.env.NODE_ENV === 'development') {
            logger.warn('Continuing in development mode without database - using mock data');
            return null;
        }
        throw error;
    }
}
export async function testConnection() {
    try {
        const DATABASE_URL = process.env.DATABASE_URL;
        if (!DATABASE_URL || DATABASE_URL.includes('dummy') || DATABASE_URL.includes('username:password')) {
            if (process.env.NODE_ENV === 'development') {
                logger.debug('No database connection test - running in mock data mode');
                return false;
            }
        }
        if (!pool) {
            try {
                getDatabase();
            }
            catch (error) {
                logger.warn('Could not initialize database for connection test', {
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
                return false;
            }
        }
        if (!pool) {
            logger.debug('Database pool not initialized - running in mock data mode');
            return false;
        }
        const result = await pool.query('SELECT 1 as test');
        logger.info('Database connection test successful', {
            rowCount: result.rowCount || 0
        });
        return true;
    }
    catch (error) {
        logger.warn('Database connection test failed - continuing in mock data mode', {
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        return false;
    }
}
export { schema };
export default getDatabase;
//# sourceMappingURL=db.js.map