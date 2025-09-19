import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Brain, Sparkles, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { GeminiService } from '@/services/geminiService';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface AIInsightsProps {
  initialText?: string;
  mode?: 'document' | 'sentiment' | 'compliance' | 'case' | 'executive';
  title?: string;
}

export function AIInsights({ initialText = '', mode = 'document', title }: AIInsightsProps) {
  const [text, setText] = useState(initialText);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast({
        title: t('ai.textRequired'),
        description: t('ai.enterText'),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      let result;
      
      switch (mode) {
        case 'document':
          result = await GeminiService.analyzeDocument(text);
          break;
        case 'sentiment':
          result = await GeminiService.analyzeSentiment(text);
          break;
        case 'compliance':
          result = await GeminiService.generateComplianceInsights(text);
          break;
        case 'case':
          result = await GeminiService.summarizeLegalCase(text);
          break;
        case 'executive':
          result = await GeminiService.generateExecutiveBriefing('weekly');
          break;
      }
      
      setAnalysis(result);
      toast({
        title: t('ai.analysisCompleted'),
        description: t('ai.analysisSuccess'),
      });
    } catch (error) {
      console.error('AI Analysis error:', error);
      toast({
        title: t('ai.analysisError'),
        description: error instanceof Error ? error.message : "The AI analysis could not be performed.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (level: string) => {
    const colors: Record<string, string> = {
      Low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      Medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", 
      High: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    };
    
    const icons: Record<string, any> = {
      Low: CheckCircle,
      Medium: Clock,
      High: AlertTriangle
    };
    
    const Icon = icons[level] || AlertTriangle;
    
    return (
      <Badge className={`${colors[level]} gap-1`} data-testid={`badge-risk-${level.toLowerCase()}`}>
        <Icon className="h-3 w-3" />
        {level}
      </Badge>
    );
  };

  const getSentimentBadge = (tone: string, rating: number) => {
    const colors: Record<string, string> = {
      Positive: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      Neutral: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
      Negative: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    };
    
    return (
      <Badge className={`${colors[tone]} gap-1`} data-testid={`badge-sentiment-${tone.toLowerCase()}`}>
        <Sparkles className="h-3 w-3" />
        {tone} ({rating}/5)
      </Badge>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2" data-testid="ai-insights-title">
          <Brain className="h-5 w-5 text-blue-600" />
          {title || t('ai.insights')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mode !== 'executive' && (
          <div className="space-y-2">
            <label htmlFor="analysis-text" className="text-sm font-medium">
              Text for analysis:
            </label>
            <Textarea
              id="analysis-text"
              placeholder={t('ai.enterTextPlaceholder')}
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              data-testid="input-analysis-text"
            />
          </div>
        )}

        <Button 
          onClick={handleAnalyze} 
          disabled={loading || (!text.trim() && mode !== 'executive')}
          className="w-full"
          data-testid="button-analyze"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analysiere...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              AI-Analyse starten
            </>
          )}
        </Button>

        {analysis && (
          <div className="space-y-4 pt-4 border-t">
            {/* Document Analysis Results */}
            {mode === 'document' && analysis.summary && (
              <div className="space-y-4" data-testid="results-document-analysis">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    📋 Zusammenfassung
                    {getRiskBadge(analysis.riskLevel)}
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {analysis.summary}
                  </p>
                </div>

                {analysis.keyPoints && analysis.keyPoints.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">🔑 Wichtige Punkte:</h4>
                    <ul className="space-y-1">
                      {analysis.keyPoints.map((point: string, index: number) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.complianceRequirements && analysis.complianceRequirements.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">⚖️ Compliance-Anforderungen:</h4>
                    <ul className="space-y-1">
                      {analysis.complianceRequirements.map((req: string, index: number) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <span className="text-red-500 mt-1">•</span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  Vertrauen: {Math.round(analysis.confidence * 100)}%
                </div>
              </div>
            )}

            {/* Sentiment Analysis Results */}
            {mode === 'sentiment' && analysis.rating && (
              <div className="space-y-3" data-testid="results-sentiment-analysis">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">📊 Sentiment-Analyse</h4>
                  <div className="flex gap-2">
                    {getSentimentBadge(analysis.tone, analysis.rating)}
                    {getRiskBadge(analysis.urgency)}
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Vertrauen: {Math.round(analysis.confidence * 100)}%
                </div>
              </div>
            )}

            {/* Compliance Insights Results */}
            {mode === 'compliance' && Array.isArray(analysis) && (
              <div className="space-y-4" data-testid="results-compliance-insights">
                <h4 className="font-semibold">🎯 Compliance-Erkenntnisse</h4>
                {analysis.map((insight, index) => (
                  <Card key={index} className="p-3 border-l-4 border-l-blue-500">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-sm">{insight.requirement}</h5>
                        {getRiskBadge(insight.impact)}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        📅 {insight.timeline}
                      </p>
                      {insight.applicability.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {insight.applicability.map((app: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {app}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Case Summary Results */}
            {mode === 'case' && analysis.summary && (
              <div className="space-y-3" data-testid="results-case-summary">
                <h4 className="font-semibold">⚖️ Rechtsfallzusammenfassung</h4>
                <div className="prose prose-sm max-w-none">
                  <p className="text-sm leading-relaxed whitespace-pre-line">
                    {analysis.summary}
                  </p>
                </div>
              </div>
            )}

            {/* Executive Briefing Results */}
            {mode === 'executive' && analysis.briefing && (
              <div className="space-y-3" data-testid="results-executive-briefing">
                <h4 className="font-semibold">📈 Executive Briefing ({analysis.timeframe})</h4>
                <div className="prose prose-sm max-w-none">
                  <p className="text-sm leading-relaxed whitespace-pre-line">
                    {analysis.briefing}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}