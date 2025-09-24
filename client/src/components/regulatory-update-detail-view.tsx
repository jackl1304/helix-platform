import React, { useState } from 'react';
import { SafeText } from '../utils/safe-render';
import { safeArray } from '@/utils/array-safety';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Download, 
  ExternalLink, 
  Calendar, 
  Building, 
  Globe, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Tag,
  Star,
  Info,
  File,
  Link as LinkIcon,
  ChevronDown,
  ChevronRight,
  Users,
  Target,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface EnrichedRegulatoryUpdate {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  published_at: string;
  created_at: string;
  authority: string;
  region: string;
  priority: string;
  language: string;
  source: string;
  url: string;
  fullText: string;
  attachments: string[];
  relatedUpdates: string[];
  detailedAnalysis: {
    keyChanges: string;
    implementationTimeline: string;
    affectedProducts: string[];
    complianceActions: string[];
    industryImpact: string;
  };
  metadata: {
    source: string;
    lastUpdated: string;
    confidence: number;
    verificationStatus: string;
  };
}

interface RegulatoryUpdateDetailViewProps {
  update: EnrichedRegulatoryUpdate;
}

export function RegulatoryUpdateDetailView({ update }: RegulatoryUpdateDetailViewProps) {
  const { t } = useLanguage();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatConfidence = (confidence: number) => {
    return `${Math.round(confidence * 100)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{update.title}</CardTitle>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline">{update.category.replace(/_/g, ' ').toUpperCase()}</Badge>
                <Badge variant="outline" className={getPriorityColor(update.priority)}>
                  <Star className="h-3 w-3 mr-1" />
                  {update.priority.charAt(0).toUpperCase() + update.priority.slice(1)} Priority
                </Badge>
                <Badge variant="secondary">{update.language.toUpperCase()}</Badge>
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed">
                <SafeText value={update.content} />
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href={update.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Source
                </a>
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Metadata Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Metadata & Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Authority:</span>
              <span>{update.authority}</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Region:</span>
              <span>{update.region}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Confidence:</span>
              <span className={update.metadata.confidence > 0.8 ? 'text-green-600' : 'text-yellow-600'}>
                {formatConfidence(update.metadata.confidence)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="font-medium">Status:</span>
              <span className="capitalize">{update.metadata.verificationStatus}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Published:</span>
              <span>{formatDate(update.published_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Last Updated:</span>
              <span>{formatDate(update.metadata.lastUpdated)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analysis">Impact Analysis</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="full-text">Full Text</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Key Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Source</h4>
                  <p><SafeText value={update.source} /></p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Category</h4>
                  <p className="capitalize">{update.category.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Published Date</h4>
                  <p>{formatDate(update.published_at)}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Language</h4>
                  <p className="uppercase">{update.language}</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-semibold mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {safeArray<string>(update.tags).map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Key Changes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  <SafeText value={update.detailedAnalysis.keyChanges} />
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Implementation Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  <SafeText value={update.detailedAnalysis.implementationTimeline} />
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Affected Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {update.detailedAnalysis.affectedProducts.map((product, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>{product}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Industry Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  <SafeText value={update.detailedAnalysis.industryImpact} />
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attachments</CardTitle>
            </CardHeader>
            <CardContent>
                  {Array.isArray(update.attachments) && update.attachments.length > 0 ? (
                <div className="space-y-2">
                  {update.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <File className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{attachment}</span>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No attachments available</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Related Updates</CardTitle>
            </CardHeader>
            <CardContent>
                  {Array.isArray(update.relatedUpdates) && update.relatedUpdates.length > 0 ? (
                <div className="space-y-2">
                  {update.relatedUpdates.map((relatedUpdate, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <LinkIcon className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{relatedUpdate}</span>
                      </div>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No related updates available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="full-text" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Complete Document Text</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 w-full">
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                    <SafeText value={update.fullText} />
                  </p>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Required Compliance Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {safeArray<string>(update.detailedAnalysis.complianceActions).map((action, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium">{action}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Implementation Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {safeArray<string>(update.detailedAnalysis.complianceActions).map((action, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <input
                      type="checkbox"
                      id={`action-${index}`}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <label htmlFor={`action-${index}`} className="flex-1 cursor-pointer">
                      {action}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
