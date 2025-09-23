import React, { useState } from 'react';
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
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface EnrichedApproval {
  id: string;
  title: string;
  type: string;
  status: string;
  region: string;
  authority: string;
  applicant: string;
  deviceClass: string;
  submittedDate: string;
  decisionDate?: string;
  summary: string;
  priority: string;
  category: string;
  tags: string[];
  url: string;
  fullText: string;
  attachments: string[];
  relatedDocuments: string[];
  detailedAnalysis: {
    riskAssessment: string;
    clinicalData: string;
    regulatoryPathway: string;
    marketImpact: string;
    complianceRequirements: string[];
  };
  metadata: {
    source: string;
    lastUpdated: string;
    confidence: number;
    verificationStatus: string;
  };
}

interface ApprovalDetailViewProps {
  approval: EnrichedApproval;
}

export function ApprovalDetailView({ approval }: ApprovalDetailViewProps) {
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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'pending':
      case 'submitted':
        return 'secondary';
      case 'rejected':
      case 'withdrawn':
        return 'destructive';
      default:
        return 'outline';
    }
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
              <CardTitle className="text-2xl mb-2">{approval.title}</CardTitle>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant={getStatusBadgeVariant(approval.status)}>
                  {approval.status.charAt(0).toUpperCase() + approval.status.slice(1)}
                </Badge>
                <Badge variant="outline">{approval.type.toUpperCase()}</Badge>
                <Badge variant="outline" className={getPriorityColor(approval.priority)}>
                  <Star className="h-3 w-3 mr-1" />
                  {approval.priority.charAt(0).toUpperCase() + approval.priority.slice(1)} Priority
                </Badge>
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {approval.summary}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href={approval.url} target="_blank" rel="noopener noreferrer">
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
              <span>{approval.authority}</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Region:</span>
              <span>{approval.region}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Confidence:</span>
              <span className={approval.metadata.confidence > 0.8 ? 'text-green-600' : 'text-yellow-600'}>
                {formatConfidence(approval.metadata.confidence)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="font-medium">Status:</span>
              <span className="capitalize">{approval.metadata.verificationStatus}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Last Updated:</span>
              <span>{formatDate(approval.metadata.lastUpdated)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Device Class:</span>
              <span>{approval.deviceClass}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="full-text">Full Text</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Key Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Applicant</h4>
                  <p>{approval.applicant}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Category</h4>
                  <p className="capitalize">{approval.category}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Submitted Date</h4>
                  <p>{formatDate(approval.submittedDate)}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Decision Date</h4>
                  <p>{approval.decisionDate ? formatDate(approval.decisionDate) : 'Pending'}</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-semibold mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {approval.tags.map((tag, index) => (
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
            {Object.entries(approval.detailedAnalysis).map(([key, value]) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSection(key)}
                    >
                      {expandedSections.has(key) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </CardTitle>
                </CardHeader>
                {expandedSections.has(key) && (
                  <CardContent>
                    {Array.isArray(value) ? (
                      <ul className="space-y-2">
                        {value.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground leading-relaxed">
                        {value}
                      </p>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attachments</CardTitle>
            </CardHeader>
            <CardContent>
              {approval.attachments.length > 0 ? (
                <div className="space-y-2">
                  {approval.attachments.map((attachment, index) => (
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
              <CardTitle>Related Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {approval.relatedDocuments.length > 0 ? (
                <div className="space-y-2">
                  {approval.relatedDocuments.map((document, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <LinkIcon className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{document}</span>
                      </div>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No related documents available</p>
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
                    {approval.fullText}
                  </p>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Regulatory Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <div>
                    <h4 className="font-semibold">Application Submitted</h4>
                    <p className="text-muted-foreground">{formatDate(approval.submittedDate)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                  <div>
                    <h4 className="font-semibold">Under Review</h4>
                    <p className="text-muted-foreground">In progress</p>
                  </div>
                </div>
                
                {approval.decisionDate && (
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    <div>
                      <h4 className="font-semibold">Decision Made</h4>
                      <p className="text-muted-foreground">{formatDate(approval.decisionDate)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
