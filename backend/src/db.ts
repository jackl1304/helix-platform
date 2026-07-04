import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { sql } from 'drizzle-orm';
import ws from "ws";
import * as schema from "../../shared/schema";
import { Logger } from './services/logger.service';

const logger = new Logger('Database');

neonConfig.webSocketConstructor = ws;

let pool: Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

export function getDatabase() {
  if (db) {
    return db;
  }

  const DATABASE_URL = process.env.DATABASE_URL;
  
  // In development, allow server to start without database
  // Database will be initialized lazily when actually needed
  if (!DATABASE_URL || DATABASE_URL.includes('dummy') || DATABASE_URL.includes('username:password')) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        "DATABASE_URL must be set in production. Did you forget to provision a database?",
      );
    }
    // In development, return null - Services will handle null database gracefully
    logger.warn('⚠️  No valid DATABASE_URL - Running in mock data mode');
    return null as any;
  }

  try {
    logger.info('Initializing database connection...');
    pool = new Pool({ connectionString: DATABASE_URL });
    db = drizzle(pool, { schema });
    logger.info('Database connection initialized successfully');
    return db;
  } catch (error) {
    logger.error('Failed to initialize database connection', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    // In development, allow server to continue without database
    if (process.env.NODE_ENV === 'development') {
      logger.warn('Continuing in development mode without database - using mock data');
      return null as any;
    }
    throw error;
  }
}

export async function testConnection(): Promise<boolean> {
  try {
    // If no valid DATABASE_URL, return false (not an error in development)
    const DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL || DATABASE_URL.includes('dummy') || DATABASE_URL.includes('username:password')) {
      if (process.env.NODE_ENV === 'development') {
        logger.debug('No database connection test - running in mock data mode');
        return false; // Not an error, just no DB
      }
    }
    
    if (!pool) {
      // Try to initialize if not already done
      try {
        getDatabase();
      } catch (error) {
        logger.warn('Could not initialize database for connection test', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        return false;
      }
    }
    
    if (!pool) {
      logger.debug('Database pool not initialized - running in mock data mode');
      return false; // Not an error in development
    }
    
    // Test connection using the pool directly
    const result = await pool.query('SELECT 1 as test');
    logger.info('Database connection test successful', { 
      rowCount: result.rowCount || 0
    });
    return true;
  } catch (error) {
    logger.warn('Database connection test failed - continuing in mock data mode', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return false; // Not an error in development
  }
}

export { schema };
export default getDatabase;

