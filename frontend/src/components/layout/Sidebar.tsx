/**
 * MedTech Data Platform - Sidebar Component
 * Hauptnavigation mit hierarchischer Struktur und globalen Zulassungen
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../utils/cn';
import {
  BarChart3,
  Database,
  Globe,
  FileText,
  Newspaper,
  CheckCircle,
  TrendingUp,
  Brain,
  Book,
  Users,
  Settings,
  Archive,
  Shield,
  Search,
  RefreshCw,
  Scale,
  FileSearch,
  ChevronDown,
  ChevronRight,
  Mail,
  Bot,
  Sparkles,
  Building,
  MessageCircle,
  Activity,
  Clock,
  AlertTriangle,
  Star,
  Filter,
  Download,
  Upload,
  Zap,
  Target,
  Award,
  Flag
} from 'lucide-react';

import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: NavigationItem[];
  permissions?: string[];
}

interface NavigationSection {
  title: string;
  items: NavigationItem[];
  defaultOpen?: boolean;
}

/**
 * Sidebar Component
 * 
 * Features:
 * - Hierarchische Navigation
 * - Rechtebasierte Sichtbarkeit
 * - Kollapsible Sektionen
 * - Global Approvals Sidebar
 * - Responsive Design
 * - Aktivitätsindikatoren
 */
export function Sidebar(): JSX.Element {
  const location = useLocation();
  const { user } = useAuth();
  const { settings, updateSetting } = useSettings();
  
  // State für kollapsible Sektionen
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    dashboard: true,
    approvals: true,
    data: true,
    analytics: false,
    administration: false
  });

  // Navigation Structure
  const getNavigationStructure = (): Record<string, NavigationSection> => ({
    dashboard: {
      title: 'Dashboard',
      items: [
        { name: 'Übersicht', href: '/', icon: BarChart3 },
        { name: 'Aktivitäten', href: '/activities', icon: Activity },
        { name: 'Benachrichtigungen', href: '/notifications', icon: Bell }
      ],
      defaultOpen: true
    },

    approvals: {
      title: 'Zulassungen & Registrierungen',
      items: [
        { 
          name: 'Alle Zulassungen', 
          href: '/approvals', 
          icon: CheckCircle,
          badge: '400+'
        },
        { 
          name: 'FDA Zulassungen', 
          href: '/approvals?filter=fda', 
          icon: Flag,
          badge: 'USA'
        },
        { 
          name: 'CE Markierungen', 
          href: '/approvals?filter=ce', 
          icon: Scale,
          badge: 'EU'
        },
        { 
          name: 'BfArM Zulassungen', 
          href: '/approvals?filter=bfarm', 
          icon: Building,
          badge: 'DE'
        },
        { 
          name: 'Neue Zulassungen', 
          href: '/approvals?filter=recent', 
          icon: Sparkles,
          badge: 'Neu'
        },
        { 
          name: 'Ausstehende', 
          href: '/approvals?filter=pending', 
          icon: Clock,
          badge: '⏳'
        },
        { 
          name: 'Abgelaufene', 
          href: '/approvals?filter=expired', 
          icon: AlertTriangle,
          badge: '⚠️'
        }
      ],
      defaultOpen: true
    },

    data: {
      title: 'Datenquellen',
      items: [
        { 
          name: 'Alle Quellen', 
          href: '/data-sources', 
          icon: Database,
          badge: '400+'
        },
        { 
          name: 'FDA Quellen', 
          href: '/data-sources?filter=fda', 
          icon: Flag
        },
        { 
          name: 'EMA Quellen', 
          href: '/data-sources?filter=ema', 
          icon: Globe
        },
        { 
          name: 'Regulatorische Updates', 
          href: '/regulatory-updates', 
          icon: Newspaper,
          badge: 'Live'
        },
        { 
          name: 'Synchronisation', 
          href: '/sync', 
          icon: RefreshCw
        },
        { 
          name: 'Import/Export', 
          href: '/import-export', 
          icon: Upload
        }
      ],
      defaultOpen: true
    },

    analytics: {
      title: 'Analytics & Berichte',
      items: [
        { 
          name: 'Dashboard Analytics', 
          href: '/analytics', 
          icon: BarChart3
        },
        { 
          name: 'Marktanalyse', 
          href: '/analytics/market', 
          icon: TrendingUp
        },
        { 
          name: 'Compliance Tracking', 
          href: '/analytics/compliance', 
          icon: Shield
        },
        { 
          name: 'Performance Metrics', 
          href: '/analytics/performance', 
          icon: Target
        },
        { 
          name: 'Export Berichte', 
          href: '/analytics/reports', 
          icon: Download
        }
      ],
      defaultOpen: false
    },

    administration: {
      title: 'Administration',
      items: [
        { 
          name: 'Benutzer', 
          href: '/users', 
          icon: Users,
          permissions: ['admin']
        },
        { 
          name: 'Rollen & Rechte', 
          href: '/roles', 
          icon: Shield,
          permissions: ['admin']
        },
        { 
          name: 'Systemeinstellungen', 
          href: '/settings', 
          icon: Settings
        },
        { 
          name: 'API Verwaltung', 
          href: '/api-management', 
          icon: Bot,
          permissions: ['admin']
        },
        { 
          name: 'Audit Log', 
          href: '/audit-log', 
          icon: Archive,
          permissions: ['admin']
        }
      ],
      defaultOpen: false
    }
  });

  // Toggle Section
  const toggleSection = (sectionKey: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  // Check if user has permission
  const hasPermission = (permissions?: string[]): boolean => {
    if (!permissions) return true;
    if (!user) return false;
    return permissions.some(permission => user.permissions?.includes(permission));
  };

  // Check if item is active
  const isActive = (href: string): boolean => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  // Navigation Structure
  const navigation = getNavigationStructure();

  return (
    <div className="flex flex-col h-full bg-card border-r">
      {/* Logo and Title */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg">MedTech Data</h1>
            <p className="text-xs text-muted-foreground">Platform v1.0</p>
          </div>
        </div>
      </div>

      {/* Global Approvals Toggle */}
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">Global Approvals</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => updateSetting('showGlobalApprovals', !settings.showGlobalApprovals)}
            className="h-6 w-6 p-0"
          >
            {settings.showGlobalApprovals ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
        </div>
        
        {settings.showGlobalApprovals && (
          <div className="mt-3 space-y-2">
            <div className="text-xs text-muted-foreground mb-2">Live Updates:</div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span>FDA 510(k)</span>
                <Badge variant="outline" className="text-xs">+12 heute</Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>CE Marks</span>
                <Badge variant="outline" className="text-xs">+8 heute</Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>BfArM</span>
                <Badge variant="outline" className="text-xs">+3 heute</Badge>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {Object.entries(navigation).map(([sectionKey, section]) => (
            <div key={sectionKey}>
              <Collapsible
                open={openSections[sectionKey]}
                onOpenChange={() => toggleSection(sectionKey)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-2 h-auto"
                  >
                    <span className="font-medium text-sm">{section.title}</span>
                    {openSections[sectionKey] ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="space-y-1 mt-2">
                  {section.items
                    .filter(item => hasPermission(item.permissions))
                    .map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                          "hover:bg-accent hover:text-accent-foreground",
                          isActive(item.href) && "bg-accent text-accent-foreground"
                        )}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        <span className="flex-1 truncate">{item.name}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    ))}
                </CollapsibleContent>
              </Collapsible>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Activity className="h-3 w-3" />
          <span>Alle Systeme betriebsbereit</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          <Database className="h-3 w-3" />
          <span>400+ Quellen aktiv</span>
        </div>
      </div>
    </div>
  );
}
