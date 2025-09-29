import fetch from "node-fetch";

export type PerplexityAskOptions = {
  question: string;
  systemPrompt?: string;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  returnCitations?: boolean;
  model?: string;
};

export type PerplexityAskResult = {
  answer: string;
  model: string;
  citations?: Array<{ title?: string; url?: string }> | undefined;
  raw?: any;
};

/**
 * Lightweight wrapper for Perplexity's OpenAI-compatible API.
 */
export class PerplexityService {
  private readonly apiKey: string | undefined;
  private readonly apiUrl: string;

  constructor(apiKey = process.env.PERPLEXITY_API_KEY, apiUrl = "https://api.perplexity.ai/chat/completions") {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  async ask(options: PerplexityAskOptions): Promise<PerplexityAskResult> {
    if (!this.apiKey) {
      throw new Error("PERPLEXITY_API_KEY is not configured");
    }

    const {
      question,
      systemPrompt = "Beantworte präzise auf Basis verifizierter Quellen. Nenne Zitate, wenn verfügbar.",
      temperature = 0.2,
      topP = 0.9,
      maxTokens = 1024,
      returnCitations = true,
      model = "llama-3.1-sonar-large-128k-online"
    } = options;

    const body = {
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question }
      ],
      temperature,
      top_p: topP,
      max_tokens: maxTokens,
      return_citations: returnCitations
    } as any;

    const res = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Perplexity API error: ${res.status} ${text}`);
    }

    const json: any = await res.json();
    const choice = json?.choices?.[0];
    const content = choice?.message?.content || "";
    const citations = choice?.message?.citations as Array<{ title?: string; url?: string }> | undefined;

    return {
      answer: String(content || ""),
      model: String(json?.model || model),
      citations,
      raw: json
    };
  }
}


