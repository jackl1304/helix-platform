import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Scale, RefreshCw, Search, Filter } from 'lucide-react';
import { apiService } from '@/services/api';
import { safeArray, safeFilter, safeMap } from '@/utils/array-safety';

// ========================================
// SAUBERE RECHTSPRECHUNG SEITE - NEU PROGRAMMIERT
// ========================================

interface LegalCase {
  id: string;
  caseNumber: string;
  title: string;
  court: string;
  jurisdiction: string;
  decisionDate: string;
  summary: string;
  impactLevel: string;
  keywords: string[];
  content: string;
  financialImpact: string;
  verdict: string;
  costs: string;
}

export default function RechtsprechungClean() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('all');

  // Fetch legal cases using new API service
  const { data: legalCases = [], isLoading, error, refetch } = useQuery({
    queryKey: ['legal-cases-clean'],
    queryFn: () => apiService.getLegalCases(),
    staleTime: 300000, // 5 minutes
  });

  // Ensure legalCases is always an array and filter cases
  const safeLegalCases = safeArray<LegalCase>(legalCases);
  
  // Additional safety check for each legal case
  const filteredCases = safeFilter(safeLegalCases, (legalCase: LegalCase) => {
    // Skip invalid cases
    if (!legalCase || typeof legalCase !== 'object') {
      console.warn('[Frontend] Invalid legal case:', legalCase);
      return false;
    }
    const matchesSearch = !searchTerm || 
      (legalCase.title && legalCase.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (legalCase.caseNumber && legalCase.caseNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (legalCase.court && legalCase.court.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesJurisdiction = selectedJurisdiction === 'all' || 
      legalCase.jurisdiction === selectedJurisdiction;

    return matchesSearch && matchesJurisdiction;
  });

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Lade Rechtsfälle...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-600">
          <Scale className="h-8 w-8 mx-auto mb-4" />
          <p>Fehler beim Laden der Rechtsfälle</p>
          <Button onClick={() => refetch()} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Erneut versuchen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Scale className="h-8 w-8 text-blue-600" />
            Legal Intelligence Center
          </h1>
          <p className="text-gray-600 mt-2">
            {filteredCases.length} Gerichtsentscheidungen und juristische Präzedenzfälle mit Executive-Analysen
          </p>
        </div>
        <Button onClick={() => refetch()} className="bg-blue-600 hover:bg-blue-700">
          <RefreshCw className="h-4 w-4 mr-2" />
          Daten synchronisieren
        </Button>
      </div>

      {/* Search & Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Suche & Filter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Rechtsquelle</label>
              <Select value={selectedJurisdiction} onValueChange={setSelectedJurisdiction}>
                <SelectTrigger>
                  <SelectValue placeholder="Alle Jurisdiktionen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Jurisdiktionen</SelectItem>
                  <SelectItem value="Deutschland">Deutschland</SelectItem>
                  <SelectItem value="EU">EU</SelectItem>
                  <SelectItem value="USA">USA</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Suche</label>
              <Input
                placeholder="Fall, Gericht oder Entscheidung suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Filter anwenden
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Gesamte Fälle</p>
                <p className="text-2xl font-bold">{filteredCases.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 bg-orange-500 rounded-full"></div>
              <div>
                <p className="text-sm text-gray-600">Erkannte Änderungen</p>
                <p className="text-2xl font-bold">{safeFilter(filteredCases, (c: LegalCase) => c.impactLevel === 'high' || c.impactLevel === 'critical').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm text-gray-600">Synchronisation</p>
                <p className="text-2xl font-bold text-green-600">OK</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Legal Cases */}
      {filteredCases.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Scale className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">Keine Rechtsfälle gefunden</h3>
            <p className="text-gray-600">Keine Daten in der Datenbank verfügbar.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {safeMap(filteredCases, (legalCase: LegalCase) => (
            <Card key={legalCase.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{legalCase.title}</CardTitle>
                    <CardDescription className="mt-2">
                      <div className="flex items-center gap-4 text-sm">
                        <span><strong>Fallnummer:</strong> {legalCase.caseNumber}</span>
                        <span><strong>Gericht:</strong> {legalCase.court}</span>
                        <span><strong>Datum:</strong> {new Date(legalCase.decisionDate).toLocaleDateString('de-DE')}</span>
                      </div>
                    </CardDescription>
                  </div>
                  <Badge className={`${getImpactColor(legalCase.impactLevel)} text-white`}>
                    {legalCase.impactLevel.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-700">{legalCase.summary}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {safeMap(legalCase.keywords || [], (keyword, index) => (
                      <Badge key={index} variant="outline">
                        {keyword}
                      </Badge>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Finanzielle Auswirkung</p>
                      <p className="font-semibold text-green-600">{legalCase.financialImpact}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Urteil</p>
                      <p className="font-semibold text-orange-600">{legalCase.verdict}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Kosten</p>
                      <p className="font-semibold text-blue-600">{legalCase.costs}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

