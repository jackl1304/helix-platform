import { RealTimeAPIService } from './realTimeAPIService';
import { universalSourceDispatcher } from './universalSourceDispatcher';
import { db } from '../db';
export class StartupSyncService {
    constructor() {
        this.realTimeAPI = new RealTimeAPIService();
    }
    async performStartupSync() {
        console.log('[Startup Sync] 🚀 Starting resilient multi-source data synchronization...');
        const syncResults = {
            fda: { success: false, error: null, records: 0 },
            clinical: { success: false, error: null, records: 0 },
            who: { success: false, error: null, records: 0 },
            universal: { success: false, error: null, sources: 0, records: 0 },
            cleanup: { success: false, error: null, entriesRemoved: 0 }
        };
        try {
            console.log('[Startup Sync] Phase 1: Syncing FDA data sources...');
            const fdaResult = await this.realTimeAPI.syncFDAData();
            syncResults.fda.success = fdaResult.success;
            syncResults.fda.records = fdaResult.summary?.totalRecords || 0;
            console.log('[Startup Sync] FDA Phase Result:', fdaResult.summary);
        }
        catch (error) {
            syncResults.fda.error = error.message;
            console.error('[Startup Sync] FDA phase failed but continuing:', error.message);
        }
        try {
            console.log('[Startup Sync] Phase 2: Syncing clinical trials data...');
            const clinicalResult = await this.realTimeAPI.syncClinicalTrialsData();
            syncResults.clinical.success = clinicalResult.success;
            syncResults.clinical.records = clinicalResult.summary?.totalRecords || 0;
            console.log('[Startup Sync] Clinical Trials Phase Result:', clinicalResult.summary);
        }
        catch (error) {
            syncResults.clinical.error = error.message;
            console.error('[Startup Sync] Clinical trials phase failed but continuing:', error.message);
        }
        try {
            console.log('[Startup Sync] Phase 3: Syncing EU regulatory data (EMA, BfArM, Swissmedic)...');
            const euResult = await this.realTimeAPI.syncEUData();
            syncResults.who.success = euResult.success;
            syncResults.who.records = euResult.summary?.totalRecords || 0;
            console.log('[Startup Sync] EU Regulatory Phase Result:', euResult.summary);
        }
        catch (error) {
            syncResults.who.error = error.message;
            console.error('[Startup Sync] EU regulatory phase failed but continuing:', error.message);
        }
        try {
            console.log('[Startup Sync] Phase 4: Universal multi-source synchronization (70+ sources)...');
            const universalResult = await universalSourceDispatcher.syncAllSources();
            syncResults.universal = {
                success: universalResult.summary.successfulSources > 0,
                error: null,
                sources: universalResult.summary.totalSources,
                records: universalResult.summary.totalRecords
            };
            console.log('[Startup Sync] Universal sync phase completed:', universalResult.summary);
        }
        catch (error) {
            syncResults.universal = { success: false, error: error.message, sources: 0, records: 0 };
            console.error('[Startup Sync] Universal sync failed but continuing:', error.message);
        }
        try {
            console.log('[Startup Sync] Phase 5: Cleaning up generic entries...');
            await this.cleanupGenericEntries();
            syncResults.cleanup.success = true;
            console.log('[Startup Sync] Cleanup phase completed successfully');
        }
        catch (error) {
            syncResults.cleanup.error = error.message;
            console.error('[Startup Sync] Cleanup failed:', error.message);
        }
        const totalSuccesses = Object.values(syncResults).filter(r => r.success).length;
        const totalPhases = Object.keys(syncResults).length;
        const totalRecords = syncResults.fda.records + syncResults.clinical.records + syncResults.who.records + syncResults.universal.records;
        console.log('[Startup Sync] 🎯 FINAL SUMMARY:');
        console.log(`[Startup Sync] Success Rate: ${totalSuccesses}/${totalPhases} phases successful`);
        console.log(`[Startup Sync] Total Records Synced: ${totalRecords}`);
        console.log('[Startup Sync] Phase Details:', syncResults);
        if (totalSuccesses >= 2) {
            console.log('[Startup Sync] ✅ Startup sync completed successfully (partial or full)');
        }
        else {
            console.log('[Startup Sync] ⚠️  Startup sync completed with limited success');
        }
    }
    async cleanupGenericEntries() {
        try {
            console.log('[Startup Sync] Cleaning up generic entries...');
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
            console.log(`[Startup Sync] Cleaned up ${result.rowCount || 0} generic entries`);
        }
        catch (error) {
            console.error('[Startup Sync] Error during cleanup:', error);
        }
    }
    async getSyncStats() {
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
        }
        catch (error) {
            console.error('[Startup Sync] Error getting stats:', error);
            return { totalUpdates: 0, recentUpdates: 0, lastSync: new Date().toISOString() };
        }
    }
}
export const startupSyncService = new StartupSyncService();
if (process.env.NODE_ENV !== 'test') {
    setTimeout(async () => {
        try {
            await startupSyncService.performStartupSync();
        }
        catch (error) {
            console.error('[Startup Sync] Failed to run startup sync:', error);
        }
    }, 5000);
}
//# sourceMappingURL=startupSyncService.js.map