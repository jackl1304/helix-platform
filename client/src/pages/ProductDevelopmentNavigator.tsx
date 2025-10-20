import React, 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Rocket, FileText, Book, Scale, CheckCircle } from 'lucide-react';

interface ProjectPlan {
  productIdea: string;
  generatedAt: string;
  phases: Phase[];
}

interface Phase {
  title: string;
  description: string;
  tasks: string[];
  relevantDocuments: Document[];
  templates: Document[];
}

interface Document {
  name?: string;
  title: string;
  type: string;
  url: string;
}

const ProductDevelopmentNavigator: React.FC = () => {
  const [productIdea, setProductIdea] = React.useState('');
  const [projectPlan, setProjectPlan] = React.useState<ProjectPlan | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleGeneratePlan = async () => {
    if (!productIdea) {
      setError('Bitte geben Sie eine Produktidee ein.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setProjectPlan(null);

    try {
      const response = await fetch('/api/navigator/start-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productIdea }),
      });

      if (!response.ok) {
        throw new Error('Netzwerkantwort war nicht erfolgreich.');
      }

      const result = await response.json();
      if (result.success) {
        setProjectPlan(result.data);
      } else {
        throw new Error(result.message || 'Fehler beim Abrufen des Projektplans.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getIconForType = (type: string) => {
    switch (type.toLowerCase()) {
      case 'iso-norm': return <Book className="h-4 w-4 mr-2 text-blue-500" />;
      case 'rechtsfall': return <Scale className="h-4 w-4 mr-2 text-red-500" />;
      default: return <FileText className="h-4 w-4 mr-2 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Rocket className="mr-3 h-8 w-8 text-blue-600" />
            Product Development Navigator
          </CardTitle>
          <CardDescription>
            Starten Sie Ihr nächstes Medizintechnik-Projekt. Geben Sie Ihre Idee ein, und wir erstellen einen geführten Fahrplan von der Konzeption bis zur Zulassung.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full max-w-lg items-center space-x-2">
            <Input
              type="text"
              placeholder="z.B. KI-gestützte Diagnosesoftware für Hautkrebs"
              value={productIdea}
              onChange={(e) => setProductIdea(e.target.value)}
              disabled={isLoading}
            />
            <Button onClick={handleGeneratePlan} disabled={isLoading}>
              {isLoading ? 'Analysiere...' : 'Fahrplan erstellen'}
            </Button>
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </CardContent>
      </Card>

      {projectPlan && (
        <Card>
          <CardHeader>
            <CardTitle>Ihr Projekt-Fahrplan für: "{projectPlan.productIdea}"</CardTitle>
            <CardDescription>Generiert am: {new Date(projectPlan.generatedAt).toLocaleString()}</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {projectPlan.phases.map((phase, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="text-lg font-semibold">Phase {index + 1}: {phase.title}</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <p className="text-muted-foreground">{phase.description}</p>

                    <h4 className="font-semibold mt-4">Aufgaben:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {phase.tasks.map((task, i) => <li key={i}>{task}</li>)}
                    </ul>

                    {phase.relevantDocuments.length > 0 && (
                      <>
                        <h4 className="font-semibold mt-4">Relevante Dokumente aus unserer Datenbank:</h4>
                        <ul className="space-y-1">
                          {phase.relevantDocuments.map((doc, i) => <li key={i} className="flex items-center">{getIconForType(doc.type)} <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{doc.title}</a></li>)}
                        </ul>
                      </>
                    )}

                    {phase.templates.length > 0 && (
                      <>
                        <h4 className="font-semibold mt-4">Nützliche Vorlagen:</h4>
                        <ul className="space-y-1">
                          {phase.templates.map((doc, i) => <li key={i} className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500" /> <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{doc.name || doc.title}</a></li>)}
                        </ul>
                      </>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductDevelopmentNavigator;
