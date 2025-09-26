import { useState, useEffect, useMemo, useCallback } from 'react';
import { logger, LoggingUtils } from '../utils/logger';
import { useQuery, useQueryClient } from '@tanstack/react-query';
// Customer permissions interface
interface CustomerPermissions {
  dashboard: boolean;
  regulatoryUpdates: boolean;
  legalCases: boolean;
  knowledgeBase: boolean;
  newsletters: boolean;
  analytics: boolean;
  reports: boolean;
  dataCollection: boolean;
  globalSources: boolean;
  historicalData: boolean;
  administration: boolean;
  userManagement: boolean;
  systemSettings: boolean;
  auditLogs: boolean;
  aiInsights: boolean;
  advancedAnalytics: boolean;
}

interface UseLiveTenantPermissionsOptions {
  tenantId: string;
  pollInterval?: number;
}

export function useLiveTenantPermissions({ 
  tenantId, 
  pollInterval = 10000 // Reduced polling frequency from 3s to 10s to avoid reload loops
}: UseLiveTenantPermissionsOptions) {
  const [permissions, setPermissions] = useState<CustomerPermissions | null>(null);
  const [tenantName, setTenantName] = useState<string>('');
  const queryClient = useQueryClient();

  // Memoize query function to prevent unnecessary re-renders
  const queryFn = useCallback(async () => {
    const response = await fetch(`/api/customer/tenant/${tenantId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch tenant data: ${response.status}`);
    }
    return await response.json();
  }, [tenantId]);

  // Fetch tenant data with automatic polling
  const { data: tenantData, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/customer/tenant', tenantId],
    queryFn,
    refetchInterval: pollInterval,
    enabled: !!tenantId,
    staleTime: 5000, // Data is considered stale after 5s
    gcTime: 30000, // Keep in cache for 30s (renamed from cacheTime in v5)
  });

  // Update local state when tenant data changes
  useEffect(() => {
    if (tenantData && typeof tenantData === 'object') {
      const newPermissions = (tenantData as any).customerPermissions;
      const newName = (tenantData as any).name;
      
      // Update permissions if they exist and are different
      if (newPermissions && JSON.stringify(newPermissions) !== JSON.stringify(permissions)) {
        setPermissions(newPermissions);
        logger.info('[LIVE PERMISSIONS] Updated for tenant:', tenantId, newPermissions);
      }
      
      // Update tenant name if different  
      if (newName && newName !== tenantName) {
        setTenantName(newName);
      }
    }
  }, [tenantData, tenantId]);

  return {
    permissions,
    tenantName,
    isLoading,
    error,
    refetch: () => {
      // Force immediate refresh using React Query - much safer than window.location.reload()
      queryClient.invalidateQueries({ queryKey: ['/api/customer/tenant', tenantId] });
      refetch();
    }
  };
}