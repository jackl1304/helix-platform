import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Database, Download, Filter, Search, FileText, AlertTriangle, Activity, TrendingUp, CheckCircle } from 'lucide-react';

interface FinanceBreakdownEntry {
  label: string;
  value: string;
}

interface RoiEntry {
  label: string;
  value: string;
}

interface ApprovalInsights {
  overview: string;
  summary: string;
  fullContent: string;
  finance: {
    costRange: string;
    timeline: string;
    breakdown: FinanceBreakdownEntry[];
    roi: RoiEntry[];
  };
  ai: string;
  metadata: {
    priority: string;
    region: string;
    regulationFocus: string;
    tags: string[];
  };
}

interface FDAApproval {
  product_name: string;
  device_name: string;
  manufacturer_name: string;
  device_class: string;
  regulation_number: string;
  product_code: string;
  submission_type: string;
  submission_number: string;
  submission_status: string;
  submission_date: string;
  decision_date: string;
  decision_code: string;
  decision_description: string;
  risk_score: number;
  success_probability: number;
  timeline: string;
  insights: ApprovalInsights;
}

interface FDAEvent {
  event_type: string;
  report_number: string;
  manufacturer_name: string;
  device_name: string;
  brand_name: string;
  model_number: string;
  device_class: string;
  event_date: string;
  event_description: string;
  patient_age: string;
  patient_sex: string;
  adverse_event_flag: string;
  product_problem_flag: string;
}

interface FDARecall {
  recall_number: string;
  recall_date: string;
  recall_status: string;
  product_description: string;
  reason_for_recall: string;
  classification: string;
  distribution_pattern: string;
  manufacturer_name: string;
  product_quantity: string;
  code_info: string;
}

const mockFDAApprovals: FDAApproval[] = [
  {
    product_name: "Venclose digiRF Generator (VC10A256F60)",
    device_name: "Venclose EVSRF Catheter",
    manufacturer_name: "Venclose Inc.",
    device_class: "II",
    regulation_number: "878.4400",
    product_code: "GEI",
    submission_type: "510(k)",
    submission_number: "K252316",
    submission_status: "Cleared",
    submission_date: "2025-06-11",
    decision_date: "2025-08-19",
    decision_code: "APPR",
    decision_description: "Substantial equivalence accepted – radiofrequency ablation system",
    risk_score: 50,
    success_probability: 75,
    timeline: "14–18 Monate bis Markteinführung",
    insights: {
      overview:
        "Minimalinvasive RF-Behandlung für venöse Insuffizienz. Update umfasst Smart-Thermografie und Cloud-Reporting für Kliniken.",
      summary:
        "Die DigiRF-Plattform reduziert Eingriffszeit um 28 % und bietet automatisierte Temperaturüberwachung. Klinische Daten aus 290 Patienten überzeugten die FDA.",
      fullContent:
        "Mock-Dossier mit Risikoanalysen, klinischen Metriken und Post-Market-Surveillance-Konzept. Enthält Checklisten für deutsche BfArM-Anträge.",
      finance: {
        costRange: "€1.2 Mio. – €2.1 Mio.",
        timeline: "Payback in 36 Monaten",
        breakdown: [
          { label: "R&D", value: "€423.360" },
          { label: "Clinical Trials", value: "€338.688" },
          { label: "Regulatory", value: "€181.440" },
          { label: "Manufacturing", value: "€145.152" },
          { label: "Marketing", value: "€120.960" },
        ],
        roi: [
          { label: "Jahr 1", value: "€1.57 Mio. Revenue (IRR 30%)" },
          { label: "Jahr 3", value: "€4.23 Mio. Revenue (IRR 48%)" },
        ],
      },
      ai:
        "KI simuliert RF-Profile und überprüft Dosisgrenzen in Echtzeit. Empfiehlt Pre-Op-Scorecards für Patientenselektion.",
      metadata: {
        priority: "Niedrig",
        region: "US",
        regulationFocus: "21 CFR 878.4400",
        tags: ["Endovenous", "RF", "Smart Catheter"],
      },
    },
  },
  {
    product_name: "NeuroPulse AI DBS Controller",
    device_name: "Closed-Loop Deep Brain Stimulation Platform",
    manufacturer_name: "Synaptica Medical",
    device_class: "III",
    regulation_number: "882.5890",
    product_code: "MFP",
    submission_type: "PMA",
    submission_number: "P240078",
    submission_status: "Approved",
    submission_date: "2024-11-02",
    decision_date: "2025-07-05",
    decision_code: "AAP",
    decision_description: "PMA approval with post-market surveillance obligations",
    risk_score: 62,
    success_probability: 68,
    timeline: "12 Monate bis Rollout",
    insights: {
      overview:
        "Closed-Loop DBS mit adaptiven Stimulationstechniken und Echtzeit-ML. Fokus: Parkinson und Tremor in EU/US Zentren.",
      summary:
        "FDA erteilte PMA unter Auflagen für zusätzliche Safety-Reports. Mock-Daten zeigen 35 % Senkung von Nebenwirkungen.",
      fullContent:
        "Beinhaltet klinische KPIs, Sicherheitslogs und Frameworks für kombinierte MDR/FDA-Pflege. Enthält Playbook für deutsche Zentren.",
      finance: {
        costRange: "€3.1 Mio. – €4.0 Mio.",
        timeline: "Return ab Jahr 4",
        breakdown: [
          { label: "AI Safety Sprint", value: "€940.000" },
          { label: "Telemetrie", value: "€510.000" },
          { label: "Regulatory Defense", value: "€420.000" },
          { label: "Clinical Re-Training", value: "€320.000" },
          { label: "Market Re-Entry", value: "€190.000" },
        ],
        roi: [
          { label: "Jahr 2", value: "€2.9 Mio. Risk Savings" },
          { label: "Jahr 4", value: "€6.4 Mio. Umsatz" },
        ],
      },
      ai:
        "Explainable AI bewertet Stimulation, markiert Off-Target-Risiken und liefert Therapievorschläge für behandelnde Neurologen.",
      metadata: {
        priority: "Hoch",
        region: "US/EU",
        regulationFocus: "PMA (21 CFR 882.5890)",
        tags: ["DBS", "Closed Loop", "AI"],
      },
    },
  },
  {
    product_name: "CardioSense Predictive Monitoring Suite",
    device_name: "AI-driven ECG analytics",
    manufacturer_name: "CardioAI Technologies",
    device_class: "II",
    regulation_number: "870.2340",
    product_code: "DQA",
    submission_type: "De Novo",
    submission_number: "DEN230045",
    submission_status: "Under Review",
    submission_date: "2025-03-14",
    decision_date: "2025-09-01",
    decision_code: "URV",
    decision_description: "Pending – De Novo classification under active review",
    risk_score: 58,
    success_probability: 64,
    timeline: "9–12 Monate bis Bewilligung (Mock)",
    insights: {
      overview:
        "Cloudbasierte ECG-Analytics mit Digital Twin pro Patient. Automatisierte Alerting-Pipeline für Home Monitoring.",
      summary:
        "De Novo-Einreichung deckt 18 Telehealth-Provider ab. Modell prüft 45.000 ECG-Sequenzen in Echtzeit.",
      fullContent:
        "Mock-Komplettantrag mit De Novo-Argumentation, Labeling-Strategie und MDR-Transferpfad.",
      finance: {
        costRange: "€1.6 Mio. – €2.4 Mio.",
        timeline: "Break-even nach 24 Monaten",
        breakdown: [
          { label: "Algorithm Tuning", value: "€520.000" },
          { label: "Clinical Validation", value: "€380.000" },
          { label: "Cybersecurity", value: "€240.000" },
          { label: "Regulatory Prep", value: "€210.000" },
          { label: "Pilot Rollout", value: "€180.000" },
        ],
        roi: [
          { label: "Jahr 1", value: "€1.1 Mio. Telehealth-Verträge" },
          { label: "Jahr 3", value: "€3.6 Mio. SaaS-Umsatz" },
        ],
      },
      ai:
        "Predictive Modell priorisiert Hochrisiko-Patienten, erstellt Compliance-Reports und liefert Reimbursement-Argumente.",
      metadata: {
        priority: "Mittel",
        region: "US",
        regulationFocus: "De Novo (Software SaMD)",
        tags: ["ECG", "SaMD", "Digital Twin"],
      },
    },
  },
];

const mockFDAEvents: FDAEvent[] = [
  {
    event_type: "Malfunction",
    report_number: "1284321",
    manufacturer_name: "Helix Imaging Corp.",
    device_name: "Helix CT SmartScanner",
    brand_name: "Helix CT SmartScanner",
    model_number: "HX-CT900",
    device_class: "II",
    event_date: "2025-08-15",
    event_description:
      "System reboot required mid-procedure due to AI reconstruction freeze. No patient injury reported.",
    patient_age: "58",
    patient_sex: "F",
    adverse_event_flag: "N",
    product_problem_flag: "Y",
  },
  {
    event_type: "Injury",
    report_number: "1288755",
    manufacturer_name: "Medivac Robotics",
    device_name: "MediAssist Surgical Robot",
    brand_name: "MediAssist",
    model_number: "MA-200",
    device_class: "III",
    event_date: "2025-07-29",
    event_description:
      "Post-operative bleeding attributed to misaligned robotic arm calibration; corrective surgery required.",
    patient_age: "64",
    patient_sex: "M",
    adverse_event_flag: "Y",
    product_problem_flag: "Y",
  },
  {
    event_type: "Malfunction",
    report_number: "1291204",
    manufacturer_name: "PulseWear Diagnostics",
    device_name: "PulseWear Continuous Monitoring Patch",
    brand_name: "PulseWear",
    model_number: "PW-12",
    device_class: "II",
    event_date: "2025-07-12",
    event_description:
      "False tachycardia alerts triggered by firmware update; remote patch issued within 48 hours.",
    patient_age: "45",
    patient_sex: "F",
    adverse_event_flag: "N",
    product_problem_flag: "Y",
  },
];

const mockFDARecalls: FDARecall[] = [
  {
    recall_number: "Z-1234-2025",
    recall_date: "2025-08-10",
    recall_status: "Ongoing",
    product_description: "NovaBreath Ventilator Tubing Set",
    reason_for_recall: "Potential disconnection at Y-connector leading to ventilation loss",
    classification: "Class I",
    distribution_pattern: "US nationwide – hospital networks",
    manufacturer_name: "NovaLife Systems",
    product_quantity: "18,500 units",
    code_info: "Lot numbers NB-2025-01 to NB-2025-06",
  },
  {
    recall_number: "Z-1438-2025",
    recall_date: "2025-07-18",
    recall_status: "Ongoing",
    product_description: "AcuDose Insulin Pen",
    reason_for_recall: "Inaccurate dose markings causing overdose risk",
    classification: "Class II",
    distribution_pattern: "North America and EU distributors",
    manufacturer_name: "GlucoSense Ltd.",
    product_quantity: "72,000 units",
    code_info: "Serial prefix GS-IP-25",
  },
  {
    recall_number: "Z-1510-2025",
    recall_date: "2025-06-22",
    recall_status: "Completed",
    product_description: "ClearView Ophthalmic Lens Solution",
    reason_for_recall: "Microbial contamination in isolated lots",
    classification: "Class III",
    distribution_pattern: "Retail pharmacies in US/Canada",
    manufacturer_name: "ClearView Vision",
    product_quantity: "9,200 bottles",
    code_info: "Lot CV-2025-045",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved': return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'withdrawn': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function FDAData() {
  const fdaApprovals = mockFDAApprovals;
  const fdaEvents = mockFDAEvents;
  const fdaRecalls = mockFDARecalls;

  // Helper functions for new data types
  const getEventTypeColor = (eventType: string) => {
    switch (eventType.toLowerCase()) {
      case 'injury': return 'bg-red-100 text-red-800';
      case 'death': return 'bg-red-200 text-red-900';
      case 'malfunction': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRecallClassificationColor = (classification: string) => {
    switch (classification) {
      case 'Class I': return 'bg-red-100 text-red-800';
      case 'Class II': return 'bg-yellow-100 text-yellow-800';
      case 'Class III': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubmissionStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'cleared': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'under review': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">FDA Regulatory Intelligence</h1>
          <p className="text-gray-600 mt-2">
            Umfassende Übersicht über FDA-Zulassungen, Adverse Events und Recalls
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Critical Alerts */}
      {fdaRecalls && fdaRecalls.filter(r => r.classification === 'Class I').length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Kritische Recall-Warnung!</AlertTitle>
          <AlertDescription>
            {fdaRecalls.filter(r => r.classification === 'Class I').length} Class I Recalls erfordern sofortige Aufmerksamkeit.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">FDA Approvals</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fdaApprovals?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {fdaApprovals?.filter(a => a.submission_status === 'Cleared' || a.submission_status === 'Approved').length || 0} genehmigt
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Adverse Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fdaEvents?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {fdaEvents?.filter(e => e.adverse_event_flag === 'Y').length || 0} mit Adverse Events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Recalls</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fdaRecalls?.filter(r => r.recall_status === 'Ongoing').length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {fdaRecalls?.filter(r => r.classification === 'Class I').length || 0} Class I
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(fdaApprovals?.length || 0) + (fdaEvents?.length || 0) + (fdaRecalls?.length || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Alle FDA-Daten
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content with Tabs */}
      <Tabs defaultValue="approvals" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="approvals" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Approvals
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Events
          </TabsTrigger>
          <TabsTrigger value="recalls" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Recalls
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Overview
          </TabsTrigger>
        </TabsList>

        {/* Approvals Tab */}
        <TabsContent value="approvals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>FDA Device Approvals</CardTitle>
              <CardDescription>
                Aktuelle FDA-Zulassungen und -Bewertungen für Medizinprodukte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {fdaApprovals.map((approval) => (
                <Card key={approval.submission_number} className="border-slate-200 shadow-sm">
                  <CardHeader className="space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Submission {approval.submission_number}</p>
                        <CardTitle className="text-2xl text-[#07233e]">{approval.product_name}</CardTitle>
                        <CardDescription className="text-sm text-gray-600">
                          {approval.device_name} · {approval.manufacturer_name}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={getSubmissionStatusColor(approval.submission_status)}>
                          {approval.submission_status}
                        </Badge>
                        <Badge className="bg-blue-100 text-blue-800">{approval.submission_type}</Badge>
                        <Badge variant="outline" className="text-xs">
                          Entscheidung: {approval.decision_date}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-gray-600">
                      <div className="bg-slate-50 border rounded-lg p-3">
                        <p className="text-muted-foreground">Risiko-Score</p>
                        <p className="text-xl font-semibold text-[#07233e]">{approval.risk_score}/100</p>
                      </div>
                      <div className="bg-slate-50 border rounded-lg p-3">
                        <p className="text-muted-foreground">Erfolgswahrscheinlichkeit</p>
                        <p className="text-xl font-semibold text-[#07233e]">{approval.success_probability}%</p>
                      </div>
                      <div className="bg-slate-50 border rounded-lg p-3">
                        <p className="text-muted-foreground">Timeline</p>
                        <p className="text-sm font-semibold text-[#07233e]">{approval.timeline}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Tabs key={`tabs-${approval.submission_number}`} defaultValue="overview" className="w-full">
                      <TabsList className="flex flex-wrap gap-2 bg-slate-100 rounded-full p-1 w-full">
                        <TabsTrigger value="overview">Übersicht</TabsTrigger>
                        <TabsTrigger value="summary">Zusammenfassung</TabsTrigger>
                        <TabsTrigger value="full">Vollständiger Inhalt</TabsTrigger>
                        <TabsTrigger value="finance">💰 Finanzanalyse</TabsTrigger>
                        <TabsTrigger value="ai">🤖 KI-Analyse</TabsTrigger>
                        <TabsTrigger value="meta">Metadaten</TabsTrigger>
                      </TabsList>
                      <TabsContent value="overview" className="pt-4 text-sm text-gray-700">
                        {approval.insights.overview}
                      </TabsContent>
                      <TabsContent value="summary" className="pt-4 text-sm text-gray-700">
                        {approval.insights.summary}
                      </TabsContent>
                      <TabsContent value="full" className="pt-4 text-sm text-gray-700">
                        {approval.insights.fullContent}
                      </TabsContent>
                      <TabsContent value="finance" className="pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card className="border-emerald-200 bg-emerald-50">
                            <CardHeader>
                              <CardTitle className="text-sm text-emerald-900">Implementierungskosten</CardTitle>
                              <CardDescription className="text-xs text-emerald-800">
                                Timeline: {approval.insights.finance.timeline}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                              <p className="text-lg font-semibold text-[#07233e]">
                                {approval.insights.finance.costRange}
                              </p>
                              <div className="space-y-1">
                                {approval.insights.finance.breakdown.map((entry) => (
                                  <div key={`${approval.submission_number}-${entry.label}`} className="flex justify-between">
                                    <span>{entry.label}</span>
                                    <span className="font-semibold text-[#07233e]">{entry.value}</span>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                          <Card className="border-blue-200 bg-blue-50">
                            <CardHeader>
                              <CardTitle className="text-sm text-blue-900">ROI-Projektion</CardTitle>
                              <CardDescription className="text-xs text-blue-800">
                                Payback: {approval.timeline}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                              {approval.insights.finance.roi.map((entry) => (
                                <div
                                  key={`${approval.submission_number}-${entry.label}`}
                                  className="bg-white rounded-lg p-3 border text-[#07233e]"
                                >
                                  <p className="text-xs text-gray-500">{entry.label}</p>
                                  <p className="font-semibold">{entry.value}</p>
                                </div>
                              ))}
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>
                      <TabsContent value="ai" className="pt-4 text-sm text-gray-700">
                        {approval.insights.ai}
                      </TabsContent>
                      <TabsContent value="meta" className="pt-4 text-xs text-gray-600">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <p className="font-semibold text-gray-900 mb-1">Key Facts</p>
                            <p>Regulation: {approval.regulation_number}</p>
                            <p>Product Code: {approval.product_code}</p>
                            <p>Device Class: {approval.device_class}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 mb-1">Regulatorische Tags</p>
                            <p>Priorität: {approval.insights.metadata.priority}</p>
                            <p>Region: {approval.insights.metadata.region}</p>
                            <p>Schwerpunkte: {approval.insights.metadata.tags.join(', ')}</p>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>MAUDE Adverse Events</CardTitle>
              <CardDescription>
                Berichte über unerwünschte Ereignisse mit Medizinprodukten
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fdaEvents?.map((event, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-lg">{event.device_name}</h3>
                          <Badge className={getEventTypeColor(event.event_type)}>
                            {event.event_type}
                          </Badge>
                          {event.adverse_event_flag === 'Y' && (
                            <Badge className="bg-red-100 text-red-800">
                              Adverse Event
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{event.manufacturer_name}</p>
                        <p className="text-gray-700 mb-3">{event.event_description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span><strong>Report:</strong> {event.report_number}</span>
                          <span><strong>Date:</strong> {event.event_date}</span>
                          <span><strong>Patient:</strong> {event.patient_age}yo {event.patient_sex}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Search className="h-4 w-4 mr-2" />
                              Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                {event.device_name} - {event.event_type}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium mb-2">Event Details</h4>
                                  <div className="text-sm space-y-1">
                                    <p><strong>Type:</strong> {event.event_type}</p>
                                    <p><strong>Report:</strong> {event.report_number}</p>
                                    <p><strong>Date:</strong> {event.event_date}</p>
                                    <p><strong>Adverse Event:</strong> {event.adverse_event_flag === 'Y' ? 'Yes' : 'No'}</p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">Patient Information</h4>
                                  <div className="text-sm space-y-1">
                                    <p><strong>Age:</strong> {event.patient_age}</p>
                                    <p><strong>Sex:</strong> {event.patient_sex}</p>
                                    <p><strong>Product Problem:</strong> {event.product_problem_flag === 'Y' ? 'Yes' : 'No'}</p>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Device Information</h4>
                                <div className="text-sm space-y-1">
                                  <p><strong>Device:</strong> {event.device_name}</p>
                                  <p><strong>Brand:</strong> {event.brand_name}</p>
                                  <p><strong>Model:</strong> {event.model_number}</p>
                                  <p><strong>Class:</strong> {event.device_class}</p>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Event Description</h4>
                                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                                  {event.event_description}
                                </p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recalls Tab */}
        <TabsContent value="recalls" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Device Recalls</CardTitle>
              <CardDescription>
                Aktuelle Rückrufe und Sicherheitswarnungen für Medizinprodukte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fdaRecalls?.map((recall, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-lg">{recall.product_description}</h3>
                          <Badge className={getRecallClassificationColor(recall.classification)}>
                            {recall.classification}
                          </Badge>
                          <Badge className={recall.recall_status === 'Ongoing' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                            {recall.recall_status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{recall.manufacturer_name}</p>
                        <p className="text-gray-700 mb-3">{recall.reason_for_recall}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span><strong>Recall:</strong> {recall.recall_number}</span>
                          <span><strong>Date:</strong> {recall.recall_date}</span>
                          <span><strong>Quantity:</strong> {recall.product_quantity}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Search className="h-4 w-4 mr-2" />
                              Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                {recall.product_description}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium mb-2">Recall Details</h4>
                                  <div className="text-sm space-y-1">
                                    <p><strong>Number:</strong> {recall.recall_number}</p>
                                    <p><strong>Date:</strong> {recall.recall_date}</p>
                                    <p><strong>Status:</strong> {recall.recall_status}</p>
                                    <p><strong>Classification:</strong> {recall.classification}</p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">Distribution</h4>
                                  <div className="text-sm space-y-1">
                                    <p><strong>Pattern:</strong> {recall.distribution_pattern}</p>
                                    <p><strong>Quantity:</strong> {recall.product_quantity}</p>
                                    <p><strong>Manufacturer:</strong> {recall.manufacturer_name}</p>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Reason for Recall</h4>
                                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                                  {recall.reason_for_recall}
                                </p>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Product Information</h4>
                                <div className="text-sm space-y-1">
                                  <p><strong>Description:</strong> {recall.product_description}</p>
                                  <p><strong>Code Info:</strong> {recall.code_info}</p>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Approvals Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Recent Approvals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {fdaApprovals?.slice(0, 3).map((approval, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-sm">{approval.product_name}</p>
                        <p className="text-xs text-gray-600">{approval.manufacturer_name}</p>
                      </div>
                      <Badge className={getSubmissionStatusColor(approval.submission_status)}>
                        {approval.submission_status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Events Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {fdaEvents?.slice(0, 3).map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-sm">{event.device_name}</p>
                        <p className="text-xs text-gray-600">{event.event_type}</p>
                      </div>
                      <Badge className={getEventTypeColor(event.event_type)}>
                        {event.event_type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recalls Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Active Recalls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {fdaRecalls?.filter(r => r.recall_status === 'Ongoing').slice(0, 3).map((recall, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-sm">{recall.product_description}</p>
                        <p className="text-xs text-gray-600">{recall.manufacturer_name}</p>
                      </div>
                      <Badge className={getRecallClassificationColor(recall.classification)}>
                        {recall.classification}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Approvals</span>
                    <span className="font-medium">{fdaApprovals?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Adverse Events</span>
                    <span className="font-medium">{fdaEvents?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Active Recalls</span>
                    <span className="font-medium">{fdaRecalls?.filter(r => r.recall_status === 'Ongoing').length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Class I Recalls</span>
                    <span className="font-medium text-red-600">{fdaRecalls?.filter(r => r.classification === 'Class I').length || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Info Box */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Database className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Demo-Datenquelle</h4>
              <p className="text-sm text-blue-700 mt-1">
                Diese Ansicht nutzt vollständig lokal gepflegte Mock-Daten, damit Tests auch ohne Backend- oder openFDA-Verbindung möglich sind.
                Für reale Projekte kann dieselbe Oberfläche direkt mit Live-APIs verbunden werden.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
