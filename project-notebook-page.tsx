import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, BookOpen, Trash2, Eye, PlusCircle, Inbox, Share2, UserPlus, FileText, ChevronDown, MessageSquare, History, Paperclip } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProjectKickstarterPage } from './project-kickstarter'; // Wiederverwendung der Detailansicht
import { useToast } from "@/hooks/use-toast";

// Annahme: Ein API-Client existiert
const apiClient = {
  get: async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  },
  delete: async (url: string) => {
    const response = await fetch(url, { method: 'DELETE' });
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  },
  post: async (url: string, body: any) => {
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  },
  patch: async (url: string, body: any) => {
    const response = await fetch(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  }
};

interface ProjectKit {
  id: string;
  productIdea: string;
  createdAt: string;
  summary: string;
  owner: string;
  sharedWith: string[];
  documentTemplates: DocumentTemplate[];
  activityLog: ActivityLogEntry[];
}

interface DocumentTemplate {
  id: string;
  title: string;
  category: string;
  status: {
    id: 'todo' | 'inprogress' | 'inreview' | 'done';
    name: string;
  };
  comments: Comment[];
}

interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  attachment?: { fileName: string; fileSize: number } | null;
}

interface ActivityLogEntry {
  id: string;
  message: string;
  user: string;
  timestamp: string;
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase() || name.charAt(0).toUpperCase();
}

export function ProjectNotebookPage() {
  const documentStatuses = [
    { id: 'todo', name: 'To Do', color: 'bg-gray-500' },
    { id: 'inprogress', name: 'In Progress', color: 'bg-blue-500' },
    { id: 'inreview', name: 'In Review', color: 'bg-yellow-500' },
    { id: 'done', name: 'Done', color: 'bg-green-500' },
  ];

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: projectKits = [], isLoading, error } = useQuery<ProjectKit[]>({
    queryKey: ['projectKits'],
    queryFn: async () => {
      const response = await apiClient.get('/api/project-kits');
      return response.data || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (kitId: string) => apiClient.delete(`/api/project-kits/${kitId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectKits'] });
      toast({
        title: "Projektmappe gelöscht",
        description: "Die ausgewählte Projektmappe wurde erfolgreich entfernt.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Die Projektmappe konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    },
  });

  const shareMutation = useMutation({
    mutationFn: ({ kitId, email }: { kitId: string, email: string }) => apiClient.post(`/api/project-kits/${kitId}/share`, { email }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projectKits'] });
      toast({
        title: "Projektmappe geteilt",
        description: `Erfolgreich mit ${variables.email} geteilt.`,
      });
    },
    onError: () => {
      toast({
        title: "Fehler beim Teilen",
        description: "Die Projektmappe konnte nicht geteilt werden.",
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ kitId, documentId, status }: { kitId: string, documentId: string, status: { id: string, name: string } }) =>
      apiClient.patch(`/api/project-kits/${kitId}/documents/${documentId}`, { status }),
    onMutate: async ({ kitId, documentId, status }) => {
      await queryClient.cancelQueries({ queryKey: ['projectKits'] });
      const previousKits = queryClient.getQueryData<ProjectKit[]>(['projectKits']);
      queryClient.setQueryData<ProjectKit[]>(['projectKits'], old =>
        old?.map(kit =>
          kit.id === kitId
            ? {
                ...kit,
                documentTemplates: kit.documentTemplates.map(doc =>
                  doc.id === documentId ? { ...doc, status } : doc
                ),
              }
            : kit
        )
      );
      return { previousKits };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['projectKits'], context?.previousKits);
      toast({
        title: "Fehler beim Update",
        description: "Der Dokumentenstatus konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['projectKits'] });
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: ({ kitId, documentId, content, attachment }: { kitId: string, documentId: string, content: string, attachment: any }) =>
      apiClient.post(`/api/project-kits/${kitId}/documents/${documentId}/comments`, { content, author: 'current.user@example.com', attachment }),
    onMutate: async ({ kitId, documentId, content, attachment }) => {
      await queryClient.cancelQueries({ queryKey: ['projectKits'] });
      const previousKits = queryClient.getQueryData<ProjectKit[]>(['projectKits']);
      queryClient.setQueryData<ProjectKit[]>(['projectKits'], old =>
        old?.map(kit =>
          kit.id === kitId
            ? {
                ...kit,
                documentTemplates: kit.documentTemplates.map(doc =>
                  doc.id === documentId ? { ...doc, comments: [...(doc.comments || []), { id: `temp-${Date.now()}`, author: 'current.user@example.com', content, createdAt: new Date().toISOString(), attachment }] } : doc
                ),
              }
            : kit
        )
      );
      return { previousKits };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['projectKits'], context?.previousKits);
      toast({
        title: "Fehler",
        description: "Kommentar konnte nicht hinzugefügt werden.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['projectKits'] });
    },
  });


  const ShareDialog = ({ kit }: { kit: ProjectKit }) => {
    const [email, setEmail] = useState('');
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm"><Share2 className="mr-2 h-4 w-4" /> Teilen</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Projektmappe teilen: {kit.productIdea}</DialogTitle>
            <DialogDescription>Geben Sie die E-Mail-Adresse der Person ein, mit der Sie teilen möchten.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-4">
            <Input placeholder="user@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button onClick={() => shareMutation.mutate({ kitId: kit.id, email })} disabled={!email || shareMutation.isPending}>
              {shareMutation.isPending ? <Loader2 className="animate-spin" /> : <UserPlus className="h-4 w-4" />}
            </Button>
          </div>
          <div className="mt-4">
            <h4 className="font-semibold text-sm">Geteilt mit:</h4>
            <div className="flex flex-wrap gap-2 mt-2">{kit.sharedWith.map(e => <Badge key={e}>{e}</Badge>)}</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="text-blue-600" />
            Projektmappe
          </CardTitle>
          <CardDescription>
            Verwalten Sie hier Ihre generierten Projekt-Kits. Sie können sie ansehen, bearbeiten oder löschen.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Button onClick={() => window.location.href = '/project-kickstarter'}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Neues Projekt-Kit erstellen
            </Button>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex justify-center items-center p-8">
          <Loader2 className="mr-2 h-8 w-8 animate-spin" />
          <span>Lade Projektmappen...</span>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Fehler</AlertTitle>
          <AlertDescription>Projektmappen konnten nicht geladen werden.</AlertDescription>
        </Alert>
      )}

      {!isLoading && projectKits.length === 0 && (
        <Card className="text-center p-12">
            <Inbox className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium">Keine Projektmappen gefunden</h3>
            <p className="mt-1 text-sm text-muted-foreground">
                Erstellen Sie Ihr erstes Projekt-Kit, um es hier zu verwalten.
            </p>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projectKits.map((kit) => {
          const doneCount = kit.documentTemplates.filter(d => d.status.id === 'done').length;
          const totalCount = kit.documentTemplates.length;
          const progress = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;

          return (
            <Card key={kit.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="line-clamp-2">{kit.productIdea}</CardTitle>
              <CardDescription>
                Erstellt am: {new Date(kit.createdAt).toLocaleDateString('de-DE')}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {kit.summary.split('- **')[0].replace('Executive Summary für das Projekt: "', '').replace('".', '')}
                </p>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-muted-foreground">Fortschritt</span>
                    <span className="text-xs font-semibold">{doneCount} / {totalCount} Abgeschlossen</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </div>
            </CardContent>
            <div className="p-4 border-t flex justify-between items-center gap-2">
              <div className="flex items-center -space-x-2">
                <Avatar className="border-2 border-white">
                  <AvatarFallback>{getInitials(kit.owner)}</AvatarFallback>
                </Avatar>
                {kit.sharedWith.slice(0, 2).map(email => (
                  <Avatar key={email} className="border-2 border-white">
                    <AvatarFallback>{getInitials(email)}</AvatarFallback>
                  </Avatar>
                ))}
                {kit.sharedWith.length > 2 && <Avatar className="border-2 border-white"><AvatarFallback>+{kit.sharedWith.length - 2}</AvatarFallback></Avatar>}
              </div>

              <div className="flex items-center gap-1">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            Ansehen
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Detailansicht: {kit.productIdea}</DialogTitle>
                        </DialogHeader>
                        {/* Hier könnte eine Detailansichtskomponente für das Kit stehen */}
                        <pre className="text-xs bg-gray-100 p-4 rounded-md whitespace-pre-wrap font-mono">
                            {JSON.stringify(kit, null, 2)}
                        </pre>
                    </DialogContent>
                </Dialog>
                <ShareDialog kit={kit} />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteMutation.mutate(kit.id)}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending && deleteMutation.variables === kit.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-red-500" />
                  )}
                </Button>
              </div>
            </div>
            <Accordion type="multiple" className="w-full border-t">
              <AccordionItem value="documents" className="border-none">
                <AccordionTrigger className="px-4 py-2 text-sm font-medium">
                  Dokumenten-Fortschritt
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 space-y-4">
                  <div className="space-y-2">
                    {kit.documentTemplates.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {doc.title}
                        </span>
                        <Select
                          value={doc.status.id}
                          onValueChange={(value) => {
                            const newStatus = documentStatuses.find(s => s.id === value);
                            if (newStatus) {
                              updateStatusMutation.mutate({ kitId: kit.id, documentId: doc.id, status: newStatus });
                            }
                          }}
                        >
                          <SelectTrigger className="w-[120px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {documentStatuses.map(s => (
                              <SelectItem key={s.id} value={s.id} className="text-xs">
                                <span className={`flex items-center gap-2`}><div className={`w-2 h-2 rounded-full ${s.color}`}></div>{s.name}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                  <Accordion type="single" collapsible className="w-full">
                    {kit.documentTemplates.map(doc => (
                      <AccordionItem value={doc.id} key={`comments-${doc.id}`}>
                        <AccordionTrigger className="text-xs text-muted-foreground pt-3">
                          <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> Kommentare zu "{doc.title}" ({doc.comments?.length || 0})</span>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2 space-y-3">
                          <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                            {doc.comments?.length > 0 ? doc.comments.map(comment => (
                              <div key={comment.id} className="flex items-start gap-2 text-xs">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback>{getInitials(comment.author)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-semibold">{comment.author} <span className="font-normal text-muted-foreground ml-2">{new Date(comment.createdAt).toLocaleString('de-DE')}</span></p>
                                  <p className="text-muted-foreground whitespace-pre-wrap">{comment.content}</p>
                                  {comment.attachment && (
                                    <div className="mt-2 flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                                      <Paperclip className="h-4 w-4 text-blue-600" />
                                      <span className="text-xs font-medium text-blue-700">{comment.attachment.fileName}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )) : <p className="text-xs text-muted-foreground italic">Noch keine Kommentare.</p>}
                          </div>
                          <AddCommentForm kitId={kit.id} documentId={doc.id} mutation={addCommentMutation} />
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="activity" className="border-none">
                <AccordionTrigger className="px-4 py-2 text-sm font-medium">
                  <span className="flex items-center gap-2"><History className="h-4 w-4" /> Aktivitäts-Historie</span>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                    {kit.activityLog?.length > 0 ? kit.activityLog.map(log => (
                      <div key={log.id} className="flex items-start gap-3 text-xs">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>{getInitials(log.user)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p><span className="font-semibold">{log.user}</span> {log.message}</p>
                          <p className="text-muted-foreground">{new Date(log.timestamp).toLocaleString('de-DE')}</p>
                        </div>
                      </div>
                    )) : (
                      <p className="text-xs text-muted-foreground italic">Keine Aktivitäten protokolliert.</p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
        )})}
      </div>
    </div>
  );
}

function AddCommentForm({ kitId, documentId, mutation }: { kitId: string, documentId: string, mutation: any }) {
  const [content, setContent] = useState('');
  const [attachmentName, setAttachmentName] = useState('');

  const handleSubmit = () => {
    if (!content.trim()) return;
    const attachment = attachmentName ? { fileName: attachmentName, fileSize: Math.floor(Math.random() * 5000) + 100 } : null;
    mutation.mutate({ kitId, documentId, content: content.trim(), attachment });
    setContent('');
    setAttachmentName('');
  };

  return (
    <div className="pt-3 border-t space-y-2">
      <Textarea
        placeholder="Neuer Kommentar..."
        className="text-xs"
        rows={2}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      {attachmentName && (
        <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
          <Paperclip className="h-4 w-4 text-blue-600" />
          <span className="text-xs font-medium text-blue-700">{attachmentName}</span>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setAttachmentName('')}><Trash2 className="h-3 w-3" /></Button>
        </div>
      )}
      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={() => {
          const name = prompt("Simulierter Dateianhang:\nBitte geben Sie einen Dateinamen ein (z.B. 'analyse.pdf'):");
          if (name) setAttachmentName(name);
        }}>
          <Paperclip className="h-4 w-4 mr-2" /> Anhang (simuliert)
        </Button>
        <Button size="sm" onClick={handleSubmit} disabled={!content.trim() || mutation.isPending}>
          {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Senden"}
        </Button>
      </div>
    </div>
  );
}
