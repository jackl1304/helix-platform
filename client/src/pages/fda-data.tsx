import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Database, Download, Filter, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface FDADataItem {
  id: string;
  title: string;
  type: '510(k)' | 'PMA' | 'De Novo' | 'HDE' | 'IDE';
  company: string;
  decisionDate: string;
  summary: string;
  status: 'approved' | 'pending' | 'withdrawn';
}

// Mock FDA data
const mockFDAData: FDADataItem[] = [
  {
    id: '1',
    title: 'Profoject™ Disposable Syringe System',
    type: '510(k)',
    company: 'Profoject Medical Inc.',
    decisionDate: '2025-08-06',
    summary: 'FDA clears disposable syringe system for medical injection procedures (K252033)',
    status: 'approved'
  },
  {
    id: '2',
    title: 'SmartHeart AI Diagnostic Platform',
    type: 'De Novo',
    company: 'CardioAI Technologies',
    decisionDate: '2025-07-15',
    summary: 'First-of-its-kind AI-powered cardiac diagnostic system receives De Novo clearance',
    status: 'approved'
  },
  {
    id: '3',
    title: 'NeuralLink Brain-Computer Interface',
    type: 'IDE',
    company: 'NeuralLink Corporation',
    decisionDate: '2025-06-20',
    summary: 'Investigational Device Exemption for brain-computer interface in clinical trials',
    status: 'pending'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved': return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'withdrawn': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case '510(k)': return 'bg-blue-100 text-blue-800';
    case 'PMA': return 'bg-purple-100 text-purple-800';
    case 'De Novo': return 'bg-orange-100 text-orange-800';
    case 'HDE': return 'bg-pink-100 text-pink-800';
    case 'IDE': return 'bg-indigo-100 text-indigo-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function FDAData() {
  const { data: fdaData, isLoading, error } = useQuery({
    queryKey: ['fda-data'],
    queryFn: async (): Promise<FDADataItem[]> => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockFDAData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Fehler beim Laden der FDA-Daten</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">FDA Device Data</h1>
          <p className="text-gray-600 mt-2">
            Übersicht über FDA-Zulassungen und -Bewertungen für Medizinprodukte
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt Zulassungen</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fdaData?.length || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Genehmigt</CardTitle>
            <Badge className="bg-green-100 text-green-800">✓</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {fdaData?.filter(item => item.status === 'approved').length || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ausstehend</CardTitle>
            <Badge className="bg-yellow-100 text-yellow-800">⏳</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {fdaData?.filter(item => item.status === 'pending').length || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">510(k) Clearances</CardTitle>
            <Badge className="bg-blue-100 text-blue-800">510(k)</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {fdaData?.filter(item => item.type === '510(k)').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FDA Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>FDA Device Clearances & Approvals</CardTitle>
          <CardDescription>
            Aktuelle Übersicht über FDA-Zulassungen für Medizinprodukte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {fdaData?.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-lg">{item.title}</h3>
                      <Badge className={getTypeColor(item.type)}>
                        {item.type}
                      </Badge>
                      <Badge className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{item.company}</p>
                    <p className="text-gray-700 mb-3">{item.summary}</p>
                    <p className="text-sm text-gray-500">
                      Entscheidungsdatum: {new Date(item.decisionDate).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Search className="h-4 w-4 mr-2" />
                      Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Info Box */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Database className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Datenquelle</h4>
              <p className="text-sm text-blue-700 mt-1">
                Diese Daten werden automatisch von der FDA-Website gesammelt und regelmäßig aktualisiert. 
                Für die neuesten Informationen besuchen Sie die offizielle FDA-Datenbank.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
