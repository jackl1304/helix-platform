import React, { useState, useEffect, useTransition } from "react";
import { Link, useLocation, useParams } from "wouter";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Button } from "@/components/ui/button";
import { useCustomerTheme } from "@/contexts/customer-theme-context";
import {
  LayoutDashboard,
  FileText,
  Scale,
  BookOpen,
  Mail,
  BarChart3,
  Settings,
  Building,
  Activity,
  Globe,
  Database,
  Users,
  Shield,
  Clipboard,
  Search,
  Brain,
  LogOut,
  MessageCircle,
  FileCheck
} from "lucide-react";

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

// Navigation item interface
interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  permission: keyof CustomerPermissions;
  description?: string;
}

// All possible navigation items with German names
const ALL_NAVIGATION_ITEMS: NavigationItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    permission: "dashboard",
    description: "Übersicht und aktuelle Statistiken"
  },
  {
    name: "Regulatory Intelligence",
    href: "/regulatory-updates",
    icon: FileText,
    permission: "regulatoryUpdates",
    description: "Regulatory Intelligence"
  },
  {
    name: "Rechtsprechung",
    href: "/legal-cases",
    icon: Scale,
    permission: "legalCases",
    description: "Rechtsprechung und Präzedenzfälle"
  },
  {
    name: "Wissensdatenbank",
    href: "/knowledge-base",
    icon: BookOpen,
    permission: "knowledgeBase",
    description: "Wissensdatenbank und Artikel"
  },
  {
    name: "Newsletter",
    href: "/newsletters",
    icon: Mail,
    permission: "newsletters",
    description: "Newsletter-Verwaltung"
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    permission: "analytics",
    description: "Datenanalyse und Berichte"
  },
  {
    name: "Erweiterte Analytics", 
    href: "/advanced-analytics",
    icon: Activity,
    permission: "advancedAnalytics",
    description: "Erweiterte Analysetools"
  },
  {
    name: "KI-Erkenntnisse",
    href: "/ai-insights",
    icon: Brain,
    permission: "aiInsights",
    description: "KI-gestützte Erkenntnisse"
  },
  {
    name: "Datenquellen-Verwaltung",
    href: "/global-sources",
    icon: Globe,
    permission: "globalSources",
    description: "Datenquellen-Verwaltung"
  },
  {
    name: "Datensammlung",
    href: "/data-collection", 
    icon: Database,
    permission: "dataCollection",
    description: "Datensammlung und -verwaltung"
  },
  {
    name: "Historische Daten",
    href: "/historical-data",
    icon: Clipboard,
    permission: "historicalData",
    description: "Historische Datenanalyse"
  },
  {
    name: "Projektmappe",
    href: "/project-notebook",
    icon: BookOpen,
    permission: "knowledgeBase",
    description: "Persönliche Projektsammlung"
  },
  {
    name: "Einstellungen",
    href: "/settings",
    icon: Settings,
    permission: "systemSettings",
    description: "Kundeneinstellungen"
  }
];

// Props interface
interface CustomerNavigationProps {
  permissions: CustomerPermissions;
  tenantName?: string;
  onPermissionsUpdate?: (newPermissions: CustomerPermissions) => void;
}

export default function CustomerNavigation({ permissions, tenantName, onPermissionsUpdate }: CustomerNavigationProps) {
  const [location, setLocation] = useLocation();
  const params = useParams();
  const [currentPermissions, setCurrentPermissions] = useState(permissions);
  const { themeSettings, getThemeColors } = useCustomerTheme();
  const colors = getThemeColors();
  const [isPending, startTransition] = useTransition();
  
  // Build tenant-specific URLs
  const buildTenantUrl = (path: string) => {
    if (params.tenantId) {
      return `/tenant/${params.tenantId}${path}`;
    }
    return path;
  };

  // Polling für Live-Updates der Berechtigungen (entkoppelt, ohne Flackern)
  useEffect(() => {
    if (!params.tenantId) return;

    let aborted = false;
    const isEqual = (a: any, b: any) => {
      try { return JSON.stringify(a) === JSON.stringify(b); } catch { return false; }
    };

    const pollPermissions = async () => {
      try {
        const res = await fetch(`/api/customer/tenant/${params.tenantId}`, { cache: 'no-store' });
        if (!res.ok) return;
        const tenantData = await res.json();
        const perms = tenantData?.customerPermissions;
        if (!aborted && perms && !isEqual(perms, currentPermissions)) {
          setCurrentPermissions(perms);
          onPermissionsUpdate?.(perms);
        }
      } catch (err) {
        // leise scheitern; kein UI-Flackern
      }
    };

    // Initial einmalig und danach nur selten aktualisieren
    pollPermissions();
    const interval = setInterval(pollPermissions, 60000); // 60s statt 5s, um Flackern zu vermeiden

    return () => { aborted = true; clearInterval(interval); };
  }, [params.tenantId, onPermissionsUpdate, currentPermissions]);

  // Filter navigation items based on current permissions
  const allowedItems = ALL_NAVIGATION_ITEMS.filter(item => 
    currentPermissions[item.permission]
  );

  const renderNavigationItem = (item: NavigationItem) => {
    const tenantUrl = buildTenantUrl(item.href);
    const isActive = location === tenantUrl || location === item.href;
    const IconComponent = item.icon;
    
    return (
      <button
        key={item.href}
        onClick={() => startTransition(() => setLocation(tenantUrl))}
        className={cn(
          "w-full flex items-center justify-start px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer group",
          isActive
            ? "bg-white/10 text-white shadow-md"
            : cn("text-white/80", colors.sidebarHover)
        )}
      >
        <IconComponent className={cn(
          "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
          isActive ? "text-white" : "text-white/70"
        )} />
        <div className="flex flex-col">
          <span className="text-left font-medium">{item.name}</span>
          {item.description && (
            <span className={cn(
              "text-xs text-left mt-0.5",
              isActive ? "text-white/80" : "text-white/70"
            )}>
              {item.description}
            </span>
          )}
        </div>
      </button>
    );
  };

  return (
    <div className={cn("fixed left-0 top-0 h-screen w-64 flex flex-col z-40 text-white", colors.sidebar)}>
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center space-x-3">
          {themeSettings.companyLogo ? (
            <img
              src={themeSettings.companyLogo}
              alt="Company Logo"
              className="w-8 h-8 rounded-lg object-cover"
            />
          ) : (
            <div className={cn("w-8 h-8 bg-gradient-to-r rounded-lg flex items-center justify-center text-white font-bold text-sm", colors.primary)}>
              {(themeSettings.companyName || tenantName)?.charAt(0) || 'H'}
            </div>
          )}
          <div>
            <h2 className="text-lg font-semibold text-white">
              {themeSettings.companyName || tenantName || "Customer Portal"}
            </h2>
            <p className="text-sm text-white/70">Regulatory Intelligence</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {allowedItems.length > 0 ? (
          allowedItems.map(renderNavigationItem)
        ) : (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 mx-auto text-white/60 mb-3" />
            <p className="text-sm text-white/80">
              Keine Berechtigung für Navigation
            </p>
          </div>
        )}
      </nav>

      {/* Footer with Logout and Chat */}
      <div className="p-4 border-t border-white/10 bg-white/5 space-y-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full" 
          onClick={() => window.open('/chat-support', '_blank')}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Support Chat
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full text-red-200 hover:text-white hover:bg-red-500/20" 
          onClick={() => window.location.href = '/login'}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Abmelden
        </Button>
        <p className="text-xs text-white/60 text-center mt-2">
          Powered by Helix Platform
        </p>
      </div>
    </div>
  );
}

// Export permission types for use in other components
export type { CustomerPermissions, NavigationItem };