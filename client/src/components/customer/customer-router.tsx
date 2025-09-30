import { useLocation } from "wouter";
import { lazy, Suspense, useTransition, useEffect, useState } from "react";
import type { CustomerPermissions } from "@/components/customer/customer-navigation";

// Lazy load components to avoid circular dependencies
const CustomerDashboard = lazy(() => import("@/pages/customer-dashboard"));
const CustomerRegulatoryUpdates = lazy(() => import("@/pages/customer-regulatory-updates"));
const CustomerAIInsightsClean = lazy(() => import("@/pages/customer-ai-insights-clean"));
const CustomerSettings = lazy(() => import("@/pages/customer-settings"));
const CustomerLegalCases = lazy(() => import("@/pages/customer-legal-cases"));
const CustomerKnowledgeBase = lazy(() => import("@/pages/customer-knowledge-base"));
const ProjectNotebookPage = lazy(() => import("@/pages/project-notebook-page"));
const CustomerAnalytics = lazy(() => import("@/pages/customer-analytics"));
const CustomerNewsletters = lazy(() => import("@/pages/customer-newsletters"));
const ZulassungenGlobal = lazy(() => import("@/pages/zulassungen-global-new"));
const LaufendeZulassungen = lazy(() => import("@/pages/laufende-zulassungen"));

interface CustomerRouterProps {
  permissions: CustomerPermissions;
  tenantName?: string;
}

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
  </div>
);

export default function CustomerRouter({ permissions, tenantName }: CustomerRouterProps) {
  const [location] = useLocation();
  const [renderedComponent, setRenderedComponent] = useState<React.ReactNode>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(() => {
      let componentToRender: React.ReactNode = null;

      switch (location) {
        case '/':
        case '/dashboard':
          componentToRender = <CustomerDashboard permissions={permissions} tenantName={tenantName} />;
          break;
        case '/regulatory-updates':
          componentToRender = <CustomerRegulatoryUpdates />;
          break;
        case '/ai-insights':
          componentToRender = <CustomerAIInsightsClean />;
          break;
        case '/settings':
          componentToRender = <CustomerSettings />;
          break;
        case '/legal-cases':
          componentToRender = <CustomerLegalCases />;
          break;
        case '/knowledge-base':
          componentToRender = <CustomerKnowledgeBase />;
          break;
        case '/notebooks':
          componentToRender = <ProjectNotebookPage />;
          break;
        case '/analytics':
          componentToRender = <CustomerAnalytics />;
          break;
        case '/newsletters':
          componentToRender = <CustomerNewsletters />;
          break;
        case '/zulassungen-global':
          componentToRender = <ZulassungenGlobal />;
          break;
        case '/laufende-zulassungen':
          componentToRender = <LaufendeZulassungen />;
          break;
        default:
          componentToRender = <CustomerDashboard permissions={permissions} tenantName={tenantName} />;
      }

      setRenderedComponent(componentToRender);
    });
  }, [location]);

  return (
    <Suspense fallback={<LoadingFallback />}>
      {isPending ? <LoadingFallback /> : renderedComponent}
    </Suspense>
  );
}