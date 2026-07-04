import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Shield, Building, Globe, Brain, Layers, Lock, Cpu, Satellite } from "lucide-react";

interface PatentEntry {
  id: string;
  title: string;
  owner: string;
  region: string;
  status: "pending" | "granted" | "expired";
  filingDate: string;
  summary: string;
  technology: string;
  area: string;
  partners?: string[];
  overview: string;
  executiveSummary: string;
  fullContent: string;
  financials: {
    budget: string;
    roi: string;
    licensing: string;
  };
  aiInsights: string;
  metadata: {
    familyId: string;
    ipcCodes: string[];
    priorityDate: string;
  };
  priority: "Niedrig" | "Mittel" | "Hoch";
  riskScore: number;
  complexity: "Niedrig" | "Mittel" | "Hoch";
  successProbability: number;
  costRange: string;
  timeline: string;
  type: string;
  summaryLine: string;
  publishedDate: string;
}

const mockPatents: PatentEntry[] = [
  {
    id: "P-2025-001",
    title: "AI-gestütztes MDR-Compliance-System für vernetzte Medizingeräte",
    owner: "Helix Labs Europe GmbH",
    region: "EU",
    status: "pending",
    filingDate: "2025-02-14",
    summary:
      "Plattformgestützte Patentfamilie zur automatisierten MDR-Compliance mit erklärbarer KI und Live-Risikoprofiling.",
    technology: "AI Compliance Engine",
    area: "ai-compliance",
    partners: ["Helix Research Inc.", "MedAI Alliance"],
    overview: "AI-gestützte MDR-Hauptengine mit validiertem Regelwerk für High-Risk Devices.",
    executiveSummary: "Mock-Executive Summary inkl. Audit-Strategie, Risikoprofil und Equipotential Network.",
    fullContent:
      "Demo-Inhalt: Architekturdiagramme, MDR Annex IX Mapping, Live-Risikoprofile und erklärbare KI-Module.",
    financials: {
      budget: "3,5 Mio. € F&E (Mock)",
      roi: "Erwartete ROI: 4,2x (Mock)",
      licensing: "Enterprise SaaS • Mock-Pricing",
    },
    aiInsights:
      "KI bewertet MDR-Kriterien automatisch, markiert Interessenkonflikte und erstellt Audit-Playbooks.",
    metadata: {
      familyId: "HELIX-MDR-AI-01",
      ipcCodes: ["G06N 3/08", "A61B 5/00"],
      priorityDate: "2025-01-30",
    },
    priority: "Niedrig",
    riskScore: 45,
    complexity: "Mittel",
    successProbability: 78,
    costRange: "2,4 Mio. € – 3,8 Mio. €",
    timeline: "12-16 Monate Mock-Markteinführung",
    type: "Compliance Engine",
    summaryLine: "Explainable MDR Engine mit Live-Risikoprofiling",
    publishedDate: "14.02.2025",
  },
  {
    id: "P-2024-118",
    title: "Predictive Regulatory Intelligence Graph",
    owner: "Helix Research Inc.",
    region: "US",
    status: "granted",
    filingDate: "2024-08-09",
    summary:
      "Graph-basierter Ansatz zur Vorhersage regulatorischer Änderungen über mehr als 70 Behörden-Datenquellen.",
    technology: "Knowledge Graph",
    area: "predictive-intelligence",
    partners: ["Helix Labs Europe GmbH"],
    overview: "Graphbasierte Pipeline, die regulatorische Änderungen 4-6 Monate vorhersagt.",
    executiveSummary:
      "Mock-Summary mit Impact-Matrix für Zulassungen, Compliance-Delays und Marktchancen.",
    fullContent:
      "Detailansicht enthält Demo-Daten zu Behörden, Signal-Routing, Confidence Scores und Alert-Plänen.",
    financials: {
      budget: "2,1 Mio. € (Mock)",
      roi: "3,1x Projektiert",
      licensing: "Graph-as-a-Service (Mock)",
    },
    aiInsights:
      "Explainable Predictive Graph mit Alert-Clustering und Smart Scenarios für CEO Briefings.",
    metadata: {
      familyId: "HELIX-PRED-02",
      ipcCodes: ["G06F 16/35", "G06Q 10/10"],
      priorityDate: "2024-07-11",
    },
    priority: "Mittel",
    riskScore: 52,
    complexity: "Hoch",
    successProbability: 71,
    costRange: "1,8 Mio. € – 2,9 Mio. €",
    timeline: "10-14 Monate Mock-Deployment",
    type: "Intelligence Graph",
    summaryLine: "Vorhersage von Zulassungsfenstern und regulatorischen Shifts",
    publishedDate: "09.08.2024",
  },
  {
    id: "P-2023-082",
    title: "Secure Multi-Tenant Regulatory Hub",
    owner: "Helix Cloud Systems",
    region: "Global",
    status: "granted",
    filingDate: "2023-05-22",
    summary:
      "Mandantenfähige Architektur für regulatorische Live-Datenströme inkl. Audit-Trail und Zero-Knowledge-Layer.",
    technology: "Secure Architecture",
    area: "secure-infrastructure",
    partners: ["Helix Cloud Systems", "SecureTech Consortium"],
    overview: "Zero-Knowledge-Stack für Live-Regulatorikdaten inkl. Audit-Stream.",
    executiveSummary:
      "Mock-Executive Summary für CISO/CTO: Architektur, Resilienztests, Compliance-Score.",
    fullContent:
      "Technische Tiefenbeschreibung mit Tenant-Isolation, Invarianten und Disaster-Recovery-Szenarien.",
    financials: {
      budget: "2,8 Mio. € (Mock)",
      roi: "2,7x, Payback 18 Monate",
      licensing: "Secure-Core Subscription",
    },
    aiInsights:
      "AI-basierter Intrusion-Scoring-Mechanismus + automatische Abweichungsberichte für Aufsichten.",
    metadata: {
      familyId: "HELIX-SEC-03",
      ipcCodes: ["H04L 9/32", "G06F 21/57"],
      priorityDate: "2023-04-02",
    },
    priority: "Hoch",
    riskScore: 38,
    complexity: "Mittel",
    successProbability: 84,
    costRange: "3,0 Mio. € – 4,5 Mio. €",
    timeline: "15-18 Monate Mock-Rollout",
    type: "Secure Platform",
    summaryLine: "Zero-Knowledge Audit Fabric für Multi-Tenant-Umgebungen",
    publishedDate: "22.05.2023",
  },
  {
    id: "P-2022-211",
    title: "Satellite-Linked Regulatory Intelligence Uplink",
    owner: "Helix Space Data",
    region: "Global",
    status: "pending",
    filingDate: "2022-11-30",
    summary:
      "Direkt gestreamte Echtzeit-Dossiers über geostationäre Links zur Absicherung globaler Zulassungsverfahren.",
    technology: "Satellite Data Backbone",
    area: "global-expansion",
    partners: ["Orbital Insight Labs"],
    overview: "Mock-Uplink für regulatorische Dossiers via Satellit zur globalen Synchronisation.",
    executiveSummary:
      "Strategisches Demo-Dokument für globale Zustellzeiten und Redundanzkonzepte.",
    fullContent:
      "End-to-End Deployment Guide inkl. Bodenstation, Uplink-Routing und Compliance-Notarization.",
    financials: {
      budget: "4,0 Mio. € (Mock)",
      roi: "4,8x (Mock Szenario)",
      licensing: "Satellite Data Licensing",
    },
    aiInsights:
      "AI wählt optimale Routing-Fenster, prüft Datenintegrität und erstellt Dossier-Playbooks.",
    metadata: {
      familyId: "HELIX-GLOB-05",
      ipcCodes: ["H04B 7/185", "G06Q 10/08"],
      priorityDate: "2022-11-05",
    },
    priority: "Mittel",
    riskScore: 60,
    complexity: "Hoch",
    successProbability: 66,
    costRange: "4,5 Mio. € – 6,2 Mio. €",
    timeline: "18-22 Monate Pilotphase (Mock)",
    type: "Global Expansion",
    summaryLine: "Satellitengestützter Dossier-Uplink für globale Einreichungen",
    publishedDate: "30.11.2022",
  },
  {
    id: "P-2025-044",
    title: "Self-Healing Compliance Knowledge Fabric",
    owner: "Helix Research Inc.",
    region: "US",
    status: "pending",
    filingDate: "2025-01-05",
    summary:
      "Verteilter Wissenslayer, der Inkonsistenzen automatisch erkennt und regulatorische Wissensgraphen repariert.",
    technology: "Autonomous Knowledge Fabric",
    area: "ai-compliance",
    partners: ["Helix Labs Europe GmbH"],
    overview: "Selbstheilender Wissenslayer, der regulatorische Inkonsistenzen erkennt und repariert.",
    executiveSummary:
      "Mock-Executive Deck mit Use Cases für MDR, IVDR und FDA Breakthrough Devices.",
    fullContent:
      "Detailbeschreibung zur Wissensverteilung, Memory Fabric und Integration in klinische Systeme.",
    financials: {
      budget: "1,9 Mio. €",
      roi: "3,5x",
      licensing: "Fabric as a Service",
    },
    aiInsights:
      "AI führt Root-Cause-Analysen durch und liefert strukturierte Playbooks für Auditoren.",
    metadata: {
      familyId: "HELIX-AI-07",
      ipcCodes: ["G06F 16/245", "G06N 20/00"],
      priorityDate: "2024-12-22",
    },
    priority: "Niedrig",
    riskScore: 40,
    complexity: "Mittel",
    successProbability: 82,
    costRange: "1,4 Mio. € – 2,1 Mio. €",
    timeline: "9-12 Monate Mock-Sandbox",
    type: "Knowledge Fabric",
    summaryLine: "Selbstheilender Wissenslayer für regulatorische Inkonsistenzen",
    publishedDate: "05.01.2025",
  },
  {
    id: "P-2021-309",
    title: "Quantum-Safe Regulatory Vault",
    owner: "Helix Secure Core",
    region: "EU",
    status: "expired",
    filingDate: "2021-04-12",
    summary:
      "Frühe Generation eines quantensicheren Tresors für Medizinprodukteakten, Grundlage für neue Secure-Core-Serie.",
    technology: "Quantum-Safe Vault",
    area: "secure-infrastructure",
    overview: "Legacy-Mock-Vault als Grundlage für Secure-Core 2.0.",
    executiveSummary: "Mock-Review zu Lessons Learned aus dem ersten Vault-Programm.",
    fullContent: "Prototypische Dokumentation, die als Demo-Datensatz verwendet wird.",
    financials: {
      budget: "1,2 Mio. €",
      roi: "Auslaufend",
      licensing: "n/a",
    },
    aiInsights:
      "AI markiert Schwachstellen und liefert Empfehlungen für Quantum-Safe Generation 2.",
    metadata: {
      familyId: "HELIX-SEC-LEG",
      ipcCodes: ["H04L 9/30"],
      priorityDate: "2021-03-30",
    },
    priority: "Niedrig",
    riskScore: 65,
    complexity: "Niedrig",
    successProbability: 55,
    costRange: "0,8 Mio. € – 1,2 Mio. €",
    timeline: "Legacy (abgeschlossen)",
    type: "Legacy Vault",
    summaryLine: "Grundlage für Secure-Core 2.0",
    publishedDate: "12.04.2021",
  },
  {
    id: "P-2024-210",
    title: "Regulatory Digital Twin Orchestrator",
    owner: "Helix Digital Twin Labs",
    region: "Global",
    status: "granted",
    filingDate: "2024-03-19",
    summary:
      "Digitales Zwillingssystem, das Zulassungszyklen simuliert und Genehmigungsszenarien optimiert.",
    technology: "Digital Twin Simulation",
    area: "predictive-intelligence",
    partners: ["Helix Labs Europe GmbH", "Helix Research Inc."],
    overview: "Mock-Digital Twin für Zulassungszyklen inkl. Simulation von Behördenantwortzeiten.",
    executiveSummary:
      "Demo-Strategiepapier für Executives mit Szenario-Kits und Launch-Playbook.",
    fullContent:
      "Technische Beschreibung des Twin-Orchestrators, inklusive KPIs, Alerts und Governance.",
    financials: {
      budget: "2,4 Mio. €",
      roi: "4,1x",
      licensing: "Twin SaaS Pack",
    },
    aiInsights:
      "KI liefert Automationsvorschläge für Submission Packs und Risiko-Splitting.",
    metadata: {
      familyId: "HELIX-TWIN-01",
      ipcCodes: ["G06Q 10/063", "G06N 5/02"],
      priorityDate: "2023-02-15",
    },
    priority: "Hoch",
    riskScore: 48,
    complexity: "Hoch",
    successProbability: 77,
    costRange: "2,9 Mio. € – 4,0 Mio. €",
    timeline: "14-18 Monate Mock-Rollout",
    type: "Digital Twin",
    summaryLine: "Simulation kompletter Zulassungszyklen mit Twin-Orchestrierung",
    publishedDate: "19.03.2024",
  },
  {
    id: "P-2023-150",
    title: "Autonomous Patent Licensing Framework",
    owner: "Helix Legal AI",
    region: "Global",
    status: "granted",
    filingDate: "2023-09-07",
    summary:
      "Selbstverhandelnde Lizenzmodule für regulatorische IP-Bündel, inklusive Abrechnung über Smart Contracts.",
    technology: "Smart Licensing Engine",
    area: "global-expansion",
    overview: "Mock-Framework für automatische Lizenzverhandlungen via Smart Contracts.",
    executiveSummary:
      "Partner-Deck für Mock-Lizenzierung mit Fokus auf Medical Device OEMs.",
    fullContent:
      "Workflow-Dokumentation, wie Lizenzpakete orchestriert werden (Demo/Mock).",
    financials: {
      budget: "1,5 Mio. €",
      roi: "3,9x",
      licensing: "Royalty-as-a-Service",
    },
    aiInsights:
      "AI bewertet Lizenzanfragen, berechnet Konditionen und erstellt Vertragsentwürfe.",
    metadata: {
      familyId: "HELIX-LIC-04",
      ipcCodes: ["G06Q 40/02"],
      priorityDate: "2023-08-01",
    },
    priority: "Mittel",
    riskScore: 55,
    complexity: "Mittel",
    successProbability: 69,
    costRange: "1,1 Mio. € – 1,9 Mio. €",
    timeline: "10-12 Monate Mock-Launch",
    type: "Licensing Platform",
    summaryLine: "Automatisiertes Lizenzframework über Smart Contracts",
    publishedDate: "07.09.2023",
  },
  {
    id: "P-2022-078",
    title: "Multi-Layer Data Provenance Tracker",
    owner: "Helix Data Integrity",
    region: "US",
    status: "granted",
    filingDate: "2022-02-18",
    summary:
      "Schichtenbasiertes Provenance-System zur Nachverfolgung jeder regulatorischen Datenänderung in Echtzeit.",
    technology: "Data Lineage Engine",
    area: "secure-infrastructure",
    overview: "Mock-Provenance-System, das regulatorische Datenverläufe dokumentiert.",
    executiveSummary:
      "CIO-Briefing mit Kennzahlen zur Datenherkunft und Audit-Trust.",
    fullContent:
      "Technische Mock-Dokumentation zu Layern, Event Streams und Prüfpfaden.",
    financials: {
      budget: "1,8 Mio. €",
      roi: "3,0x",
      licensing: "Integrity Pack",
    },
    aiInsights:
      "AI erkennt Missing Links, erstellt primäre Quellenkette und warnt vor Inkonsistenzen.",
    metadata: {
      familyId: "HELIX-DATA-02",
      ipcCodes: ["G06F 21/62"],
      priorityDate: "2021-12-05",
    },
    priority: "Niedrig",
    riskScore: 58,
    complexity: "Mittel",
    successProbability: 73,
    costRange: "1,3 Mio. € – 2,0 Mio. €",
    timeline: "12 Monate Mock-Integration",
    type: "Data Integrity",
    summaryLine: "Lineage-Tracking für regulatorische Datenströme",
    publishedDate: "18.02.2022",
  },
];

const statusStyles: Record<PatentEntry["status"], string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  granted: "bg-emerald-100 text-emerald-800 border-emerald-300",
  expired: "bg-gray-100 text-gray-700 border-gray-200",
};

const patentFocusAreas = [
  {
    id: "ai-compliance",
    title: "AI Compliance Engines",
    description: "Selbstheilende MDR/IVDR-KI-Module mit erklärbarer Entscheidungslogik.",
    icon: Brain,
    patents: 2,
    coverage: "EU • US",
    highlight: "Live-Risikoprofile + Audit-Trail",
    readiness: "Pilotbetrieb in 4 MDR-Projekten (Mock)",
    initiatives: [
      "MDR Guardian 2.0",
      "Explainable AI Reviewer",
      "Compliance Digital Twin",
    ],
  },
  {
    id: "predictive-intelligence",
    title: "Predictive Intelligence Graph",
    description: "Vorhersage von Zulassungsfenstern und regulatorischen Shift-Szenarien.",
    icon: Layers,
    patents: 2,
    coverage: "Global",
    highlight: "70+ Datenquellen · Realtime Updates",
    readiness: "Mock-Daten für Zulassungen 2025",
    initiatives: [
      "Regulatory Shift Radar",
      "AI Roadmap Planner",
      "Opportunity Forecast Board",
    ],
  },
  {
    id: "secure-infrastructure",
    title: "Secure Infrastructure",
    description: "Mandantenfähige Zero-Knowledge-Architekturen für streng regulierte Daten.",
    icon: Lock,
    patents: 3,
    coverage: "EU • US",
    highlight: "Quantum-Safe Vault + Zero Trust",
    readiness: "Mock-Deployment in Private Cloud",
    initiatives: [
      "Zero-Knowledge Vault",
      "Audit Log Fabric",
      "Tenant Isolation Engine",
    ],
  },
  {
    id: "global-expansion",
    title: "Global Expansion & Licensing",
    description: "Satellite-Uplinks, Smart Contracts und Partnernetzwerke.",
    icon: Satellite,
    patents: 2,
    coverage: "Global",
    highlight: "Orbital Insight • Smart Licensing",
    readiness: "Demo-Setup für Licensing Workflows",
    initiatives: [
      "Satellite Uplink Demo",
      "Smart Contract Licensing",
      "Global Partner Hub",
    ],
  },
  {
    id: "innovation-program",
    title: "Innovation & Knowledge Fabric",
    description: "Digital Twins, Knowledge Fabric & autonome IP-Pipelines.",
    icon: Cpu,
    patents: 2,
    coverage: "EU • US",
    highlight: "Digital Twin Orchestrator",
    readiness: "Mock Sandbox mit 5 Entwicklungsstreams",
    initiatives: [
      "Knowledge Fabric Pilot",
      "Digital Twin Studio",
      "Autonomous Licensing Lab",
    ],
  },
];

export default function PatentePage(): JSX.Element {
  const [activeArea, setActiveArea] = useState<string>("ai-compliance");
  const visiblePatents = useMemo(() => {
    return mockPatents.filter((patent) => patent.area === activeArea);
  }, [activeArea]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-[#07233e]" />
          <div>
            <h1 className="text-2xl font-semibold text-[#07233e]">Patente & Innovationsschutz</h1>
            <p className="text-muted-foreground">
              Mock-Daten für Live-Demos – vollständige Patent-Pipelines ohne externe Datenquellen.
            </p>
          </div>
        </div>
        <Separator />
      </div>

      <Tabs value={activeArea} onValueChange={setActiveArea}>
        <TabsList className="grid gap-2 md:grid-cols-5 bg-transparent">
          {patentFocusAreas.map((area) => {
            const Icon = area.icon;
            return (
              <TabsTrigger
                key={area.id}
                value={area.id}
                className="flex flex-col items-start gap-1 border rounded-lg p-3 text-left h-full"
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-[#07233e]" />
                  <span className="font-semibold">{area.title}</span>
                </div>
                <p className="text-xs text-muted-foreground">{area.description}</p>
                <div className="flex flex-wrap gap-2 text-xs text-[#07233e] mt-1">
                  <span>{area.patents} Patente</span>
                  <span>•</span>
                  <span>{area.coverage}</span>
                </div>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {patentFocusAreas.map((area) => (
          <TabsContent key={area.id} value={area.id}>
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>{area.title}</CardTitle>
                <CardDescription>{area.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4 text-sm text-[#07233e]">
                <div>
                  <strong>Patente:</strong> {area.patents} (Mock-Daten)
                </div>
                <div>
                  <strong>Regionen:</strong> {area.coverage}
                </div>
                <div>
                  <strong>Highlight:</strong> {area.highlight}
                </div>
                <div>
                  <strong>Status:</strong> {area.readiness}
                </div>
                <div>
                  <strong>Mock-Modus:</strong> Keine externen Quellen, lokal erweiterbar
                </div>
              </CardContent>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground mb-2">Demo-Initiativen:</p>
                <div className="flex flex-wrap gap-2">
                  {area.initiatives.map((initiative) => (
                    <Badge key={initiative} variant="secondary">
                      {initiative}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Patentpipeline (Demo)</CardTitle>
          <CardDescription>Alle Einträge basieren auf Mock-Daten – keine externen Quellen nötig.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {visiblePatents.map((patent) => (
            <div
              key={patent.id}
              className="border border-gray-200 rounded-lg p-4 flex flex-col gap-3 bg-white shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline">{patent.priority}</Badge>
                    <Badge variant="secondary">{patent.region}</Badge>
                    <Badge variant="secondary">{patent.type}</Badge>
                    <p className="text-xs text-muted-foreground">#{patent.id}</p>
                    <p className="text-xs text-muted-foreground">Veröffentlicht: {patent.publishedDate}</p>
                  </div>
                  <h3 className="text-lg font-semibold text-[#07233e]">{patent.title}</h3>
                  <p className="text-sm text-muted-foreground">{patent.summaryLine}</p>
                </div>
                <Badge className={statusStyles[patent.status]}>
                  {patent.status === "pending"
                    ? "In Prüfung"
                    : patent.status === "granted"
                    ? "Erteilt"
                    : "Abgelaufen"}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground">{patent.summary}</p>

              <div className="flex flex-wrap gap-4 text-sm text-[#07233e]">
                <span>
                  <strong>Inhaber:</strong> {patent.owner}
                </span>
                <span>
                  <strong>Region:</strong> {patent.region}
                </span>
                <span>
                  <strong>Filing:</strong> {patent.filingDate}
                </span>
                <span>
                  <strong>Technologie:</strong> {patent.technology}
                </span>
                <span>
                  <strong>Segment:</strong> {patent.area.replace(/-/g, " ")}
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-slate-50 border-slate-200">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm text-muted-foreground">Risiko-Score</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <p className="text-2xl font-semibold text-[#07233e]">{patent.riskScore}/100</p>
                    <p className="text-xs text-muted-foreground">Komplexität: {patent.complexity}</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-50 border-slate-200">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm text-muted-foreground">Erfolgswahrscheinlichkeit</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <p className="text-2xl font-semibold text-[#07233e]">{patent.successProbability}%</p>
                    <p className="text-xs text-muted-foreground">Implementierungswahrscheinlichkeit</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-50 border-slate-200">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm text-muted-foreground">Kosten & Timeline</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <p className="text-lg font-semibold text-[#07233e]">{patent.costRange}</p>
                    <p className="text-xs text-muted-foreground">{patent.timeline}</p>
                  </CardContent>
                </Card>
              </div>

              {patent.partners && patent.partners.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  <strong>Partner:</strong> {patent.partners.join(" • ")}
                </div>
              )}
              <Tabs defaultValue="overview" className="mt-4">
                <TabsList className="bg-slate-100 rounded-lg p-1 flex flex-wrap gap-1">
                  <TabsTrigger value="overview">Übersicht</TabsTrigger>
                  <TabsTrigger value="summary">Zusammenfassung</TabsTrigger>
                  <TabsTrigger value="full">Vollständiger Inhalt</TabsTrigger>
                  <TabsTrigger value="finance">💰 Finanzanalyse</TabsTrigger>
                  <TabsTrigger value="ai">🤖 KI-Analyse</TabsTrigger>
                  <TabsTrigger value="meta">Metadaten</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="pt-3 text-sm text-muted-foreground">
                  {patent.overview}
                </TabsContent>
                <TabsContent value="summary" className="pt-3 text-sm text-muted-foreground">
                  {patent.executiveSummary}
                </TabsContent>
                <TabsContent value="full" className="pt-3 text-sm text-muted-foreground">
                  {patent.fullContent}
                </TabsContent>
                <TabsContent value="finance" className="pt-3 text-sm text-muted-foreground space-y-1">
                  <div>
                    <strong>Budget:</strong> {patent.financials.budget}
                  </div>
                  <div>
                    <strong>ROI:</strong> {patent.financials.roi}
                  </div>
                  <div>
                    <strong>Lizenzierung:</strong> {patent.financials.licensing}
                  </div>
                </TabsContent>
                <TabsContent value="ai" className="pt-3 text-sm text-muted-foreground">
                  {patent.aiInsights}
                </TabsContent>
                <TabsContent value="meta" className="pt-3 text-sm text-muted-foreground space-y-1">
                  <div>
                    <strong>Familie:</strong> {patent.metadata.familyId}
                  </div>
                  <div>
                    <strong>Priority Date:</strong> {patent.metadata.priorityDate}
                  </div>
                  <div>
                    <strong>IPC Codes:</strong> {patent.metadata.ipcCodes.join(", ")}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          ))}

          {visiblePatents.length === 0 && (
            <div className="text-sm text-muted-foreground">
              Für diesen Bereich sind derzeit keine Patente hinterlegt. Mock-Daten können jederzeit ergänzt werden.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

