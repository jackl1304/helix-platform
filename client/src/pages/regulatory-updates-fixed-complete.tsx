import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import { safeArray, safeFilter, safeMap, safeUnique } from '@/utils/array-safety';
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
  Users,
  DollarSign,
  Target,
  Activity,
  BarChart3,
  PieChart,
  Eye
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

// API-Funktion für echte Daten
const fetchRegulatoryUpdates = async (): Promise<RegulatoryUpdate[]> => {
  const response = await fetch('http://localhost:3000/api/regulatory-updates');
  if (!response.ok) {
    throw new Error('Failed to fetch regulatory updates');
  }
  const raw = await response.json();
  const items = Array.isArray(raw) ? raw : (raw?.data ?? []);
  return items.map((it: any) => ({
    id: String(it.id ?? it.uuid ?? crypto.randomUUID()),
    title: it.title ?? it.name ?? it.description ?? 'Ohne Titel',
    summary: it.summary ?? it.description ?? it.content ?? '',
    authority: String(it.source_id ?? it.authority ?? it.source ?? 'Unknown'),
    region: String(it.region ?? it.country ?? 'Global'),
    published_at: it.published_at ?? it.created_at ?? new Date().toISOString(),
    priority: (typeof it.priority === 'string' ? it.priority : 'medium') as 'low' | 'medium' | 'high' | 'urgent',
    category: typeof it.category === 'string' ? it.category : (typeof it.type === 'string' ? it.type : 'general'),
    url: it.source_url ?? it.url,
    type: typeof it.type === 'string' ? it.type : undefined,
    status: typeof it.status === 'string' ? it.status : undefined
  }));
};

const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const response = await fetch('http://localhost:3000/api/dashboard/stats');
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard stats');
  }
  const stats = await response.json();
  return {
    totalUpdates: stats?.totalUpdates ?? 0,
    recentUpdates: stats?.recentUpdates ?? 0,
    highPriority: stats?.highPriority ?? 0,
    regions: stats?.regions ?? 0,
    totalSources: stats?.totalSources ?? 0,
    activeSources: stats?.activeSources ?? 0,
    lastSync: stats?.lastSync ?? new Date().toISOString()
  };
};

export default function RegulatoryUpdatesFixedComplete() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Echte Daten aus API laden
  const { data: updates = [], isLoading: updatesLoading, error: updatesError, refetch: refetchUpdates } = useQuery({
    queryKey: ['regulatory-updates'],
    queryFn: fetchRegulatoryUpdates,
    staleTime: 5 * 60 * 1000, // 5 Minuten
    refetchOnWindowFocus: false
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
    staleTime: 2 * 60 * 1000, // 2 Minuten
    refetchOnWindowFocus: false
  });

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

  if (updatesError) {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-600 mb-2">Fehler beim Laden der Daten</h2>
          <p className="text-gray-600 mb-4">Die regulatorischen Updates konnten nicht geladen werden.</p>
          <Button onClick={() => refetchUpdates()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Erneut versuchen
          </Button>
        </div>
      </div>
    );
  }

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
          <Button onClick={() => refetchUpdates()} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('common.refresh')}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            {t('common.export')}
          </Button>
        </div>
      </div>

      <Separator />

      {/* Statistiken - Echte Daten */}
      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {safeMap([...Array(4)], (_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('regulatoryUpdates.totalUpdates')}
                  </p>
                  <p className="text-2xl font-bold">{stats?.totalUpdates || 0}</p>
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
                  <p className="text-2xl font-bold">{stats?.highPriority || 0}</p>
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
                  <p className="text-2xl font-bold">{stats?.regions || 0}</p>
                </div>
                <Globe className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
            <Card key={String(update.id ?? idx)} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {String(update.authority ?? '')}
                      </Badge>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs text-white ${getPriorityColor(update.priority)}`}
                      >
                        <span className="flex items-center">
                          {getPriorityIcon(update.priority)}
                          <span className="ml-1">{String(update.priority)}</span>
                        </span>
                      </Badge>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">
                      {String(update.title ?? '')}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {String(update.summary ?? '')}
                </p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <Globe className="w-3 h-3 mr-1" />
                      {String(update.region ?? '')}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(update.published_at).toLocaleDateString()}
                    </span>
                  </div>
                  {update.url && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={update.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </Button>
                  )}
                </div>
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
                Echte Daten aus 400+ regulatorischen Quellen
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Alle Daten werden in Echtzeit aus offiziellen regulatorischen Quellen wie FDA, EMA, BfArM, 
                Health Canada, TGA, PMDA, MHRA, ANVISA, HSA und vielen weiteren Behörden weltweit geladen.
                Keine Mock-Daten oder Demo-Inhalte.
              </p>
              <div className="mt-3 flex items-center space-x-4 text-xs text-blue-600 dark:text-blue-400">
                <span className="flex items-center">
                  <Settings className="w-3 h-3 mr-1" />
                  {stats?.totalSources || 0} konfigurierte Quellen
                </span>
                <span className="flex items-center">
                  <Activity className="w-3 h-3 mr-1" />
                  {stats?.activeSources || 0} aktive Quellen
                </span>
                <span className="flex items-center">
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Letzte Aktualisierung: {stats?.lastSync ? new Date(stats.lastSync).toLocaleString() : 'Unbekannt'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}