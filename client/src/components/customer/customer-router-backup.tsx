import { useLocation, useParams } from "wouter";
import { lazy        case '/legal-cases':
          componentToRender = <CustomerLegalCases />;
          break;        case '/knowledge-base':
          componentToRender = <CustomerKnowledgeBase />;
          break;ense, useTransition, useEffect, useState } from "react";
import type { CustomerPermissions } from "@/components/customer/customer-navigation";

// Lazy load components to avoid circular dependencies
const CustomerDashboard = lazy(() => import("@/pages/customer-dashboard"));
const CustomerSettings = lazy(() => import("@/pages/customer-settings"));
const CustomerAIInsightsClean = lazy(() => import("@/pages/customer-ai-insights-clean"));
const CustomerRegulatoryUpdates = lazy(() => import("@/pages/customer-regulatory-updates"));
const ZulassungenGlobal = lazy(() => import("@/pages/zulassungen-global-new"));
const LaufendeZulassungen = lazy(() => import("@/pages/laufende-zulassungen"));
const KnowledgeBasePage = lazy(() => import("@/pages/knowledge-base"));
const CustomerKnowledgeBase = lazy(() => import("@/pages/customer-knowledge-base"));
const CustomerLegalCases = lazy(() => import("@/pages/customer-legal-cases"));
const ProjectNotebooksList = lazy(() => import("@/pages/project-notebooks-list"));
const ProjectWorkbenchPage = lazy(() => import("@/pages/project-workbench"));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

interface CustomerRouterProps {
  permissions: CustomerPermissions;
  tenantName?: string;
}

export default function CustomerRouter({ permissions, tenantName }: CustomerRouterProps) {
  const [location] = useLocation();
  const [renderedComponent, setRenderedComponent] = useState<React.ReactNode>(null);
  const params = useParams();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(() => {
      let componentToRender;
    // Multi-tenant routing: /tenant/:tenantId/*
    if (location.includes('/tenant/') && params.tenantId) {
      // Extract the route part after tenant ID
      const urlParts = location.split('/');
      const tenantIndex = urlParts.indexOf('tenant');
      const routeParts = urlParts.slice(tenantIndex + 2); // Skip 'tenant' and tenantId
      const route = routeParts.join('/');

      switch (route) {
        case "":
        case "dashboard":
        case "customer-dashboard":
          componentToRender = <CustomerDashboard permissions={permissions} tenantName={tenantName} />;
          break;
        case "regulatory-updates":
        case "customer/regulatory-updates":
          componentToRender = <CustomerRegulatoryUpdates permissions={permissions} tenantName={tenantName} />;
          break;
        case "ai-insights":
        case "customer-ai-insights":
          componentToRender = <CustomerAIInsightsClean permissions={permissions} tenantName={tenantName} />;
          break;
        case "settings":
        case "customer-settings":
          componentToRender = <CustomerSettings permissions={permissions} tenantName={tenantName} />;
          break;
        case "legal-cases":
          componentToRender = <CustomerLegalCases permissions={permissions} tenantName={tenantName} />;
          break;
        case "knowledge-base":
          componentToRender = <CustomerKnowledgeBase permissions={permissions} tenantName={tenantName} />;
          break;
        case 'project-notebooks':
          componentToRender = <ProjectNotebooksList />;
          break;
        case `project-workbench/${routeParts[1]}`:
          componentToRender = <ProjectWorkbenchPage />;
          break;
        case "newsletters":
          componentToRender = <CustomerDashboard permissions={permissions} tenantName={tenantName} />; // Placeholder
          break;
        case "analytics":
          componentToRender = <CustomerDashboard permissions={permissions} tenantName={tenantName} />; // Placeholder
          break;
        case "advanced-analytics":
          componentToRender = <CustomerDashboard permissions={permissions} tenantName={tenantName} />; // Placeholder
          break;
        case "global-sources":
          componentToRender = <CustomerDashboard permissions={permissions} tenantName={tenantName} />; // Placeholder
          break;
        case "data-collection":
          componentToRender = <CustomerDashboard permissions={permissions} tenantName={tenantName} />; // Placeholder
          break;
        case "historical-data":
          componentToRender = <CustomerDashboard permissions={permissions} tenantName={tenantName} />; // Placeholder
          break;
        case "zulassungen-global":
        case "global-approvals":
          componentToRender = <ZulassungenGlobal permissions={permissions} tenantName={tenantName} />;
          break;
        case "laufende-zulassungen":
        case "ongoing-approvals":
          componentToRender = <LaufendeZulassungen permissions={permissions} tenantName={tenantName} />;
          break;
        default:
          componentToRender = <CustomerDashboard permissions={permissions} tenantName={tenantName} />;
      }
    } else {
      // Fallback for legacy routes or direct access
      componentToRender = <CustomerDashboard permissions={permissions} tenantName={tenantName} />;
    }

    setRenderedComponent(componentToRender);
    });
  }, [location, params.tenantId, permissions, tenantName]);

  return (
    <Suspense fallback={<LoadingFallback />}>
      {renderedComponent}
    </Suspense>
  );
}
