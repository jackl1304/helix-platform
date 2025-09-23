/**
 * MedTech Data Platform - ApprovalsPage Tests
 * Umfassende Tests für die ApprovalsPage-Komponente
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import ApprovalsPage from '../pages/approvals/ApprovalsPage';
import { AuthProvider } from '../contexts/AuthContext';
import { SettingsProvider } from '../contexts/SettingsContext';

// Mock der API-Hooks
vi.mock('../hooks/useApprovals', () => ({
  useApprovals: vi.fn(() => ({
    data: {
      items: [
        {
          id: '1',
          title: 'Test FDA 510(k) Zulassung',
          approval_type: 'fda_510k',
          status: 'approved',
          region: 'US',
          authority: 'FDA',
          applicant_name: 'Test Medical Corp',
          reference_number: 'K123456',
          decision_date: '2024-01-15',
          priority: 'high',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          title: 'Test CE Mark Zulassung',
          approval_type: 'ce_mark',
          status: 'pending',
          region: 'EU',
          authority: 'EMA',
          applicant_name: 'Test EU Corp',
          reference_number: 'CE123456',
          decision_date: null,
          priority: 'medium',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ],
      total: 2
    },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    isFetching: false
  }))
}));

vi.mock('../hooks/useApprovalFilters', () => ({
  useApprovalFilters: vi.fn(() => ({
    filters: {},
    setFilters: vi.fn(),
    resetFilters: vi.fn()
  }))
}));

// Mock der Context-Provider
const mockAuthContext = {
  user: {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    permissions: ['read_approvals', 'write_approvals']
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

// Test-Wrapper-Komponente
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider value={mockAuthContext}>
          <SettingsProvider value={mockSettingsContext}>
            {children}
          </SettingsProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('ApprovalsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders page title and subtitle correctly', async () => {
    render(
      <TestWrapper>
        <ApprovalsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('MedTech Zulassungen')).toBeInTheDocument();
      expect(screen.getByText('2 Zulassungen aus 400+ Quellen')).toBeInTheDocument();
    });
  });

  it('displays statistics cards with correct data', async () => {
    render(
      <TestWrapper>
        <ApprovalsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument(); // Gesamt
      expect(screen.getByText('1')).toBeInTheDocument(); // Genehmigt (1 von 2)
      expect(screen.getByText('1')).toBeInTheDocument(); // Ausstehend (1 von 2)
    });
  });

  it('shows search input and filter controls', async () => {
    render(
      <TestWrapper>
        <ApprovalsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Zulassungen durchsuchen...')).toBeInTheDocument();
      expect(screen.getByText('Filter')).toBeInTheDocument();
    });
  });

  it('displays approvals in table view by default', async () => {
    render(
      <TestWrapper>
        <ApprovalsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Test FDA 510(k) Zulassung')).toBeInTheDocument();
      expect(screen.getByText('Test CE Mark Zulassung')).toBeInTheDocument();
      expect(screen.getByText('K123456')).toBeInTheDocument();
      expect(screen.getByText('CE123456')).toBeInTheDocument();
    });
  });

  it('switches between table and card view', async () => {
    render(
      <TestWrapper>
        <ApprovalsPage />
      </TestWrapper>
    );

    // Standardmäßig sollte Tabelle angezeigt werden
    await waitFor(() => {
      expect(screen.getByText('Test FDA 510(k) Zulassung')).toBeInTheDocument();
    });

    // Wechsle zu Kartenansicht
    const viewSelect = screen.getByDisplayValue('Tabelle');
    fireEvent.click(viewSelect);
    
    const cardOption = screen.getByText('Karten');
    fireEvent.click(cardOption);

    // Überprüfe, dass Kartenansicht angezeigt wird
    await waitFor(() => {
      // In der Kartenansicht sollten die Zulassungen als Karten angezeigt werden
      expect(screen.getByText('Test FDA 510(k) Zulassung')).toBeInTheDocument();
      expect(screen.getByText('Test CE Mark Zulassung')).toBeInTheDocument();
    });
  });

  it('handles search input correctly', async () => {
    render(
      <TestWrapper>
        <ApprovalsPage />
      </TestWrapper>
    );

    const searchInput = screen.getByPlaceholderText('Zulassungen durchsuchen...');
    
    fireEvent.change(searchInput, { target: { value: 'FDA' } });
    
    await waitFor(() => {
      expect(searchInput).toHaveValue('FDA');
    });
  });

  it('toggles filter panel visibility', async () => {
    render(
      <TestWrapper>
        <ApprovalsPage />
      </TestWrapper>
    );

    const filterButton = screen.getByText('Filter');
    
    // Filter-Panel sollte initial nicht sichtbar sein
    expect(screen.queryByText('Filter & Suche')).not.toBeInTheDocument();
    
    // Klicke auf Filter-Button
    fireEvent.click(filterButton);
    
    // Filter-Panel sollte jetzt sichtbar sein
    await waitFor(() => {
      expect(screen.getByText('Filter & Suche')).toBeInTheDocument();
    });
  });

  it('displays action buttons correctly', async () => {
    render(
      <TestWrapper>
        <ApprovalsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Aktualisieren')).toBeInTheDocument();
      expect(screen.getByText('Export')).toBeInTheDocument();
      expect(screen.getByText('Neue Zulassung')).toBeInTheDocument();
    });
  });

  it('shows correct status badges', async () => {
    render(
      <TestWrapper>
        <ApprovalsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('APPROVED')).toBeInTheDocument();
      expect(screen.getByText('PENDING')).toBeInTheDocument();
    });
  });

  it('displays approval types correctly', async () => {
    render(
      <TestWrapper>
        <ApprovalsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('FDA 510K')).toBeInTheDocument();
      expect(screen.getByText('CE MARK')).toBeInTheDocument();
    });
  });

  it('shows priority badges correctly', async () => {
    render(
      <TestWrapper>
        <ApprovalsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('HIGH')).toBeInTheDocument();
      expect(screen.getByText('MEDIUM')).toBeInTheDocument();
    });
  });

  it('handles loading state', async () => {
    // Mock loading state
    const { useApprovals } = await import('../hooks/useApprovals');
    vi.mocked(useApprovals).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
      isFetching: false
    });

    render(
      <TestWrapper>
        <ApprovalsPage />
      </TestWrapper>
    );

    // Loading-Spinner sollte angezeigt werden
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('handles error state', async () => {
    // Mock error state
    const { useApprovals } = await import('../hooks/useApprovals');
    vi.mocked(useApprovals).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('API Error'),
      refetch: vi.fn(),
      isFetching: false
    });

    render(
      <TestWrapper>
        <ApprovalsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Fehler beim Laden der Zulassungen')).toBeInTheDocument();
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });

  it('calls refetch when refresh button is clicked', async () => {
    const mockRefetch = vi.fn();
    const { useApprovals } = await import('../hooks/useApprovals');
    vi.mocked(useApprovals).mockReturnValue({
      data: { items: [], total: 0 },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
      isFetching: false
    });

    render(
      <TestWrapper>
        <ApprovalsPage />
      </TestWrapper>
    );

    const refreshButton = screen.getByText('Aktualisieren');
    fireEvent.click(refreshButton);

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('handles empty data state', async () => {
    const { useApprovals } = await import('../hooks/useApprovals');
    vi.mocked(useApprovals).mockReturnValue({
      data: { items: [], total: 0 },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
      isFetching: false
    });

    render(
      <TestWrapper>
        <ApprovalsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('0 Zulassungen aus 400+ Quellen')).toBeInTheDocument();
    });
  });

  it('displays correct region and authority information', async () => {
    render(
      <TestWrapper>
        <ApprovalsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('US')).toBeInTheDocument();
      expect(screen.getByText('FDA')).toBeInTheDocument();
      expect(screen.getByText('EU')).toBeInTheDocument();
      expect(screen.getByText('EMA')).toBeInTheDocument();
    });
  });

  it('shows applicant names correctly', async () => {
    render(
      <TestWrapper>
        <ApprovalsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Medical Corp')).toBeInTheDocument();
      expect(screen.getByText('Test EU Corp')).toBeInTheDocument();
    });
  });

  it('displays decision dates when available', async () => {
    render(
      <TestWrapper>
        <ApprovalsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      // FDA-Zulassung hat ein Entscheidungsdatum
      expect(screen.getByText('15.01.2024')).toBeInTheDocument();
      // CE-Zulassung hat kein Entscheidungsdatum
      expect(screen.getByText('N/A')).toBeInTheDocument();
    });
  });

  it('handles table row clicks for navigation', async () => {
    // Mock window.location
    delete (window as any).location;
    window.location = { href: '' } as any;

    render(
      <TestWrapper>
        <ApprovalsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      const approvalRow = screen.getByText('Test FDA 510(k) Zulassung');
      fireEvent.click(approvalRow);
    });

    // Überprüfe, dass Navigation stattgefunden hat
    expect(window.location.href).toBe('/approvals/1');
  });

  it('displays correct pagination information', async () => {
    render(
      <TestWrapper>
        <ApprovalsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      // Überprüfe, dass Pagination-Informationen angezeigt werden
      expect(screen.getByText('2')).toBeInTheDocument(); // Total count
    });
  });

  it('handles export button click', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    render(
      <TestWrapper>
        <ApprovalsPage />
      </TestWrapper>
    );

    const exportButton = screen.getByText('Export');
    fireEvent.click(exportButton);

    expect(consoleSpy).toHaveBeenCalledWith('Exporting approvals...');
    
    consoleSpy.mockRestore();
  });

  it('handles new approval button click', async () => {
    render(
      <TestWrapper>
        <ApprovalsPage />
      </TestWrapper>
    );

    const newApprovalButton = screen.getByText('Neue Zulassung');
    expect(newApprovalButton).toBeInTheDocument();
    
    // Button sollte klickbar sein
    fireEvent.click(newApprovalButton);
  });

  it('displays correct reference numbers', async () => {
    render(
      <TestWrapper>
        <ApprovalsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('K123456')).toBeInTheDocument();
      expect(screen.getByText('CE123456')).toBeInTheDocument();
    });
  });

  it('shows correct approval type badges', async () => {
    render(
      <TestWrapper>
        <ApprovalsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      const badges = screen.getAllByText(/FDA 510K|CE MARK/);
      expect(badges).toHaveLength(2);
    });
  });

  it('handles responsive design correctly', async () => {
    render(
      <TestWrapper>
        <ApprovalsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      // Überprüfe, dass responsive Klassen vorhanden sind
      const statisticsGrid = screen.getByText('Gesamt').closest('.grid');
      expect(statisticsGrid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4');
    });
  });
});
