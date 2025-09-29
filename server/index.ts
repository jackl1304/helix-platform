import dotenv from "dotenv";
dotenv.config();

import express, { type Request, type Response, type NextFunction } from "express";
import { createServer } from "http";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupCustomerAIRoutes } from "./temp-ai-routes";
import tenantRoutes from "./routes/tenant-routes";
import tenantAuthRoutes from "./routes/tenant-auth-simple";
import tenantApiRoutes from "./routes/tenant-api";
import { tenantIsolationMiddleware } from "./middleware/tenant-isolation";
import { analyticsMiddleware } from "./middleware/analyticsMiddleware";
import { setupVite, log } from "./vite";
import fs from "fs";
import path from "path";
import { Logger } from "./services/logger.service";
import fetch from "node-fetch";
import { EventEmitter } from "events";
// import "./services/startupSyncService"; // DISABLED - was causing endless duplicate loop
import { neon } from "@neondatabase/serverless";
import { storage } from "./storage";

// Listener-Warnungen entschärfen
EventEmitter.defaultMaxListeners = 30;
process.setMaxListeners(30);

// Express-App initialisieren
export const app = express();
// Server wird von registerRoutes erstellt
const PORT = process.env.PORT || 3000;

// CORS-Konfiguration für Development - ALLE ORIGINS ERLAUBT
app.use(cors({
  origin: true, // Erlaubt alle Origins für Development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID', 'X-Requested-With', 'Cache-Control', 'Accept', 'Origin', 'Access-Control-Request-Method', 'Access-Control-Request-Headers'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

// Body-Parser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));

// Analytics Tracking Middleware (vor allen anderen Routen) - TEMPORARILY DISABLED
// app.use((req, res, next) => {
//   analyticsMiddleware(req as any, res, next).catch(next);
// });

// Multi-Tenant Isolation Middleware
app.use('/api/tenant', (req, res, next) => {
  tenantIsolationMiddleware(req as any, res, next).catch(next);
});
app.use('/tenant', (req, res, next) => {
  tenantIsolationMiddleware(req as any, res, next).catch(next);
});


// Logger
const logger = new Logger("ServerMain");

// Health-Check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Entfernt: alte placeholder-AI-Route – echte AI-Routen werden in routes.ts gemountet

// Async startup function
async function startServer() {
  // Register main routes - gets server back from routes
  const routesServer = await registerRoutes(app);

  // Setup customer AI routes  
  setupCustomerAIRoutes(app);

  // Register tenant-specific routes - ONLY new real data API
  app.use('/api/tenant/auth', tenantAuthRoutes);
  app.use('/api/tenant', tenantApiRoutes);  // NEW real data API with database connections
  // OLD tenant routes REMOVED to prevent conflicts

  // AI-powered search routes disabled - will be replaced with different AI service later

// Weitere Routen
app.post("/api/webhook", (req: Request, res: Response) => {
  console.log("Webhook empfangen:", req.body);
  res.json({ received: true });
});

// Quick Feedback Routes - MUSS VOR 404-Handler stehen
const sqlFeedback = neon(process.env.DATABASE_URL!);

app.post('/api/feedback', async (req, res) => {
  try {
    const {
      page,
      type = 'general',
      title,
      message,
      userEmail,
      userName,
      browserInfo = {}
    } = req.body;
    
    console.log('[FEEDBACK] Received:', { page, type, title, userName });
    
    // Validation
    if (!page || !title || !message) {
      return res.status(400).json({ 
        error: 'Page, title und message sind erforderlich' 
      });
    }
    
    // Get current tenant (default if not authenticated)
    const tenantId = 'demo-medical-tech';
    const userId = null;
    
    // Create feedback entry
    const result = await sqlFeedback`
      INSERT INTO feedback (
        tenant_id, user_id, page, type, title, message, 
        user_email, user_name, browser_info, status, priority
      ) VALUES (
        ${tenantId}, ${userId}, ${page}, ${type}, ${title}, ${message},
        ${userEmail}, ${userName}, ${JSON.stringify(browserInfo)}, 'new', 'medium'
      ) RETURNING id
    `;
    
    const feedbackId = result[0]?.id;
    
    console.log('[FEEDBACK] SUCCESS:', feedbackId);
    
    return res.json({
      success: true,
      message: 'Feedback erfolgreich übermittelt! Vielen Dank für Ihre Rückmeldung.',
      feedbackId
    });
    
  } catch (error: any) {
    console.error('[FEEDBACK] ERROR:', error);
    return res.status(500).json({ 
      error: 'Fehler beim Übermitteln des Feedbacks' 
    });
  }
});

// Get all feedback
app.get('/api/feedback', async (req, res) => {
  try {
    const { status = 'all', type = 'all', page, limit = 50 } = req.query;
    
    const feedback = await sqlFeedback`
      SELECT * FROM feedback 
      ORDER BY created_at DESC 
      LIMIT ${Number(limit)}
    `;
    
    res.json({
      success: true,
      total: feedback.length,
      feedback
    });
    
  } catch (error: any) {
    console.error('[FEEDBACK] Get Error:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen des Feedbacks' });
  }
});

// Update feedback status
app.put('/api/feedback/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    await sqlFeedback`
      UPDATE feedback 
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${id}
    `;
    
    res.json({
      success: true,
      message: 'Feedback-Status erfolgreich aktualisiert'
    });
    
  } catch (error: any) {
    console.error('[FEEDBACK] Update Error:', error);
    res.status(500).json({ error: 'Fehler beim Aktualisieren des Feedback-Status' });
  }
});

// 404-Handler nur für API (must be AFTER all other routes)
// This is moved to routes.ts to ensure it comes after all route registrations

// Globaler Error-Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});


  // Entwicklungs- vs. Produktionsmodus
  const isProd = process.env.NODE_ENV === "production" || app.get("env") !== "development";
  if (!isProd) {
    // Vite Dev-Server im Dev-Modus
    setupVite(app, routesServer).catch(console.error);
  } else {
    // Statische Dateien im Prod-Modus
    const distPath = path.resolve(import.meta.url.replace("file://", ""), "../public");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (_req, res) => {
        res.sendFile(path.resolve(distPath, "index.html"));
      });
    }
  }

  // Server starten
  const port = parseInt(process.env.PORT || "3000", 10);
  routesServer.listen(port, "0.0.0.0", () => {
    log(`Server läuft auf Port ${port}`);
    console.log(`🚀 Server is running on http://0.0.0.0:${port}`);
  });

  // Lightweight Auto-Sync/Warmup alle 5 Minuten
  const SYNC_INTERVAL_MS = 5 * 60 * 1000;
  const runWarmup = async () => {
    try {
      const [updates, cases] = await Promise.all([
        storage.getAllRegulatoryUpdates?.() ?? [],
        storage.getAllLegalCases?.() ?? []
      ]);
      console.log(`[WARMUP] Updates: ${Array.isArray(updates) ? updates.length : 0}, LegalCases: ${Array.isArray(cases) ? cases.length : 0} @ ${new Date().toISOString()}`);

      // GRIP/Äquivalenzdaten zyklisch synchronisieren
      try {
        const res = await fetch('http://0.0.0.0:' + port + '/api/grip/extract', { method: 'POST' });
        const bodyText = await res.text();
        console.log('[WARMUP][GRIP] Sync triggered:', res.status, bodyText.slice(0, 200));
      } catch (gripErr) {
        console.warn('[WARMUP][GRIP] Sync failed:', (gripErr as Error)?.message || gripErr);
      }

      // Real Scraper Refresh (alle 5 Minuten)
      try {
        const { realRegulatoryScraper } = await import('./services/real-regulatory-scraper.service');
        const fresh = await realRegulatoryScraper.getCachedApprovals();
        console.log('[WARMUP][SCRAPER] Cached approvals:', Array.isArray(fresh) ? fresh.length : 0);
      } catch (scrapeErr) {
        console.warn('[WARMUP][SCRAPER] Refresh failed:', (scrapeErr as Error)?.message || scrapeErr);
      }
    } catch (err) {
      console.error('[WARMUP] Failed:', err);
    }
  };

  // sofort und dann alle 5 Minuten
  runWarmup().catch(() => {});
  setInterval(runWarmup, SYNC_INTERVAL_MS);
}

// Start the server
startServer().catch(console.error);
