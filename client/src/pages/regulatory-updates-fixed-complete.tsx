import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { safeArray, safeFilter, safeMap } from '@/utils/array-safety';
import {
  Search,
  Filter,
  Download,
  ExternalLink,
  Calendar,
  Building,
  Globe,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Database,
  Settings,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Target,
  Activity,
  Shield
} from 'lucide-react';

interface RegulatoryUpdate {
  id: string;
  title: string;
  summary: string;
  authority: string;
  region: string;
  published_at: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  url?: string;
  type?: string;
  status?: string;
  deviceClass?: string;
  successProbability?: number;
  costRange?: string;
  riskScore?: number;
  owner?: string;
  productCode?: string;
  statusLabel?: string;
  timeline?: string;
  costBreakdown?: { label: string; value: string }[];
  roiProjection?: {
    payback: string;
    entries: { label: string; value: string; note?: string }[];
  };
}

interface DashboardStats {
  totalUpdates: number;
  recentUpdates: number;
  highPriority: number;
  regions: number;
  totalSources: number;
  activeSources: number;
  lastSync: string;
}

const mockStats: DashboardStats = {
  totalUpdates: 292,
  recentUpdates: 24,
  highPriority: 12,
  regions: 4,
  totalSources: 72,
  activeSources: 68,
  lastSync: "2025-08-22T10:00:00Z",
};

const mockUpdates: RegulatoryUpdate[] = [
  {
    id: "K252316",
    title: "FDA 510(k): Venclose digiRF Generator (VCRFG1); Venclose EVSRF Catheter (VC10A256F60, VC10A256F100)",
    summary:
      "AI-gestützte Hochfrequenzbehandlung zur endovenösen Therapie. Fokus auf sensorbasierter Steuerung und geringere Komplikationsraten.",
    authority: "FDA",
    region: "US",
    published_at: "2025-08-19",
    priority: "low",
    category: "fda_510k",
    type: "approval",
    status: "submitted",
    deviceClass: "II",
    successProbability: 75,
    costRange: "€1.2M – €2.1M",
    riskScore: 50,
    owner: "Venclose, Inc.",
    productCode: "GEI",
    statusLabel: "Genehmigung wahrscheinlich",
    timeline: "14–18 Monate bis Markteinführung",
    costBreakdown: [
      { label: "R&D", value: "€423.360" },
      { label: "Clinical Trials", value: "€338.688" },
      { label: "Regulatory", value: "€181.440" },
      { label: "Manufacturing", value: "€145.152" },
      { label: "Marketing", value: "€120.960" },
    ],
    roiProjection: {
      payback: "36 Monate",
      entries: [
        { label: "Jahr 1", value: "€1.572.480 Umsatz (IRR: 30%)" },
        { label: "Jahr 3", value: "€4.233.600 Umsatz (IRR: 48%)" },
      ],
    },
  },
  {
    id: "K252362",
    title: "FDA 510(k): GBrain MRI",
    summary:
      "Neuro-MRI mit Echtzeit-Datenfusion. Fokus auf Bildqualität zur Diagnostik degenerativer Erkrankungen.",
    authority: "FDA",
    region: "US",
    published_at: "2025-08-22",
    priority: "medium",
    category: "fda_510k",
    type: "approval",
    status: "review",
    deviceClass: "III",
    successProbability: 68,
    costRange: "€2.8M – €3.6M",
    riskScore: 58,
    owner: "GBrain Technologies",
    productCode: "LLZ",
    statusLabel: "Technische Prüfung",
    timeline: "18–24 Monate bis klinischem Launch",
    costBreakdown: [
      { label: "AI Core & Imaging", value: "€950.000" },
      { label: "Hardware", value: "€720.000" },
      { label: "Klinische Studien", value: "€680.000" },
      { label: "Regulatorik", value: "€220.000" },
      { label: "Go-to-Market", value: "€180.000" },
    ],
    roiProjection: {
      payback: "42 Monate",
      entries: [
        { label: "Jahr 1", value: "€2.050.000 Umsatz (IRR: 22%)" },
        { label: "Jahr 5", value: "€5.900.000 Umsatz (IRR: 38%)" },
      ],
    },
  },
  {
    id: "EMA2025-044",
    title: "EMA Fast-Track: AI-basierte Compliance für Robotik-Implantate",
    summary:
      "Neue EU-Referenzarchitektur für erklärbare KI und autonome Robotik. Ziel: MDR Annex IX harmonisieren.",
    authority: "EMA",
    region: "EU",
    published_at: "2025-07-30",
    priority: "high",
    category: "ema_fasttrack",
    type: "guidance",
    status: "active",
    deviceClass: "III",
    successProbability: 62,
    costRange: "€3.2M – €4.5M",
    riskScore: 70,
    owner: "European Commission / Helix Labs",
    productCode: "AI-RBT",
    statusLabel: "Fast-Track aktiv",
    timeline: "12 Monate Policy-Rollout",
    costBreakdown: [
      { label: "Explainable AI Stack", value: "€1.200.000" },
      { label: "Robotik Safety Tests", value: "€980.000" },
      { label: "Regulatory Alignment", value: "€620.000" },
      { label: "Partnernetzwerk", value: "€400.000" },
      { label: "Deployment Support", value: "€320.000" },
    ],
    roiProjection: {
      payback: "30 Monate",
      entries: [
        { label: "Jahr 1", value: "€1.800.000 Einsparungen" },
        { label: "Jahr 2", value: "€3.600.000 Lizenzumsatz" },
      ],
    },
  },
  {
    id: "BfArM-2025-12",
    title: "BfArM Hinweisblatt: Digitale Gesundheitsanwendungen mit KI-Koprozessor",
    summary:
      "Mock-Hinweisblatt zu klinischen Bewertungsanforderungen für KI-basierte Digitale Gesundheitsanwendungen (DiGA).",
    authority: "BfArM",
    region: "DE",
    published_at: "2025-08-05",
    priority: "medium",
    category: "bfarm_guidance",
    type: "guidance",
    status: "published",
    deviceClass: "I/IIa",
    successProbability: 80,
    costRange: "€0.5M – €0.9M",
    riskScore: 35,
    owner: "Helix Research – Demo Mock",
    productCode: "DIGITAL",
    statusLabel: "Guidance veröffentlicht",
    timeline: "6–9 Monate DiGA-Launch",
    costBreakdown: [
      { label: "Software Validierung", value: "€180.000" },
      { label: "Klinische Evaluation", value: "€120.000" },
      { label: "Datensicherheit", value: "€90.000" },
      { label: "Regulatory Paket", value: "€70.000" },
      { label: "Launch & Support", value: "€60.000" },
    ],
    roiProjection: {
      payback: "18 Monate",
      entries: [
        { label: "Jahr 1", value: "€0.9M Erstattungsvolumen" },
        { label: "Jahr 2", value: "€1.6M Abo-Umsatz" },
      ],
    },
  },
  {
    id: "FDA-RDE-2025-09",
    title: "FDA Draft Guidance: Remote Monitoring & Edge Intelligence",
    summary:
      "Entwurf für neue Remote-Monitoring-Auflagen, inklusive Edge-AI Validierung und Zero-Knowledge Logs.",
    authority: "FDA",
    region: "US",
    published_at: "2025-09-01",
    priority: "urgent",
    category: "fda_guidance",
    type: "guidance",
    status: "draft",
    deviceClass: "II/III",
    successProbability: 55,
    costRange: "€1.5M – €2.4M",
    riskScore: 72,
    owner: "Helix Policy Lab (Mock)",
    productCode: "REMOTE",
    statusLabel: "Draft Guidance",
    timeline: "9–12 Monate Edge-Compliance",
    costBreakdown: [
      { label: "Edge Hardware Cert", value: "€420.000" },
      { label: "AI Validation", value: "€380.000" },
      { label: "Security Controls", value: "€320.000" },
      { label: "Operations", value: "€260.000" },
      { label: "Audits & Training", value: "€210.000" },
    ],
    roiProjection: {
      payback: "28 Monate",
      entries: [
        { label: "Jahr 1", value: "€1.2M Compliance-Savings" },
        { label: "Jahr 3", value: "€3.0M Serviceumsatz" },
      ],
    },
  },
];

export default function RegulatoryUpdatesFixedComplete() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isRefetching, setIsRefetching] = useState(false);

  const [updates] = useState<RegulatoryUpdate[]>(mockUpdates);
  const [stats] = useState<DashboardStats>(mockStats);
  const updatesLoading = false;

  const handleMockRefetch = () => {
    setIsRefetching(true);
    setTimeout(() => setIsRefetching(false), 800);
  };

  // Gefilterte Updates basierend auf Suchkriterien
  const safeUpdates = safeArray<RegulatoryUpdate>(updates);
  const filteredUpdates = safeFilter(safeUpdates, (update: RegulatoryUpdate) => {
    const matchesSearch = !searchTerm ||
      update.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      update.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      update.authority.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRegion = selectedRegion === 'all' || update.region === selectedRegion;
    const matchesPriority = selectedPriority === 'all' || update.priority === selectedPriority;
    const matchesType = selectedType === 'all' || update.type === selectedType;

    const matchesDateRange = (!startDate || !endDate) ||
      (update.published_at >= startDate && update.published_at <= endDate);

    return matchesSearch && matchesRegion && matchesPriority && matchesType && matchesDateRange;
  });

  // Eindeutige Werte für Filter
  const uniqueRegions = Array.from(new Set(safeUpdates.map((u: RegulatoryUpdate) => u.region).filter(Boolean))) as string[];
  const uniquePriorities = Array.from(new Set(safeUpdates.map((u: RegulatoryUpdate) => u.priority).filter(Boolean))) as string[];
  const uniqueTypes = Array.from(new Set(safeUpdates.map((u: RegulatoryUpdate) => u.type).filter(Boolean))) as string[];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertTriangle className="w-4 h-4" />;
      case 'high': return <TrendingUp className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('regulatoryUpdates.title')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('regulatoryUpdates.description')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleMockRefetch} variant="outline" size="sm" disabled={isRefetching}>
            <RefreshCw className="w-4 h-4 mr-2" />
            {isRefetching ? 'Demo aktualisiert...' : t('common.refresh')}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            {t('common.export')}
          </Button>
        </div>
      </div>

      <Separator />

      {/* Statistiken - Mock-Daten */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t('regulatoryUpdates.totalUpdates')}
                </p>
                <p className="text-2xl font-bold">{stats.totalUpdates}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t('regulatoryUpdates.filtered')}
                </p>
                <p className="text-2xl font-bold">{filteredUpdates.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t('regulatoryUpdates.highPriority')}
                </p>
                <p className="text-2xl font-bold">{stats.highPriority}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t('regulatoryUpdates.regions')}
                </p>
                <p className="text-2xl font-bold">{stats.regions}</p>
              </div>
              <Globe className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Suche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            {t('regulatoryUpdates.filterSearch')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t('regulatoryUpdates.searchPlaceholder')}
              </label>
              <Input
                placeholder={t('regulatoryUpdates.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {t('regulatoryUpdates.region')}
              </label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue placeholder={t('regulatoryUpdates.allRegions')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('regulatoryUpdates.allRegions')}</SelectItem>
                  {safeMap(uniqueRegions, (region: string) => (
                    <SelectItem key={String(region)} value={String(region)}>{String(region)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {t('regulatoryUpdates.priority')}
              </label>
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger>
                  <SelectValue placeholder={t('regulatoryUpdates.allPriorities')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('regulatoryUpdates.allPriorities')}</SelectItem>
                  {safeMap(uniquePriorities, (priority: string) => (
                    <SelectItem key={String(priority)} value={String(priority)}>{String(priority)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {t('regulatoryUpdates.type')}
              </label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder={t('regulatoryUpdates.allTypes')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('regulatoryUpdates.allTypes')}</SelectItem>
                  {safeMap(uniqueTypes, (type: string) => (
                    <SelectItem key={String(type)} value={String(type)}>{String(type)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {t('regulatoryUpdates.startDate')}
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {t('regulatoryUpdates.endDate')}
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Updates Liste */}
      {updatesLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeMap([...Array(6)], (_: any, i: number) => (
            <Card key={`skeleton-${i}`} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredUpdates.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t('regulatoryUpdates.noUpdates')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t('regulatoryUpdates.noUpdatesDescription')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeMap(filteredUpdates, (update: RegulatoryUpdate, idx: number) => (
            <Card
              key={String(update.id ?? idx)}
              className="hover:shadow-lg transition-shadow border border-slate-200 overflow-hidden"
            >
              <CardHeader className="space-y-4 bg-gradient-to-b from-white to-slate-50">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <Badge variant="outline">{String(update.authority ?? '')}</Badge>
                      <Badge variant="secondary" className={`text-white ${getPriorityColor(update.priority)}`}>
                        <span className="flex items-center">
                          {getPriorityIcon(update.priority)}
                          <span className="ml-1 capitalize">{String(update.priority)}</span>
                        </span>
                      </Badge>
                      <Badge variant="secondary">{String(update.region ?? '')}</Badge>
                      <Badge variant="outline">#{String(update.id)}</Badge>
                    </div>
                    <div>
                      <CardTitle className="text-xl text-[#07233e] leading-snug">
                        {String(update.title ?? '')}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        Produktcode {update.productCode ?? "–"} • Geräteklasse {update.deviceClass ?? "–"} •{" "}
                        {update.statusLabel || update.status || "Mock-Status"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground space-y-1 min-w-[160px]">
                    <p className="flex items-center justify-end gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(update.published_at).toLocaleDateString()}
                    </p>
                    <p className="flex items-center justify-end gap-1">
                      <Globe className="w-3 h-3" />
                      {String(update.region ?? '')}
                    </p>
                    <p className="font-medium text-emerald-700">{update.timeline ?? "Timeline offen"}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{String(update.summary ?? '')}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="rounded-lg border border-slate-200 bg-white p-3">
                    <p className="text-muted-foreground mb-1">Risiko-Score</p>
                    <p className="text-lg font-semibold text-[#07233e]">{update.riskScore ?? 50}/100</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-3">
                    <p className="text-muted-foreground mb-1">Erfolgswahrscheinlichkeit</p>
                    <p className="text-lg font-semibold text-[#07233e]">
                      {update.successProbability ?? 70}%
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-3">
                    <p className="text-muted-foreground mb-1">Kostenrahmen</p>
                    <p className="text-lg font-semibold text-[#07233e]">{update.costRange ?? "n/a"}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-3">
                    <p className="text-muted-foreground mb-1">Status</p>
                    <p className="text-lg font-semibold text-[#07233e]">
                      {update.statusLabel || update.status || "Mock-Demo"}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="overview">
                  <TabsList className="bg-slate-100 rounded-lg p-1 flex flex-wrap gap-1 text-xs">
                    <TabsTrigger value="overview">Übersicht</TabsTrigger>
                    <TabsTrigger value="summary">Zusammenfassung</TabsTrigger>
                    <TabsTrigger value="full">Vollständiger Inhalt</TabsTrigger>
                    <TabsTrigger value="finance">💰 Finanzanalyse</TabsTrigger>
                    <TabsTrigger value="ai">🤖 KI-Analyse</TabsTrigger>
                    <TabsTrigger value="meta">Metadaten</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="pt-3 text-sm text-muted-foreground">
                    <p className="mb-3">
                      {String(update.summary ?? '')} Die Timeline liegt bei {update.timeline ?? "Mock-Timeline"},
                      priorisiert durch {update.authority}. Fokusregion: {update.region}.
                    </p>
                    <div className="flex flex-wrap gap-3 text-xs">
                      <span className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        Priorität: {update.priority}
                      </span>
                      <span className="flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        Klasse {update.deviceClass ?? "n/a"}
                      </span>
                      {update.url && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={update.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Quelle öffnen
                          </a>
                        </Button>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="summary" className="pt-3 text-sm text-muted-foreground">
                    Mock-Executive Summary mit Kerndaten, Behördenfeedback, Risiko-Mitigationsplan und
                    Implementierungsfahrplan für das lokale Team.
                  </TabsContent>

                  <TabsContent value="full" className="pt-3 text-sm text-muted-foreground">
                    Demo-Bericht mit Audit Trail, klinischen Ergebnissen, Behördennotizen und
                    Verantwortlichkeiten. Kann für Kunden-Demos erweitert werden.
                  </TabsContent>

                  <TabsContent value="finance" className="pt-4 space-y-4">
                    <Card className="border-emerald-100 bg-emerald-50">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-emerald-900 text-base">
                          <DollarSign className="w-4 h-4" />
                          Finanzielle Auswirkungen & ROI-Analyse
                        </CardTitle>
                        <CardDescription className="text-emerald-900">
                          Implementierungskosten und erwartete Kapitalrendite basierend auf Mock-Szenarien
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                          <Card className="border-white shadow-sm">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base text-[#07233e]">Implementierungskosten</CardTitle>
                              <CardDescription>{update.timeline ?? "Mock-Timeline"}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                              <p className="text-lg font-semibold text-[#07233e]">{update.costRange ?? "n/a"}</p>
                              <Separator className="bg-slate-200" />
                              <div className="space-y-1">
                                {(update.costBreakdown ?? []).map((item) => (
                                  <div key={item.label} className="flex justify-between text-xs">
                                    <span>{item.label}</span>
                                    <span className="font-medium text-[#07233e]">{item.value}</span>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                          <Card className="border-white shadow-sm">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base text-[#07233e]">ROI-Projektion</CardTitle>
                              <CardDescription>Payback: {update.roiProjection?.payback ?? "k. A."}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                              <div className="space-y-2">
                                {(update.roiProjection?.entries ?? []).map((entry) => (
                                  <div key={entry.label} className="bg-slate-100 rounded-lg p-3">
                                    <p className="text-xs text-muted-foreground">{entry.label}</p>
                                    <p className="text-sm font-semibold text-[#07233e]">{entry.value}</p>
                                    {entry.note && <p className="text-xs text-muted-foreground">{entry.note}</p>}
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="ai" className="pt-3 text-sm text-muted-foreground">
                    KI bewertet Anforderungen, erzeugt Risiko-Playbooks und kennzeichnet kritische Paragraphen.
                    Auto-Summaries stehen für Auditor:innen bereit.
                  </TabsContent>

                  <TabsContent value="meta" className="pt-3 text-xs text-muted-foreground space-y-1">
                    <div>Region: {update.region}</div>
                    <div>Publiziert: {new Date(update.published_at).toLocaleDateString()}</div>
                    <div>Status: {update.statusLabel || update.status || "Mock"}</div>
                    <div>Autor: {update.owner ?? "Helix Demo"}</div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info über Datenquellen */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <Database className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Demo-Datenmodell für 400+ regulatorische Quellen
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Dieses Modul läuft vollständig mit Mock-Daten – ideal für Demos ohne Backend oder externe
                APIs. Alle Kennzahlen spiegeln das Livesystem wider, lassen sich aber offline erweitern.
              </p>
              <div className="mt-3 flex items-center space-x-4 text-xs text-blue-600 dark:text-blue-400">
                <span className="flex items-center">
                  <Settings className="w-3 h-3 mr-1" />
                  {stats.totalSources} konfigurierte Quellen (Mock)
                </span>
                <span className="flex items-center">
                  <Activity className="w-3 h-3 mr-1" />
                  {stats.activeSources} aktive Quellen (Mock)
                </span>
                <span className="flex items-center">
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Letzte Demo-Aktualisierung: {new Date(stats.lastSync).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
