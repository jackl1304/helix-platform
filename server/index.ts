import express, { type Request, type Response, type NextFunction } from "express";
import { createServer } from "http";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupCustomerAIRoutes } from "./temp-ai-routes";
import tenantRoutes from "./routes/tenant-routes";
import tenantAuthRoutes from "./routes/tenant-auth-simple";
import tenantApiRoutes from "./routes/tenant-api";
import aiSearchRoutes from "./routes/ai-search-routes";
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

// CORS aktivieren (für alle Ursprünge, später einschränken)
app.use(cors({ origin: "*" }));

// Body-Parser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));

// Analytics Tracking Middleware (vor allen anderen Routen)
app.use((req, res, next) => {
  analyticsMiddleware(req as any, res, next).catch(next);
});

// Multi-Tenant Isolation Middleware
app.use('/api/tenant', (req, res, next) => {
  tenantIsolationMiddleware(req as any, res, next).catch(next);
});
app.use('/tenant', (req, res, next) => {
  tenantIsolationMiddleware(req as any, res, next).catch(next);
});

// Simple Perplexity-Client
async function perplexityChat(prompt: string, model = "sonar"): Promise<string> {
  try {
    const API_KEY = process.env.PERPLEXITY_API_KEY;
    if (!API_KEY) throw new Error("PERPLEXITY_API_KEY ist nicht gesetzt");

    const res = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }] }),
    });
    if (!res.ok) throw new Error(`Perplexity API Error ${res.status}`);
    const data = await res.json() as any;
    return data.choices?.[0]?.message?.content || "";
  } catch (error) {
    console.error("Perplexity API Error:", error);
    return "Entschuldigung, der AI-Service ist momentan nicht verfügbar.";
  }
}

// Logger
const logger = new Logger("ServerMain");

// Health-Check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// AI-Route
app.post("/api/ai", async (req: Request, res: Response) => {
  try {
    const prompt = req.body?.prompt;
    if (!prompt) return res.status(400).json({ error: "Feld 'prompt' erforderlich." });
    const answer = await perplexityChat(prompt);
    return res.json({ answer });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: "AI-Service nicht verfügbar." });
  }
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

  // Register AI-powered search and analysis routes (Admin only)
  app.use('/api/ai', aiSearchRoutes);

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
app.use("/api/*", (req, res) => {
  res.status(404).json({ error: `API nicht gefunden: ${req.path}` });
});

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
  const port = parseInt(process.env.PORT || "5000", 10);
  routesServer.listen(port, "0.0.0.0", () => {
    log(`Server läuft auf Port ${port}`);
    console.log(`🚀 Server is running on http://0.0.0.0:${port}`);
  });
}

// Start the server
startServer().catch(console.error);
