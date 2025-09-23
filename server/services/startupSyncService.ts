import { RealTimeAPIService } from './realTimeAPIService';
import { businessLogger, LoggingUtils } from '../utils/logger';
import { universalSourceDispatcher } from './universalSourceDispatcher';
import { db } from '../db';

/**
 * Startup Synchronization Service
 * Ensures fresh regulatory data on every server start
 */
export class StartupSyncService {
  private realTimeAPI: RealTimeAPIService;

  constructor() {
    this.realTimeAPI = new RealTimeAPIService();
  }

  /**
   * Comprehensive data synchronization on startup
   * RESILIENT: Each phase runs independently, failures don't stop other phases
   */
  async performStartupSync(): Promise<void> {
    logger.info('🚀 Starting resilient multi-source data synchronization...', { context: 'Startup Sync' });
    
    const syncResults = {
      fda: { success: false, error: null, records: 0 },
      clinical: { success: false, error: null, records: 0 },
      who: { success: false, error: null, records: 0 },
      universal: { success: false, error: null, sources: 0, records: 0 },
      cleanup: { success: false, error: null, entriesRemoved: 0 }
    };

    // Phase 1: FDA Data (High Priority) - Resilient execution
    try {
      logger.info('Phase 1: Syncing FDA data sources...', { context: 'Startup Sync' });
      const fdaResult = await this.realTimeAPI.syncFDAData();
      syncResults.fda.success = fdaResult.success;
      syncResults.fda.records = fdaResult.summary?.totalRecords || 0;
      logger.info('[Startup Sync] FDA Phase Result:', fdaResult.summary);
    } catch (error: any) {
      syncResults.fda.error = error.message;
      logger.error('[Startup Sync] FDA phase failed but continuing:', error.message);
    }

    // Phase 2: Clinical Trials (Medium Priority) - Resilient execution
    try {
      logger.info('Phase 2: Syncing clinical trials data...', { context: 'Startup Sync' });
      const clinicalResult = await this.realTimeAPI.syncClinicalTrialsData();
      syncResults.clinical.success = clinicalResult.success;
      syncResults.clinical.records = clinicalResult.summary?.totalRecords || 0;
      logger.info('[Startup Sync] Clinical Trials Phase Result:', clinicalResult.summary);
    } catch (error: any) {
      syncResults.clinical.error = error.message;
      logger.error('[Startup Sync] Clinical trials phase failed but continuing:', error.message);
    }

    // Phase 3: EU Regulatory Data (High Priority) - Resilient execution
    try {
      logger.info('Phase 3: Syncing EU regulatory data (EMA, BfArM, Swissmedic)...', { context: 'Startup Sync' });
      const euResult = await this.realTimeAPI.syncEUData();
      syncResults.who.success = euResult.success;
      syncResults.who.records = euResult.summary?.totalRecords || 0;
      logger.info('[Startup Sync] EU Regulatory Phase Result:', euResult.summary);
    } catch (error: any) {
      syncResults.who.error = error.message;
      logger.error('[Startup Sync] EU regulatory phase failed but continuing:', error.message);
    }

    // Phase 4: Universal Multi-Source Sync (ALL 70+ sources)
    try {
      logger.info('Phase 4: Universal multi-source synchronization (70+ sources)...', { context: 'Startup Sync' });
      const universalResult = await universalSourceDispatcher.syncAllSources();
      syncResults.universal = { 
        success: universalResult.summary.successfulSources > 0, 
        error: null, 
        sources: universalResult.summary.totalSources,
        records: universalResult.summary.totalRecords 
      };
      logger.info('[Startup Sync] Universal sync phase completed:', universalResult.summary);
    } catch (error: any) {
      syncResults.universal = { success: false, error: error.message, sources: 0, records: 0 };
      logger.error('[Startup Sync] Universal sync failed but continuing:', error.message);
    }

    // Phase 5: Cleanup - ALWAYS runs regardless of previous failures
    try {
      logger.info('Phase 5: Cleaning up generic entries...', { context: 'Startup Sync' });
      await this.cleanupGenericEntries();
      syncResults.cleanup.success = true;
      logger.info('Cleanup phase completed successfully', { context: 'Startup Sync' });
    } catch (error: any) {
      syncResults.cleanup.error = error.message;
      logger.error('[Startup Sync] Cleanup failed:', error.message);
    }

    // Final Summary Report
    const totalSuccesses = Object.values(syncResults).filter(r => r.success).length;
    const totalPhases = Object.keys(syncResults).length;
    const totalRecords = syncResults.fda.records + syncResults.clinical.records + syncResults.who.records + syncResults.universal.records;

    logger.info('🎯 FINAL SUMMARY:', { context: 'Startup Sync' });
    logger.info('Success Rate: ${totalSuccesses}/${totalPhases} phases successful', { context: 'Startup Sync' });
    logger.info('Total Records Synced: ${totalRecords}', { context: 'Startup Sync' });
    logger.info('[Startup Sync] Phase Details:', syncResults);
    
    if (totalSuccesses >= 2) {
      logger.info('✅ Startup sync completed successfully (partial or full)', { context: 'Startup Sync' });
    } else {
      logger.info('⚠️  Startup sync completed with limited success', { context: 'Startup Sync' });
    }
  }

  /**
   * Remove any remaining generic/fake entries from previous sync issues
   */
  private async cleanupGenericEntries(): Promise<void> {
    try {
      logger.info('Cleaning up generic entries...', { context: 'Startup Sync' });
      
      // Remove entries with generic titles and no source
      const result = await db.execute(`
        DELETE FROM regulatory_updates 
        WHERE (
          title LIKE '%Medical Device Approval%' OR 
          title LIKE '%Medical Device Clearance%' OR
          title LIKE '%Medical Device Recall%'
        ) 
        AND source_id IS NULL
        AND description IS NULL
      `);

      logger.info('Cleaned up ${result.rowCount || 0} generic entries', { context: 'Startup Sync' });
      
    } catch (error) {
      logger.error('[Startup Sync] Error during cleanup:', error);
    }
  }

  /**
   * Get sync statistics for monitoring
   */
  async getSyncStats(): Promise<any> {
    try {
      const totalResult = await db.execute('SELECT COUNT(*) as total FROM regulatory_updates');
      const recentResult = await db.execute(`
        SELECT COUNT(*) as recent 
        FROM regulatory_updates 
        WHERE created_at >= NOW() - INTERVAL '24 hours'
      `);

      return {
        totalUpdates: totalResult.rows[0]?.total || 0,
        recentUpdates: recentResult.rows[0]?.recent || 0,
        lastSync: new Date().toISOString()
      };
    } catch (error) {
      logger.error('[Startup Sync] Error getting stats:', error);
      return { totalUpdates: 0, recentUpdates: 0, lastSync: new Date().toISOString() };
    }
  }
}

// Auto-run on server startup
export const startupSyncService = new StartupSyncService();

// Schedule startup sync when this module is imported
if (process.env.NODE_ENV !== 'test') {
  setTimeout(async () => {
    try {
      await startupSyncService.performStartupSync();
    } catch (error) {
      logger.error('[Startup Sync] Failed to run startup sync:', error);
    }
  }, 5000); // Wait 5 seconds after server start to allow DB connection
}