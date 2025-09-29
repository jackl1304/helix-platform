import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CustomerNavigation, { type CustomerPermissions } from '@/components/customer/customer-navigation';
import { useLiveTenantPermissions } from '@/hooks/use-live-tenant-permissions';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSelector } from '@/components/LanguageSelector';
import { Scale, Clock, Gavel } from 'lucide-react';

// Mock tenant ID
const mockTenantId = "030d3e01-32c4-4f95-8d54-98be948e8d4b";

export default function CustomerLegalCasesSafe() {
  const params = useParams();
  const tenantId = params.tenantId || mockTenantId;
  const { t } = useLanguage();

  // Use live tenant permissions hook for real-time updates
  const { 
    permissions: livePermissions, 
    tenantName: liveTenantName, 
    isLoading: isTenantLoading 
  } = useLiveTenantPermissions({ 
    tenantId,
    pollInterval: 3000
  });

  // Use live permissions with fallback
  const permissions = livePermissions || {
    dashboard: true,
    regulatoryUpdates: true,
    legalCases: true,
    knowledgeBase: false,
    newsletters: false,
    analytics: false,
    reports: false,
    dataCollection: false,
    globalSources: false,
    historicalData: false,
    administration: false,
    userManagement: false,
    systemSettings: false,
    auditLogs: false,
    aiInsights: false,
    advancedAnalytics: false
  };

  // Fetch legal cases - completely safe version
  const { data: rawLegalCases = [], isLoading, error } = useQuery({
    queryKey: ['legal-cases-customer-safe', tenantId],
    queryFn: async () => {
      try {
        const response = await fetch('/api/legal-cases');
        if (!response.ok) throw new Error('Failed to fetch legal cases');
        const data = await response.json();
        
        // Convert to completely safe format
        const safeData = Array.isArray(data) ? data : [data];
        return safeData.map((item: any, index: number) => ({
          safeId: `case-${index}`,
          safeTitle: (item?.title || 'Unbekannter Fall').toString(),
          safeSummary: (item?.summary || 'Keine Zusammenfassung').toString(),
          safeCourt: (item?.court || 'Unbekanntes Gericht').toString(),
          safeCaseNumber: (item?.caseNumber || item?.case_number || 'Unbekannt').toString(),
          safeImpactLevel: (item?.impactLevel || item?.impact_level || 'medium').toString(),
          safeDate: item?.decisionDate || item?.decision_date || new Date().toISOString()
        }));
      } catch (error) {
        console.error('Error fetching legal cases:', error);
        return [];
      }
    },
    enabled: Boolean(permissions?.legalCases)
  });

  if (isTenantLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex items-center justify-center w-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Check permission
  if (!permissions?.legalCases) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="fixed top-4 right-4 z-50">
          <LanguageSelector />
        </div>
        
        <CustomerNavigation 
          permissions={permissions} 
          tenantName={liveTenantName || "Customer Portal"} 
        />
        
        <main className="ml-64 flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Zugriff eingeschränkt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Sie haben keine Berechtigung für den Zugriff auf Rechtsprechung.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="fixed top-4 right-4 z-50">
        <LanguageSelector />
      </div>
      
      <CustomerNavigation 
        permissions={permissions} 
        tenantName={liveTenantName || "Customer Portal"} 
      />
      
      <main className="ml-64 flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Rechtsprechung & Präzedenzfälle
            </h1>
            <p className="text-gray-600">
              Aktuelle Gerichtsentscheidungen und Präzedenzfälle im Bereich Medizintechnik
            </p>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                </div>
              ))}
            </div>
          ) : rawLegalCases && rawLegalCases.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {rawLegalCases.map((safeLegalCase: any) => (
                <Card key={safeLegalCase.safeId} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-semibold line-clamp-2">
                        {safeLegalCase.safeTitle}
                      </CardTitle>
                      <Badge variant={safeLegalCase.safeImpactLevel === 'high' ? 'destructive' : 'default'}>
                        {safeLegalCase.safeImpactLevel}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {safeLegalCase.safeSummary}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center space-x-1">
                        <Gavel className="w-4 h-4" />
                        <span>{safeLegalCase.safeCourt}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          {(() => {
                            try {
                              return new Date(safeLegalCase.safeDate).toLocaleDateString('de-DE');
                            } catch (error) {
                              return 'Ungültiges Datum';
                            }
                          })()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">
                        {safeLegalCase.safeCaseNumber}
                      </Badge>
                      <Button variant="outline" size="sm">
                        Details anzeigen
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Scale className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Keine Rechtsfälle gefunden
                </h3>
                <p className="text-gray-500">
                  Es wurden keine Rechtsfälle für Ihre Anfrage gefunden.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}