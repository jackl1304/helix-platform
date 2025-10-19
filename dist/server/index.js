import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupCustomerAIRoutes } from "./temp-ai-routes";
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
import { neon } from "@neondatabase/serverless";
EventEmitter.defaultMaxListeners = 30;
process.setMaxListeners(30);
export const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));
app.use((req, res, next) => {
    analyticsMiddleware(req, res, next).catch(next);
});
app.use('/api/tenant', (req, res, next) => {
    tenantIsolationMiddleware(req, res, next).catch(next);
});
app.use('/tenant', (req, res, next) => {
    tenantIsolationMiddleware(req, res, next).catch(next);
});
async function perplexityChat(prompt, model = "sonar") {
    try {
        const API_KEY = process.env.PERPLEXITY_API_KEY;
        if (!API_KEY)
            throw new Error("PERPLEXITY_API_KEY ist nicht gesetzt");
        const res = await fetch("https://api.perplexity.ai/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }] }),
        });
        if (!res.ok)
            throw new Error(`Perplexity API Error ${res.status}`);
        const data = await res.json();
        return data.choices?.[0]?.message?.content || "";
    }
    catch (error) {
        console.error("Perplexity API Error:", error);
        return "Entschuldigung, der AI-Service ist momentan nicht verfügbar.";
    }
}
const logger = new Logger("ServerMain");
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
app.post("/api/ai", async (req, res) => {
    try {
        const prompt = req.body?.prompt;
        if (!prompt)
            return res.status(400).json({ error: "Feld 'prompt' erforderlich." });
        const answer = await perplexityChat(prompt);
        return res.json({ answer });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "AI-Service nicht verfügbar." });
    }
});
async function startServer() {
    const routesServer = await registerRoutes(app);
    setupCustomerAIRoutes(app);
    app.use('/api/tenant/auth', tenantAuthRoutes);
    app.use('/api/tenant', tenantApiRoutes);
    app.use('/api/ai', aiSearchRoutes);
    app.post("/api/webhook", (req, res) => {
        console.log("Webhook empfangen:", req.body);
        res.json({ received: true });
    });
    const sqlFeedback = neon(process.env.DATABASE_URL);
    app.post('/api/feedback', async (req, res) => {
        try {
            const { page, type = 'general', title, message, userEmail, userName, browserInfo = {} } = req.body;
            console.log('[FEEDBACK] Received:', { page, type, title, userName });
            if (!page || !title || !message) {
                return res.status(400).json({
                    error: 'Page, title und message sind erforderlich'
                });
            }
            const tenantId = 'demo-medical-tech';
            const userId = null;
            const result = await sqlFeedback `
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
        }
        catch (error) {
            console.error('[FEEDBACK] ERROR:', error);
            return res.status(500).json({
                error: 'Fehler beim Übermitteln des Feedbacks'
            });
        }
    });
    app.get('/api/feedback', async (req, res) => {
        try {
            const { status = 'all', type = 'all', page, limit = 50 } = req.query;
            const feedback = await sqlFeedback `
      SELECT * FROM feedback 
      ORDER BY created_at DESC 
      LIMIT ${Number(limit)}
    `;
            res.json({
                success: true,
                total: feedback.length,
                feedback
            });
        }
        catch (error) {
            console.error('[FEEDBACK] Get Error:', error);
            res.status(500).json({ error: 'Fehler beim Abrufen des Feedbacks' });
        }
    });
    app.put('/api/feedback/:id/status', async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            await sqlFeedback `
      UPDATE feedback 
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${id}
    `;
            res.json({
                success: true,
                message: 'Feedback-Status erfolgreich aktualisiert'
            });
        }
        catch (error) {
            console.error('[FEEDBACK] Update Error:', error);
            res.status(500).json({ error: 'Fehler beim Aktualisieren des Feedback-Status' });
        }
    });
    app.use("/api/*", (req, res) => {
        res.status(404).json({ error: `API nicht gefunden: ${req.path}` });
    });
    app.use((err, _req, res, _next) => {
        res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
    });
    const isProd = process.env.NODE_ENV === "production" || app.get("env") !== "development";
    if (!isProd) {
        setupVite(app, routesServer).catch(console.error);
    }
    else {
        const distPath = path.resolve(import.meta.url.replace("file://", ""), "../public");
        if (fs.existsSync(distPath)) {
            app.use(express.static(distPath));
            app.get("*", (_req, res) => {
                res.sendFile(path.resolve(distPath, "index.html"));
            });
        }
    }
    const port = parseInt(process.env.PORT || "5000", 10);
    routesServer.listen(port, "0.0.0.0", () => {
        log(`Server läuft auf Port ${port}`);
        console.log(`🚀 Server is running on http://0.0.0.0:${port}`);
    });
}
startServer().catch(console.error);
//# sourceMappingURL=index.js.map