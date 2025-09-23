import { GoogleGenAI } from "@google/genai";
import { businessLogger, LoggingUtils } from '../utils/logger';

// Initialize Gemini AI client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

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

/**
 * Analyzes regulatory documents and provides comprehensive insights
 */
export async function analyzeRegulatoryDocument(text: string): Promise<RegulatoryAnalysis> {
  try {
    const systemPrompt = `You are a regulatory intelligence expert specializing in medical device compliance. 
    Analyze the provided regulatory document and provide:
    1. A concise executive summary (max 200 words)
    2. Key regulatory points (3-5 bullet points)
    3. Specific compliance requirements
    4. Risk level assessment (Low/Medium/High)
    5. Confidence score (0-1)
    
    Respond in JSON format matching the RegulatoryAnalysis interface.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            keyPoints: { type: "array", items: { type: "string" } },
            complianceRequirements: { type: "array", items: { type: "string" } },
            riskLevel: { type: "string", enum: ["Low", "Medium", "High"] },
            confidence: { type: "number" }
          },
          required: ["summary", "keyPoints", "complianceRequirements", "riskLevel", "confidence"]
        }
      },
      contents: text
    });

    const rawJson = response.text;
    if (rawJson) {
      const analysis: RegulatoryAnalysis = JSON.parse(rawJson);
      return analysis;
    } else {
      throw new Error("Empty response from Gemini");
    }
  } catch (error) {
    logger.error('Gemini regulatory analysis error:', error);
    throw new Error(`Failed to analyze regulatory document: ${error}`);
  }
}

/**
 * Performs sentiment analysis on regulatory updates
 */
export async function analyzeSentiment(text: string): Promise<DocumentSentiment> {
  try {
    const systemPrompt = `You are a regulatory sentiment analysis expert.
    Analyze the sentiment and urgency of the regulatory text and provide:
    1. Rating from 1-5 (1=very negative, 3=neutral, 5=very positive)
    2. Confidence score between 0 and 1
    3. Overall tone (Positive/Neutral/Negative)
    4. Urgency level (Low/Medium/High) based on regulatory impact
    
    Respond with JSON matching the DocumentSentiment interface.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            rating: { type: "number" },
            confidence: { type: "number" },
            tone: { type: "string", enum: ["Positive", "Neutral", "Negative"] },
            urgency: { type: "string", enum: ["Low", "Medium", "High"] }
          },
          required: ["rating", "confidence", "tone", "urgency"]
        }
      },
      contents: text
    });

    const rawJson = response.text;
    if (rawJson) {
      const sentiment: DocumentSentiment = JSON.parse(rawJson);
      return sentiment;
    } else {
      throw new Error("Empty response from Gemini");
    }
  } catch (error) {
    logger.error('Gemini sentiment analysis error:', error);
    throw new Error(`Failed to analyze sentiment: ${error}`);
  }
}

/**
 * Generates compliance insights for specific regulatory requirements
 */
export async function generateComplianceInsights(regulationText: string, deviceType: string = "medical device"): Promise<ComplianceInsight[]> {
  try {
    const prompt = `Analyze this ${deviceType} regulation and identify specific compliance insights:

${regulationText}

Device Type: ${deviceType}

Provide 3-5 key compliance insights with:
- Specific requirement descriptions
- Applicable device categories/classes  
- Implementation timelines
- Business impact assessment
- Actionable recommendations

Respond in JSON array format matching the ComplianceInsight interface.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              requirement: { type: "string" },
              applicability: { type: "array", items: { type: "string" } },
              timeline: { type: "string" },
              impact: { type: "string", enum: ["Low", "Medium", "High"] },
              recommendations: { type: "array", items: { type: "string" } }
            },
            required: ["requirement", "applicability", "timeline", "impact", "recommendations"]
          }
        }
      },
      contents: prompt
    });

    const rawJson = response.text;
    if (rawJson) {
      const insights: ComplianceInsight[] = JSON.parse(rawJson);
      return insights;
    } else {
      throw new Error("Empty response from Gemini");
    }
  } catch (error) {
    logger.error('Gemini compliance insights error:', error);
    throw new Error(`Failed to generate compliance insights: ${error}`);
  }
}

/**
 * Summarizes legal cases with key takeaways
 */
export async function summarizeLegalCase(caseText: string): Promise<string> {
  try {
    const prompt = `Summarize this medical device legal case in a professional, concise manner:

${caseText}

Provide:
1. Case overview (2-3 sentences)
2. Key legal issues
3. Court decision summary
4. Industry implications
5. Compliance takeaways

Keep the summary focused on regulatory and compliance aspects.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    return response.text || "Summary not available";
  } catch (error) {
    logger.error('Gemini legal case summary error:', error);
    throw new Error(`Failed to summarize legal case: ${error}`);
  }
}

/**
 * Generates executive briefing for regulatory intelligence dashboard
 */
export async function generateExecutiveBriefing(
  updates: any[], 
  legalCases: any[], 
  timeframe: string = "weekly"
): Promise<string> {
  try {
    const prompt = `Generate an executive briefing for regulatory intelligence dashboard:

REGULATORY UPDATES (${updates.length} items):
${updates.slice(0, 5).map(u => `- ${u.title} (${u.source_id || u.authority})`).join('\n')}

LEGAL CASES (${legalCases.length} items):
${legalCases.slice(0, 3).map(c => `- ${c.case_title || c.title} (${c.court || c.jurisdiction})`).join('\n')}

Timeframe: ${timeframe}

Generate a professional executive briefing covering:
1. Key regulatory developments
2. Critical legal precedents
3. Compliance priorities
4. Risk assessment
5. Strategic recommendations

Keep it executive-level (200-300 words), focusing on business impact.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt
    });

    return response.text || "Executive briefing not available";
  } catch (error) {
    logger.error('Gemini executive briefing error:', error);
    throw new Error(`Failed to generate executive briefing: ${error}`);
  }
}