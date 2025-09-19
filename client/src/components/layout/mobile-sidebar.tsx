import { useState } from "react";
import { Link, useLocation } from "wouter";
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
  Menu,
  X,
  Scale,
  Activity,
  Mail
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";
// Logo als SVG embedded
const logoPath = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzI1NjNlYiIvPgo8dGV4dCB4PSIyMCIgeT0iMjgiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5IPC90ZXh0Pgo8L3N2Zz4K";

const getNavigationItems = (t: (key: string) => string) => [
  { name: t('nav.dashboard'), href: "/", icon: BarChart3 },
  { name: t('nav.dataCollection'), href: "/data-collection", icon: Database },
  { name: t('nav.globalSources'), href: "/global-sources", icon: Globe },
  { name: t('nav.regulatoryUpdates'), href: "/regulatory-updates", icon: FileText },
  { name: t('mobile.approvalWorkflow'), href: "/approval-workflow", icon: CheckCircle },
  { name: t('nav.analytics'), href: "/analytics", icon: TrendingUp },
];

const getKnowledgeBaseItems = (t: (key: string) => string) => [
  { name: t('mobile.aiInsights'), href: "/ai-insights", icon: Brain },
  { name: t('mobile.customKnowledge'), href: "/knowledge-base", icon: Book },
  { name: t('mobile.historicalData'), href: "/historical-data", icon: Archive },
  { name: t('mobile.legalCases'), href: "/legal-cases", icon: Scale },
];

const getAdministrationItems = (t: (key: string) => string) => [
  { name: t('nav.userManagement'), href: "/user-management", icon: Users },
  { name: t('mobile.dataSourcesAdmin'), href: "/administration/data-sources", icon: Database },
  { name: t('nav.newsletterAdmin'), href: "/newsletter-admin", icon: Mail },
  { name: t('nav.systemAdmin'), href: "/system-settings", icon: Settings },
  { name: t('mobile.auditLogs'), href: "/audit-logs", icon: FileText },
];

export function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [location] = useLocation();
  const { t } = useLanguage();
  
  const navigation = getNavigationItems(t);
  const knowledgeBase = getKnowledgeBaseItems(t);
  const administration = getAdministrationItems(t);

  const renderNavItem = (item: any, isActive: boolean, onClose?: () => void) => (
    <Link key={item.name} href={item.href}>
      <div
        className={cn(
          "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors cursor-pointer",
          isActive
            ? "text-blue-600 bg-blue-50 border border-blue-200"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
        )}
        onClick={onClose}
      >
        <item.icon className={cn(
          "mr-3 h-5 w-5",
          isActive ? "text-blue-600" : "text-gray-400"
        )} />
        {item.name}
      </div>
    </Link>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <Link href="/">
          <div className="flex flex-col items-center cursor-pointer">
            <img 
              src={logoPath} 
              alt="Helix Logo" 
              className="h-10 w-10 rounded-lg object-cover"
            />
            <span className="text-xs font-medium text-gray-700 mt-1">{t('branding.appName')}</span>
          </div>
        </Link>
        
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <Menu className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent 
            align="end" 
            className="w-80 max-h-[80vh] overflow-y-auto"
            sideOffset={8}
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-col items-center">
                <img 
                  src={logoPath} 
                  alt="Helix Logo" 
                  className="h-12 w-12 rounded-lg object-cover mb-2"
                />
                <div className="text-sm font-medium text-gray-700">{t('branding.appName')}</div>
              </div>
            </div>

            {/* Main Navigation */}
            <DropdownMenuLabel className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {t('mobile.mainModules')}
            </DropdownMenuLabel>
            {navigation.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <DropdownMenuItem 
                    className={cn(
                      "flex items-center px-4 py-3 cursor-pointer",
                      isActive && "bg-blue-50 text-blue-600"
                    )}
                    onClick={() => setDropdownOpen(false)}
                  >
                    <item.icon className={cn(
                      "mr-3 h-4 w-4",
                      isActive ? "text-blue-600" : "text-gray-400"
                    )} />
                    {item.name}
                  </DropdownMenuItem>
                </Link>
              );
            })}

            <DropdownMenuSeparator />

            {/* Knowledge Base */}
            <DropdownMenuLabel className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {t('mobile.knowledgeBase')}
            </DropdownMenuLabel>
            {knowledgeBase.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <DropdownMenuItem 
                    className={cn(
                      "flex items-center px-4 py-3 cursor-pointer",
                      isActive && "bg-blue-50 text-blue-600"
                    )}
                    onClick={() => setDropdownOpen(false)}
                  >
                    <item.icon className={cn(
                      "mr-3 h-4 w-4",
                      isActive ? "text-blue-600" : "text-gray-400"
                    )} />
                    {item.name}
                  </DropdownMenuItem>
                </Link>
              );
            })}

            <DropdownMenuSeparator />

            {/* Administration */}
            <DropdownMenuLabel className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {t('mobile.administration')}
            </DropdownMenuLabel>
            {administration.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <DropdownMenuItem 
                    className={cn(
                      "flex items-center px-4 py-3 cursor-pointer",
                      isActive && "bg-blue-50 text-blue-600"
                    )}
                    onClick={() => setDropdownOpen(false)}
                  >
                    <item.icon className={cn(
                      "mr-3 h-4 w-4",
                      isActive ? "text-blue-600" : "text-gray-400"
                    )} />
                    {item.name}
                  </DropdownMenuItem>
                </Link>
              );
            })}

            {/* Footer */}
            <DropdownMenuSeparator />
            <div className="p-3 text-center">
              <div className="text-xs text-gray-500">
                <div className="font-medium">{t('branding.platformVersion')}</div>
                <div className="mt-1">{t('branding.copyright')}</div>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}