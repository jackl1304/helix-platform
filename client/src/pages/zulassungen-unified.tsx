import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ApprovalDetailView } from '@/components/approval-detail-view';
import { safeArray, safeFilter, safeMap, safeSome, safeUnique } from '@/utils/array-safety';
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
  BarChart3
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ApprovalData {
  id: string;
  title: string;
  type: '510k' | 'pma' | 'ce' | 'mdr' | 'ivd' | 'iso' | 'other' | 'tga' | 'pmda' | 'anvisa' | 'hsa';
  status: 'approved' | 'pending' | 'submitted' | 'rejected' | 'withdrawn';
  region: 'US' | 'EU' | 'Germany' | 'Global' | 'APAC' | 'Canada' | 'Australia' | 'Japan' | 'UK' | 'Brazil' | 'Singapore';
  authority: 'FDA' | 'EMA' | 'BfArM' | 'ISO' | 'IEC' | 'Other' | 'Health Canada' | 'TGA' | 'PMDA' | 'MHRA' | 'ANVISA' | 'HSA';
  applicant: string;
  deviceClass: 'I' | 'II' | 'III' | 'IVD' | 'N/A' | 'IIa' | 'IIb';
  submittedDate: string;
  decisionDate?: string;
  summary: string;
  priority: 'high' | 'medium' | 'low';
  category: 'device' | 'software' | 'diagnostic' | 'therapeutic' | 'monitoring';
  tags: string[];
  url?: string;
  fullText?: string;
  attachments?: string[];
  relatedDocuments?: string[];
  detailedAnalysis?: {
    riskAssessment?: string;
    clinicalData?: string;
    regulatoryPathway?: string;
    marketImpact?: string;
    complianceRequirements?: string[];
  };
  metadata?: {
    source?: string;
    lastUpdated?: string;
    confidence?: number;
    verificationStatus?: string;
  };
}

export default function ZulassungenUnified() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedAuthority, setSelectedAuthority] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedApproval, setSelectedApproval] = useState<ApprovalData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Fetch unified approvals data
  const { data: approvalsData, isLoading, error } = useQuery({
    queryKey: ['/api/approvals/unified'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3000/api/approvals/unified');
      if (!response.ok) {
        throw new Error('Failed to fetch approvals');
      }
      return response.json();
    },
    staleTime: 300000, // 5 minutes
  });

  // Process approvals data
  const approvals: ApprovalData[] = useMemo(() => {
    if (!approvalsData) return [];
    if (Array.isArray(approvalsData)) return approvalsData;
    if (approvalsData && typeof approvalsData === 'object' && 'data' in approvalsData) {
      return Array.isArray(approvalsData.data) ? approvalsData.data : [];
    }
    return [];
  }, [approvalsData]);

  // Filter approvals based on search and filters
  const safeApprovals = safeArray(approvals);
  const filteredApprovals = useMemo(() => {
    return safeFilter(safeApprovals, approval => {
      const matchesSearch = !searchTerm || 
        approval.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        approval.applicant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        approval.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        safeSome(approval.tags || [], tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = selectedType === 'all' || approval.type === selectedType;
      const matchesStatus = selectedStatus === 'all' || approval.status === selectedStatus;
      const matchesRegion = selectedRegion === 'all' || approval.region === selectedRegion;
      const matchesAuthority = selectedAuthority === 'all' || approval.authority === selectedAuthority;
      const matchesClass = selectedClass === 'all' || approval.deviceClass === selectedClass;
      const matchesPriority = selectedPriority === 'all' || approval.priority === selectedPriority;
      const matchesCategory = selectedCategory === 'all' || approval.category === selectedCategory;
      
      // Tab filtering
      const matchesTab = activeTab === 'all' || 
        (activeTab === 'pending' && approval.status === 'pending') ||
        (activeTab === 'approved' && approval.status === 'approved') ||
        (activeTab === 'recent' && approval.decisionDate && 
         new Date(approval.decisionDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
      
      return matchesSearch && matchesType && matchesStatus && matchesRegion && 
             matchesAuthority && matchesClass && matchesPriority && matchesCategory && matchesTab;
    });
  }, [approvals, searchTerm, selectedType, selectedStatus, selectedRegion, 
      selectedAuthority, selectedClass, selectedPriority, selectedCategory, activeTab]);

  const openApprovalDetail = (approval: ApprovalData) => {
    setSelectedApproval(approval);
    setIsModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'withdrawn': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {safeMap([...Array(6)], (_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Zulassungen & Registrierungen</h1>
          <p className="text-muted-foreground mt-2">
            Zentrale Übersicht aller Medizinprodukte-Zulassungen, FDA Clearances und Registrierungen
          </p>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Aktualisieren
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt Zulassungen</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvals.length}</div>
            <p className="text-xs text-muted-foreground">
              Alle Zulassungstypen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Genehmigt</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {safeFilter(safeApprovals, a => a.status === 'approved').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Erfolgreich zugelassen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ausstehend</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {safeFilter(safeApprovals, a => a.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">
              In Bearbeitung
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regionen</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {safeUnique(safeApprovals, a => a.region).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Verschiedene Märkte
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Search & Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Erweiterte Suche & Filter
          </CardTitle>
          <CardDescription>
            Filtern Sie nach Typ, Status, Region, Behörde und weiteren Kriterien
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Suche nach Produkt, Hersteller, Beschreibung oder Tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>

            {/* Filter Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Typ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Typen</SelectItem>
                  <SelectItem value="510k">FDA 510(k)</SelectItem>
                  <SelectItem value="pma">FDA PMA</SelectItem>
                  <SelectItem value="ce">CE-Kennzeichnung</SelectItem>
                  <SelectItem value="mdr">MDR</SelectItem>
                  <SelectItem value="ivd">IVDR</SelectItem>
                  <SelectItem value="iso">ISO Standards</SelectItem>
                  <SelectItem value="other">Sonstige</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  <SelectItem value="approved">Genehmigt</SelectItem>
                  <SelectItem value="pending">Ausstehend</SelectItem>
                  <SelectItem value="submitted">Eingereicht</SelectItem>
                  <SelectItem value="rejected">Abgelehnt</SelectItem>
                  <SelectItem value="withdrawn">Zurückgezogen</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue placeholder="Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Regionen</SelectItem>
                  <SelectItem value="US">USA</SelectItem>
                  <SelectItem value="EU">Europa</SelectItem>
                  <SelectItem value="Germany">Deutschland</SelectItem>
                  <SelectItem value="Canada">Kanada</SelectItem>
                  <SelectItem value="Australia">Australien</SelectItem>
                  <SelectItem value="Japan">Japan</SelectItem>
                  <SelectItem value="UK">Großbritannien</SelectItem>
                  <SelectItem value="APAC">APAC</SelectItem>
                  <SelectItem value="Global">Global</SelectItem>
                  <SelectItem value="China">China</SelectItem>
                  <SelectItem value="Brazil">Brasilien</SelectItem>
                  <SelectItem value="India">Indien</SelectItem>
                  <SelectItem value="South Korea">Südkorea</SelectItem>
                  <SelectItem value="Singapore">Singapur</SelectItem>
                  <SelectItem value="Saudi Arabia">Saudi-Arabien</SelectItem>
                  <SelectItem value="South Africa">Südafrika</SelectItem>
                  <SelectItem value="Argentina">Argentinien</SelectItem>
                  <SelectItem value="Malaysia">Malaysia</SelectItem>
                  <SelectItem value="New Zealand">Neuseeland</SelectItem>
                  <SelectItem value="Kenya">Kenia</SelectItem>
                  <SelectItem value="Egypt">Ägypten</SelectItem>
                  <SelectItem value="Nigeria">Nigeria</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedAuthority} onValueChange={setSelectedAuthority}>
                <SelectTrigger>
                  <SelectValue placeholder="Behörde" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Behörden</SelectItem>
                  <SelectItem value="FDA">FDA (USA)</SelectItem>
                  <SelectItem value="EMA">EMA (EU)</SelectItem>
                  <SelectItem value="BfArM">BfArM (Deutschland)</SelectItem>
                  <SelectItem value="Health Canada">Health Canada</SelectItem>
                  <SelectItem value="TGA">TGA (Australien)</SelectItem>
                  <SelectItem value="PMDA">PMDA (Japan)</SelectItem>
                  <SelectItem value="MHRA">MHRA (UK)</SelectItem>
                  <SelectItem value="ISO">ISO (International)</SelectItem>
                  <SelectItem value="IEC">IEC (International)</SelectItem>
                  <SelectItem value="NMPA">NMPA (China)</SelectItem>
                  <SelectItem value="CDSCO">CDSCO (Indien)</SelectItem>
                  <SelectItem value="MFDS">MFDS (Südkorea)</SelectItem>
                  <SelectItem value="HSA">HSA (Singapur)</SelectItem>
                  <SelectItem value="Medsafe">Medsafe (Neuseeland)</SelectItem>
                  <SelectItem value="ANMAT">ANMAT (Argentinien)</SelectItem>
                  <SelectItem value="MOH Malaysia">MOH Malaysia</SelectItem>
                  <SelectItem value="KEMRI">KEMRI (Kenia)</SelectItem>
                  <SelectItem value="MOH Egypt">MOH Egypt</SelectItem>
                  <SelectItem value="NMPB">NMPB (Nigeria)</SelectItem>
                  <SelectItem value="SFDA">SFDA (Saudi-Arabien)</SelectItem>
                  <SelectItem value="SAHPRA">SAHPRA (Südafrika)</SelectItem>
                  <SelectItem value="TÜV SÜD">TÜV SÜD (Notified Body)</SelectItem>
                  <SelectItem value="Bureau Veritas">Bureau Veritas (Notified Body)</SelectItem>
                  <SelectItem value="ANVISA">ANVISA (Brasilien)</SelectItem>
                  <SelectItem value="Other">Sonstige</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Klasse" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Klassen</SelectItem>
                  <SelectItem value="I">Klasse I</SelectItem>
                  <SelectItem value="II">Klasse II</SelectItem>
                  <SelectItem value="III">Klasse III</SelectItem>
                  <SelectItem value="IVD">IVD</SelectItem>
                  <SelectItem value="N/A">N/A</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Priorität" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Prioritäten</SelectItem>
                  <SelectItem value="high">Hoch</SelectItem>
                  <SelectItem value="medium">Mittel</SelectItem>
                  <SelectItem value="low">Niedrig</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Kategorien</SelectItem>
                  <SelectItem value="device">Gerät</SelectItem>
                  <SelectItem value="software">Software</SelectItem>
                  <SelectItem value="diagnostic">Diagnostik</SelectItem>
                  <SelectItem value="therapeutic">Therapie</SelectItem>
                  <SelectItem value="monitoring">Monitoring</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('all');
                  setSelectedStatus('all');
                  setSelectedRegion('all');
                  setSelectedAuthority('all');
                  setSelectedClass('all');
                  setSelectedPriority('all');
                  setSelectedCategory('all');
                  setActiveTab('all');
                }}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Zurücksetzen
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Alle ({filteredApprovals.length})</TabsTrigger>
          <TabsTrigger value="approved">Genehmigt ({safeFilter(safeApprovals, a => a.status === 'approved').length})</TabsTrigger>
          <TabsTrigger value="pending">Ausstehend ({safeFilter(safeApprovals, a => a.status === 'pending').length})</TabsTrigger>
          <TabsTrigger value="recent">Aktuell ({safeFilter(safeApprovals, a => a.decisionDate && new Date(a.decisionDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {/* Detailed Approvals List with Tabs */}
          <div className="space-y-6">
            {safeMap(filteredApprovals, (approval) => (
              <Card key={approval.id} className="w-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{approval.title}</CardTitle>
                      <CardDescription className="text-base">
                        <div className="flex items-center gap-4 mb-2">
                          <span className="flex items-center gap-1">
                            <Building className="h-4 w-4" />
                            {approval.applicant}
                          </span>
                          <span className="flex items-center gap-1">
                            <Globe className="h-4 w-4" />
                            {approval.region}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(approval.submittedDate).toLocaleDateString('de-DE')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(approval.status)}>
                            {approval.status === 'approved' && 'Genehmigt'}
                            {approval.status === 'pending' && 'Ausstehend'}
                            {approval.status === 'submitted' && 'Eingereicht'}
                            {approval.status === 'rejected' && 'Abgelehnt'}
                            {approval.status === 'withdrawn' && 'Zurückgezogen'}
                          </Badge>
                          <Badge variant="outline">{approval.type.toUpperCase()}</Badge>
                          <Badge variant="outline">Klasse {approval.deviceClass}</Badge>
                          <span className={`text-sm ${getPriorityColor(approval.priority)}`}>
                            {approval.priority === 'high' && '🔴 Hohe Priorität'}
                            {approval.priority === 'medium' && '🟡 Mittlere Priorität'}
                            {approval.priority === 'low' && '🟢 Niedrige Priorität'}
                          </span>
                        </div>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openApprovalDetail(approval)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* DETAILLIERTE TAB-STRUKTUR WIE BEI ANDEREN ZULASSUNGEN */}
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="mx-4 mt-4">
                      <TabsTrigger value="overview" data-testid={`tab-overview-${approval.id}`}>Übersicht</TabsTrigger>
                      <TabsTrigger value="milestones" data-testid={`tab-milestones-${approval.id}`}>Meilensteine</TabsTrigger>
                      <TabsTrigger value="challenges" data-testid={`tab-challenges-${approval.id}`}>Herausforderungen</TabsTrigger>
                      <TabsTrigger value="details" data-testid={`tab-details-${approval.id}`}>Details</TabsTrigger>
                      <TabsTrigger value="analysis" data-testid={`tab-analysis-${approval.id}`}>Analyse</TabsTrigger>
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
                            {approval.summary || 'Produktbeschreibung wird geladen...'}
                          </p>
                        </div>

                        {/* Volltext falls verfügbar */}
                        {approval.fullText && (
                          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                              <FileText className="w-5 h-5 text-gray-600" />
                              Vollständige Beschreibung
                            </h4>
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                              {approval.fullText}
                            </p>
                          </div>
                        )}

                        {/* Zulassungsdetails */}
                        <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            Zulassungsdetails
                          </h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Antragsteller:</span>
                              <p className="text-gray-600 dark:text-gray-400">{approval.applicant}</p>
                            </div>
                            <div>
                              <span className="font-medium">Behörde:</span>
                              <p className="text-gray-600 dark:text-gray-400">{approval.authority}</p>
                            </div>
                            <div>
                              <span className="font-medium">Eingereicht:</span>
                              <p className="text-gray-600 dark:text-gray-400">
                                {new Date(approval.submittedDate).toLocaleDateString('de-DE')}
                              </p>
                            </div>
                            {approval.decisionDate && (
                              <div>
                                <span className="font-medium">Entscheidung:</span>
                                <p className="text-gray-600 dark:text-gray-400">
                                  {new Date(approval.decisionDate).toLocaleDateString('de-DE')}
                                </p>
                              </div>
                            )}
                            <div>
                              <span className="font-medium">Zulassungstyp:</span>
                              <p className="text-gray-600 dark:text-gray-400">{approval.type.toUpperCase()}</p>
                            </div>
                            <div>
                              <span className="font-medium">Geräteklasse:</span>
                              <p className="text-gray-600 dark:text-gray-400">Klasse {approval.deviceClass}</p>
                            </div>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                            <Database className="w-5 h-5 text-purple-600" />
                            Kategorien & Tags
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {approval.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="milestones" className="p-4">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                          <Clock className="w-5 h-5 text-blue-600" />
                          Zulassungsmeilensteine
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <div>
                              <p className="font-medium text-sm">Antrag eingereicht</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {new Date(approval.submittedDate).toLocaleDateString('de-DE')}
                              </p>
                            </div>
                          </div>
                          {approval.decisionDate && (
                            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <div>
                                <p className="font-medium text-sm">Zulassung erteilt</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  {new Date(approval.decisionDate).toLocaleDateString('de-DE')}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="challenges" className="p-4">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-yellow-600" />
                          Herausforderungen & Risiken
                        </h4>
                        <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {approval.detailedAnalysis?.riskAssessment || 'Risikobewertung wird geladen...'}
                          </p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="details" className="p-4">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-gray-600" />
                          Technische Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                            <h5 className="font-medium mb-2">Klinische Daten</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {approval.detailedAnalysis?.clinicalData || 'Klinische Daten werden geladen...'}
                            </p>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                            <h5 className="font-medium mb-2">Regulatorischer Weg</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {approval.detailedAnalysis?.regulatoryPathway || 'Regulatorischer Weg wird geladen...'}
                            </p>
                          </div>
                        </div>
                        {approval.attachments && approval.attachments.length > 0 && (
                          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                            <h5 className="font-medium mb-2">Anhänge</h5>
                            <div className="space-y-2">
                              {approval.attachments.map((attachment, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm">
                                  <FileText className="w-4 h-4" />
                                  {attachment}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="analysis" className="p-4">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-indigo-600" />
                          Marktanalyse & Impact
                        </h4>
                        <div className="bg-indigo-50 dark:bg-indigo-950 p-4 rounded-lg">
                          <h5 className="font-medium mb-2">Marktauswirkungen</h5>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                            {approval.detailedAnalysis?.marketImpact || 'Marktanalyse wird geladen...'}
                          </p>
                        </div>
                        {approval.detailedAnalysis?.complianceRequirements && (
                          <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                            <h5 className="font-medium mb-2">Compliance-Anforderungen</h5>
                            <div className="space-y-1">
                              {approval.detailedAnalysis.complianceRequirements.map((req, index) => (
                                <div key={index} className="text-sm text-gray-700 dark:text-gray-300">
                                  • {req}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {approval.metadata && (
                          <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
                            <h5 className="font-medium mb-2">Metadaten</h5>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="font-medium">Quelle:</span>
                                <p className="text-gray-600 dark:text-gray-400">{approval.metadata.source}</p>
                              </div>
                              <div>
                                <span className="font-medium">Vertrauen:</span>
                                <p className="text-gray-600 dark:text-gray-400">
                                  {Math.round((approval.metadata.confidence || 0) * 100)}%
                                </p>
                              </div>
                              <div>
                                <span className="font-medium">Status:</span>
                                <p className="text-gray-600 dark:text-gray-400">{approval.metadata.verificationStatus}</p>
                              </div>
                              <div>
                                <span className="font-medium">Aktualisiert:</span>
                                <p className="text-gray-600 dark:text-gray-400">
                                  {approval.metadata.lastUpdated ? new Date(approval.metadata.lastUpdated).toLocaleDateString('de-DE') : 'N/A'}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredApprovals.length === 0 && (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine Zulassungen gefunden</h3>
              <p className="text-gray-600">
                Versuchen Sie andere Suchkriterien oder Filter zu verwenden.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedApproval && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedApproval.title}</DialogTitle>
                <DialogDescription>
                  {selectedApproval.applicant} • {selectedApproval.authority} • {selectedApproval.region}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Status and Type */}
                <div className="flex items-center gap-4">
                  <Badge className={getStatusColor(selectedApproval.status)}>
                    {selectedApproval.status === 'approved' && 'Genehmigt'}
                    {selectedApproval.status === 'pending' && 'Ausstehend'}
                    {selectedApproval.status === 'submitted' && 'Eingereicht'}
                    {selectedApproval.status === 'rejected' && 'Abgelehnt'}
                    {selectedApproval.status === 'withdrawn' && 'Zurückgezogen'}
                  </Badge>
                  <Badge variant="outline">{selectedApproval.type.toUpperCase()}</Badge>
                  <Badge variant="outline">Klasse {selectedApproval.deviceClass}</Badge>
                  <span className={`text-sm ${getPriorityColor(selectedApproval.priority)}`}>
                    {selectedApproval.priority === 'high' && '🔴 Hohe Priorität'}
                    {selectedApproval.priority === 'medium' && '🟡 Mittlere Priorität'}
                    {selectedApproval.priority === 'low' && '🟢 Niedrige Priorität'}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Antragsteller</h4>
                      <p className="text-muted-foreground">{selectedApproval.applicant}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Zuständige Behörde</h4>
                      <p className="text-muted-foreground">{selectedApproval.authority}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Region/Markt</h4>
                      <p className="text-muted-foreground">{selectedApproval.region}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Kategorie</h4>
                      <p className="text-muted-foreground capitalize">{selectedApproval.category}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Eingereicht am</h4>
                      <p className="text-muted-foreground">
                        {new Date(selectedApproval.submittedDate).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                    {selectedApproval.decisionDate && (
                      <div>
                        <h4 className="font-semibold mb-2">Entscheidung am</h4>
                        <p className="text-muted-foreground">
                          {new Date(selectedApproval.decisionDate).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedApproval.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <h4 className="font-semibold mb-2">Zusammenfassung</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedApproval.summary}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-4 border-t">
                  {selectedApproval.url && (
                    <Button variant="outline" asChild>
                      <a href={selectedApproval.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Offizielle Quelle
                      </a>
                    </Button>
                  )}
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Exportieren
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
