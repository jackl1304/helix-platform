import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  BookOpen,
  Plus,
  Save,
  Download,
  Link,
  FileText,
  Bookmark,
  FolderOpen,
  Tag,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  Calendar,
  User
} from 'lucide-react';

// Project notebook entry types
interface ProjectEntry {
  id: string;
  type: 'link' | 'article' | 'note' | 'document';
  title: string;
  content: string;
  category: string;
  tags: string[];
  url?: string;
  sourceType?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  tenantId: string;
  userId?: string;
}

interface ProjectCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  entryCount: number;
}

// Default categories for medical tech projects
const DEFAULT_CATEGORIES: Omit<ProjectCategory, 'id' | 'entryCount'>[] = [
  {
    name: 'Regulatorische Anforderungen',
    description: 'Zulassungsbedingungen, MDR, FDA Guidelines',
    color: 'blue',
    icon: 'Shield'
  },
  {
    name: 'Technische Dokumentation',
    description: 'Spezifikationen, Handbücher, Schemas',
    color: 'green',
    icon: 'FileText'
  },
  {
    name: 'Qualitätsmanagement',
    description: 'QMS, ISO Standards, Prüfprotokolle',
    color: 'purple',
    icon: 'CheckCircle'
  },
  {
    name: 'Rechtsprechung',
    description: 'Urteile, Präzedenzfälle, Legal Updates',
    color: 'orange',
    icon: 'Scale'
  },
  {
    name: 'Forschung & Entwicklung',
    description: 'Studien, Patente, Innovation',
    color: 'teal',
    icon: 'Lightbulb'
  },
  {
    name: 'Notizen & Ideen',
    description: 'Persönliche Notizen und Gedanken',
    color: 'gray',
    icon: 'PenTool'
  }
];

interface ProjectNotebookProps {
  isFloating?: boolean;
  onClose?: () => void;
}

export function ProjectNotebook({ isFloating = false, onClose }: ProjectNotebookProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ProjectEntry | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch project entries
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['/api/project-notebook/entries'],
    queryFn: async () => {
      const response = await fetch('/api/project-notebook/entries');
      if (!response.ok) throw new Error('Failed to fetch entries');
      return await response.json();
    },
    staleTime: 60000 // 1 minute
  });

  // Fetch categories with entry counts
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/project-notebook/categories'],
    queryFn: async () => {
      const response = await fetch('/api/project-notebook/categories');
      if (!response.ok) {
        // Return default categories if backend not available
        return DEFAULT_CATEGORIES.map((cat, idx) => ({
          ...cat,
          id: `default-${idx}`,
          entryCount: 0
        }));
      }
      return await response.json();
    },
    staleTime: 300000 // 5 minutes
  });

  // Create/Update entry mutation
  const saveEntryMutation = useMutation({
    mutationFn: async (entry: Partial<ProjectEntry>) => {
      const method = entry.id ? 'PUT' : 'POST';
      const url = entry.id ? `/api/project-notebook/entries/${entry.id}` : '/api/project-notebook/entries';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
      
      if (!response.ok) throw new Error('Failed to save entry');
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/project-notebook/entries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/project-notebook/categories'] });
      setShowAddForm(false);
      setEditingEntry(null);
      toast({
        title: "Gespeichert",
        description: "Eintrag wurde erfolgreich gespeichert."
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Eintrag konnte nicht gespeichert werden.",
        variant: "destructive"
      });
    }
  });

  // Delete entry mutation
  const deleteEntryMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/project-notebook/entries/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete entry');
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/project-notebook/entries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/project-notebook/categories'] });
      toast({
        title: "Gelöscht",
        description: "Eintrag wurde erfolgreich gelöscht."
      });
    }
  });

  // Filter entries
  const filteredEntries = entries.filter((entry: ProjectEntry) => {
    const matchesCategory = selectedCategory === 'all' || entry.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  // Export to PDF
  const handleExportPDF = async () => {
    try {
      const response = await fetch('/api/project-notebook/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: localStorage.getItem('tenant_id'),
          includeCategories: 'all',
          format: 'professional'
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Projektmappe_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Export erfolgreich",
          description: "PDF wurde heruntergeladen."
        });
      }
    } catch (error) {
      toast({
        title: "Export fehlgeschlagen",
        description: "PDF konnte nicht erstellt werden.",
        variant: "destructive"
      });
    }
  };

  const containerClass = isFloating 
    ? "fixed right-4 top-20 bottom-4 w-96 bg-white border shadow-lg rounded-lg z-50 flex flex-col"
    : "max-w-6xl mx-auto p-6 space-y-6";

  return (
    <div className={containerClass}>
      {isFloating && (
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Projektmappe
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>
      )}

      <div className={isFloating ? "flex-1 overflow-y-auto p-4" : ""}>
        {!isFloating && (
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <BookOpen className="h-8 w-8" />
                Persönliche Projektmappe
              </h1>
              <p className="text-muted-foreground mt-2">
                Sammeln, organisieren und exportieren Sie projektrelevante Informationen
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleExportPDF} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                PDF Export
              </Button>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Neuer Eintrag
              </Button>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Einträge durchsuchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="w-48">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kategorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Kategorien</SelectItem>
                    {categories.map((cat: ProjectCategory) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name} ({cat.entryCount})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories Overview */}
        {!isFloating && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {categories.map((category: ProjectCategory) => (
              <Card key={category.id} className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedCategory(category.name)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">{category.entryCount} Einträge</p>
                    </div>
                    <div className={`w-3 h-3 rounded-full bg-${category.color}-500`}></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Entries List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : filteredEntries.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Keine Einträge gefunden
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || selectedCategory !== 'all' 
                    ? 'Ihre Suchkriterien ergaben keine Treffer.' 
                    : 'Erstellen Sie Ihren ersten Eintrag.'}
                </p>
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ersten Eintrag erstellen
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredEntries.map((entry: ProjectEntry) => (
              <Card key={entry.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{entry.title}</h3>
                        <Badge variant="outline">{entry.type}</Badge>
                        <Badge className={`bg-${entry.priority === 'high' ? 'red' : entry.priority === 'medium' ? 'yellow' : 'gray'}-100`}>
                          {entry.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {entry.content}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <FolderOpen className="h-3 w-3" />
                          {entry.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(entry.createdAt).toLocaleDateString('de-DE')}
                        </span>
                        {entry.tags.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {entry.tags.slice(0, 2).join(', ')}
                            {entry.tags.length > 2 && ` +${entry.tags.length - 2}`}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {entry.url && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={entry.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => setEditingEntry(entry)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => deleteEntryMutation.mutate(entry.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Entry Dialog */}
      <EntryDialog
        entry={editingEntry}
        categories={categories}
        isOpen={showAddForm || !!editingEntry}
        onClose={() => {
          setShowAddForm(false);
          setEditingEntry(null);
        }}
        onSave={(entryData) => saveEntryMutation.mutate(entryData)}
      />

      {isFloating && (
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setShowAddForm(true)} className="flex-1">
              <Plus className="h-4 w-4 mr-1" />
              Hinzufügen
            </Button>
            <Button size="sm" variant="outline" onClick={handleExportPDF}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Entry creation/editing dialog
interface EntryDialogProps {
  entry: ProjectEntry | null;
  categories: ProjectCategory[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Partial<ProjectEntry>) => void;
}

function EntryDialog({ entry, categories, isOpen, onClose, onSave }: EntryDialogProps) {
  const [formData, setFormData] = useState({
    type: 'note' as ProjectEntry['type'],
    title: '',
    content: '',
    category: '',
    tags: '',
    url: '',
    priority: 'medium' as ProjectEntry['priority']
  });

  useEffect(() => {
    if (entry) {
      setFormData({
        type: entry.type,
        title: entry.title,
        content: entry.content,
        category: entry.category,
        tags: entry.tags.join(', '),
        url: entry.url || '',
        priority: entry.priority
      });
    } else {
      setFormData({
        type: 'note',
        title: '',
        content: '',
        category: '',
        tags: '',
        url: '',
        priority: 'medium'
      });
    }
  }, [entry]);

  const handleSave = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      return;
    }

    const entryData: Partial<ProjectEntry> = {
      ...(entry && { id: entry.id }),
      type: formData.type,
      title: formData.title.trim(),
      content: formData.content.trim(),
      category: formData.category || 'Notizen & Ideen',
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      url: formData.url.trim() || undefined,
      priority: formData.priority,
      tenantId: localStorage.getItem('tenant_id') || 'demo',
      userId: localStorage.getItem('user_id') || null
    };

    onSave(entryData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {entry ? 'Eintrag bearbeiten' : 'Neuer Eintrag'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Typ</label>
              <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="note">Notiz</SelectItem>
                  <SelectItem value="link">Link</SelectItem>
                  <SelectItem value="article">Artikel</SelectItem>
                  <SelectItem value="document">Dokument</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Priorität</label>
              <Select value={formData.priority} onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Niedrig</SelectItem>
                  <SelectItem value="medium">Mittel</SelectItem>
                  <SelectItem value="high">Hoch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Titel</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Titel des Eintrags"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Kategorie</label>
            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Kategorie wählen" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat: ProjectCategory) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(formData.type === 'link' || formData.type === 'document') && (
            <div>
              <label className="text-sm font-medium">URL</label>
              <Input
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://..."
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium">Inhalt/Notizen</label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Beschreibung, Notizen oder Inhalt..."
              rows={6}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Tags (kommagetrennt)</label>
            <Input
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="tag1, tag2, tag3"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Abbrechen
            </Button>
            <Button onClick={handleSave} disabled={!formData.title.trim() || !formData.content.trim()}>
              <Save className="h-4 w-4 mr-2" />
              Speichern
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


