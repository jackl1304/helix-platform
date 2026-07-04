import React, { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Brain,
  Calendar,
  Download,
  FileText,
  Gavel,
  Globe,
  Scale,
  Search,
  Briefcase,
  MapPin,
  Clock,
  Eye,
  File,
} from "lucide-react";

type ImpactLevel = "Low" | "Medium" | "High" | "Unknown";

interface LegalCase {
  id: string;
  title: string;
  caseNumber: string;
  court: string;
  jurisdiction: string;
  regionBadge: string;
  decisionDate: string;
  impact: ImpactLevel;
  riskLevel: string;
  priorityBadge: string;
  summary: string;
  overviewBlocks: string[];
  fullContent: string;
  verdict: string;
  damages: string;
  financials: {
    costRange: string;
    timeline: string;
    breakdown: Array<{ label: string; value: string }>;
    roi: {
      payback: string;
      entries: Array<{ label: string; value: string }>;
    };
  };
  aiInsights: string;
  metadata: {
    sector: string;
    complianceLevel: string;
    criticality: string;
    lastUpdate: string;
    impactNotes: string;
    pdfUrl?: string;
  };
}

const mockStats = {
  totalCases: 2015,
  changesDetected: 302,
  highImpact: 161,
  languages: 4,
  syncStatus: "OK",
  statusText: "Synchronisation erfolgreich",
  lastSync: "2025-08-22T08:30:00Z",
};

const mockCases: LegalCase[] = [
  {
    id: "LC-2025-001",
    title: "Medtronic v. FDA - Medical Device Classification Challenge",
    caseNumber: "Case No. 2024-CV-12345",
    court: "U.S. District Court for the District of Columbia",
    jurisdiction: "US Federal Courts (USA)",
    regionBadge: "US Federal",
    decisionDate: "2025-01-15",
    impact: "High",
    riskLevel: "High",
    priorityBadge: "High Impact",
    summary: "Federal court ruling on medical device reclassification under FDA regulations",
    overviewBlocks: [],
    fullContent: "",
    verdict: "Berufung wird zurückgewiesen. Urteil der Vorinstanz bestätigt.",
    damages: "€1.750.000 Verdienstausfall und Folgeschäden",
    financials: {
      costRange: "",
      timeline: "",
      breakdown: [],
      roi: { payback: "", entries: [] },
    },
    aiInsights: "",
    metadata: {
      sector: "Medizinprodukt",
      complianceLevel: "",
      criticality: "",
      lastUpdate: "",
      impactNotes: "",
    },
  },
  {
    id: "LC-2025-014",
    title: "In Re: BioZorb Tissue Marker Products Liability Litigation",
    caseNumber: "22-md-04561",
    court: "U.S. District Court for the District of Massachusetts",
    jurisdiction: "US Federal Courts (USA)",
    regionBadge: "US Federal",
    decisionDate: "2025-08-09",
    impact: "Medium",
    riskLevel: "Medium",
    priorityBadge: "Unknown Impact",
    summary:
      "Multi-district litigation examining surgical device migration risks, adequacy of physician training, and manufacturer response obligations.",
    overviewBlocks: [],
    fullContent: "",
    verdict: "",
    damages: "",
    financials: {
      costRange: "",
      timeline: "",
      breakdown: [],
      roi: { payback: "", entries: [] },
    },
    aiInsights: "",
    metadata: {
      sector: "",
      complianceLevel: "",
      criticality: "",
      lastUpdate: "",
      impactNotes: "",
    },
  },
];

const impactBadgeStyles: Record<ImpactLevel, string> = {
  High: "bg-red-100 text-red-800 border-red-200",
  Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Low: "bg-green-100 text-green-800 border-green-200",
  Unknown: "bg-gray-100 text-gray-700 border-gray-200",
};

export default function RechtsprechungFixed(): JSX.Element {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJurisdiction, setSelectedJurisdiction] = useState("US Federal Courts (USA)");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState("rechtsfalle");

  const handleSync = (): void => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 1000);
  };

  // Alle verfügbaren Rechtssprechungsquellen
  const allLegalSources = [
    'US Federal Courts (USA)',
    'US Supreme Court (USA)',
    'FDA Enforcement Actions (USA)',
    'CJEU - Court of Justice EU',
    'EU General Court',
    'Bundesgerichtshof (Deutschland)',
    'Bundesverwaltungsgericht (Deutschland)',
    'UK High Court',
    'UK Court of Appeal',
    'Schweizer Bundesgericht',
    'International Arbitration',
  ];

  const uniqueJurisdictions = useMemo(
    () => {
      // Kombiniere alle verfügbaren Quellen mit denen aus den Mock-Daten
      const fromCases = Array.from(
        new Set(
          mockCases
            .map((c) => c.jurisdiction)
            .filter((value) => value && value.trim().length > 0),
        ),
      );
      return Array.from(new Set([...allLegalSources, ...fromCases]));
    },
    [],
  );

  const filteredCases = useMemo(() => {
    return mockCases.filter((legalCase) => {
      const matchesSearch =
        !searchTerm ||
        legalCase.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        legalCase.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        legalCase.court.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesJurisdiction =
        selectedJurisdiction === "all" || legalCase.jurisdiction === selectedJurisdiction;

      const caseDate = new Date(legalCase.decisionDate);
      const matchesStart = startDate ? caseDate >= new Date(startDate) : true;
      const matchesEnd = endDate ? caseDate <= new Date(endDate) : true;

      return matchesSearch && matchesJurisdiction && matchesStart && matchesEnd;
    });
  }, [searchTerm, selectedJurisdiction, startDate, endDate]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("de-DE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">MedTech Rechtssprechung</h1>
          <p className="text-gray-600 mt-1">
            Gerichtsentscheidungen und juristische Präzedenzfälle aus der Medizintechnik
          </p>
        </div>
        <Button 
          onClick={handleSync} 
          disabled={isSyncing} 
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Download className="w-4 h-4 mr-2" />
          {isSyncing ? "Synchronisiere..." : "Daten synchronisieren"}
        </Button>
      </div>

      {/* Filter Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filteroptionen</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Rechtsquelle</label>
            <Select value={selectedJurisdiction} onValueChange={setSelectedJurisdiction}>
              <SelectTrigger>
                <SelectValue placeholder="Rechtsquelle wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle</SelectItem>
                {uniqueJurisdictions.map((jurisdiction) => (
                  <SelectItem key={jurisdiction} value={jurisdiction}>
                    {jurisdiction}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Startdatum</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="pl-10"
                placeholder="tt.mm.jjjj"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Enddatum</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="pl-10"
                placeholder="tt.mm.jjjj"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Suche</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Fall, Gericht oder Entscheidung su"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Scale className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Gesamte Fälle</p>
              <p className="text-2xl font-bold text-gray-900">{mockStats.totalCases}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Erkannte Änderungen</p>
              <p className="text-2xl font-bold text-gray-900">{mockStats.changesDetected}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Hoher Impact</p>
              <p className="text-2xl font-bold text-gray-900">{mockStats.highImpact}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <Globe className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Sprachen</p>
              <p className="text-2xl font-bold text-gray-900">{mockStats.languages}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="rechtsfalle">Rechtsfälle</TabsTrigger>
          <TabsTrigger value="analyse">Rechtssprechungsanalyse</TabsTrigger>
          <TabsTrigger value="anderungen">Änderungen</TabsTrigger>
          <TabsTrigger value="analyse-detail">Analyse</TabsTrigger>
        </TabsList>

        <TabsContent value="rechtsfalle" className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Juristische Entscheidungen</h2>
            <p className="text-gray-600 mb-6">
              {filteredCases.length} von {mockStats.totalCases} Rechtsfällen
            </p>
          </div>

          <div className="space-y-4">
            {filteredCases.map((legalCase) => (
              <Card key={legalCase.id} className="border border-gray-200 shadow-sm">
                <CardContent className="p-6 space-y-4">
                  {/* Header with Title and Impact Badge */}
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex-1">{legalCase.title}</h3>
                    <Badge className={`${impactBadgeStyles[legalCase.impact]} border`}>
                      {legalCase.impact.toLowerCase()}
                    </Badge>
                  </div>

                  {/* Case Identifiers */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      <span>{legalCase.caseNumber}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{legalCase.regionBadge}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{formatDate(legalCase.decisionDate)}</span>
                    </div>
                  </div>

                  {/* Summary */}
                  <p className="text-sm text-gray-700">{legalCase.summary}</p>

                  {/* Court */}
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">Gericht: </span>
                    <span className="text-gray-600">{legalCase.court}</span>
                  </div>

                  {/* Ergebnis */}
                  {legalCase.verdict && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                      <div className="text-sm">
                        <span className="font-medium text-gray-900">Ergebnis: </span>
                        <span className="text-gray-700">{legalCase.verdict}</span>
                      </div>
                    </div>
                  )}

                  {/* Urteilsspruch */}
                  {legalCase.verdict && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                      <div className="text-sm">
                        <span className="font-medium text-gray-900">Urteilsspruch: </span>
                        <span className="text-gray-700">{legalCase.verdict}</span>
                      </div>
                    </div>
                  )}

                  {/* Schadensersatz */}
                  {legalCase.damages && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                      <div className="text-sm">
                        <span className="font-medium text-gray-900">Schadensersatz: </span>
                        <span className="text-gray-700">{legalCase.damages}</span>
                      </div>
                    </div>
                  )}

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t">
                    <div className="text-sm">
                      <span className="font-medium text-gray-900">Gerätetype: </span>
                      <span className="text-gray-600">{legalCase.metadata.sector || "N/A"}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-900">Sprache: </span>
                      <span className="text-gray-600">de</span>
                    </div>
                    <div className="text-sm col-span-2">
                      <span className="font-medium text-gray-900">Rechtsfragen: </span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">medical device</Badge>
                        <Badge variant="outline" className="text-xs">FDA</Badge>
                        <Badge variant="outline" className="text-xs">classification</Badge>
                        <Badge variant="outline" className="text-xs">+1 weitere</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <File className="w-4 h-4 mr-2" />
                        Dokument
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm" className="text-gray-600">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analyse" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rechtssprechungsanalyse</CardTitle>
              <CardDescription>Detaillierte Analyse der Rechtsprechung</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Analyse-Funktion wird geladen...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anderungen" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Änderungen</CardTitle>
              <CardDescription>Erkannte Änderungen in der Rechtsprechung</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Änderungsübersicht wird geladen...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analyse-detail" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detaillierte Analyse</CardTitle>
              <CardDescription>Umfassende Analyse der Rechtsfälle</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Detaillierte Analyse wird geladen...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
