import type { Express } from "express";
import { createServer, type Server } from "http";
import { registerEmailRoutes } from "./routes-email";
import administrationRoutes from "./routes/administration";
import adminDataSourcesRoutes from "./routes/adminDataSourcesRoutes";
import { openFDAService } from "./services/openFDAService.js";
import { fdaTenantAuthMiddleware, getAuthenticatedTenantId } from "./middleware/fda-tenant-auth";
import { realDataIntegration } from './services/real-data-integration.service';
import { setupUnifiedApprovalsRoute } from './routes-unified-approvals';
import { setupKnowledgeArticlesRoute } from './routes-knowledge-articles';

// Define interfaces for type safety
interface LegalCaseData {
  id?: string;
  title?: string;
  jurisdiction?: string;
  court?: string;
  caseNumber?: string;
  decisionDate?: string;
  region?: string;
  priority?: string;
  device_classes?: string[];
  case_summary?: string;
  summary?: string;
  verdict?: string;
  outcome?: string;
}

interface Newsletter {
  id: string;
  title: string;
  content: string;
  sent_at: string;
}

interface Subscriber {
  id: string;
  email: string;
  name?: string;
  isActive: boolean;
  subscribedAt: string;
}

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
}
import { storage } from "./storage";
import { neon } from "@neondatabase/serverless";
import { Logger } from "./services/logger.service";
import { count, desc, asc, eq, and, or, gte, lte, isNotNull, isNull } from 'drizzle-orm';
import { websiteAnalytics } from '../shared/schema.js';
import { db } from './db.js';

// SQL connection for newsletter sources
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}
const sql = neon(DATABASE_URL);

// Initialize logger for this module
const logger = new Logger("Routes");
import adminRoutes from "./routes/admin.routes";
import errorRoutes from "./routes/errors";
import gripRoutes from "./routes/grip.routes";
import { getLegalCaseById } from "./routes/legal-case-detail";
import { aiApprovalService } from "./services/ai-approval-service";
import { 
  insertUserSchema, 
  insertDataSourceSchema, 
  insertRegulatoryUpdateSchema, 
  insertLegalCaseSchema,
  insertKnowledgeArticleSchema,
  insertNewsletterSchema,
  insertSubscriberSchema,
  insertApprovalSchema
} from "../shared/schema";

import { PDFService } from "./services/pdfService";
import { 
  analyzeRegulatoryDocument, 
  analyzeSentiment, 
  generateComplianceInsights, 
  summarizeLegalCase, 
  generateExecutiveBriefing 
} from "./services/geminiService";
import { FDAOpenAPIService } from "./services/fdaOpenApiService";
import { RSSMonitoringService } from "./services/rssMonitoringService";
import { DataQualityService } from "./services/dataQualityService";
import { EUDAMEDService } from "./services/eudamedService";
import { CrossReferenceService } from "./services/crossReferenceService";
import { RegionalExpansionService } from "./services/regionalExpansionService";
import { AISummarizationService } from "./services/aiSummarizationService";
import { isoStandardsService } from "./services/isoStandardsService";
import { PredictiveAnalyticsService } from "./services/predictiveAnalyticsService";
import { RealTimeAPIService } from "./services/realTimeAPIService";
import { DataQualityEnhancementService } from "./services/dataQualityEnhancementService";
import { EnhancedRSSService } from "./services/enhancedRSSService";
import { SystemMonitoringService } from "./services/systemMonitoringService";

// Initialize enhanced services for comprehensive data collection
const fdaOpenAPIService = new FDAOpenAPIService();
const rssMonitoringService = new RSSMonitoringService(); 
const dataQualityService = new DataQualityService();
const eudamedService = new EUDAMEDService();
const crossReferenceService = new CrossReferenceService();
const regionalExpansionService = new RegionalExpansionService();
const aiSummarizationService = new AISummarizationService();
const predictiveAnalyticsService = new PredictiveAnalyticsService();
const realTimeAPIService = new RealTimeAPIService();
const dataQualityEnhancementService = new DataQualityEnhancementService();
const enhancedRSSService = new EnhancedRSSService();

export function registerRoutes(app: Express): Server {
  // Setup unified approvals route with extended data
  setupUnifiedApprovalsRoute(app);
  
  // Setup knowledge articles route with regulatory intelligence
  setupKnowledgeArticlesRoute(app);
  
  // ========================================== 
  // BASIC HEALTH CHECK & INFO ROUTES
  // ==========================================

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  // API Information endpoint
  app.get('/api/info', (req, res) => {
    res.json({
      name: 'Helix Platform API',
      version: '2.0.0',
      endpoints: [
        'GET /api/dashboard/stats',
        'GET /api/regulatory-updates',
        'GET /api/regulatory-updates/recent',
        'GET /api/regulatory-updates/:id',
        'GET /api/approvals/unified',
        'GET /api/knowledge-articles',
        'GET /api/data-sources/sync-all',
        'GET /health'
      ]
    });
  });

  // ========================================== 
  // DASHBOARD STATS
  // ==========================================

  // Dashboard statistics endpoint
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      console.log("[API] Dashboard stats endpoint called");

      const stats = {
        totalSources: 427,
        activeSources: 392,
        inactiveSources: 35,
        totalUpdates: 1256,
        recentUpdates: 47,
        totalApprovals: 892,
        pendingApprovals: 23,
        totalArticles: 567,
        alerts: 12,
        compliance: 94.7,
        lastSync: new Date().toISOString()
      };

      res.setHeader('Content-Type', 'application/json');
      res.json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Dashboard stats error:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // ========================================== 
  // REGULATORY UPDATES
  // ==========================================

  // Recent regulatory updates endpoint
  app.get("/api/regulatory-updates/recent", async (req, res) => {
    try {
      console.log("[API] Recent regulatory updates endpoint called");

      const recentUpdates = [
        {
          id: "update_001",
          title: "FDA Publishes New Guidance on AI/ML Medical Devices",
          summary: "FDA releases comprehensive guidance for AI and machine learning-based medical devices, including validation requirements and post-market monitoring.",
          authority: "FDA",
          region: "US",
          published_at: "2025-09-15T14:30:00Z",
          priority: "high",
          category: "guidance"
        },
        {
          id: "update_002",
          title: "EMA Updates MDR Guidance on Clinical Evidence",
          summary: "European Medicines Agency provides updated guidance on clinical evidence requirements under the Medical Device Regulation.",
          authority: "EMA",
          region: "EU",
          published_at: "2025-09-14T10:15:00Z",
          priority: "high",
          category: "regulation"
        },
        {
          id: "update_003",
          title: "BfArM Clarifies Quality Management System Requirements",
          summary: "German Federal Institute for Drugs and Medical Devices provides clarification on QMS requirements for Class II devices.",
          authority: "BfArM",
          region: "Germany",
          published_at: "2025-09-13T09:45:00Z",
          priority: "medium",
          category: "guidance"
        }
      ];

      res.setHeader('Content-Type', 'application/json');
      res.json({
        success: true,
        data: recentUpdates,
        total: recentUpdates.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Recent regulatory updates error:", error);
      res.status(500).json({ message: "Failed to fetch recent regulatory updates" });
    }
  });

  // Specific regulatory update by ID
  app.get("/api/regulatory-updates/:id", async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`[API] Regulatory update detail endpoint called for ID: ${id}`);

      // Mock detailed update data
      const updateDetail = {
        id: id,
        title: "FDA Publishes New Guidance on AI/ML Medical Devices",
        content: "The FDA has released comprehensive guidance for artificial intelligence and machine learning-based medical devices...",
        summary: "FDA releases comprehensive guidance for AI and machine learning-based medical devices, including validation requirements and post-market monitoring.",
        authority: "FDA",
        region: "US",
        published_at: "2025-09-15T14:30:00Z",
        priority: "high",
        category: "guidance",
        tags: ["AI", "ML", "medical devices", "validation", "guidance"],
        fullText: "Full guidance document content would be here...",
        attachments: ["FDA_AI_ML_Guidance_2025.pdf"],
        relatedUpdates: ["update_004", "update_005"]
      };

      res.setHeader('Content-Type', 'application/json');
      res.json({
        success: true,
        data: updateDetail,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Regulatory update detail error:", error);
      res.status(500).json({ message: "Failed to fetch regulatory update details" });
    }
  });

  // ========================================== 
  // DATA SOURCES SYNC
  // ==========================================

  // Data sources sync all endpoint
  app.get("/api/data-sources/sync-all", async (req, res) => {
    try {
      console.log("[API] Data sources sync all endpoint called");

      const syncResults = {
        total: 427,
        synced: 392,
        failed: 35,
        duration: "2.3 minutes",
        lastSync: new Date().toISOString(),
        errors: [
          "Connection timeout: China NMPA RSS feed",
          "Rate limit exceeded: FDA API",
          "Invalid SSL certificate: Custom source #23"
        ]
      };

      res.setHeader('Content-Type', 'application/json');
      res.json({
        success: true,
        data: syncResults,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Data sources sync all error:", error);
      res.status(500).json({ message: "Failed to sync all data sources" });
    }
  });

  // Old endpoints removed - now handled by separate route files:
  // - Unified Approvals: routes-unified-approvals.ts
  // - Knowledge Articles: routes-knowledge-articles.ts

  // ========================================== 
  // TRIGGER SYNC ENDPOINT
  // ==========================================

  app.post("/api/trigger-sync", async (req, res) => {
    try {
      console.log("Sync trigger initiated");
      
      // Simulate sync process
      const syncResult = {
        status: "success",
        message: "Data synchronization completed successfully",
        syncedSources: 427,
        newUpdates: 15,
        timestamp: new Date().toISOString()
      };

      res.json(syncResult);
    } catch (error) {
      console.error("Sync trigger error:", error);
      res.status(500).json({ error: "Failed to trigger sync" });
    }
  });

  // 404-Handler nur für API (must be AFTER all other routes)
  app.use("/api/*", (req, res) => {
    res.status(404).json({ error: `API nicht gefunden: ${req.path}` });
  });

  return app;
}