/**
 * MedTech Data Platform - Approvals Page
 * Hauptseite für die Anzeige und Verwaltung von MedTech-Zulassungen
 */

import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Download, Plus, RefreshCw, BarChart3 } from 'lucide-react';

// Components
import { PageHeader } from '../../components/layout/PageHeader';
import { DataTable } from '../../components/data/DataTable';
import { ApprovalCard } from '../../components/approvals/ApprovalCard';
import { FilterPanel } from '../../components/filters/FilterPanel';
import { SearchInput } from '../../components/inputs/SearchInput';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';

// Hooks
import { useApprovals } from '../../hooks/useApprovals';
import { useApprovalFilters } from '../../hooks/useApprovalFilters';

// Types
import { Approval, ApprovalType, ApprovalStatus, DeviceClass, Priority } from '../../types/approval';
import { TableColumn } from '../../types/table';

// Utils
import { formatDate, formatRelativeTime } from '../../utils/date';
import { cn } from '../../utils/cn';

/**
 * ApprovalsPage Component
 * 
 * Features:
 * - Tabellen- und Kartenansicht
 * - Erweiterte Filterung und Suche
 * - Sortierung und Pagination
 * - Export-Funktionalität
 * - Real-time Updates
 * - Responsive Design
 */
export default function ApprovalsPage(): JSX.Element {
  // State
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Hooks
  const { filters, setFilters, resetFilters } = useApprovalFilters();
  const {
    data: approvalsData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useApprovals({
    ...filters,
    search: searchTerm,
    limit: 50
  });

  // Memoized Data
  const approvals = useMemo(() => approvalsData?.items || [], [approvalsData]);
  const total = useMemo(() => approvalsData?.total || 0, [approvalsData]);

  // Table Columns
  const columns: TableColumn<Approval>[] = [
    {
      key: 'title',
      label: 'Titel',
      sortable: true,
      render: (approval) => (
        <div className="max-w-xs">
          <div className="font-medium truncate" title={approval.title}>
            {approval.title}
          </div>
          {approval.reference_number && (
            <div className="text-sm text-muted-foreground">
              {approval.reference_number}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'approval_type',
      label: 'Typ',
      sortable: true,
      render: (approval) => (
        <Badge variant="outline" className="text-xs">
          {approval.approval_type.replace('_', ' ').toUpperCase()}
        </Badge>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (approval) => {
        const statusColors = {
          approved: 'bg-green-100 text-green-800',
          pending: 'bg-yellow-100 text-yellow-800',
          submitted: 'bg-blue-100 text-blue-800',
          rejected: 'bg-red-100 text-red-800',
          withdrawn: 'bg-gray-100 text-gray-800',
          suspended: 'bg-orange-100 text-orange-800',
          expired: 'bg-red-100 text-red-800',
          under_review: 'bg-purple-100 text-purple-800'
        };
        
        return (
          <Badge className={cn('text-xs', statusColors[approval.status])}>
            {approval.status.replace('_', ' ').toUpperCase()}
          </Badge>
        );
      }
    },
    {
      key: 'region',
      label: 'Region',
      sortable: true,
      render: (approval) => (
        <div className="text-sm">
          <div>{approval.region}</div>
          <div className="text-muted-foreground">{approval.authority}</div>
        </div>
      )
    },
    {
      key: 'applicant_name',
      label: 'Antragsteller',
      sortable: true,
      render: (approval) => (
        <div className="text-sm max-w-xs truncate" title={approval.applicant_name}>
          {approval.applicant_name || 'N/A'}
        </div>
      )
    },
    {
      key: 'decision_date',
      label: 'Entscheidung',
      sortable: true,
      render: (approval) => (
        <div className="text-sm">
          {approval.decision_date ? (
            <div>
              <div>{formatDate(approval.decision_date)}</div>
              <div className="text-muted-foreground">
                {formatRelativeTime(approval.decision_date)}
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground">N/A</span>
          )}
        </div>
      )
    },
    {
      key: 'priority',
      label: 'Priorität',
      sortable: true,
      render: (approval) => {
        const priorityColors = {
          low: 'bg-gray-100 text-gray-800',
          medium: 'bg-blue-100 text-blue-800',
          high: 'bg-orange-100 text-orange-800',
          critical: 'bg-red-100 text-red-800'
        };
        
        return (
          <Badge className={cn('text-xs', priorityColors[approval.priority])}>
            {approval.priority.toUpperCase()}
          </Badge>
        );
      }
    }
  ];

  // Event Handlers
  const handleExport = async () => {
    try {
      // Export functionality would be implemented here
      console.log('Exporting approvals...');
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  // Render Loading State
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Render Error State
  if (isError) {
    return (
      <ErrorMessage
        title="Fehler beim Laden der Zulassungen"
        message={error?.message || 'Ein unbekannter Fehler ist aufgetreten.'}
        onRetry={handleRefresh}
      />
    );
  }

  return (
    <>
      <Helmet>
        <title>Zulassungen - MedTech Data Platform</title>
        <meta name="description" content="Verwalten Sie MedTech-Zulassungen aus über 400 Quellen" />
      </Helmet>

      <div className="space-y-6">
        {/* Page Header */}
        <PageHeader
          title="MedTech Zulassungen"
          subtitle={`${total.toLocaleString()} Zulassungen aus 400+ Quellen`}
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isFetching}
              >
                <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
                Aktualisieren
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4" />
                Neue Zulassung
              </Button>
            </div>
          }
        />

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gesamt</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{total.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Alle Zulassungen
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Genehmigt</CardTitle>
              <Badge className="bg-green-100 text-green-800">✓</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {approvals.filter(a => a.status === 'approved').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Aktive Zulassungen
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ausstehend</CardTitle>
              <Badge className="bg-yellow-100 text-yellow-800">⏳</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {approvals.filter(a => a.status === 'pending').length}
              </div>
              <p className="text-xs text-muted-foreground">
                In Bearbeitung
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Regionen</CardTitle>
              <Badge variant="outline">🌍</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(approvals.map(a => a.region)).size}
              </div>
              <p className="text-xs text-muted-foreground">
                Verschiedene Märkte
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Filter & Suche</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
                <Select value={viewMode} onValueChange={(value: 'table' | 'cards') => setViewMode(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="table">Tabelle</SelectItem>
                    <SelectItem value="cards">Karten</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Zulassungen durchsuchen..."
                  className="w-full"
                />
              </div>
            </div>
            
            {showFilters && (
              <div className="mt-4">
                <FilterPanel
                  filters={filters}
                  onFiltersChange={setFilters}
                  onReset={resetFilters}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Content */}
        <Card>
          <CardContent className="p-0">
            {viewMode === 'table' ? (
              <DataTable
                data={approvals}
                columns={columns}
                pagination={{
                  total,
                  pageSize: 50,
                  showSizeChanger: true,
                  showQuickJumper: true
                }}
                loading={isFetching}
                onRowClick={(approval) => {
                  // Navigate to detail page
                  window.location.href = `/approvals/${approval.id}`;
                }}
              />
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {approvals.map((approval) => (
                    <ApprovalCard
                      key={approval.id}
                      approval={approval}
                      onClick={() => {
                        window.location.href = `/approvals/${approval.id}`;
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
