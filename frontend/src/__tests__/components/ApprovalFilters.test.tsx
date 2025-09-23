/**
 * MedTech Data Platform - ApprovalFilters Tests
 * Umfassende Tests für die ApprovalFilters-Komponente
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import ApprovalFilters from '../../components/approvals/ApprovalFilters';
import { AuthProvider } from '../../contexts/AuthContext';
import { SettingsProvider } from '../../contexts/SettingsContext';

// Mock-Daten für Tests
const mockFilters = {
  search: '',
  status: '',
  approvalType: '',
  region: '',
  authority: '',
  priority: '',
  dateRange: {
    start: null,
    end: null
  }
};

const mockOnFiltersChange = vi.fn();
const mockOnReset = vi.fn();

const mockAuthContext = {
  user: {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    permissions: ['read_approvals']
  },
  login: vi.fn(),
  logout: vi.fn(),
  isLoading: false
};

const mockSettingsContext = {
  settings: {
    showGlobalApprovals: true,
    theme: 'light',
    language: 'de'
  },
  updateSetting: vi.fn()
};

describe('ApprovalFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders all filter controls correctly', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalFilters
            filters={mockFilters}
            onFiltersChange={mockOnFiltersChange}
            onReset={mockOnReset}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    // Überprüfe, dass alle Filter-Controls angezeigt werden
    expect(screen.getByPlaceholderText('Zulassungen durchsuchen...')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Zulassungstyp')).toBeInTheDocument();
    expect(screen.getByText('Region')).toBeInTheDocument();
    expect(screen.getByText('Behörde')).toBeInTheDocument();
    expect(screen.getByText('Priorität')).toBeInTheDocument();
    expect(screen.getByText('Zeitraum')).toBeInTheDocument();
    expect(screen.getByText('Filter zurücksetzen')).toBeInTheDocument();
  });

  it('handles search input changes', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalFilters
            filters={mockFilters}
            onFiltersChange={mockOnFiltersChange}
            onReset={mockOnReset}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    const searchInput = screen.getByPlaceholderText('Zulassungen durchsuchen...');
    fireEvent.change(searchInput, { target: { value: 'FDA' } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      search: 'FDA'
    });
  });

  it('handles status filter changes', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalFilters
            filters={mockFilters}
            onFiltersChange={mockOnFiltersChange}
            onReset={mockOnReset}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    const statusSelect = screen.getByDisplayValue('Alle Status');
    fireEvent.click(statusSelect);
    
    const approvedOption = screen.getByText('Genehmigt');
    fireEvent.click(approvedOption);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      status: 'approved'
    });
  });

  it('handles approval type filter changes', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalFilters
            filters={mockFilters}
            onFiltersChange={mockOnFiltersChange}
            onReset={mockOnReset}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    const typeSelect = screen.getByDisplayValue('Alle Typen');
    fireEvent.click(typeSelect);
    
    const fdaOption = screen.getByText('FDA 510(k)');
    fireEvent.click(fdaOption);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      approvalType: 'fda_510k'
    });
  });

  it('handles region filter changes', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalFilters
            filters={mockFilters}
            onFiltersChange={mockOnFiltersChange}
            onReset={mockOnReset}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    const regionSelect = screen.getByDisplayValue('Alle Regionen');
    fireEvent.click(regionSelect);
    
    const usOption = screen.getByText('USA');
    fireEvent.click(usOption);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      region: 'US'
    });
  });

  it('handles authority filter changes', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalFilters
            filters={mockFilters}
            onFiltersChange={mockOnFiltersChange}
            onReset={mockOnReset}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    const authoritySelect = screen.getByDisplayValue('Alle Behörden');
    fireEvent.click(authoritySelect);
    
    const fdaOption = screen.getByText('FDA');
    fireEvent.click(fdaOption);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      authority: 'FDA'
    });
  });

  it('handles priority filter changes', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalFilters
            filters={mockFilters}
            onFiltersChange={mockOnFiltersChange}
            onReset={mockOnReset}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    const prioritySelect = screen.getByDisplayValue('Alle Prioritäten');
    fireEvent.click(prioritySelect);
    
    const highOption = screen.getByText('Hoch');
    fireEvent.click(highOption);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      priority: 'high'
    });
  });

  it('handles date range filter changes', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalFilters
            filters={mockFilters}
            onFiltersChange={mockOnFiltersChange}
            onReset={mockOnReset}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    const startDateInput = screen.getByPlaceholderText('Von');
    fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      dateRange: {
        ...mockFilters.dateRange,
        start: '2024-01-01'
      }
    });

    const endDateInput = screen.getByPlaceholderText('Bis');
    fireEvent.change(endDateInput, { target: { value: '2024-12-31' } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      dateRange: {
        ...mockFilters.dateRange,
        end: '2024-12-31'
      }
    });
  });

  it('handles reset button click', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalFilters
            filters={mockFilters}
            onFiltersChange={mockOnFiltersChange}
            onReset={mockOnReset}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    const resetButton = screen.getByText('Filter zurücksetzen');
    fireEvent.click(resetButton);

    expect(mockOnReset).toHaveBeenCalledTimes(1);
  });

  it('displays current filter values correctly', () => {
    const currentFilters = {
      search: 'FDA',
      status: 'approved',
      approvalType: 'fda_510k',
      region: 'US',
      authority: 'FDA',
      priority: 'high',
      dateRange: {
        start: '2024-01-01',
        end: '2024-12-31'
      }
    };

    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalFilters
            filters={currentFilters}
            onFiltersChange={mockOnFiltersChange}
            onReset={mockOnReset}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    expect(screen.getByDisplayValue('FDA')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Genehmigt')).toBeInTheDocument();
    expect(screen.getByDisplayValue('FDA 510(k)')).toBeInTheDocument();
    expect(screen.getByDisplayValue('USA')).toBeInTheDocument();
    expect(screen.getByDisplayValue('FDA')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Hoch')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-01-01')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-12-31')).toBeInTheDocument();
  });

  it('handles multiple filter changes in sequence', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalFilters
            filters={mockFilters}
            onFiltersChange={mockOnFiltersChange}
            onReset={mockOnReset}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    // Ändere mehrere Filter nacheinander
    fireEvent.change(screen.getByPlaceholderText('Zulassungen durchsuchen...'), { 
      target: { value: 'Test' } 
    });
    
    const statusSelect = screen.getByDisplayValue('Alle Status');
    fireEvent.click(statusSelect);
    fireEvent.click(screen.getByText('Genehmigt'));

    expect(mockOnFiltersChange).toHaveBeenCalledTimes(2);
  });

  it('handles empty filter values', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalFilters
            filters={mockFilters}
            onFiltersChange={mockOnFiltersChange}
            onReset={mockOnReset}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    const searchInput = screen.getByPlaceholderText('Zulassungen durchsuchen...');
    fireEvent.change(searchInput, { target: { value: '' } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      search: ''
    });
  });

  it('handles special characters in search input', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalFilters
            filters={mockFilters}
            onFiltersChange={mockOnFiltersChange}
            onReset={mockOnReset}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    const searchInput = screen.getByPlaceholderText('Zulassungen durchsuchen...');
    fireEvent.change(searchInput, { target: { value: 'Test & Co. (FDA)' } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      search: 'Test & Co. (FDA)'
    });
  });

  it('handles long search input', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalFilters
            filters={mockFilters}
            onFiltersChange={mockOnFiltersChange}
            onReset={mockOnReset}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    const longSearchTerm = 'Sehr langer Suchbegriff mit vielen Wörtern und Sonderzeichen !@#$%^&*()';
    const searchInput = screen.getByPlaceholderText('Zulassungen durchsuchen...');
    fireEvent.change(searchInput, { target: { value: longSearchTerm } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      search: longSearchTerm
    });
  });

  it('handles invalid date inputs gracefully', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalFilters
            filters={mockFilters}
            onFiltersChange={mockOnFiltersChange}
            onReset={mockOnReset}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    const startDateInput = screen.getByPlaceholderText('Von');
    fireEvent.change(startDateInput, { target: { value: 'invalid-date' } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...mockFilters,
      dateRange: {
        ...mockFilters.dateRange,
        start: 'invalid-date'
      }
    });
  });

  it('handles rapid filter changes', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalFilters
            filters={mockFilters}
            onFiltersChange={mockOnFiltersChange}
            onReset={mockOnReset}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    const searchInput = screen.getByPlaceholderText('Zulassungen durchsuchen...');
    
    // Rapidly change search input
    fireEvent.change(searchInput, { target: { value: 'A' } });
    fireEvent.change(searchInput, { target: { value: 'AB' } });
    fireEvent.change(searchInput, { target: { value: 'ABC' } });

    expect(mockOnFiltersChange).toHaveBeenCalledTimes(3);
  });

  it('handles filter changes with existing values', () => {
    const existingFilters = {
      search: 'FDA',
      status: 'approved',
      approvalType: 'fda_510k',
      region: 'US',
      authority: 'FDA',
      priority: 'high',
      dateRange: {
        start: '2024-01-01',
        end: '2024-12-31'
      }
    };

    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalFilters
            filters={existingFilters}
            onFiltersChange={mockOnFiltersChange}
            onReset={mockOnReset}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    const searchInput = screen.getByDisplayValue('FDA');
    fireEvent.change(searchInput, { target: { value: 'EMA' } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...existingFilters,
      search: 'EMA'
    });
  });

  it('handles filter changes with null values', () => {
    const filtersWithNulls = {
      search: null,
      status: null,
      approvalType: null,
      region: null,
      authority: null,
      priority: null,
      dateRange: {
        start: null,
        end: null
      }
    };

    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalFilters
            filters={filtersWithNulls}
            onFiltersChange={mockOnFiltersChange}
            onReset={mockOnReset}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    const searchInput = screen.getByPlaceholderText('Zulassungen durchsuchen...');
    fireEvent.change(searchInput, { target: { value: 'Test' } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...filtersWithNulls,
      search: 'Test'
    });
  });

  it('handles filter changes with undefined values', () => {
    const filtersWithUndefined = {
      search: undefined,
      status: undefined,
      approvalType: undefined,
      region: undefined,
      authority: undefined,
      priority: undefined,
      dateRange: {
        start: undefined,
        end: undefined
      }
    };

    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalFilters
            filters={filtersWithUndefined}
            onFiltersChange={mockOnFiltersChange}
            onReset={mockOnReset}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    const searchInput = screen.getByPlaceholderText('Zulassungen durchsuchen...');
    fireEvent.change(searchInput, { target: { value: 'Test' } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...filtersWithUndefined,
      search: 'Test'
    });
  });

  it('handles filter changes with empty string values', () => {
    const filtersWithEmptyStrings = {
      search: '',
      status: '',
      approvalType: '',
      region: '',
      authority: '',
      priority: '',
      dateRange: {
        start: '',
        end: ''
      }
    };

    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalFilters
            filters={filtersWithEmptyStrings}
            onFiltersChange={mockOnFiltersChange}
            onReset={mockOnReset}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    const searchInput = screen.getByPlaceholderText('Zulassungen durchsuchen...');
    fireEvent.change(searchInput, { target: { value: 'Test' } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...filtersWithEmptyStrings,
      search: 'Test'
    });
  });

  it('handles filter changes with mixed value types', () => {
    const filtersWithMixedTypes = {
      search: 'FDA',
      status: 'approved',
      approvalType: null,
      region: '',
      authority: undefined,
      priority: 'high',
      dateRange: {
        start: '2024-01-01',
        end: null
      }
    };

    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalFilters
            filters={filtersWithMixedTypes}
            onFiltersChange={mockOnFiltersChange}
            onReset={mockOnReset}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    const searchInput = screen.getByDisplayValue('FDA');
    fireEvent.change(searchInput, { target: { value: 'EMA' } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...filtersWithMixedTypes,
      search: 'EMA'
    });
  });

  it('handles filter changes with complex date range', () => {
    const filtersWithComplexDateRange = {
      search: '',
      status: '',
      approvalType: '',
      region: '',
      authority: '',
      priority: '',
      dateRange: {
        start: '2024-01-01T00:00:00Z',
        end: '2024-12-31T23:59:59Z'
      }
    };

    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalFilters
            filters={filtersWithComplexDateRange}
            onFiltersChange={mockOnFiltersChange}
            onReset={mockOnReset}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    const startDateInput = screen.getByDisplayValue('2024-01-01T00:00:00Z');
    fireEvent.change(startDateInput, { target: { value: '2024-02-01' } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...filtersWithComplexDateRange,
      dateRange: {
        ...filtersWithComplexDateRange.dateRange,
        start: '2024-02-01'
      }
    });
  });
});
