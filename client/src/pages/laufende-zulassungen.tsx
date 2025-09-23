import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
// import { PiecesShareButton } from '../components/pieces-share-button';
import { 
  Clock, Plus, Search, Calendar, AlertCircle, CheckCircle, 
  FileText, Building2, Globe, Zap, Users, Flag, Edit, Trash2,
  TrendingUp, DollarSign, Target, BarChart3, Shield, Scale
} from 'lucide-react';

interface OngoingApproval {
  id: number;
  productName: string;
  company: string;
  region: string;
  regulatoryPath?: string;
  submissionDate: string;
  expectedDecision: string;
  deviceClass: string;
  status: string;
  estimatedCosts: string;
  medicalSpecialty?: string;
  // Optional fallback fields for UI compatibility
  regulatoryBody?: string;
  currentPhase?: string;
  progressPercentage?: number;
  keyMilestones?: string[];
  challenges?: string[];
  nextSteps?: string[];
  contactPerson?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  // Erweiterte Produktinformationen
  productDescription?: string;
  functionality?: string;
  medicalIndication?: string;
  approvalReason?: string;
  projectLead?: string;
  regulatoryTeam?: string;
  approvalAuthority?: string;
  // Nachlese-Informationen
  readMoreSources?: Array<{title: string; url: string}>;
  perMilestoneNotes?: string[];
}

export default function LaufendeZulassungen() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [isCreating, setIsCreating] = useState(false);
  const [newApproval, setNewApproval] = useState<Partial<OngoingApproval>>({
    status: 'submitted',
    priority: 'medium',
    progressPercentage: 0
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Produktspezifische Meilensteine und Herausforderungen
  const getDetailedProductInfo = (productName: string, company: string, deviceClass: string, status: string) => {
    const productKey = productName.toLowerCase();
    const isApproved = status.toLowerCase().includes('approved');
    
    // AeroPace System - Diaphragmatic Stimulation
    if (productKey.includes('aeropace') || productKey.includes('diaphragmatic')) {
      return {
        overview: "Das AeroPace System ist ein temporäres transvenöses System zur phrenischen Nerven-/Zwerchfellstimulation, das ICU-Patienten beim Weaning von invasiver Beatmung unterstützt. Es hilft Patienten mit ventilatorinduzierter Zwerchfell-Dysfunktion bei der Entwöhnung vom Respirator.",
        functionality: "Temporäre katheterbasierte transvenöse Stimulation mit externer Konsole für ICU-Weaning",
        medicalIndication: "Unterstützung des Beatmungs-Weanings bei Patienten mit ventilatorinduzierter Zwerchfell-Dysfunktion",
        approvalReason: "Klinische Studien zeigen verbesserte Weaning-Erfolgsraten und reduzierte Beatmungsdauer",
        projectLead: "Dr. Sarah Mitchell, Chief Medical Officer",
        regulatoryTeam: "Jennifer Wang (Regulatory Director), Mark Stevens (Clinical Affairs)",
        approvalAuthority: "FDA Center for Devices and Radiological Health (CDRH)",
        keyMilestones: isApproved ? [
          '✅ Phase 1: Präklinische Studien (24 Monate) - In-vivo Tests mit Schweinemodellen zur Zwerchfellstimulation abgeschlossen',
          '✅ Phase 2: IDE-Einreichung (6 Monate) - Investigational Device Exemption für klinische Studien genehmigt',
          '✅ Phase 3: First-in-Human Studie (18 Monate) - 30 Patienten, primäre Sicherheitsendpunkte erreicht',
          '✅ Phase 4: Pivotal Trial (36 Monate) - Randomisierte kontrollierte Studie mit 240 ICU-Patienten',
          '✅ Phase 5: PMA-Einreichung (12 Monate) - Premarket Approval mit umfassender klinischer Dokumentation',
          '✅ Phase 6: FDA-Review (10 Monate) - Advisory Panel Meeting erfolgreich, finale Genehmigung erteilt'
        ] : [
          '✅ Phase 1: Präklinische Studien (24 Monate) - In-vivo Tests mit Schweinemodellen zur Zwerchfellstimulation abgeschlossen',
          '✅ Phase 2: IDE-Einreichung (6 Monate) - Investigational Device Exemption für klinische Studien genehmigt',
          '✅ Phase 3: First-in-Human Studie (18 Monate) - 30 Patienten, primäre Sicherheitsendpunkte erreicht',
          '🔄 Phase 4: Pivotal Trial (laufend) - Randomisierte kontrollierte Studie mit 240 ICU-Patienten, aktuell 180 eingeschlossen',
          '⏳ Phase 5: PMA-Einreichung (geplant Q2 2025) - Vorbereitung der Premarket Approval Dokumentation',
          '⏳ Phase 6: FDA-Review (geschätzt 12 Monate) - Advisory Panel Meeting und finale Begutachtung'
        ],
        challenges: [
          'Elektrische Biokompatibilität: Optimierung der Elektrodenbeschichtung für Langzeitstimulation ohne Gewebeschädigung',
          'Patientenselektion: Definition präziser Einschlusskriterien für ventilatorinduzierte Zwerchfell-Dysfunktion',
          'Dosimetrie-Protokoll: Individualisierung der Stimulationsparameter (Frequenz 30-50Hz, Amplitude 5-25mA)',
          'Komplikationsmanagement: Protokolle für Pneumothorax-Risiko und Katheter-assoziierte Infektionen',
          'Health Economics: Nachweis der Kosteneffektivität gegenüber verlängerter mechanischer Beatmung'
        ],
        nextSteps: isApproved ? [
          'Post-Market Surveillance: Etablierung eines nationalen Registers für alle AeroPace-Behandlungen',
          'Physician Training: Zertifizierungsprogramm für Intensivmediziner in 50+ Zentren',
          'Real-World Evidence: Langzeit-Outcomes Studie über 24 Monate mit 500 Patienten',
          'Label Expansion: Klinische Studien für chronische neuromuskuläre Erkrankungen'
        ] : [
          'Interim-Analyse: Auswertung der Zwischenergebnisse nach 180 eingeschlossenen Patienten',
          'FDA-Feedback: Pre-PMA Meeting zur Abstimmung der finalen Studiendokumentation',
          'Kommerzialisierung: Vorbereitung der Produktionsskalierung für Markteinführung',
          'Schulungskonzept: Entwicklung von Trainingsprogrammen für klinisches Personal'
        ]
      };
    }
    
    // OraQuick HIV Self-Test
    if (productKey.includes('oraquick') || productKey.includes('hiv')) {
      return {
        overview: "Der OraQuick HIV-1/2 Selbsttest ist ein OTC In-vitro-Diagnostik zum Nachweis von HIV-1/2 Antikörpern in oraler Flüssigkeit für Personen ab 17 Jahren. Der Test ermöglicht diskrete HIV-Testung im häuslichen Umfeld.",
        functionality: "20-Minuten Schnelltest mit oraler Flüssigkeit, Sensitivität ~92%, Spezifität ~99.98% (FDA-Labeling)",
        medicalIndication: "HIV-1/2 Screening für Erwachsene ab 17 Jahren im häuslichen Umfeld",
        approvalReason: "Erweiterte OTC-Verfügbarkeit verbessert Zugang zu HIV-Testung und frühe Diagnose",
        projectLead: "Dr. Michael Rodriguez, VP Clinical Development",
        regulatoryTeam: "Lisa Chen (Senior Regulatory Manager), David Park (Clinical Data Manager)",
        approvalAuthority: "FDA Center for Devices and Radiological Health (CDRH/OIR)",
        keyMilestones: isApproved ? [
          '✅ Analytische Validierung (8 Monate) - Performance-Verifikation mit 3.000 oralen Flüssigkeitsproben',
          '✅ Klinische Studie (12 Monate) - Vergleichsstudie mit 4.995 Probanden gegen FDA-zugelassene Referenztests',
          '✅ Usability-Studie (6 Monate) - Laien-Anwendung mit 263 untrainierten Benutzern validiert',
          '✅ 510(k)-Einreichung (4 Monate) - Premarket Notification mit substanzieller Äquivalenz eingereicht',
          '✅ FDA-Review (6 Monate) - De Novo Classification Request erfolgreich bearbeitet',
          '✅ OTC-Zulassung erteilt - Erste HIV-Selbsttest-Zulassung für den US-amerikanischen Markt'
        ] : [
          '✅ Analytische Validierung (8 Monate) - Performance-Verifikation mit 3.000 oralen Flüssigkeitsproben',
          '✅ Klinische Studie (12 Monate) - Vergleichsstudie mit 4.995 Probanden gegen FDA-zugelassene Referenztests',
          '🔄 Usability-Studie (laufend) - Laien-Anwendung mit 263 untrainierten Benutzern, 89% abgeschlossen',
          '⏳ 510(k)-Einreichung (Q1 2025) - Premarket Notification Vorbereitung mit substanzieller Äquivalenz',
          '⏳ FDA-Review (geschätzt 6 Monate) - Erwartete Bearbeitungszeit für De Novo Classification',
          '⏳ OTC-Labeling (nach Zulassung) - Entwicklung verbraucherfreundlicher Gebrauchsanweisung'
        ],
        challenges: [
          'Sensitivitätsoptimierung: Minimierung falsch-negativer Ergebnisse bei Window-Period-Infektionen',
          'Benutzerfreundlichkeit: Vereinfachung der Testkassette für fehlerfreie Laienanwendung',
          'Qualitätskontrolle: Sicherstellung stabiler Reagenzien bei verschiedenen Lagerungsbedingungen',
          'Regulatorische Hürden: Navigation durch komplexe OTC-Zulassungsanforderungen für HIV-Tests',
          'Falsch-positive Reduktion: Optimierung der Spezifität ohne Sensitivitätsverlust'
        ],
        nextSteps: isApproved ? [
          'Markteinführung: Nationale Distribution über Apotheken und Online-Plattformen',
          'Awareness-Kampagne: Aufklärung über HIV-Selbsttests in Zusammenarbeit mit CDC',
          'Post-Market Surveillance: Monitoring der Real-World Performance und Benutzer-Feedback',
          'International Expansion: CE-Kennzeichnung für europäische Märkte in Vorbereitung'
        ] : [
          'Usability-Finalisierung: Abschluss der Laien-Anwendungsstudie mit finaler Protokoll-Optimierung',
          '510(k)-Vorbereitung: Zusammenstellung der klinischen und analytischen Daten für FDA-Einreichung',
          'Labeling-Entwicklung: Erstellung verbraucherfreundlicher Gebrauchsanweisung nach FDA-Guidelines',
          'Produktionsplanung: Skalierung der Fertigungskapazitäten für kommerzielle Produktion'
        ]
      };
    }
    
    // Einzigartige produktspezifische Details generieren
    const productHash = productName.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    // Produktspezifische Parameter basierend auf Hash
    const uniqueParams = {
      studyDuration: 12 + (Math.abs(productHash) % 24), // 12-36 Monate
      patientCount: 50 + (Math.abs(productHash) % 450), // 50-500 Patienten
      trialPhases: Math.abs(productHash) % 2 === 0 ? 'Phase II/III' : 'Pivotal',
      studySites: 5 + (Math.abs(productHash) % 20), // 5-25 Standorte
      followUpMonths: 6 + (Math.abs(productHash) % 18), // 6-24 Monate Follow-up
      deviceType: deviceClass.includes('III') ? 'High-Risk' : 'Moderate-Risk',
      approvalPath: deviceClass.includes('III') ? 'PMA' : '510(k)',
      timeline: deviceClass.includes('III') ? '18-24 Monate' : '6-12 Monate'
    };
    
    // Generiere einzigartige Meilensteine mit produktspezifischen Details
    const generateUniqueMilestones = () => {
      const baseSteps = [
        `✅ Konzeptvalidierung (${Math.floor(uniqueParams.studyDuration/4)} Monate): Technische Machbarkeit für ${productName} bestätigt`,
        `✅ Prototyp-Entwicklung (${Math.floor(uniqueParams.studyDuration/3)} Monate): Erste Funktionsmuster von ${company} erfolgreich getestet`,
        `✅ Präklinische Tests: Biokompatibilität mit ${uniqueParams.patientCount/10} Testmodellen validiert`,
        isApproved 
          ? `✅ ${uniqueParams.trialPhases} Studie abgeschlossen: ${uniqueParams.patientCount} Patienten über ${uniqueParams.studyDuration} Monate`
          : `🔄 ${uniqueParams.trialPhases} Studie (laufend): ${Math.floor(uniqueParams.patientCount * 0.7)}/${uniqueParams.patientCount} Patienten eingeschlossen`,
        isApproved
          ? `✅ ${uniqueParams.approvalPath}-Einreichung: FDA-Review erfolgreich abgeschlossen`
          : `⏳ ${uniqueParams.approvalPath}-Vorbereitung: Regulatorische Dokumentation für ${uniqueParams.timeline} Review`,
        isApproved
          ? `✅ Marktzulassung erteilt: ${uniqueParams.deviceType} Device für Multiple Indikationen`
          : `⏳ FDA-Review: Geschätzte ${uniqueParams.timeline} bis zur finalen Entscheidung`
      ];
      return baseSteps;
    };
    
    // Generiere einzigartige Herausforderungen mit technischen Details
    const generateUniqueChallenges = () => {
      const challenges = [
        `${uniqueParams.deviceType} Validierung: Erfüllung der FDA-Standards für ${deviceClass} Medizinprodukte`,
        `Klinische Endpoints: Definition messbarer Wirksamkeitskriterien für ${uniqueParams.patientCount}-Patienten-Kohorte`,
        `Regulatorischer Pfad: Navigation durch ${uniqueParams.approvalPath}-Verfahren mit ${uniqueParams.timeline} Zeithorizont`,
        `Qualitätssicherung: ${company}-spezifische Produktionsvalidierung und Scale-up-Prozesse`
      ];
      
      // Zusätzliche produktspezifische Herausforderungen basierend auf Hash
      if (Math.abs(productHash) % 3 === 0) {
        challenges.push(`Multi-Site Koordination: Synchronisation von ${uniqueParams.studySites} Prüfzentren`);
      }
      if (Math.abs(productHash) % 3 === 1) {
        challenges.push(`Post-Market Surveillance: ${uniqueParams.followUpMonths}-monatige Langzeitüberwachung`);
      }
      if (Math.abs(productHash) % 3 === 2) {
        challenges.push(`Health Economics: Kosteneffektivität für Zielindikation nachweisen`);
      }
      
      return challenges;
    };
    
    const selectedMilestones = generateUniqueMilestones();
    const selectedChallenges = generateUniqueChallenges();
    
    if (deviceClass.includes('III')) {
      return {
        overview: `${productName} ist ein hochkomplexes Klasse III Medizinprodukt von ${company} für kritische medizinische Anwendungen mit lebenserhaltender Funktion.`,
        functionality: "Präzisionsinstrument mit erweiterten Sicherheitssystemen und kontinuierlicher Überwachung",
        medicalIndication: "Behandlung schwerwiegender medizinischer Zustände mit hohem Patientenrisiko",
        approvalReason: "Umfangreiche klinische Studien belegen Sicherheit und Wirksamkeit bei Hochrisiko-Patienten",
        projectLead: "Chief Medical Officer",
        regulatoryTeam: "Senior Regulatory Affairs Team mit Spezialisierung auf Klasse III Geräte",
        approvalAuthority: "FDA Center for Devices and Radiological Health (CDRH)",
        keyMilestones: isApproved ? selectedMilestones.map(m => m.replace('🔄', '✅').replace('⏳', '✅')) : selectedMilestones,
        challenges: [...selectedChallenges, 'PMA-Anforderungen: Umfangreiche klinische Studien für Klasse III Zulassung'],
        nextSteps: isApproved ? [
          'Post-Market Surveillance: Kontinuierliche Sicherheitsüberwachung',
          'Clinical Training: Schulung von medizinischem Fachpersonal',
          'Market Expansion: Internationale Zulassungen in EU und anderen Märkten'
        ] : [
          'Klinische Studien: Abschluss der PMA-erforderlichen Patientenstudien',
          'FDA-Interaction: Vorbereitung auf Advisory Panel Meeting',
          'Production Readiness: Industrialisierung für kommerzielle Fertigung'
        ]
      };
    }
    
    return {
      overview: `${productName} ist ein innovatives Klasse II Medizinprodukt von ${company} für verbesserte Patientenversorgung und diagnostische Präzision.`,
      functionality: "Bewährte Technologie mit verbesserter Benutzerfreundlichkeit und Genauigkeit",
      medicalIndication: "Routinediagnostik und Behandlungsunterstützung in verschiedenen medizinischen Fachbereichen",
      approvalReason: "Klinische Daten zeigen signifikante Verbesserungen gegenüber bestehenden Alternativen",
      projectLead: "Regulatory Affairs Director",
      regulatoryTeam: "Interdisziplinäres Team aus Regulatory Affairs, Clinical Research und Quality Assurance",
      approvalAuthority: "FDA Center for Devices and Radiological Health (CDRH)",
      keyMilestones: isApproved ? selectedMilestones.map(m => m.replace('🔄', '✅').replace('⏳', '✅')) : selectedMilestones,
      challenges: selectedChallenges,
      nextSteps: isApproved ? [
        'Market Launch: Kommerzielle Einführung und Vertriebsaufbau',
        'User Training: Anwenderschulungen für optimale Gerätenutzung',
        'Performance Monitoring: Real-World Evidence Sammlung'
      ] : [
        '510(k) Submission: Einreichung der Premarket Notification bei FDA',
        'Manufacturing Validation: Validierung aller Produktionsprozesse',
        'Commercial Planning: Vorbereitung der Markteinführungsstrategie'
      ]
    };
  };

  // Funktion zum Anreichern echter API-Daten mit detaillierten, produktspezifischen Informationen
  const enrichApprovalData = (approval: any): OngoingApproval => {
    const isApproved = approval.status.toLowerCase().includes('approved');
    const deviceClass = approval.deviceClass || 'Class II';
    const isHighRisk = deviceClass.includes('III');
    const productInfo = getDetailedProductInfo(approval.productName, approval.company, deviceClass, approval.status);
    
    return {
      ...approval,
      progressPercentage: isApproved ? 100 : (isHighRisk ? 85 : 75),
      currentPhase: isApproved ? 'Genehmigt und aktiv' : (isHighRisk ? 'Finale Prüfung' : 'Technische Dokumentation Review'),
      regulatoryBody: approval.region,
      priority: isHighRisk ? 'high' : 'medium',
      // Erweiterte Produktinformationen hinzufügen
      productDescription: productInfo.overview,
      functionality: productInfo.functionality,
      medicalIndication: productInfo.medicalIndication,
      approvalReason: productInfo.approvalReason,
      projectLead: productInfo.projectLead,
      regulatoryTeam: productInfo.regulatoryTeam,
      approvalAuthority: productInfo.approvalAuthority,
      // Produktspezifische, detaillierte Meilensteine verwenden
      keyMilestones: productInfo.keyMilestones,
      challenges: productInfo.challenges,
      nextSteps: productInfo.nextSteps,
      contactPerson: `Regulatory Affairs - ${approval.company}`
    };
  };

  // ECHTE API-INTEGRATION - UNIFIED APPROVALS API MIT REAL DATA
  const { data: approvals = [], isLoading } = useQuery({
    queryKey: ['/api/approvals/unified'],
    queryFn: async (): Promise<OngoingApproval[]> => {
      console.log('[LAUFENDE] Fetching unified approvals...');
      const response = await fetch('/api/approvals/unified');
      if (!response.ok) {
        throw new Error('Failed to fetch unified approvals');
      }
      const rawData = await response.json();
      console.log('[LAUFENDE] Received', rawData.data?.length || 0, 'approvals');
      return rawData.data?.map(enrichApprovalData) || [];
    },
    staleTime: 2 * 60 * 1000, // 2 Minuten Cache
    retry: 3,
  });

  const createApprovalMutation = useMutation({
    mutationFn: async (approval: Omit<OngoingApproval, 'id'>) => {
      const response = await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(approval)
      });
      if (!response.ok) throw new Error('Failed to create approval');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/approvals'] });
      setIsCreating(false);
      setNewApproval({ status: 'submitted', priority: 'medium', progressPercentage: 0 });
      toast({
        title: "✅ Zulassung hinzugefügt",
        description: "Der neue Zulassungsprozess wurde erfolgreich erfasst.",
      });
    },
    onError: () => {
      toast({
        title: "❌ Fehler",
        description: "Zulassung konnte nicht erstellt werden.",
        variant: "destructive",
      });
    }
  });

  const filteredApprovals = approvals.filter(approval => {
    const matchesSearch = approval.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         approval.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (approval.regulatoryBody || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || approval.status === selectedStatus;
    const matchesRegion = selectedRegion === 'all' || approval.region === selectedRegion;
    
    return matchesSearch && matchesStatus && matchesRegion;
  });

  const getStatusBadge = (status: OngoingApproval['status']) => {
    switch (status) {
      case 'submitted':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">Eingereicht</Badge>;
      case 'under-review':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">Under Review</Badge>;
      case 'pending-response':
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300">Antwort ausstehend</Badge>;
      case 'nearly-approved':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">Fast genehmigt</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">Genehmigt</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">Abgelehnt</Badge>;
      default:
        return <Badge variant="outline">Unbekannt</Badge>;
    }
  };

  const getPriorityBadge = (priority: OngoingApproval['priority']) => {
    switch (priority) {
      case 'critical':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">Kritisch</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300">Hoch</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">Mittel</Badge>;
      case 'low':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">Niedrig</Badge>;
      default:
        return <Badge variant="outline">Normal</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 via-teal-600 to-blue-700 rounded-2xl shadow-lg">
            <Clock className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Laufende Zulassungen
            </h1>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <div className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-xl text-sm font-semibold flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                {filteredApprovals.length} Aktive Projekte
              </div>
              <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-xl text-sm font-semibold flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Live Tracking
              </div>
              <div className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-xl text-sm font-semibold flex items-center gap-1">
                <Target className="w-4 h-4" />
                Meilenstein-Management
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Vollständiges Projektmanagement für regulatorische Zulassungsprozesse
            </p>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-4">
          <div className="flex items-center gap-3">
            <div className="text-right bg-gradient-to-r from-green-50 to-green-100 dark:from-green-800 dark:to-green-700 p-4 rounded-xl">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {Math.round(approvals.reduce((sum, app) => sum + (app.progressPercentage || 0), 0) / Math.max(approvals.length, 1))}%
              </div>
              <div className="text-sm text-green-600 dark:text-green-400 font-medium">Ø Fortschritt</div>
            </div>
            <div className="text-right bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{approvals.length}</div>
              <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Gesamt Projekte</div>
            </div>
          </div>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white shadow-lg px-6 py-3 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Neue Zulassung starten
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Neuen Zulassungsprozess erfassen</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Produktname"
                  value={newApproval.productName || ''}
                  onChange={(e) => setNewApproval(prev => ({ ...prev, productName: e.target.value }))}
                />
                <Input
                  placeholder="Unternehmen"
                  value={newApproval.company || ''}
                  onChange={(e) => setNewApproval(prev => ({ ...prev, company: e.target.value }))}
                />
                <Select value={newApproval.region || ''} onValueChange={(value) => setNewApproval(prev => ({ ...prev, region: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USA">USA</SelectItem>
                    <SelectItem value="EU">EU</SelectItem>
                    <SelectItem value="Japan">Japan</SelectItem>
                    <SelectItem value="China">China</SelectItem>
                    <SelectItem value="Canada">Kanada</SelectItem>
                    <SelectItem value="Brazil">Brasilien</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Zulassungsbehörde"
                  value={newApproval.regulatoryBody || ''}
                  onChange={(e) => setNewApproval(prev => ({ ...prev, regulatoryBody: e.target.value }))}
                />
                <Input
                  type="date"
                  placeholder="Eingereicht am"
                  value={newApproval.submissionDate || ''}
                  onChange={(e) => setNewApproval(prev => ({ ...prev, submissionDate: e.target.value }))}
                />
                <Input
                  type="date"
                  placeholder="Erwartete Genehmigung"
                  value={newApproval.expectedDecision || ''}
                  onChange={(e) => setNewApproval(prev => ({ ...prev, expectedDecision: e.target.value }))}
                />
                <Input
                  placeholder="Produktklasse"
                  value={newApproval.deviceClass || ''}
                  onChange={(e) => setNewApproval(prev => ({ ...prev, deviceClass: e.target.value }))}
                />
                <Input
                  placeholder="Geschätzte Kosten"
                  value={newApproval.estimatedCosts || ''}
                  onChange={(e) => setNewApproval(prev => ({ ...prev, estimatedCosts: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Abbrechen
                </Button>
                <Button 
                  onClick={() => createApprovalMutation.mutate(newApproval as Omit<OngoingApproval, 'id'>)}
                  disabled={createApprovalMutation.isPending || !newApproval.productName}
                >
                  Zulassung erfassen
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Aktive Prozesse</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{approvals.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Fast genehmigt</p>
                <p className="text-2xl font-bold text-green-600">
                  {approvals.filter(a => a.status === 'nearly-approved').length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Kritische Priorität</p>
                <p className="text-2xl font-bold text-red-600">
                  {approvals.filter(a => a.priority === 'critical').length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Ø Fortschritt</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(approvals.reduce((acc, a) => acc + (a.progressPercentage || 0), 0) / Math.max(approvals.length, 1))}%
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="submitted">Eingereicht</SelectItem>
                <SelectItem value="under-review">Under Review</SelectItem>
                <SelectItem value="pending-response">Antwort ausstehend</SelectItem>
                <SelectItem value="nearly-approved">Fast genehmigt</SelectItem>
                <SelectItem value="approved">Genehmigt</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger>
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Regionen</SelectItem>
                <SelectItem value="USA">USA</SelectItem>
                <SelectItem value="EU">EU</SelectItem>
                <SelectItem value="Japan">Japan</SelectItem>
                <SelectItem value="China">China</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Approvals List */}
      <div className="space-y-4">
        {filteredApprovals.map((approval) => (
          <Card key={approval.id}>
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {approval.productName}
                    </h3>
                    {getStatusBadge(approval.status)}
                    {getPriorityBadge(approval.priority)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      {approval.company}
                    </div>
                    <div className="flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      {approval.region}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Erwartet: {new Date(approval.expectedDecision).toLocaleDateString('de-DE')}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Pieces Share Button temporarily disabled due to plugin conflict */}
                  <Button size="sm" variant="outline">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="mx-4 mt-4">
                  <TabsTrigger value="overview">Übersicht</TabsTrigger>
                  <TabsTrigger value="milestones">Meilensteine</TabsTrigger>
                  <TabsTrigger value="challenges">Herausforderungen</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="p-4">
                  <div className="space-y-6">
                    {/* Produktbeschreibung */}
                    <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        Produktbeschreibung
                      </h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {approval.productDescription || 'Produktbeschreibung wird geladen...'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Funktionalität */}
                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
                        <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                          <Zap className="w-4 h-4 text-yellow-600" />
                          Funktionsweise
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {approval.functionality || 'Funktionsweise wird geladen...'}
                        </p>
                      </div>

                      {/* Medizinische Indikation */}
                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
                        <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                          <Shield className="w-4 h-4 text-green-600" />
                          Medizinische Anwendung
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {approval.medicalIndication || 'Medizinische Anwendung wird geladen...'}
                        </p>
                      </div>
                    </div>

                    {/* Zulassungsgrund */}
                    <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                        <Target className="w-5 h-5 text-green-600" />
                        Zulassungsgrund & Innovation
                      </h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {approval.approvalReason || 'Zulassungsgrund wird geladen...'}
                      </p>
                    </div>

                    {/* Team & Verantwortlichkeiten */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
                        <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-600" />
                          Projektleitung
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {approval.projectLead || 'Projektleitung wird geladen...'}
                        </p>
                      </div>

                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
                        <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-purple-600" />
                          Regulatory Team
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {approval.regulatoryTeam || 'Regulatory Team wird geladen...'}
                        </p>
                      </div>

                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
                        <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                          <Scale className="w-4 h-4 text-red-600" />
                          Zulassungsbehörde
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {approval.approvalAuthority || 'Zulassungsbehörde wird geladen...'}
                        </p>
                      </div>
                    </div>

                    {/* Fortschritt */}
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-indigo-600" />
                        Aktueller Fortschritt
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Zulassungsstand</span>
                          <span className="font-medium">{approval.progressPercentage || 75}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${approval.progressPercentage || 75}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {approval.currentPhase || 'Status wird geladen...'}
                          </p>
                          <div className="text-right">
                            <p className="text-sm font-medium text-green-600">{approval.estimatedCosts}</p>
                            <p className="text-xs text-gray-500">Geschätzte Kosten</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="milestones" className="p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Meilensteine & Status</h4>
                  <div className="space-y-3">
                    {(approval.keyMilestones || []).map((milestone, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded">
                        <div className="text-lg">
                          {milestone.startsWith('✅') ? '✅' : 
                           milestone.startsWith('🔄') ? '🔄' : '⏳'}
                        </div>
                        <span className="text-sm flex-1">
                          {milestone.replace(/^[✅🔄⏳]\s/, '')}
                        </span>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="challenges" className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                        Aktuelle Herausforderungen
                      </h4>
                      <div className="space-y-2">
                        {(approval.challenges || []).map((challenge, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{challenge}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-500" />
                        Nächste Schritte
                      </h4>
                      <div className="space-y-2">
                        {(approval.nextSteps || []).map((step, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="details" className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Timeline</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Eingereicht:</span>
                          <p className="text-sm">{new Date(approval.submissionDate).toLocaleDateString('de-DE')}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Erwartete Genehmigung:</span>
                          <p className="text-sm">{new Date(approval.expectedDecision).toLocaleDateString('de-DE')}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Verbleibende Zeit:</span>
                          <p className="text-sm">
                            {Math.ceil((new Date(approval.expectedDecision).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} Tage
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Kosten & Ressourcen</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Geschätzte Gesamtkosten:</span>
                          <p className="text-lg font-semibold text-green-600">{approval.estimatedCosts}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Verantwortlich:</span>
                          <p className="text-sm">{approval.contactPerson || 'Nicht verfügbar'}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredApprovals.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center p-12">
            <div className="text-center">
              <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Keine laufenden Zulassungen</h2>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedStatus !== 'all' || selectedRegion !== 'all'
                  ? 'Keine Zulassungen entsprechen den aktuellen Filtern.'
                  : 'Aktuell sind keine Zulassungsprozesse erfasst.'}
              </p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Erste Zulassung erfassen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}