import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  RefreshCw,
  Play,
  Pause,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  Database,
  AlertTriangle
} from 'lucide-react';

// API Calls
const fetchSyncStatus = async () => {
  const response = await fetch('http://localhost:8080/api/sync/status');
  if (!response.ok) {
    throw new Error('Failed to fetch sync status');
  }
  return response.json();
};

const fetchSyncStats = async () => {
  const response = await fetch('http://localhost:8080/api/sync/stats');
  if (!response.ok) {
    throw new Error('Failed to fetch sync stats');
  }
  return response.json();
};

const triggerSync = async () => {
  const response = await fetch('http://localhost:8080/api/sync/trigger', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!response.ok) {
    throw new Error('Failed to trigger sync');
  }
  return response.json();
};

const startSyncEngine = async () => {
  const response = await fetch('http://localhost:8080/api/sync/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!response.ok) {
    throw new Error('Failed to start sync engine');
  }
  return response.json();
};

const stopSyncEngine = async () => {
  const response = await fetch('http://localhost:8080/api/sync/stop', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!response.ok) {
    throw new Error('Failed to stop sync engine');
  }
  return response.json();
};

export default function SyncMonitoringPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Queries
  const { data: syncStatus, isLoading: statusLoading, refetch: refetchStatus } = useQuery({
    queryKey: ['sync-status'],
    queryFn: fetchSyncStatus,
    refetchInterval: 5000, // Refresh every 5 seconds
    suspense: false
  });

  const { data: syncStats, isLoading: statsLoading } = useQuery({
    queryKey: ['sync-stats'],
    queryFn: fetchSyncStats,
    refetchInterval: 10000, // Refresh every 10 seconds
    suspense: false
  });

  // Manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetchStatus();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Trigger manual sync
  const handleTriggerSync = async () => {
    try {
      await triggerSync();
      await refetchStatus();
    } catch (error) {
      console.error('Failed to trigger sync:', error);
    }
  };

  // Start/Stop sync engine
  const handleStartStop = async () => {
    try {
      if (syncStatus?.data?.isRunning) {
        await stopSyncEngine();
      } else {
        await startSyncEngine();
      }
      await refetchStatus();
    } catch (error) {
      console.error('Failed to start/stop sync engine:', error);
    }
  };

  if (statusLoading || statsLoading) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const status = syncStatus?.data;
  const stats = syncStats?.data;

  return (
    <div className="container mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Activity className="h-8 w-8" />
            Synchronisations-Monitoring
          </h1>
          <p className="text-muted-foreground mt-2">
            Überwachung der weltweiten regulatorischen Datenquellen
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Aktualisieren
          </Button>
          <Button
            onClick={handleTriggerSync}
            variant="outline"
            size="sm"
          >
            <Database className="h-4 w-4 mr-2" />
            Sync starten
          </Button>
          <Button
            onClick={handleStartStop}
            variant={status?.isRunning ? "destructive" : "default"}
            size="sm"
          >
            {status?.isRunning ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Stoppen
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Starten
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Status Alert */}
      {status && (
        <Alert className={`mb-6 ${status.isRunning ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
          <Activity className="h-4 w-4" />
          <AlertTitle>
            {status.isRunning ? 'Synchronisations-Engine läuft' : 'Synchronisations-Engine gestoppt'}
          </AlertTitle>
          <AlertDescription>
            {status.isRunning
              ? `Aktive Quellen: ${status.activeSources} | Erfolgsrate: ${status.successRate}%`
              : 'Die Synchronisations-Engine ist derzeit gestoppt. Klicken Sie auf "Starten" um sie zu aktivieren.'
            }
          </AlertDescription>
        </Alert>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Quellen</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status?.activeSources || 0}</div>
            <p className="text-xs text-muted-foreground">
              von {status?.totalSources || 0} verfügbaren
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Erfolgsrate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status?.successRate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              {status?.totalSuccess || 0} erfolgreich
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fehler</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status?.totalErrors || 0}</div>
            <p className="text-xs text-muted-foreground">
              Fehlgeschlagene Synchronisationen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant={status?.isRunning ? "default" : "secondary"}>
                {status?.isRunning ? "Aktiv" : "Gestoppt"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Letzte Aktualisierung: {new Date().toLocaleTimeString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Data Sources */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Datenquellen
          </CardTitle>
          <CardDescription>
            Übersicht aller konfigurierten regulatorischen Datenquellen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {status?.dataSources?.map((source: any) => (
              <div key={source.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      source.priority === 'high' ? 'destructive' :
                      source.priority === 'medium' ? 'default' : 'secondary'
                    }>
                      {source.priority === 'high' ? 'Hoch' :
                       source.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                    </Badge>
                    <Badge variant={source.isActive ? 'default' : 'outline'}>
                      {source.isActive ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-medium">{source.name}</h4>
                    <p className="text-sm text-muted-foreground">ID: {source.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {source.successCount}
                  </div>
                  <div className="flex items-center gap-1">
                    <XCircle className="h-4 w-4 text-red-500" />
                    {source.errorCount}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {source.lastSync ? new Date(source.lastSync).toLocaleString() : 'Nie'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Letzte Aktivitäten
          </CardTitle>
          <CardDescription>
            Chronologische Übersicht der letzten Synchronisationen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {status?.lastSyncResults?.length > 0 ? (
              status.lastSyncResults.map((result: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {result.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium">{result.sourceId}</p>
                      <p className="text-sm text-muted-foreground">
                        {result.success
                          ? `${result.dataCount} Datensätze synchronisiert`
                          : `Fehler: ${result.error}`
                        }
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {result.duration}ms
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Keine Synchronisations-Aktivitäten verfügbar</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
