import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Activity, Globe, Monitor, Calendar, TrendingUp, Users, RefreshCw, BarChart3 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface AnalyticsOverview {
  totalViews: number;
  todayViews: number;
  uniqueToday: number;
  topPages: Array<{ page: string; views: number }>;
  browserStats: Array<{ browser: string; count: number }>;
  deviceStats: Array<{ device: string; count: number }>;
  hourlyActivity: Array<{ hour: number; views: number }>;
}

interface AccessLogEntry {
  id: string;
  page: string;
  ipAddress: string;
  location: string;
  device: string;
  browser: string;
  os: string;
  userAgent: string;
  referrer?: string;
  sessionId: string;
  timestamp: string;
}

interface AccessLogResponse {
  accessLog: AccessLogEntry[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

interface LiveActivityData {
  activeUsers: number;
  recentActivity: Array<{
    page: string;
    location: string;
    browser: string;
    device: string;
    timestamp: string;
  }>;
}

export default function WebsiteAnalytics() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [accessLogOffset, setAccessLogOffset] = useState(0);
  const queryClient = useQueryClient();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup any pending queries when component unmounts
      queryClient.cancelQueries({ queryKey: ['/api/analytics'] });
    };
  }, [queryClient]);

  // Analytics Overview Query
  const { data: overview, isLoading: overviewLoading } = useQuery<AnalyticsOverview>({
    queryKey: ['/api/analytics/overview'],
    refetchInterval: 30000, // Aktualisierung alle 30 Sekunden
  });

  // Access Log Query  
  const { data: accessLog, isLoading: accessLogLoading } = useQuery<AccessLogResponse>({
    queryKey: ['/api/analytics/access-log', accessLogOffset],
    enabled: selectedTab === 'access-log',
  });

  // Live Activity Query
  const { data: liveActivity, isLoading: liveLoading } = useQuery<LiveActivityData>({
    queryKey: ['/api/analytics/live'],
    enabled: selectedTab === 'live',
    refetchInterval: 5000, // Live-Updates alle 5 Sekunden
  });

  // Refresh Mutation
  const refreshMutation = useMutation({
    mutationFn: async () => {
      // Alle Analytics-Daten neu laden
      await queryClient.invalidateQueries({ queryKey: ['/api/analytics'] });
    },
    onSuccess: () => {
      console.log('Analytics-Daten erfolgreich aktualisiert');
    }
  });

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('de-DE');
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt-Zugriffe</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.totalViews?.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Alle Zeit</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Heute</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.todayViews}</div>
            <p className="text-xs text-muted-foreground">Seitenaufrufe heute</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eindeutige Besucher</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.uniqueToday}</div>
            <p className="text-xs text-muted-foreground">Heute</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Pages */}
      <Card>
        <CardHeader>
          <CardTitle>Meistbesuchte Seiten (letzte 7 Tage)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {overview?.topPages?.map((page, index) => (
              <div key={page.page} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline">{index + 1}</Badge>
                  <span className="font-medium">{page.page}</span>
                </div>
                <Badge variant="secondary">{page.views} Aufrufe</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Browser & Device Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Browser-Statistiken</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {overview?.browserStats?.map((browser) => (
                <div key={browser.browser} className="flex items-center justify-between">
                  <span className="text-sm">{browser.browser}</span>
                  <Badge variant="outline">{browser.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gerät-Statistiken</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {overview?.deviceStats?.map((device) => (
                <div key={device.device} className="flex items-center justify-between">
                  <span className="text-sm">{device.device}</span>
                  <Badge variant="outline">{device.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderAccessLog = () => (
    <Card>
      <CardHeader>
        <CardTitle>Detailliertes Zugriffs-Protokoll</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Zeitstempel</TableHead>
              <TableHead>Seite</TableHead>
              <TableHead>IP-Adresse</TableHead>
              <TableHead>Standort</TableHead>
              <TableHead>Browser</TableHead>
              <TableHead>Gerät</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accessLog?.accessLog?.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="text-sm">
                  {formatTimestamp(entry.timestamp)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{entry.page}</Badge>
                </TableCell>
                <TableCell className="font-mono text-xs">{entry.ipAddress}</TableCell>
                <TableCell>{entry.location}</TableCell>
                <TableCell className="text-sm">{entry.browser}</TableCell>
                <TableCell>{entry.device}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        {accessLog?.pagination && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Zeige {accessLog.pagination.offset + 1} - {Math.min(accessLog.pagination.offset + accessLog.pagination.limit, accessLog.pagination.total)} von {accessLog.pagination.total} Einträgen
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAccessLogOffset(Math.max(0, accessLogOffset - 100))}
                disabled={accessLogOffset === 0}
              >
                Vorherige
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAccessLogOffset(accessLogOffset + 100)}
                disabled={!accessLog.pagination.hasMore}
              >
                Nächste
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderLiveActivity = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Live-Aktivität (letzte 5 Minuten)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600 mb-4">
            {liveActivity?.activeUsers || 0} aktive Benutzer
          </div>
          
          <div className="space-y-3">
            {liveActivity?.recentActivity?.map((activity, index) => (
              <div key={index} className="flex items-center justify-between border-l-2 border-green-500 pl-4 py-2">
                <div>
                  <div className="font-medium">{activity.page}</div>
                  <div className="text-sm text-muted-foreground">
                    {activity.location} • {activity.browser} • {activity.device}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatTimestamp(activity.timestamp)}
                </div>
              </div>
            ))}
          </div>

          {(!liveActivity?.recentActivity || liveActivity.recentActivity.length === 0) && (
            <div className="text-center text-muted-foreground py-8">
              Keine aktuelle Aktivität in den letzten 5 Minuten
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  if (overviewLoading && selectedTab === 'overview') {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Website Analytics</h1>
          <p className="text-muted-foreground">
            Überwachen Sie Zugriffe und Benutzeraktivität auf Ihrer Website
          </p>
        </div>
        <Button 
          onClick={() => refreshMutation.mutate()}
          disabled={refreshMutation.isPending}
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
          Aktualisieren
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b">
        <button
          onClick={() => setSelectedTab('overview')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            selectedTab === 'overview'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <BarChart3 className="h-4 w-4 inline mr-2" />
          Übersicht
        </button>
        <button
          onClick={() => setSelectedTab('access-log')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            selectedTab === 'access-log'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Monitor className="h-4 w-4 inline mr-2" />
          Zugriffs-Protokoll
        </button>
        <button
          onClick={() => setSelectedTab('live')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            selectedTab === 'live'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Activity className="h-4 w-4 inline mr-2" />
          Live-Aktivität
        </button>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {selectedTab === 'overview' && renderOverview()}
        {selectedTab === 'access-log' && renderAccessLog()}
        {selectedTab === 'live' && renderLiveActivity()}
      </div>
    </div>
  );
}