// Unified Approvals Route - ECHTE DATEN AUS REGULATORISCHEN QUELLEN
import { Request, Response } from 'express';
import { realDataScraper } from './services/real-data-scraper.service';

export const setupUnifiedApprovalsRoute = (app: any) => {
  // Unified Approvals endpoint - ALLE ZULASSUNGEN UND REGISTRIERUNGEN AUS ECHTEN QUELLEN
  app.get("/api/approvals/unified", async (req: Request, res: Response) => {
    try {
      console.log("[API] Unified approvals endpoint called - fetching REAL DATA from regulatory sources");

      // Hole ECHTE Daten aus den regulatorischen Quellen
      const unifiedApprovals = await realDataScraper.getCachedRealApprovals();

      // Falls keine Daten gefunden wurden, verwende Fallback
      if (!unifiedApprovals || unifiedApprovals.length === 0) {
        console.log("[API] No real data available from regulatory sources");
        return res.status(500).json({ 
          message: "No regulatory data available from sources", 
          error: "All regulatory sources are currently unavailable",
          suggestion: "Please try again later or check network connectivity"
        });
      }

      console.log(`[API] Successfully fetched ${unifiedApprovals.length} real regulatory approvals`);

      res.setHeader('Content-Type', 'application/json');
      res.json({
        success: true,
        data: unifiedApprovals,
        total: unifiedApprovals.length,
        timestamp: new Date().toISOString(),
        source: 'Real Regulatory Sources',
        filters: {
          types: [...new Set(unifiedApprovals.map(a => a.type))],
          statuses: [...new Set(unifiedApprovals.map(a => a.status))],
          regions: [...new Set(unifiedApprovals.map(a => a.region))],
          authorities: [...new Set(unifiedApprovals.map(a => a.authority))],
          classes: [...new Set(unifiedApprovals.map(a => a.deviceClass))],
          categories: [...new Set(unifiedApprovals.map(a => a.category))],
          priorities: [...new Set(unifiedApprovals.map(a => a.priority))]
        },
        statistics: {
          totalApprovals: unifiedApprovals.length,
          approved: unifiedApprovals.filter(a => a.status === 'approved').length,
          pending: unifiedApprovals.filter(a => a.status === 'pending').length,
          submitted: unifiedApprovals.filter(a => a.status === 'submitted').length,
          rejected: unifiedApprovals.filter(a => a.status === 'rejected').length,
          withdrawn: unifiedApprovals.filter(a => a.status === 'withdrawn').length,
          regions: new Set(unifiedApprovals.map(a => a.region)).size,
          authorities: new Set(unifiedApprovals.map(a => a.authority)).size,
          categories: new Set(unifiedApprovals.map(a => a.category)).size
        },
        sources: {
          fda: unifiedApprovals.filter(a => a.authority === 'FDA').length,
          ema: unifiedApprovals.filter(a => a.authority === 'EMA').length,
          bfarm: unifiedApprovals.filter(a => a.authority === 'BfArM').length,
          healthCanada: unifiedApprovals.filter(a => a.authority === 'Health Canada').length,
          tga: unifiedApprovals.filter(a => a.authority === 'TGA').length,
          pmda: unifiedApprovals.filter(a => a.authority === 'PMDA').length,
          mhra: unifiedApprovals.filter(a => a.authority === 'MHRA').length,
          anvisa: unifiedApprovals.filter(a => a.authority === 'ANVISA').length,
          hsa: unifiedApprovals.filter(a => a.authority === 'HSA').length
        }
      });

    } catch (error) {
      console.error("Unified approvals error:", error);
      res.status(500).json({ 
        message: "Failed to fetch unified approvals from regulatory sources",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      });
    }
  });
};
