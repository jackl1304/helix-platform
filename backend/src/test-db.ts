import dotenv from 'dotenv';
import { getDatabase, testConnection } from './db';
import { legalCases, regulatoryUpdates } from '../../shared/schema';
import { sql } from 'drizzle-orm';
import { Logger } from './services/logger.service';

const logger = new Logger('DB-Test');

dotenv.config();

async function testDatabase() {
  console.log('🔍 Testing database connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
  
  try {
    // Test connection
    const isConnected = await testConnection();
    console.log('✅ Connection test:', isConnected ? 'SUCCESS' : 'FAILED');
    
    if (!isConnected) {
      console.error('❌ Database connection failed');
      return;
    }
    
    const db = getDatabase();
    
    // Test legal cases count using Drizzle ORM
    try {
      const legalCasesList = await db.select().from(legalCases);
      console.log(`📊 Legal Cases in database: ${legalCasesList.length}`);
      if (legalCasesList.length > 0) {
        console.log(`   First case: ${legalCasesList[0].title}`);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error querying legal_cases:', errorMsg);
      if (errorMsg.includes('relation') || errorMsg.includes('does not exist')) {
        console.error('   💡 Hint: Table might not exist. Run migrations with: npm run db:push');
      }
    }
    
    // Test regulatory updates count using Drizzle ORM
    try {
      const regUpdatesList = await db.select().from(regulatoryUpdates);
      console.log(`📊 Regulatory Updates in database: ${regUpdatesList.length}`);
      if (regUpdatesList.length > 0) {
        console.log(`   First update: ${regUpdatesList[0].title}`);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error querying regulatory_updates:', errorMsg);
      if (errorMsg.includes('relation') || errorMsg.includes('does not exist')) {
        console.error('   💡 Hint: Table might not exist. Run migrations with: npm run db:push');
      }
    }
    
    // Try to fetch some legal cases
    try {
      const cases = await db.select().from(legalCases).limit(5);
      console.log(`📋 Sample Legal Cases (first 5): ${cases.length}`);
      cases.forEach((c, i) => {
        console.log(`  ${i + 1}. ${c.title} (${c.id})`);
      });
    } catch (error) {
      console.error('❌ Error fetching legal cases:', error instanceof Error ? error.message : 'Unknown error');
    }
    
    console.log('✅ Database test completed');
  } catch (error) {
    console.error('❌ Database test failed:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Stack:', error instanceof Error ? error.stack : undefined);
  }
}

testDatabase().then(() => process.exit(0)).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

