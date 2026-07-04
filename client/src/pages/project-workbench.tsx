import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangleIcon, Info, CheckCircle, Clock, AlertCircle, ExternalLink, Shield, Activity, TrendingUp, Download } from 'lucide-react';

// API Calls
const fetchProjectDetails = async (id: string, tenantId: string) => {
  const response = await fetch(`/api/project-notebook/entries/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch project notebook details');
  }
  return response.json();
};

const fetchFDAData = async () => {
  const response = await fetch('/api/fda/all');
  if (!response.ok) {
    throw new Error('Failed to fetch FDA data');
  }
  const result = await response.json();
  return result.data || { approvals: [], events: [], recalls: [] };
};

// FDA Project Matching Logic
const findFDAApprovalForProject = (projectName: string, fdaApprovals: any[]) => {
  const lowerCaseProjectName = projectName.toLowerCase();
  return fdaApprovals.find(approval =>
    lowerCaseProjectName.includes(approval.product_name.toLowerCase()) ||
    lowerCaseProjectName.includes(approval.device_name.toLowerCase())
  );
};

const findFDARecallsForProject = (projectName: string, fdaRecalls: any[]) => {
  const lowerCaseProjectName = projectName.toLowerCase();
  return fdaRecalls.filter(recall =>
    lowerCaseProjectName.includes(recall.product_description.toLowerCase()) ||
    lowerCaseProjectName.includes(recall.manufacturer_name.toLowerCase())
  );
};

// Helper for FDA Status Badge
const getFDAStatusBadge = (approval: any) => {
  if (!approval) return null;
  const status = approval.submission_status;
  const submissionType = approval.submission_type;

  if (status === 'Cleared' || status === 'Approved') {
    return (
      <Badge className="bg-green-100 text-green-800 border-green-200">
        <CheckCircle className="h-3 w-3 mr-1" />
        FDA {submissionType} Cleared
      </Badge>
    );
  }
  if (status === 'Under Review') {
    return (
      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
        <Clock className="h-3 w-3 mr-1" />
        FDA {submissionType} Under Review
      </Badge>
    );
  }
  return (
    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
      <Shield className="h-3 w-3 mr-1" />
      FDA {submissionType} {status}
    </Badge>
  );
};

export default function ProjectWorkbenchPage() {
  const params = useParams();
  const id = params.id as string;
  const tenantId = params.tenantId as string || 'demo-medical-tech';

  // Project Details Query
  const { data: project, isLoading, isError, error } = useQuery({
    queryKey: ['project-notebook-detail', id, tenantId],
    queryFn: () => fetchProjectDetails(id, tenantId),
    enabled: !!id && !!tenantId,
    suspense: false,
  });

  // FDA Data Query
  const { data: fdaData, isLoading: isFdaLoading, isError: isFdaError, error: fdaError } = useQuery({
    queryKey: ['fda-all-data'],
    queryFn: fetchFDAData,
    suspense: false,
  });

  // FDA Project Matching
  const fdaApproval = project && fdaData ? findFDAApprovalForProject(project.title, fdaData.approvals || []) : null;
  const fdaRecalls = project && fdaData ? findFDARecallsForProject(project.title, fdaData.recalls || []) : [];
  const activeRecalls = fdaRecalls.filter(r => r.recall_status === 'Ongoing');
  const criticalRecalls = activeRecalls.filter(r => r.classification === 'Class I');

  // PDF Export Handler
  const handleExportPDF = async () => {
    if (!project || !fdaData) return;

    // Simple PDF export placeholder
    console.log('PDF Export requested for project:', project.title);
    alert('PDF Export feature will be implemented soon!');
  };

  if (isLoading || isFdaLoading) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <Skeleton className="h-12 w-1/2 mb-4" />
        <Skeleton className="h-8 w-1/3 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
        <Skeleton className="h-64 mt-8" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <Alert variant="destructive">
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertTitle>Fehler</AlertTitle>
          <AlertDescription>
            {error?.message || 'Ein unbekannter Fehler ist aufgetreten beim Laden des Projekts.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Projekt nicht gefunden</AlertTitle>
          <AlertDescription>
            Das angeforderte Projekt konnte nicht gefunden werden.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const getSubmissionStatusColor = (status: string) => {
    switch (status) {
      case 'Cleared':
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Under Review':
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Denied':
      case 'Withdrawn':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRecallClassificationColor = (classification: string) => {
    switch (classification) {
      case 'Class I':
        return 'bg-red-100 text-red-800';
      case 'Class II':
        return 'bg-orange-100 text-orange-800';
      case 'Class III':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">
              {project.title}
            </h1>
            {fdaApproval && getFDAStatusBadge(fdaApproval)}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              FDA Database
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground mb-8">{project.description}</p>

        {criticalRecalls.length > 0 && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangleIcon className="h-4 w-4" />
            <AlertTitle>Kritische Recall-Warnung!</AlertTitle>
            <AlertDescription>
              Dieses Projekt ist von einem Class I Recall betroffen. Sofortige Überprüfung erforderlich.
              <Button variant="link" className="p-0 h-auto ml-2 text-red-800" onClick={() => window.location.href = '/fda-data'}>
                Details ansehen <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>Key information</CardDescription>
            </CardHeader>
            <CardContent>
              <p><strong>Status:</strong> {project.status}</p>
              <p><strong>Priority:</strong> {project.priority}</p>
              <p><strong>Created:</strong> {new Date(project.createdDate).toLocaleDateString()}</p>
              <p><strong>Last Modified:</strong> {new Date(project.lastModified).toLocaleDateString()}</p>
              <p><strong>Tenant ID:</strong> {project.tenantId}</p>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" /> Regulatory Status (FDA)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isFdaError && (
                <Alert variant="destructive">
                  <AlertTriangleIcon className="h-4 w-4" />
                  <AlertTitle>FDA Daten Fehler</AlertTitle>
                  <AlertDescription>
                    {fdaError?.message || 'Fehler beim Laden der FDA-Daten.'}
                  </AlertDescription>
                </Alert>
              )}

              {fdaApproval ? (
                <div className="border rounded-lg p-4 bg-green-50 border-green-200">
                  <h4 className="font-semibold text-lg flex items-center gap-2 text-green-800">
                    <CheckCircle className="h-5 w-5" /> FDA Approval: {fdaApproval.submission_status}
                  </h4>
                  <p className="text-sm text-green-700 mt-2">
                    <strong>Product:</strong> {fdaApproval.product_name} ({fdaApproval.device_name})
                  </p>
                  <p className="text-sm text-green-700">
                    <strong>Submission Type:</strong> {fdaApproval.submission_type} ({fdaApproval.submission_number})
                  </p>
                  <p className="text-sm text-green-700">
                    <strong>Decision Date:</strong> {fdaApproval.decision_date}
                  </p>
                  <Button variant="link" className="p-0 h-auto mt-2 text-green-800" onClick={() => window.location.href = '/fda-data'}>
                    Alle FDA Approvals ansehen <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              ) : (
                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertTitle>Keine direkte FDA-Zulassung gefunden</AlertTitle>
                  <AlertDescription>
                    Es wurde keine direkte FDA-Zulassung für dieses Projekt gefunden. Dies kann bedeuten, dass das Produkt noch in der Entwicklung ist oder unter einem anderen Namen gelistet ist.
                    <Button variant="link" className="p-0 h-auto ml-2 text-blue-800" onClick={() => window.location.href = '/fda-data'}>
                      Alle FDA Daten durchsuchen <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {fdaRecalls.length > 0 && (
                <div className="border rounded-lg p-4 bg-red-50 border-red-200 mt-4">
                  <h4 className="font-semibold text-lg flex items-center gap-2 text-red-800">
                    <AlertCircle className="h-5 w-5" /> Aktive FDA Recalls ({fdaRecalls.length})
                  </h4>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    {fdaRecalls.map((recall: any, index: number) => (
                      <li key={index} className="text-sm text-red-700">
                        <Badge className={getRecallClassificationColor(recall.classification)}>{recall.classification}</Badge> {recall.product_description} - {recall.reason_for_recall} (Status: {recall.recall_status})
                      </li>
                    ))}
                  </ul>
                  <Button variant="link" className="p-0 h-auto mt-2 text-red-800" onClick={() => window.location.href = '/fda-data'}>
                    Alle FDA Recalls ansehen <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
