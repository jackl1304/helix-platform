import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangleIcon, BookOpen, FileText, Scale, BookCopy, Info } from 'lucide-react';

const fetchProjectDetails = async (id: string, tenantId: string) => {
  const response = await fetch(`/api/project-notebooks/${id}/tenant/${tenantId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch project notebook details');
  }
  return response.json();
};

const DocumentIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'regulatory_update':
      return <Info className="h-4 w-4 text-blue-500" />;
    case 'legal_case':
      return <Scale className="h-4 w-4 text-red-500" />;
    case 'iso_standard':
      return <BookCopy className="h-4 w-4 text-green-500" />;
    default:
      return <FileText className="h-4 w-4 text-gray-500" />;
  }
};

const getDocumentLink = (doc: any) => {
  // Assumption: The document viewer route is /documents/:sourceType/:documentId
  // The document_id for mock data (legal, iso) might not be a real ID.
  // This link will work for regulatory_updates.
  return `/documents/${doc.document_type}/${doc.document_id}`;
};

export default function ProjectNotebookDetailPage() {
  const params = useParams();
  const id = params.id as string;
  // Assumption: Hardcoding tenantId for now.
  const tenantId = 'demo-medical-tech';

  const { data: project, isLoading, isError, error } = useQuery({
    queryKey: ['project-notebook-detail', id, tenantId],
    queryFn: () => fetchProjectDetails(id, tenantId),
    enabled: !!id && !!tenantId,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-8 space-y-6">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Card>
          <CardHeader><Skeleton className="h-8 w-1/4" /></CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <Alert variant="destructive">
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Could not load project details. {(error as Error)?.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!project) {
    return <div className="container mx-auto p-4 md:p-8">Project not found.</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-3xl">
            <BookOpen className="h-8 w-8 text-primary" />
            {project.name}
          </CardTitle>
          <CardDescription className="flex items-center gap-4 pt-2">
            <Badge variant="outline">{project.product_area}</Badge>
            <Badge variant="secondary">{project.device_class}</Badge>
            <span className="text-sm text-muted-foreground">
              Created on: {new Date(project.created_at).toLocaleDateString()}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{project.description || 'No description provided.'}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Relevant Documents</CardTitle>
          <CardDescription>
            Automatically gathered documents based on your project's profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="w-[120px] text-right">Relevance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {project.documents?.length > 0 ? (
                project.documents.map((doc: any, index: number) => (
                  <TableRow key={`${doc.document_id}-${index}`}>
                    <TableCell>
                      <DocumentIcon type={doc.document_type} />
                    </TableCell>
                    <TableCell>
                      <Link href={getDocumentLink(doc)}>
                        <a className="font-medium text-primary hover:underline">{doc.title}</a>
                      </Link>
                      <p className="text-xs text-muted-foreground line-clamp-1">{doc.description}</p>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={doc.relevance_score > 90 ? 'default' : 'secondary'}>
                        {doc.relevance_score}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={3} className="text-center">No documents found yet. The system is still gathering data.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
