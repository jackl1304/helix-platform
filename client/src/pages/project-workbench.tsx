import React, { useState, useMemo, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { useToast } from "@/components/ui/use-toast";
import { AlertTriangleIcon, BookOpen, FileText, Scale, BookCopy, Info, CheckCircle, Target, ClipboardList, GaugeCircle, FlaskConical, ScrollText, PlusCircle, X, Search, Loader2, Bell, ShieldCheck } from 'lucide-react';
import { AlertTriangleIcon, BookOpen, FileText, Scale, BookCopy, Info, CheckCircle, Target, ClipboardList, GaugeCircle, FlaskConical, ScrollText, PlusCircle, X, Search, Loader2, Bell, ShieldCheck, Trash2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Header from '@/components/layout/Header';

const fetchProjectDetails = async (id: string, tenantId: string) => {
  const response = await fetch(`/api/project-notebooks/${id}/tenant/${tenantId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch project notebook details');
  }
  return response.json();
};

const unlinkDocument = async ({ projectId, documentId, documentType }: { projectId: string, documentId: string, documentType: string }) => {
  const response = await fetch(`/api/project-notebooks/${projectId}/documents`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentId, documentType }),
  });
  if (!response.ok) throw new Error('Failed to unlink document.');
  return response.json();
};

const linkDocument = async ({ projectId, documentId, documentType }: { projectId: string, documentId: string, documentType: string }) => {
  const response = await fetch(`/api/project-notebooks/${projectId}/documents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentId, documentType }),
  });
  if (!response.ok) throw new Error('Failed to link document.');
  return response.json();
};

const updateTask = async ({ projectId, taskKey, completed }: { projectId: string, taskKey: string, completed: boolean }) => {
const updateTask = async ({ projectId, taskKey, completed, taskDescription }: { projectId: string, taskKey: string, completed: boolean, taskDescription?: string }) => {
  const response = await fetch(`/api/project-notebooks/${projectId}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taskKey, completed }),
    body: JSON.stringify({ taskKey, completed, taskDescription }),
  });
  if (!response.ok) throw new Error('Failed to update task.');
};

const deleteTask = async ({ projectId, taskKey }: { projectId: string, taskKey: string }) => {
    const response = await fetch(`/api/project-notebooks/${projectId}/tasks/${taskKey}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete task.');
    return response.json();
};

const searchDocuments = async (query: string) => {
  if (!query) return [];
  const response = await fetch(`/api/documents/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error('Failed to search documents');
  }
  return response.json();
};

const fetchComplianceChecklist = async (projectId: string) => {
  const response = await fetch(`/api/project-notebooks/${projectId}/compliance-checklist`);
  if (!response.ok) throw new Error('Failed to fetch compliance checklist');
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

export default function ProjectWorkbenchPage() {
  const params = useParams();
  const id = params.id as string;
  // Assumption: Hardcoding tenantId for now.
  const tenantId = 'demo-medical-tech';
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: project, isLoading, isError, error } = useQuery({
    queryKey: ['project-notebook-detail', id, tenantId],
    queryFn: () => fetchProjectDetails(id, tenantId),
    enabled: !!id && !!tenantId,
  });

  const { data: taskData } = useQuery({
    queryKey: ['project-tasks', id],
    queryFn: async () => {
      const response = await fetch(`/api/project-notebooks/${id}/tasks`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const tasks: { task_key: string, completed: boolean }[] = await response.json();
      // Convert array to the state object format
      const taskState: { [key: string]: { [key: string]: boolean } } = { idea: {}, development: {}, regulatory: {} };
      tasks.forEach(({ task_key, completed }) => {
        const [phase, ...taskNameParts] = task_key.split(':');
        if (phase in taskState) taskState[phase][taskNameParts.join(':')] = completed;
      });
      return taskState;
    },
    enabled: !!id,
  });

  const { data: complianceChecklist = [], isLoading: isChecklistLoading } = useQuery({
    queryKey: ['compliance-checklist', id],
    queryFn: () => fetchComplianceChecklist(id),
    enabled: !!id,
  });

  const unlinkMutation = useMutation({
    mutationFn: unlinkDocument,
    onSuccess: () => {
      toast({ title: "Document unlinked successfully." });
      queryClient.invalidateQueries({ queryKey: ['project-notebook-detail', id, tenantId] });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleUnlink = (documentId: string, documentType: string) => {
    unlinkMutation.mutate({ projectId: id, documentId, documentType });
  };

   smndcess: () => {
      // Optimistically update UI or just refetch
      queryClient.invalidateQueries({ queryKey: ['project-tasks', id] });
    },
    onError: (err: Error) => {
      toast({ title: "Task Update Failed", description: err.message, variant: "destructive" });
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      toast({ title: "Task deleted." });
      queryClient.invalidateQueries({ queryKey: ['compliance-checklist', id] });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });

  // Default task structure
  const defaultTasks = {
    idea: { 'Marktanalyse durchführen': true, 'Anforderungsdokument erstellen': false },
    development: { 'Prototyp entwickeln': false, 'Technische Dokumentation schreiben': false, 'Verifizierungstests planen': false },
    regulatory: { 'Zulassungsstrategie definieren': true, 'Klinische Bewertung beginnen': false, 'Einreichungsunterlagen vorbereiten': false },
  };

  // Merge fetched tasks with default structure to ensure all tasks are displayed
  const tasks = useMemo(() => ({
    idea: { ...defaultTasks.idea, ...taskData?.idea },
    development: { ...defaultTasks.development, ...taskData?.development },
    regulatory: { ...defaultTasks.regulatory, ...taskData?.regulatory },
  }), [taskData]);

  const handleTaskChange = (taskKey: string, currentCompleted: boolean) => {
    updateTaskMutation.mutate({ projectId: id, taskKey, completed: !currentCompleted });
  };

  const renderTaskList = (phase: keyof typeof tasks, title: string) => (
    <div>
      <h4 className="font-semibold mb-2">{title}</h4>
      {Object.entries(tasks[phase]).map(([task, completed]) => (
        <div key={task} className="flex items-center space-x-2 mb-1">
          <Checkbox
            id={`${phase}-${task}`}
            checked={completed}
            onCheckedChange={() => handleTaskChange(`${phase}:${task}`, completed)}
          />
          <label
            htmlFor={`${phase}-${task}`}
            className={`text-sm ${completed ? 'text-muted-foreground line-through' : ''}`}
          >
            {task}
          </label>
        </div>
      ))}
    </div>);

  const AddDocumentDialog = () => { // This component remains the same
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async () => {
      if (!searchQuery.trim()) return;
      setIsSearching(true);
      try {
        const results = await searchDocuments(searchQuery);
        setSearchResults(results);
      } catch (error) {
        toast({ title: "Search Failed", description: (error as Error).message, variant: "destructive" });
      } finally {
        setIsSearching(false);
      }
    };

    const linkMutation = useMutation({
      mutationFn: linkDocument,
      onSuccess: () => {
        toast({ title: "Document linked successfully." });
        queryClient.invalidateQueries({ queryKey: ['project-notebook-detail', id, tenantId] });
      },
      onError: (err: Error) => {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      },
    });

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Document</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Add Document to Project</DialogTitle>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <Input placeholder="Search for documents..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
            <Button onClick={handleSearch} disabled={isSearching}>{isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}</Button>
          </div>
          <div className="mt-4 max-h-[400px] overflow-y-auto">
            {searchResults.map(doc => (
              <div key={`${doc.id}-${doc.type}`} className="flex items-center justify-between p-2 hover:bg-muted rounded-md">
                <div className="flex items-center gap-2">
                  <DocumentIcon type={doc.type} />
                  <div>
                    <p className="font-medium line-clamp-1">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">{new Date(doc.published_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => linkMutation.mutate({ projectId: id, documentId: doc.id, documentType: doc.type })}>Add</Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const MetricCard = ({ icon, title, value, description }: { icon: React.ElementType, title: string, value: string, description: string }) => {
    const Icon = icon;
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    );
  };

  const ComplianceChecklistCard = () => {
    type ChecklistItem = { key: string; task: string; completed: boolean; description?: string };
    const [newTask, setNewTask] = useState('');
    type ChecklistItem = { key: string; task: string; completed: boolean; description?: string; isCustom?: boolean };

    const handleAddTask = () => {
      if (!newTask.trim()) return;
      // Using a simple unique key generation for custom tasks
      const taskKey = `custom_compliance:${Date.now()}`;
      updateTaskMutation.mutate({ projectId: id, taskKey, completed: false, taskDescription: newTask.trim() });
      setNewTask('');
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><ShieldCheck className="mr-2 h-5 w-5 text-blue-600" /> Compliance Checklist</CardTitle>
          <CardDescription>Regulatorische Meilensteine basierend auf {project.region} & {project.device_class}.</CardDescription>
        </CardHeader>
        <CardContent>
          {isChecklistLoading ? <Skeleton className="h-20 w-full" /> :
            complianceChecklist.length > 0 ? (
              <div className="space-y-2">
                {complianceChecklist.map((item: ChecklistItem) => (
                  <div key={item.key} className="flex items-center space-x-2">
                    <Checkbox id={item.key} checked={item.completed} onCheckedChange={() => handleTaskChange(item.key, item.completed)} />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <label htmlFor={item.key} className={`text-sm cursor-help ${item.completed ? 'text-muted-foreground line-through' : ''}`}>
                            {item.task}
                          </label>
                        </TooltipTrigger>
                        {item.description && <TooltipContent><p className="max-w-xs">{item.description}</p></TooltipContent>}
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Für dieses Projekt konnte keine spezifische Checkliste generiert werden.</p>
            )
          }
          <div className="space-y-4">
            {isChecklistLoading ? <Skeleton className="h-20 w-full" /> :
              complianceChecklist.length > 0 ? (
                <div className="space-y-2">
                  {complianceChecklist.map((item: ChecklistItem) => (
                    <div key={item.key} className="flex items-center justify-between group">
                      <div className="flex items-center space-x-2">
                        <Checkbox id={item.key} checked={item.completed} onCheckedChange={() => handleTaskChange(item.key, item.completed)} />
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <label htmlFor={item.key} className={`text-sm ${item.description ? 'cursor-help' : ''} ${item.completed ? 'text-muted-foreground line-through' : ''}`}>
                                {item.task}
                              </label>
                            </TooltipTrigger>
                            {item.description && <TooltipContent><p className="max-w-xs">{item.description}</p></TooltipContent>}
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      {item.isCustom && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => deleteTaskMutation.mutate({ projectId: id, taskKey: item.key })}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Für dieses Projekt konnte keine spezifische Checkliste generiert werden.</p>
              )
            }
            <div className="flex items-center space-x-2 pt-4">
              <Input
                placeholder="Add custom compliance task..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
              />
              <Button onClick={handleAddTask} disabled={updateTaskMutation.isPending}>
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

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
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-3xl">
            <BookOpen className="h-8 w-8 text-primary" />
            {project.name}
          </CardTitle>
          <CardDescription className="flex items-center gap-4 pt-2">
            <Badge variant="outline">{project.product_area}</Badge>
            <Badge variant="secondary">{project.device_class}</Badge>
            <Badge variant="secondary">{project.region}</Badge>
            <span className="text-sm text-muted-foreground">
              Created on: {new Date(project.created_at).toLocaleDateString()}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{project.description || 'No description provided.'}</p>
        </CardContent>
      </Card>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Key Metrics</CardTitle>
              <CardDescription>At-a-glance overview of your project's status.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <MetricCard icon={Target} title="Development Phase" value="Conception" description="Current project lifecycle phase" />
              <MetricCard icon={GaugeCircle} title="Compliance Risk" value="Medium" description="AI-assessed regulatory risk" />
              <MetricCard icon={ClipboardList} title="Tasks Completed" value="2 / 9" description="Overall project progress" />
              <MetricCard icon={FileText} title="Relevant Documents" value={project.documents?.length || 0} description="Automatically gathered documents" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Relevant Documents</CardTitle>
              <CardDescription>Automatically gathered and manually added documents.</CardDescription>
            </div>
            <AddDocumentDialog />
          </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Type</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="w-[120px] text-right">Relevance</TableHead>
                <TableHead className="w-[50px] text-right">Actions</TableHead>
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
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleUnlink(doc.document_id, doc.document_type)} disabled={unlinkMutation.isPending}>
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                      </TableRow>
                    ))
                  ) : (
                <TableRow><TableCell colSpan={4} className="text-center">No documents found yet. The system is still gathering data.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <div className="space-y-8">
            <ComplianceChecklistCard />
            <Card>
              <CardHeader>
                <CardTitle>Project Task List</CardTitle>
                <CardDescription>Key milestones for your product development lifecycle.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderTaskList('idea', 'Idea & Conception')}
                {renderTaskList('development', 'Development & V&V')}
                {renderTaskList('regulatory', 'Regulatory Submission')}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      </main>
    </div>
  );
}
