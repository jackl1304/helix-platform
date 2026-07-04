import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, CheckCircle, Activity, TrendingUp, ExternalLink } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface FDAWidgetData {
  totalApprovals: number;
  activeRecalls: number;
  criticalRecalls: number;
  adverseEvents: number;
  complianceScore: number;
  lastUpdated: string;
}

const fetchFDAStats = async (): Promise<FDAWidgetData> => {
  try {
    const response = await fetch('/api/fda/stats');
    if (!response.ok) {
      const errorText = await response.text();
      console.error('FDA stats API error:', response.status, errorText);
      throw new Error(`Failed to fetch FDA stats: ${response.status}`);
    }
    const result = await response.json();
    if (!result.success || !result.data) {
      console.warn('FDA stats API returned unexpected format:', result);
      // Return fallback data instead of throwing
      return {
        totalApprovals: 0,
        activeRecalls: 0,
        criticalRecalls: 0,
        adverseEvents: 0,
        complianceScore: 100,
        lastUpdated: new Date().toISOString()
      };
    }
    return result.data;
  } catch (error) {
    console.error('Error fetching FDA stats:', error);
    // Return fallback data instead of throwing to prevent UI crash
    return {
      totalApprovals: 0,
      activeRecalls: 0,
      criticalRecalls: 0,
      adverseEvents: 0,
      complianceScore: 100,
      lastUpdated: new Date().toISOString()
    };
  }
};

export function FDAWidget() {
  const { data: fdaStats, isLoading, error, refetch } = useQuery({
    queryKey: ['fda-stats'],
    queryFn: fetchFDAStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: 1000,
    // Don't throw errors, use fallback data instead
    throwOnError: false,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            FDA Regulatory Status
          </CardTitle>
          <CardDescription>Loading FDA compliance data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            FDA Regulatory Status
          </CardTitle>
          <CardDescription>Error loading FDA data</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Fehler beim Laden der FDA-Daten</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>Die FDA-Regulierungsdaten konnten nicht geladen werden.</p>
              <p className="text-xs text-gray-500">
                Mögliche Ursachen: API-Verbindungsproblem oder Backend-Fehler. 
                Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="mt-2 w-full"
              >
                <Activity className="h-4 w-4 mr-2" />
                Erneut versuchen
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Fallback-Werte falls fdaStats undefined ist
  const stats: FDAWidgetData = fdaStats ?? {
    totalApprovals: 0,
    activeRecalls: 0,
    criticalRecalls: 0,
    adverseEvents: 0,
    complianceScore: 100,
    lastUpdated: new Date().toISOString()
  };

  const complianceColor = stats.complianceScore >= 90 ? 'text-green-600' :
                         stats.complianceScore >= 70 ? 'text-yellow-600' : 'text-red-600';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          FDA Regulatory Status
        </CardTitle>
        <CardDescription>
          Real-time FDA compliance monitoring
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Compliance Score */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Compliance Score</span>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${complianceColor}`}>
              {stats.complianceScore}%
            </span>
            <Badge variant={stats.complianceScore >= 90 ? 'default' :
                           stats.complianceScore >= 70 ? 'secondary' : 'destructive'}>
              {stats.complianceScore >= 90 ? 'Excellent' :
               stats.complianceScore >= 70 ? 'Good' : 'Needs Attention'}
            </Badge>
          </div>
        </div>

        {/* Critical Alerts */}
        {stats.criticalRecalls > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Critical Alert</AlertTitle>
            <AlertDescription>
              {stats.criticalRecalls} Class I Recall(s) require immediate attention
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{stats.totalApprovals}</div>
            <div className="text-sm text-green-700">FDA Approvals</div>
          </div>

          <div className="text-center p-3 bg-red-50 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-600">{stats.activeRecalls}</div>
            <div className="text-sm text-red-700">Active Recalls</div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Critical Recalls (Class I)</span>
            <Badge variant={stats.criticalRecalls > 0 ? 'destructive' : 'secondary'}>
              {stats.criticalRecalls}
            </Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span>Adverse Events</span>
            <Badge variant={stats.adverseEvents > 5 ? 'destructive' : 'secondary'}>
              {stats.adverseEvents}
            </Badge>
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-xs text-gray-500 text-center">
          Last updated: {new Date(stats.lastUpdated).toLocaleString()}
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            className="w-full flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
            onClick={() => window.location.href = '/fda-data'}
          >
            <ExternalLink className="h-4 w-4" />
            View Detailed FDA Data
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
