import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BookOpen, PlusCircle, AlertTriangleIcon, Search, Filter, Shield, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const fetchProjectNotebooks = async (tenantId: string) => {
  const response = await fetch(`/api/project-notebook/entries?tenantId=${tenantId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch project notebooks');
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
const findFDAApprovalForProject = (projectTitle: string, fdaApprovals: any[]) => {
  const titleLower = projectTitle.toLowerCase();

  if (titleLower.includes('cardiac') || titleLower.includes('heart')) {
    return fdaApprovals.find(a => a.product_name.includes('Cardiac AI'));
  }
  if (titleLower.includes('neural') || titleLower.includes('brain')) {
    return fdaApprovals.find(a => a.product_name.includes('Neural Interface'));
  }
  if (titleLower.includes('orthopedic') || titleLower.includes('implant')) {
    return fdaApprovals.find(a => a.product_name.includes('Orthopedic'));
  }
  if (titleLower.includes('insulin') || titleLower.includes('diabetes')) {
    return fdaApprovals.find(a => a.product_name.includes('Insulin'));
  }
  if (titleLower.includes('diagnostic') || titleLower.includes('scanner')) {
    return fdaApprovals.find(a => a.product_name.includes('Diagnostic'));
  }

  return null;
};

const findFDARecallsForProject = (projectTitle: string, fdaRecalls: any[]) => {
  const titleLower = projectTitle.toLowerCase();

  if (titleLower.includes('cardiac') || titleLower.includes('heart')) {
    return fdaRecalls.filter(r => r.product_description.includes('Cardiac AI'));
  }
  if (titleLower.includes('neural') || titleLower.includes('brain')) {
    return fdaRecalls.filter(r => r.product_description.includes('Neural Interface'));
  }
  if (titleLower.includes('orthopedic') || titleLower.includes('implant')) {
    return fdaRecalls.filter(r => r.product_description.includes('Orthopedic'));
  }

  return [];
};

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

export default function ProjectNotebooksListPage() {
  // Assumption: Hardcoding tenantId for now. In a real app, this would come from context or session.
  const tenantId = 'demo-medical-tech';

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [fdaStatusFilter, setFdaStatusFilter] = useState('all');

  // Queries
  const { data: projects, isLoading, isError, error } = useQuery({
    queryKey: ['project-notebooks', tenantId],
    queryFn: () => fetchProjectNotebooks(tenantId),
  });

  const { data: fdaData, isLoading: fdaLoading } = useQuery({
    queryKey: ['fda-all-data'],
    queryFn: fetchFDAData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    suspense: false,
  });

  // Filtered and searched projects
  const filteredProjects = useMemo(() => {
    if (!projects) return [];

    return projects.filter((project: any) => {
      // Search filter
      const matchesSearch = searchQuery === '' ||
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;

      // Priority filter
      const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;

      // FDA Status filter
      let matchesFdaStatus = true;
      if (fdaStatusFilter !== 'all' && fdaData) {
        const fdaApproval = findFDAApprovalForProject(project.title, fdaData.approvals || []);
        const fdaRecalls = findFDARecallsForProject(project.title, fdaData.recalls || []);
        const activeRecalls = fdaRecalls.filter(r => r.recall_status === 'Ongoing');
        const criticalRecalls = activeRecalls.filter(r => r.classification === 'Class I');

        if (fdaStatusFilter === 'has_approval') {
          matchesFdaStatus = !!fdaApproval;
        } else if (fdaStatusFilter === 'no_approval') {
          matchesFdaStatus = !fdaApproval;
        } else if (fdaStatusFilter === 'has_recalls') {
          matchesFdaStatus = activeRecalls.length > 0;
        } else if (fdaStatusFilter === 'critical_recalls') {
          matchesFdaStatus = criticalRecalls.length > 0;
        }
      }

      return matchesSearch && matchesStatus && matchesPriority && matchesFdaStatus;
    });
  }, [projects, searchQuery, statusFilter, priorityFilter, fdaStatusFilter, fdaData]);

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

      {/* Search and Filter Controls */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search projects by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="research">Research</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={fdaStatusFilter} onValueChange={setFdaStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="FDA Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All FDA Status</SelectItem>
              <SelectItem value="has_approval">Has FDA Approval</SelectItem>
              <SelectItem value="no_approval">No FDA Approval</SelectItem>
              <SelectItem value="has_recalls">Has Active Recalls</SelectItem>
              <SelectItem value="critical_recalls">Critical Recalls</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Filter className="h-4 w-4" />
            <span>{filteredProjects.length} of {projects?.length || 0} projects</span>
          </div>
        </div>
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
          {filteredProjects.map((project: any) => {
            // FDA Status for this project
            const fdaApproval = fdaData ? findFDAApprovalForProject(project.title, fdaData.approvals || []) : null;
            const fdaRecalls = fdaData ? findFDARecallsForProject(project.title, fdaData.recalls || []) : [];
            const activeRecalls = fdaRecalls.filter(r => r.recall_status === 'Ongoing');
            const criticalRecalls = activeRecalls.filter(r => r.classification === 'Class I');

            return (
              <Link key={project.id} href={`/tenant/${tenantId}/project-workbench/${project.id}`}>
                <a className="block">
                  <Card className="hover:shadow-lg transition-shadow duration-200 h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                            {project.title}
                          </CardTitle>
                          <CardDescription>
                            {project.status} • {project.priority} priority
                          </CardDescription>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                            {project.status}
                          </Badge>
                          <Badge variant={project.priority === 'high' ? 'destructive' : project.priority === 'medium' ? 'default' : 'secondary'}>
                            {project.priority}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {project.description || 'No description provided.'}
                      </p>

                      {/* FDA Status Section */}
                      <div className="space-y-2">
                        {fdaApproval && (
                          <div className="flex items-center gap-2">
                            {getFDAStatusBadge(fdaApproval)}
                          </div>
                        )}

                        {criticalRecalls.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Badge className="bg-red-100 text-red-800 border-red-200">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              {criticalRecalls.length} Critical Recall(s)
                            </Badge>
                          </div>
                        )}

                        {activeRecalls.length > 0 && criticalRecalls.length === 0 && (
                          <div className="flex items-center gap-2">
                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                              <AlertTriangleIcon className="h-3 w-3 mr-1" />
                              {activeRecalls.length} Active Recall(s)
                            </Badge>
                          </div>
                        )}

                        {!fdaApproval && activeRecalls.length === 0 && (
                          <div className="text-xs text-gray-500">
                            No FDA data available
                          </div>
                        )}
                      </div>

                      {/* Project Stats */}
                      <div className="flex justify-between text-xs text-gray-500 pt-2 border-t">
                        <span>Created: {new Date(project.createdDate).toLocaleDateString()}</span>
                        <span>Modified: {new Date(project.lastModified).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                </a>
              </Link>
            );
          })}
        </div>
      )}

      {/* No Results */}
      {!isLoading && !isError && filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-500">
            Try adjusting your search criteria or filters to find what you're looking for.
          </p>
        </div>
      )}
    </div>
  );
}
