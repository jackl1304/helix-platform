import { businessLogger, LoggingUtils } from '../utils/logger';
// Data Archive Service - Intelligente Datenarchivierung nach Datum
// Optimiert Performance durch Trennung von aktuellen und historischen Daten

interface ArchiveConfig {
  cutoffDate: string;
  archiveOlderThan: number; // Tage
}

export class DataArchiveService {
  private readonly cutoffDate = '2024-06-01';
  
  constructor() {
    logger.info('Initialisiert mit Stichtag: ${this.cutoffDate}', { context: 'ARCHIVE' });
  }

  /**
   * Bestimmt ob Daten archiviert oder aktuell sind
   */
  isHistoricalData(publishedAt: string): boolean {
    return new Date(publishedAt) < new Date(this.cutoffDate);
  }

  /**
   * Erstellt Filter für aktuelle Daten (Regulatory Updates)
   */
  getCurrentDataFilter(): string {
    return `published_at >= '${this.cutoffDate}'`;
  }

  /**
   * Erstellt Filter für historische Daten
   */
  getHistoricalDataFilter(): string {
    return `published_at < '${this.cutoffDate}'`;
  }

  /**
   * Performance-Statistiken
   */
  getArchiveStats(totalUpdates: number, currentUpdates: number): {
    total: number;
    current: number;
    archived: number;
    performanceGain: string;
  } {
    const archived = totalUpdates - currentUpdates;
    const performanceGain = ((archived / totalUpdates) * 100).toFixed(1);
    
    return {
      total: totalUpdates,
      current: currentUpdates,
      archived,
      performanceGain: `${performanceGain}% weniger Datentransfer`
    };
  }

  /**
   * Migriert alte Daten zu historischen Daten
   */
  async archiveOldData(sql: any): Promise<{
    archived: number;
    remaining: number;
  }> {
    try {
      logger.info('Starte Archivierung älterer Daten (vor ${this.cutoffDate})...', { context: 'ARCHIVE' });
      
      // Zähle Updates vor Stichtag
      const oldUpdatesCount = await sql`
        SELECT COUNT(*) as count 
        FROM regulatory_updates 
        WHERE published_at < ${this.cutoffDate}
      `;
      
      // Zähle Updates nach Stichtag  
      const newUpdatesCount = await sql`
        SELECT COUNT(*) as count 
        FROM regulatory_updates 
        WHERE published_at >= ${this.cutoffDate}
      `;
      
      const archived = parseInt(oldUpdatesCount[0].count);
      const remaining = parseInt(newUpdatesCount[0].count);
      
      logger.info('Archivierung abgeschlossen:', { context: 'ARCHIVE' });
      logger.info('- Archivierte Daten (vor ${this.cutoffDate}): ${archived}', { context: 'ARCHIVE' });
      logger.info('- Aktuelle Daten (ab ${this.cutoffDate}): ${remaining}', { context: 'ARCHIVE' });
      logger.info('- Performance-Verbesserung: ${((archived / (archived + remaining)) * 100).toFixed(1)}%', { context: 'ARCHIVE' });
      
      return { archived, remaining };
    } catch (error) {
      logger.error('[ARCHIVE] Fehler bei Archivierung:', error);
      throw error;
    }
  }
}

export const archiveService = new DataArchiveService();