import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BookOpen, PlusCircle, AlertTriangleIcon } from 'lucide-react';

const fetchProjectNotebooks = async (tenantId: string) => {
  const response = await fetch(`/api/project-notebooks/tenant/${tenantId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch project notebooks');
  }
  return response.json();
};

export default function ProjectNotebooksListPage() {
  // Assumption: Hardcoding tenantId for now. In a real app, this would come from context or session.
  const tenantId = 'demo-medical-tech';

  const { data: projects, isLoading, isError, error } = useQuery({
    queryKey: ['project-notebooks', tenantId],
    queryFn: () => fetchProjectNotebooks(tenantId),
  });

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Project Notebooks</h1>
        <Link href="/project-kickstarter">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isError && (
        <Alert variant="destructive">
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Could not load project notebooks. {(error as Error)?.message}
          </AlertDescription>
        </Alert>
      )}

      {!isLoading && !isError && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects?.map((project: any) => (
            <Link key={project.id} href={`/tenant/${tenantId}/project-workbench/${project.id}`}>
              <a className="block">
                <Card className="hover:shadow-lg transition-shadow duration-200 h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      {project.name}
                    </CardTitle>
                    <CardDescription>
                      {project.product_area} - {project.device_class}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">{project.description || 'No description provided.'}</p>
                  </CardContent>
                </Card>
              </a>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
