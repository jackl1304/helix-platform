// Gemini AI service for regulatory intelligence

export interface RegulatoryAnalysis {
  summary: string;
  keyPoints: string[];
  complianceRequirements: string[];
  riskLevel: "Low" | "Medium" | "High";
  confidence: number;
}

export interface DocumentSentiment {
  rating: number; // 1-5 scale
  confidence: number; // 0-1 scale
  tone: "Positive" | "Neutral" | "Negative";
  urgency: "Low" | "Medium" | "High";
}

export interface ComplianceInsight {
  requirement: string;
  applicability: string[];
  timeline: string;
  impact: "Low" | "Medium" | "High";
  recommendations: string[];
}

export interface ExecutiveBriefing {
  briefing: string;
  timeframe: string;
}

export class GeminiService {
  /**
   * Analyzes regulatory document with Gemini AI
   */
  static async analyzeDocument(text: string): Promise<RegulatoryAnalysis> {
    const response = await fetch("/api/gemini/analyze-document", {
      method: "POST",
      body: JSON.stringify({ text }),
      headers: { "Content-Type": "application/json" }
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Unknown error" }));
      throw new Error(error.message || "Failed to analyze document");
    }
    
    return await response.json();
  }

  /**
   * Analyzes sentiment with Gemini AI
   */
  static async analyzeSentiment(text: string): Promise<DocumentSentiment> {
    const response = await fetch("/api/gemini/analyze-sentiment", {
      method: "POST",
      body: JSON.stringify({ text }),
      headers: { "Content-Type": "application/json" }
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Unknown error" }));
      throw new Error(error.message || "Failed to analyze sentiment");
    }
    
    return await response.json();
  }

  /**
   * Generates compliance insights with Gemini AI
   */
  static async generateComplianceInsights(text: string, deviceType?: string): Promise<ComplianceInsight[]> {
    const response = await fetch("/api/gemini/compliance-insights", {
      method: "POST",
      body: JSON.stringify({ text, deviceType }),
      headers: { "Content-Type": "application/json" }
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Unknown error" }));
      throw new Error(error.message || "Failed to generate compliance insights");
    }
    
    return await response.json();
  }

  /**
   * Summarizes legal case with Gemini AI
   */
  static async summarizeLegalCase(text: string): Promise<{ summary: string }> {
    const response = await fetch("/api/gemini/summarize-case", {
      method: "POST",
      body: JSON.stringify({ text }),
      headers: { "Content-Type": "application/json" }
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Unknown error" }));
      throw new Error(error.message || "Failed to summarize legal case");
    }
    
    return await response.json();
  }

  /**
   * Generates executive briefing with Gemini AI
   */
  static async generateExecutiveBriefing(timeframe: string = "weekly"): Promise<ExecutiveBriefing> {
    const response = await fetch("/api/gemini/executive-briefing", {
      method: "POST",
      body: JSON.stringify({ timeframe }),
      headers: { "Content-Type": "application/json" }
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Unknown error" }));
      throw new Error(error.message || "Failed to generate executive briefing");
    }
    
    return await response.json();
  }
}