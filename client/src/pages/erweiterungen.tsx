import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  MessageCircle, 
  Clock, 
  User, 
  MapPin, 
  Star, 
  Bug, 
  Lightbulb, 
  AlertTriangle, 
  MessageSquare,
  CheckCircle,
  Eye,
  Calendar,
  Filter,
  Database,
  Globe,
  BookOpen,
  FileText,
  Scale,
  Zap,
  Settings
} from 'lucide-react';

interface Feedback {
  id: string;
  user_name: string;
  message: string;
  type: 'verbesserung' | 'kritik' | 'bug' | 'feature' | 'error' | 'general';
  title: string;
  status: 'new' | 'in_progress' | 'resolved' | 'closed' | 'gelesen' | 'diskutiert' | 'umgesetzt';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  page: string;
  created_at: string;
  updated_at: string;
}

// Helper functions for feedback display
const getFeedbackIcon = (type: string) => {
  switch (type) {
    case 'verbesserung': return { icon: Star, color: 'text-blue-600', bg: 'bg-blue-50' };
    case 'kritik': return { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' };
    case 'bug': return { icon: Bug, color: 'text-red-600', bg: 'bg-red-50' };
    case 'feature': return { icon: Lightbulb, color: 'text-yellow-600', bg: 'bg-yellow-50' };
    case 'error': return { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' };
    default: return { icon: MessageSquare, color: 'text-gray-600', bg: 'bg-gray-50' };
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'new': return { label: 'Neu', variant: 'destructive' as const, icon: Clock };
    case 'in_progress': return { label: 'In Bearbeitung', variant: 'default' as const, icon: Eye };
    case 'resolved': return { label: 'Gelöst', variant: 'secondary' as const, icon: CheckCircle };
    case 'closed': return { label: 'Geschlossen', variant: 'outline' as const, icon: CheckCircle };
    case 'gelesen': return { label: 'Gelesen', variant: 'secondary' as const, icon: Eye };
    case 'diskutiert': return { label: 'Diskutiert', variant: 'default' as const, icon: MessageCircle };
    case 'umgesetzt': return { label: 'Umgesetzt', variant: 'secondary' as const, icon: CheckCircle };
    default: return { label: 'Unbekannt', variant: 'outline' as const, icon: Clock };
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'urgent': return { label: 'Dringend', variant: 'destructive' as const };
    case 'high': return { label: 'Hoch', variant: 'default' as const };
    case 'medium': return { label: 'Mittel', variant: 'secondary' as const };
    case 'low': return { label: 'Niedrig', variant: 'outline' as const };
    default: return { label: 'Mittel', variant: 'secondary' as const };
  }
};

const getFeedbackTypeLabel = (type: string) => {
  switch (type) {
    case 'verbesserung': return 'Verbesserung';
    case 'kritik': return 'Kritik';
    case 'bug': return 'Bug Report';
    case 'feature': return 'Feature-Wunsch';
    case 'error': return 'Fehler';
    default: return 'Allgemein';
  }
};

export default function ErweiterungenPage() {
  const { t } = useLanguage();
  const { data: feedbackData, isLoading, error } = useQuery({
    queryKey: ['/api/feedback'],
    queryFn: async () => {
      const response = await fetch('/api/feedback');
      if (!response.ok) throw new Error('Failed to fetch feedback');
      return response.json();
    }
  });

  const feedback: Feedback[] = feedbackData?.feedback || [];

  // Filter and sort feedback
  const newFeedback = feedback.filter(f => f.status === 'new');
  const gelesenfeedback = feedback.filter(f => f.status === 'gelesen');
  const diskutiertFeedback = feedback.filter(f => f.status === 'diskutiert');
  const umgesetztFeedback = feedback.filter(f => f.status === 'umgesetzt');
  const resolvedFeedback = feedback.filter(f => f.status === 'resolved' || f.status === 'closed');

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/feedback/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        // Trigger a refetch
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const deleteFeedback = async (id: string) => {
    if (!confirm('Möchten Sie dieses Feedback wirklich löschen?')) return;
    
    try {
      const response = await fetch(`/api/feedback/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to delete feedback:', error);
    }
  };

  const FeedbackCard = ({ item }: { item: Feedback }) => {
    const typeInfo = getFeedbackIcon(item.type);
    const statusInfo = getStatusBadge(item.status);
    const priorityInfo = getPriorityBadge(item.priority || 'medium');
    const IconComponent = typeInfo.icon;
    const StatusIcon = statusInfo.icon;

    // Parse created_at safely
    let timeAgo = 'Unbekannt';
    try {
      const date = new Date(item.created_at);
      timeAgo = formatDistanceToNow(date, { 
        addSuffix: true, 
        locale: de 
      });
    } catch (e) {
      // Fallback for invalid dates
      timeAgo = 'Vor einiger Zeit';
    }

    return (
      <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${typeInfo.bg}`}>
                <IconComponent className={`h-5 w-5 ${typeInfo.color}`} />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {getFeedbackTypeLabel(item.type)}
                </CardTitle>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span className="font-medium">{item.user_name || 'Anonym'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{timeAgo}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span className="font-mono text-xs">{item.page}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={priorityInfo.variant}>
                {priorityInfo.label}
              </Badge>
              <Badge variant={statusInfo.variant} className="flex items-center gap-1">
                <StatusIcon className="h-3 w-3" />
                {statusInfo.label}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-l-gray-300">
              <p className="text-gray-800 leading-relaxed">{item.message}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {item.status === 'new' && (
                <>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => updateStatus(item.id, 'gelesen')}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Gelesen ✓
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => updateStatus(item.id, 'diskutiert')}
                    className="bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200"
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Diskutiert ✓
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => updateStatus(item.id, 'umgesetzt')}
                    className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Umgesetzt ✓
                  </Button>
                </>
              )}
              
              {(item.status === 'gelesen' || item.status === 'diskutiert') && (
                <>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => updateStatus(item.id, 'diskutiert')}
                    className="bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200"
                    disabled={item.status === 'diskutiert'}
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Diskutiert ✓
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => updateStatus(item.id, 'umgesetzt')}
                    className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Umgesetzt ✓
                  </Button>
                </>
              )}
              
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => deleteFeedback(item.id)}
                className="ml-auto"
              >
                🗑️ Löschen
              </Button>
            </div>

            <div className="text-xs text-gray-500 pt-2 border-t">
              📅 Eingegangen: {new Date(item.created_at).toLocaleDateString('de-DE', {
                day: '2-digit',
                month: '2-digit', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200">
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Fehler beim Laden</h3>
              <p>Das Feedback konnte nicht geladen werden. Bitte versuchen Sie es später erneut.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <MessageCircle className="h-8 w-8 text-blue-600" />
            {t('extensions.title')}
          </h1>
          <p className="text-gray-600 mt-2">
            {t('extensions.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            📊 {t('extensions.totalEntries').replace('{count}', feedback.length.toString())}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-700">{newFeedback.length}</p>
                <p className="text-sm text-red-600">{t('extensions.new')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Eye className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-700">{gelesenfeedback.length}</p>
                <p className="text-sm text-blue-600">{t('extensions.read')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-orange-700">{diskutiertFeedback.length}</p>
                <p className="text-sm text-orange-600">{t('extensions.discussed')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-700">{umgesetztFeedback.length}</p>
                <p className="text-sm text-green-600">{t('extensions.implemented')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-gray-600" />
              <div>
                <p className="text-2xl font-bold text-gray-700">{resolvedFeedback.length}</p>
                <p className="text-sm text-gray-600">Alt (System)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Filter className="h-8 w-8 text-slate-600" />
              <div>
                <p className="text-2xl font-bold text-slate-700">{feedback.length}</p>
                <p className="text-sm text-slate-600">Gesamt</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback Tabs */}
      <Tabs defaultValue="new" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="new" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Neu ({newFeedback.length})
          </TabsTrigger>
          <TabsTrigger value="gelesen" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Gelesen ({gelesenfeedback.length})
          </TabsTrigger>
          <TabsTrigger value="diskutiert" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Diskutiert ({diskutiertFeedback.length})
          </TabsTrigger>
          <TabsTrigger value="umgesetzt" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Umgesetzt ({umgesetztFeedback.length})
          </TabsTrigger>
          <TabsTrigger value="resolved" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Alt ({resolvedFeedback.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Alle ({feedback.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="space-y-4 mt-6">
          <div className="text-sm text-gray-600 mb-4">
            ⚡ Neue Anmerkungen, die Ihre Aufmerksamkeit benötigen
          </div>
          {newFeedback.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Perfekt!</h3>
                <p className="text-gray-600">Alle Anmerkungen wurden bearbeitet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {newFeedback.map((item) => (
                <FeedbackCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="gelesen" className="space-y-4 mt-6">
          <div className="text-sm text-gray-600 mb-4">
            👁️ Anmerkungen, die bereits gelesen wurden
          </div>
          {gelesenfeedback.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine gelesenen Anmerkungen</h3>
                <p className="text-gray-600">Hier erscheinen gelesene Anmerkungen.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {gelesenfeedback.map((item) => (
                <FeedbackCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="diskutiert" className="space-y-4 mt-6">
          <div className="text-sm text-gray-600 mb-4">
            💬 Anmerkungen, die diskutiert wurden
          </div>
          {diskutiertFeedback.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine diskutierten Anmerkungen</h3>
                <p className="text-gray-600">Hier erscheinen diskutierte Anmerkungen.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {diskutiertFeedback.map((item) => (
                <FeedbackCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="umgesetzt" className="space-y-4 mt-6">
          <div className="text-sm text-gray-600 mb-4">
            ✅ Anmerkungen, die erfolgreich umgesetzt wurden
          </div>
          {umgesetztFeedback.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine umgesetzten Anmerkungen</h3>
                <p className="text-gray-600">Hier erscheinen umgesetzte Anmerkungen.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {umgesetztFeedback.map((item) => (
                <FeedbackCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4 mt-6">
          <div className="text-sm text-gray-600 mb-4">
            🗂️ Alte System-Stati (resolved/closed) - vor der neuen Kategorisierung
          </div>
          {resolvedFeedback.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Noch keine gelösten Anmerkungen</h3>
                <p className="text-gray-600">Bearbeitete Anmerkungen erscheinen hier.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {resolvedFeedback.map((item) => (
                <FeedbackCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4 mt-6">
          <div className="text-sm text-gray-600 mb-4">
            📋 Vollständige Übersicht aller eingegangenen Anmerkungen
          </div>
          {feedback.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Noch keine Anmerkungen</h3>
                <p className="text-gray-600">Feedback von Benutzern wird hier angezeigt.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {feedback
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((item) => (
                  <FeedbackCard key={item.id} item={item} />
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Datenquellen-Übersicht */}
      <div className="mt-12 space-y-6">
        <div className="border-t pt-8">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-6">
            <Database className="h-7 w-7 text-blue-600" />
            {t('extensions.dataSourcesOverview')}
          </h2>
          <p className="text-gray-600 mb-8">
            {t('extensions.completeMapping')}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Regulatory Updates */}
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-blue-800">
                  <Globe className="h-6 w-6" />
                  {t('extensions.regulatoryUpdates').replace('{count}', '69')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-white text-blue-700">FDA 510(k)</Badge>
                    <span className="text-sm text-gray-600">fda_510k</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-white text-blue-700">GRIP Platform</Badge>
                    <span className="text-sm text-gray-600">grip_platform</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-white text-blue-700">PMDA Japan</Badge>
                    <span className="text-sm text-gray-600">pmda_japan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-white text-blue-700">ANSM France</Badge>
                    <span className="text-sm text-gray-600">ansm_france</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Knowledge & Content */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-green-800">
                  <BookOpen className="h-6 w-6" />
                  {t('extensions.knowledgeContent').replace('{count}', '94')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-3 mb-3">
                    <Badge variant="outline" className="bg-white text-green-700">Articles: 10</Badge>
                    <Badge variant="outline" className="bg-white text-green-700">Knowledge Base: 84</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="bg-white text-green-700">FDA</Badge>
                      <Badge variant="outline" className="bg-white text-green-700">European Commission</Badge>
                      <Badge variant="outline" className="bg-white text-green-700">ISO</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="bg-white text-green-700">BfArM</Badge>
                      <Badge variant="outline" className="bg-white text-green-700">IMDRF</Badge>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 pt-2 border-t">
                    Behörden: FDA, BfArM, EU-Kommission • Standards: ISO, IMDRF
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Legal Cases */}
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-orange-800">
                  <Scale className="h-6 w-6" />
                  {t('extensions.legalCases').replace('{count}', '65')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-white text-orange-700">European Court of Justice</Badge>
                    <span className="text-sm text-gray-600">EU-Gerichtshof</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-white text-orange-700">EU General Court</Badge>
                    <span className="text-sm text-gray-600">EU-Gericht</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-white text-orange-700">German Federal Administrative Court</Badge>
                    <span className="text-sm text-gray-600">Bundesverwaltungsgericht</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-white text-orange-700">Swiss Federal Court</Badge>
                    <span className="text-sm text-gray-600">Bundesgericht Schweiz</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-white text-orange-700">International Court of Arbitration</Badge>
                    <span className="text-sm text-gray-600">Internationales Schiedsgericht</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technical & System Data */}
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-purple-800">
                  <Zap className="h-6 w-6" />
                  {t('extensions.technicalSystemData').replace('{count}', '1.328')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-3">
                    <Badge variant="outline" className="bg-white text-purple-700">Analytics: 1.054</Badge>
                    <Badge variant="outline" className="bg-white text-purple-700">Approvals: 156</Badge>
                    <Badge variant="outline" className="bg-white text-purple-700">Data Sources: 70</Badge>
                    <Badge variant="outline" className="bg-white text-purple-700">Standards: 6</Badge>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Badge variant="outline" className="bg-white text-purple-700">Newsletter Sources: 7</Badge>
                    <Badge variant="outline" className="bg-white text-purple-700">Newsletters: 4</Badge>
                    <Badge variant="outline" className="bg-white text-purple-700">Categories: 7</Badge>
                    <Badge variant="outline" className="bg-white text-purple-700">Publishers: 5</Badge>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Badge variant="outline" className="bg-white text-purple-700">Subscribers: 7</Badge>
                    <Badge variant="outline" className="bg-white text-purple-700">Tenants: 4</Badge>
                    <Badge variant="outline" className="bg-white text-purple-700">Users: 3</Badge>
                    <Badge variant="outline" className="bg-white text-purple-700">Feedback: 4</Badge>
                  </div>
                  <div className="text-xs text-gray-600 pt-2 border-t">
                    <strong>Analytics:</strong> Real-time Tracking, Live User-Aktivität<br/>
                    <strong>System:</strong> Multi-Tenant-Architektur, Benutzer-Management
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gesamt-Statistik */}
          <Card className="mt-6 border-2 border-dashed border-gray-300 bg-gray-50">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Settings className="h-8 w-8 text-gray-600" />
                  <h3 className="text-xl font-bold text-gray-800">{t('extensions.totalDataStock')}</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm border-2 border-blue-200">
                    <p className="text-3xl font-bold text-blue-600">1.558</p>
                    <p className="text-sm text-gray-600">{t('extensions.totalRecords')}</p>
                    <p className="text-xs text-blue-500">{t('extensions.moreDiscovered').replace('{count}', '+596')}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border-2 border-green-200">
                    <p className="text-3xl font-bold text-green-600">18</p>
                    <p className="text-sm text-gray-600">{t('extensions.databaseTables')}</p>
                    <p className="text-xs text-green-500">{t('extensions.allCaptured')}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border-2 border-orange-200">
                    <p className="text-3xl font-bold text-orange-600">100%</p>
                    <p className="text-sm text-gray-600">{t('extensions.transmissionRate')}</p>
                    <p className="text-xs text-orange-500">{t('extensions.complete')}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border-2 border-purple-200">
                    <p className="text-3xl font-bold text-purple-600">15+</p>
                    <p className="text-sm text-gray-600">{t('extensions.apiEndpoints')}</p>
                    <p className="text-xs text-purple-500">{t('extensions.allActive')}</p>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border">
                  <p className="text-sm text-gray-700 text-center">
                    <strong className="text-blue-600">{t('extensions.corrected')}</strong> • <strong>1.558 {t('extensions.totalRecords')}</strong> (nicht 962+!) • 
                    <strong className="text-green-600">Website Analytics:</strong> 1.054 Einträge • <strong className="text-purple-600">Knowledge Base:</strong> 84 zusätzliche Einträge entdeckt
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}