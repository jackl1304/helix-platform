import React from 'react';
import { useParams } from 'wouter';
import { useLiveTenantPermissions } from '@/hooks/use-live-tenant-permissions';
import { useCustomerTheme } from '@/contexts/customer-theme-context';
import CustomerNavigation from '@/components/customer/customer-navigation';
import CustomerRouter from '@/components/customer/customer-router';

const mockTenantId = "030d3e01-32c4-4f95-8d54-98be948e8d4b";

const LoadingSpinner = () => (
  <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-900">
    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
  </div>
);

export default function CustomerPortalLayout() {
  const params = useParams();
  const tenantId = params.tenantId || mockTenantId;

  // Lade Berechtigungen und Theme-Daten ZENTRAL an einer Stelle.
  const { 
    permissions, 
    tenantName, 
    isLoading: permissionsLoading 
  } = useLiveTenantPermissions({ tenantId });

  const { themeSettings, isLoading: themeLoading } = useCustomerTheme();

  // Zeige einen einzigen Ladebildschirm, bis alle initialen Daten da sind.
  if (permissionsLoading || themeLoading || !permissions) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <CustomerNavigation 
        permissions={permissions} 
        tenantName={tenantName || themeSettings.companyName || "Customer Portal"} 
      />
      <main className="ml-64 flex-1 p-8 overflow-y-auto">
        {/* 
          Der Router rendert jetzt die spezifische Seite,
          die ihre Daten von hier als Props erhalten wird.
        */}
        <CustomerRouter permissions={permissions} tenantName={tenantName} />
      </main>
    </div>
  );
}