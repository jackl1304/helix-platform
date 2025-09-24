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

// AI-Route (Disabled - will be replaced with different AI service later)
app.post("/api/ai", async (req: Request, res: Response) => {
  res.status(503).json({ 
    error: "AI-Service temporär deaktiviert. Wird bald durch eine neue KI-Lösung ersetzt." 
  });
});

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
// Check if DATABASE_URL is available, otherwise feedback will be disabled
let sqlFeedback: any = null;

if (process.env.DATABASE_URL) {
  try {
    sqlFeedback = neon(process.env.DATABASE_URL);
    console.log('[FEEDBACK] Database connection initialized');
  } catch (error) {
    console.error('[FEEDBACK] Database connection failed:', error);
  }
} else {
  console.warn('[FEEDBACK] DATABASE_URL not set - feedback functionality disabled');
}

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
    
    let feedbackId = null;
    
    if (sqlFeedback) {
      // Try to save to database
      try {
        const result = await sqlFeedback`
          INSERT INTO feedback (
            tenant_id, user_id, page, type, title, message, 
            user_email, user_name, browser_info, status, priority
          ) VALUES (
            ${tenantId}, ${userId}, ${page}, ${type}, ${title}, ${message},
            ${userEmail}, ${userName}, ${JSON.stringify(browserInfo)}, 'new', 'medium'
          ) RETURNING id
        `;
        feedbackId = result[0]?.id;
        console.log('[FEEDBACK] SUCCESS (Database):', feedbackId);
      } catch (dbError: any) {
        console.error('[FEEDBACK] Database save failed:', dbError);
        // Continue with fallback
      }
    }
    
    if (!feedbackId) {
      // Fallback: Log feedback to console and file
      feedbackId = `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const feedbackData = {
        id: feedbackId,
        tenant_id: tenantId,
        user_id: userId,
        page,
        type,
        title,
        message,
        user_email: userEmail,
        user_name: userName,
        browser_info: browserInfo,
        status: 'new',
        priority: 'medium',
        timestamp: new Date().toISOString()
      };
      
      console.log('[FEEDBACK] SUCCESS (Fallback):', JSON.stringify(feedbackData, null, 2));
      
      // Try to save to file for persistence
      try {
        const fs = await import('fs');
        const path = await import('path');
        const feedbackDir = path.join(process.cwd(), 'logs');
        
        // Ensure logs directory exists
        if (!fs.existsSync(feedbackDir)) {
          fs.mkdirSync(feedbackDir, { recursive: true });
        }
        
        const feedbackFile = path.join(feedbackDir, 'feedback.jsonl');
        fs.appendFileSync(feedbackFile, JSON.stringify(feedbackData) + '\n');
        console.log('[FEEDBACK] Saved to file:', feedbackFile);
      } catch (fileError) {
        console.warn('[FEEDBACK] Could not save to file:', fileError.message);
      }
    }
    
    return res.json({
      success: true,
      message: 'Feedback erfolgreich übermittelt! Vielen Dank für Ihre Rückmeldung.',
      feedbackId
    });
    
  } catch (error: any) {
    console.error('[FEEDBACK] ERROR:', error);
    return res.status(500).json({ 
      error: 'Fehler beim Übermitteln des Feedbacks',
      details: error.message
    });
  }
});

// Get all feedback
app.get('/api/feedback', async (req, res) => {
  try {
    const { status = 'all', type = 'all', page, limit = 50 } = req.query;
    
    if (sqlFeedback) {
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
    } else {
      // Fallback: Try to read from file
      try {
        const fs = await import('fs');
        const path = await import('path');
        const feedbackFile = path.join(process.cwd(), 'logs', 'feedback.jsonl');
        
        if (fs.existsSync(feedbackFile)) {
          const lines = fs.readFileSync(feedbackFile, 'utf8').trim().split('\n');
          const feedback = lines
            .filter(line => line.trim())
            .map(line => JSON.parse(line))
            .reverse() // Most recent first
            .slice(0, Number(limit));
            
          res.json({
            success: true,
            total: feedback.length,
            feedback,
            source: 'file'
          });
        } else {
          res.json({
            success: true,
            total: 0,
            feedback: [],
            source: 'fallback'
          });
        }
      } catch (fileError) {
        console.error('[FEEDBACK] File read error:', fileError);
        res.json({
          success: true,
          total: 0,
          feedback: [],
          source: 'fallback'
        });
      }
    }
    
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
    
    if (sqlFeedback) {
      await sqlFeedback`
        UPDATE feedback 
        SET status = ${status}, updated_at = NOW()
        WHERE id = ${id}
      `;
      
      res.json({
        success: true,
        message: 'Feedback-Status erfolgreich aktualisiert'
      });
    } else {
      // For fallback mode, just log the update attempt
      console.log('[FEEDBACK] Status update (fallback mode):', { id, status });
      
      res.json({
        success: true,
        message: 'Feedback-Status erfolgreich aktualisiert (Fallback-Modus)'
      });
    }
    
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
  const port = parseInt(process.env.PORT || "3001", 10);
  routesServer.listen(port, "0.0.0.0", () => {
    log(`Server läuft auf Port ${port}`);
    console.log(`🚀 Server is running on http://0.0.0.0:${port}`);
  });
}

// Start the server
startServer().catch(console.error);
