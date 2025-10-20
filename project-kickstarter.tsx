import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Rocket, FileText, FlaskConical, BarChart, Clock, Euro, Target, CheckCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

// Annahme: Ein API-Client existiert
const apiClient = {
  post: async (url: string, body: any) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  },
};

interface ProjectKit {
  id: string;
  productIdea: string;
  summary: string;
  regulatoryProfile: {
    targetRegion: string;
    estimatedDeviceClass: string;
    likelyRegulatoryPathway: string;
  };
  estimation: {
    estimatedTime: string;
    estimatedCost: string;
    criticalFactors: string;
  };
  documentTemplates: { id: string; title: string; category: string; content: string }[];
  supportingData: {
    relevantApprovals: { id: string; title: string }[];
    relevantKnowledgeArticles: { id: string; title: string }[];
  };
}

export function ProjectKickstarterPage() {
  const [productIdea, setProductIdea] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectKit, setProjectKit] = useState<ProjectKit | null>(null);

  const handleGenerateKit = async () => {
    if (!productIdea) {
      setError('Bitte geben Sie eine Produktidee ein.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setProjectKit(null);

    try {
      const response = await apiClient.post('/api/project-kits', { productIdea });
      if (response.success) {
        setProjectKit(response.data);
      } else {
        setError(response.message || 'Ein unbekannter Fehler ist aufgetreten.');
      }
    } catch (err) {
      setError('Fehler bei der Kommunikation mit dem Server. Bitte versuchen Sie es später erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <Card className="bg-gradient-to-r from-gray-50 to-blue-50">
        <CardHeader>
          <CardTitle className="text-3xl font-bold flex items-center gap-2">
            <Rocket className="text-blue-600" />
            Project Kickstarter
          </CardTitle>
          <CardDescription>
            Transformieren Sie Ihre Idee in einen strukturierten, regulatorischen Projektplan. Geben Sie Ihre Produktidee ein und erhalten Sie in Sekunden ein komplettes Starter-Kit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              type="text"
              placeholder="z.B. 'KI-gestütztes Diagnosetool für Kardiologie'"
              value={productIdea}
              onChange={(e) => setProductIdea(e.target.value)}
              className="flex-grow"
              disabled={isLoading}
            />
            <Button onClick={handleGenerateKit} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analysiere...
                </>
              ) : (
                'Projekt-Kit generieren'
              )}
            </Button>
          </div>
          {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
        </CardContent>
      </Card>

      {projectKit && (
        <div className="space-y-6 animate-fade-in">
          <Alert variant="default" className="bg-green-50 border-green-200">
             <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="font-semibold text-green-800">Projekt-Kit erfolgreich generiert!</AlertTitle>
            <AlertDescription className="text-green-700">
              Hier ist Ihr maßgeschneidertes Paket für: "{projectKit.productIdea}"
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Target /> Executive Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm text-gray-700">{projectKit.summary}</p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FlaskConical /> Regulatorisches Profil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p><strong>Zielregion:</strong> {projectKit.regulatoryProfile.targetRegion}</p>
                <p><strong>Geschätzte Geräteklasse:</strong> <Badge variant="secondary">{projectKit.regulatoryProfile.estimatedDeviceClass}</Badge></p>
                <p><strong>Wahrscheinlicher Zulassungsweg:</strong> {projectKit.regulatoryProfile.likelyRegulatoryPathway}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BarChart /> Zeit- & Kostenabschätzung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500"/>
                    <p><strong>Zeitrahmen:</strong> {projectKit.estimation.estimatedTime}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Euro className="h-4 w-4 text-gray-500"/>
                    <p><strong>Kosten (Zulassung):</strong> {projectKit.estimation.estimatedCost}</p>
                </div>
                <Separator className="my-2"/>
                <p className="text-xs text-gray-500">{projectKit.estimation.criticalFactors}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText /> Notwendige Dokumentvorlagen</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {projectKit.documentTemplates.map(doc => (
                  <AccordionItem value={doc.id} key={doc.id}>
                    <AccordionTrigger>
                      <div className="flex items-center justify-between w-full pr-4">
                        <span className="text-sm font-medium text-left">{doc.title}</span>
                        <Badge variant="outline">{doc.category}</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <pre className="text-xs bg-gray-100 p-4 rounded-md whitespace-pre-wrap font-mono">
                        {doc.content}
                      </pre>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Ähnliche Zulassungen</CardTitle></CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {projectKit.supportingData.relevantApprovals.map(item => (
                    <li key={item.id}>{item.title}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Relevante Wissensartikel</CardTitle></CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {projectKit.supportingData.relevantKnowledgeArticles.map(item => (
                    <li key={item.id}>{item.title}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
