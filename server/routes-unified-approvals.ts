// Unified Approvals Route - NUR ECHTE DATEN aus 400+ Quellen
import { Request, Response } from 'express';
import { realRegulatoryScraper } from './services/real-regulatory-scraper.service';

export const setupUnifiedApprovalsRoute = (app: any) => {
  // Unified Approvals endpoint - NUR ECHTE DATEN aus regulatorischen Quellen
  app.get("/api/approvals/unified", async (req: Request, res: Response) => {
    try {
      console.log("[API] Unified approvals endpoint called - fetching REAL DATA from 400+ sources");

      // Hole echte Daten aus den 400+ regulatorischen Quellen
      const unifiedApprovals = await realRegulatoryScraper.getCachedApprovals();

      res.setHeader('Content-Type', 'application/json');
      res.json({
        success: true,
        data: unifiedApprovals,
        total: unifiedApprovals.length,
        timestamp: new Date().toISOString(),
        source: "Real Regulatory Sources (400+ sources)",
        filters: {
          types: [...new Set(unifiedApprovals.map((a: any) => a.type))],
          statuses: [...new Set(unifiedApprovals.map((a: any) => a.status))],
          regions: [...new Set(unifiedApprovals.map((a: any) => a.region))],
          authorities: [...new Set(unifiedApprovals.map((a: any) => a.authority))],
          classes: [...new Set(unifiedApprovals.map((a: any) => a.deviceClass))],
          categories: [...new Set(unifiedApprovals.map((a: any) => a.category))],
          priorities: [...new Set(unifiedApprovals.map((a: any) => a.priority))]
        },
        statistics: {
          totalApprovals: unifiedApprovals.length,
          approved: unifiedApprovals.filter((a: any) => a.status === 'approved').length,
          pending: unifiedApprovals.filter((a: any) => a.status === 'pending').length,
          submitted: unifiedApprovals.filter((a: any) => a.status === 'submitted').length,
          rejected: unifiedApprovals.filter((a: any) => a.status === 'rejected').length,
          withdrawn: unifiedApprovals.filter((a: any) => a.status === 'withdrawn').length,
          regions: new Set(unifiedApprovals.map((a: any) => a.region)).size,
          authorities: new Set(unifiedApprovals.map((a: any) => a.authority)).size,
          categories: new Set(unifiedApprovals.map((a: any) => a.category)).size
        }
      });
    } catch (error) {
      console.error("Unified approvals error:", error);
      res.status(500).json({ message: "Failed to fetch unified approvals" });
    }
  });
};
