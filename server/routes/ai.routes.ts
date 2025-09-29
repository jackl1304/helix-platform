import { Router } from "express";
import { PerplexityService } from "../services/ai/perplexity.service";
import { DEFAULT_SYSTEM_PROMPT } from "../services/ai/prompt";

const router = Router();

// POST /api/ai/ask
// body: { question: string, provider?: "perplexity"|"gemini", systemPrompt?: string }
router.post("/ask", async (req, res) => {
  try {
    const { question, provider = "perplexity", systemPrompt } = req.body || {};
    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: "'question' ist erforderlich" });
    }

    if (provider === "gemini") {
      return res.status(503).json({ error: "Gemini-Service temporär deaktiviert" });
    }

    const ppx = new PerplexityService();
    if (!ppx.isConfigured()) {
      return res.status(503).json({ error: "Perplexity ist nicht konfiguriert" });
    }
    const result = await ppx.ask({ question, systemPrompt: systemPrompt || DEFAULT_SYSTEM_PROMPT });
    return res.json({ provider: "perplexity", ...result });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Interner Fehler" });
  }
});

export default router;


