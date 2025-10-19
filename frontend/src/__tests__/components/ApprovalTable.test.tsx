/**
 * MedTech Data Platform - ApprovalTable Tests
 * Umfassende Tests fÃ¼r die ApprovalTable-Komponente
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import ApprovalTable from '../../components/approvals/ApprovalTable';
import { AuthProvider } from '../../contexts/AuthContext';
import { SettingsProvider } from '../../contexts/SettingsContext';

// Mock-Daten fÃ¼r Tests
const mockApprovals = [
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
  },
  {
    id: '3',
    title: 'Test PMA Zulassung',
    approval_type: 'pma',
    status: 'rejected',
    region: 'US',
    authority: 'FDA',
    applicant_name: 'Test PMA Corp',
    reference_number: 'P123456',
    decision_date: '2024-01-10',
    priority: 'low',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

const mockOnViewDetails = vi.fn();
const mockOnEdit = vi.fn();
const mockOnDelete = vi.fn();

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

describe.skip('ApprovalTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders table headers correctly', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalTable
            approvals={mockApprovals}
            onViewDetails={mockOnViewDetails}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    // ÃœberprÃ¼fe, dass alle Tabellen-Header angezeigt werden
    expect(screen.getByText('Titel')).toBeInTheDocument();
    expect(screen.getByText('Typ')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Region')).toBeInTheDocument();
    expect(screen.getByText('BehÃ¶rde')).toBeInTheDocument();
    expect(screen.getByText('Antragsteller')).toBeInTheDocument();
    expect(screen.getByText('Referenznummer')).toBeInTheDocument();
    expect(screen.getByText('Entscheidungsdatum')).toBeInTheDocument();
    expect(screen.getByText('PrioritÃ¤t')).toBeInTheDocument();
    expect(screen.getByText('Aktionen')).toBeInTheDocument();
  });

  it('renders approval data correctly', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalTable
            approvals={mockApprovals}
            onViewDetails={mockOnViewDetails}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    // ÃœberprÃ¼fe, dass alle Zulassungsdaten angezeigt werden
    expect(screen.getByText('Test FDA 510(k) Zulassung')).toBeInTheDocument();
    expect(screen.getByText('Test CE Mark Zulassung')).toBeInTheDocument();
    expect(screen.getByText('Test PMA Zulassung')).toBeInTheDocument();
    
    expect(screen.getByText('FDA 510K')).toBeInTheDocument();
    expect(screen.getByText('CE MARK')).toBeInTheDocument();
    expect(screen.getByText('PMA')).toBeInTheDocument();
    
    expect(screen.getByText('APPROVED')).toBeInTheDocument();
    expect(screen.getByText('PENDING')).toBeInTheDocument();
    expect(screen.getByText('REJECTED')).toBeInTheDocument();
    
    expect(screen.getByText('US')).toBeInTheDocument();
    expect(screen.getByText('EU')).toBeInTheDocument();
    
    expect(screen.getByText('FDA')).toBeInTheDocument();
    expect(screen.getByText('EMA')).toBeInTheDocument();
    
    expect(screen.getByText('Test Medical Corp')).toBeInTheDocument();
    expect(screen.getByText('Test EU Corp')).toBeInTheDocument();
    expect(screen.getByText('Test PMA Corp')).toBeInTheDocument();
    
    expect(screen.getByText('K123456')).toBeInTheDocument();
    expect(screen.getByText('CE123456')).toBeInTheDocument();
    expect(screen.getByText('P123456')).toBeInTheDocument();
    
    expect(screen.getByText('15.01.2024')).toBeInTheDocument();
    expect(screen.getByText('10.01.2024')).toBeInTheDocument();
    expect(screen.getByText('N/A')).toBeInTheDocument();
    
    expect(screen.getByText('HIGH')).toBeInTheDocument();
    expect(screen.getByText('MEDIUM')).toBeInTheDocument();
    expect(screen.getByText('LOW')).toBeInTheDocument();
  });

  it('handles view details button clicks', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalTable
            approvals={mockApprovals}
            onViewDetails={mockOnViewDetails}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    const viewButtons = screen.getAllByText('Details');
    fireEvent.click(viewButtons[0]);

    expect(mockOnViewDetails).toHaveBeenCalledWith(mockApprovals[0]);
  });

  it('handles edit button clicks', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalTable
            approvals={mockApprovals}
            onViewDetails={mockOnViewDetails}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    const editButtons = screen.getAllByText('Bearbeiten');
    fireEvent.click(editButtons[0]);

    expect(mockOnEdit).toHaveBeenCalledWith(mockApprovals[0]);
  });

  it('handles delete button clicks', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalTable
            approvals={mockApprovals}
            onViewDetails={mockOnViewDetails}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    const deleteButtons = screen.getAllByText('LÃ¶schen');
    fireEvent.click(deleteButtons[0]);

    expect(mockOnDelete).toHaveBeenCalledWith(mockApprovals[0]);
  });

  it('handles table row clicks for navigation', () => {
    // Mock window.location
    delete (window as any).location;
    window.location = { href: '' } as any;

    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalTable
            approvals={mockApprovals}
            onViewDetails={mockOnViewDetails}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    const approvalRow = screen.getByText('Test FDA 510(k) Zulassung').closest('tr');
    fireEvent.click(approvalRow!);

    expect(window.location.href).toBe('/approvals/1');
  });

  it('displays correct status badges with styling', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalTable
            approvals={mockApprovals}
            onViewDetails={mockOnViewDetails}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    const approvedBadge = screen.getByText('APPROVED');
    const pendingBadge = screen.getByText('PENDING');
    const rejectedBadge = screen.getByText('REJECTED');

    expect(approvedBadge).toHaveClass('bg-green-100', 'text-green-800');
    expect(pendingBadge).toHaveClass('bg-yellow-100', 'text-yellow-800');
    expect(rejectedBadge).toHaveClass('bg-red-100', 'text-red-800');
  });

  it('displays correct priority badges with styling', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalTable
            approvals={mockApprovals}
            onViewDetails={mockOnViewDetails}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    const highBadge = screen.getByText('HIGH');
    const mediumBadge = screen.getByText('MEDIUM');
    const lowBadge = screen.getByText('LOW');

    expect(highBadge).toHaveClass('bg-red-100', 'text-red-800');
    expect(mediumBadge).toHaveClass('bg-yellow-100', 'text-yellow-800');
    expect(lowBadge).toHaveClass('bg-gray-100', 'text-gray-800');
  });

  it('handles empty approvals array', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalTable
            approvals={[]}
            onViewDetails={mockOnViewDetails}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    // Header sollte noch angezeigt werden
    expect(screen.getByText('Titel')).toBeInTheDocument();
    
    // Keine Datenzeilen sollten angezeigt werden
    expect(screen.queryByText('Test FDA 510(k) Zulassung')).not.toBeInTheDocument();
  });

  it('handles null approvals array', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalTable
            approvals={null as any}
            onViewDetails={mockOnViewDetails}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    // Header sollte noch angezeigt werden
    expect(screen.getByText('Titel')).toBeInTheDocument();
    
    // Keine Datenzeilen sollten angezeigt werden
    expect(screen.queryByText('Test FDA 510(k) Zulassung')).not.toBeInTheDocument();
  });

  it('handles undefined approvals array', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalTable
            approvals={undefined as any}
            onViewDetails={mockOnViewDetails}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    // Header sollte noch angezeigt werden
    expect(screen.getByText('Titel')).toBeInTheDocument();
    
    // Keine Datenzeilen sollten angezeigt werden
    expect(screen.queryByText('Test FDA 510(k) Zulassung')).not.toBeInTheDocument();
  });

  it('handles approvals with missing data', () => {
    const incompleteApprovals = [
      {
        id: '1',
        title: 'Incomplete Approval',
        approval_type: null,
        status: 'pending',
        region: null,
        authority: null,
        applicant_name: null,
        reference_number: null,
        decision_date: null,
        priority: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];

    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalTable
            approvals={incompleteApprovals}
            onViewDetails={mockOnViewDetails}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    expect(screen.getByText('Incomplete Approval')).toBeInTheDocument();
    expect(screen.getByText('PENDING')).toBeInTheDocument();
    expect(screen.getAllByText('N/A')).toHaveLength(5); // Typ, Region, BehÃ¶rde, Referenznummer, Entscheidungsdatum, PrioritÃ¤t
  });

  it('handles approvals with long titles', () => {
    const longTitleApprovals = [
      {
        ...mockApprovals[0],
        title: 'Sehr lange Zulassung mit einem extrem langen Titel der Ã¼ber mehrere Zeilen gehen kÃ¶nnte und trotzdem korrekt angezeigt werden sollte'
      }
    ];

    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalTable
            approvals={longTitleApprovals}
            onViewDetails={mockOnViewDetails}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    expect(screen.getByText(longTitleApprovals[0].title)).toBeInTheDocument();
  });

  it('handles approvals with special characters', () => {
    const specialCharApprovals = [
      {
        ...mockApprovals[0],
        title: 'Zulassung mit Sonderzeichen: & < > " \' / \\',
        applicant_name: 'Firma & Co. KG (Test)',
        reference_number: 'K-123/456 & 789'
      }
    ];

    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalTable
            approvals={specialCharApprovals}
            onViewDetails={mockOnViewDetails}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    expect(screen.getByText(specialCharApprovals[0].title)).toBeInTheDocument();
    expect(screen.getByText(specialCharApprovals[0].applicant_name)).toBeInTheDocument();
    expect(screen.getByText(specialCharApprovals[0].reference_number)).toBeInTheDocument();
  });

  it('handles approvals with different date formats', () => {
    const differentDateApprovals = [
      {
        ...mockApprovals[0],
        decision_date: '2024-01-15T10:30:00Z'
      },
      {
        ...mockApprovals[1],
        decision_date: '2024-01-15'
      },
      {
        ...mockApprovals[2],
        decision_date: '2024-01-15T10:30:00.000Z'
      }
    ];

    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalTable
            approvals={differentDateApprovals}
            onViewDetails={mockOnViewDetails}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    expect(screen.getAllByText('15.01.2024')).toHaveLength(3);
  });

  it('handles approvals with different approval types', () => {
    const differentTypeApprovals = [
      { ...mockApprovals[0], approval_type: 'fda_510k' },
      { ...mockApprovals[0], approval_type: 'pma' },
      { ...mockApprovals[0], approval_type: 'ce_mark' },
      { ...mockApprovals[0], approval_type: 'mdr' },
      { ...mockApprovals[0], approval_type: 'ivd' },
      { ...mockApprovals[0], approval_type: 'iso' },
      { ...mockApprovals[0], approval_type: 'other' }
    ];

    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalTable
            approvals={differentTypeApprovals}
            onViewDetails={mockOnViewDetails}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    expect(screen.getByText('FDA 510K')).toBeInTheDocument();
    expect(screen.getByText('PMA')).toBeInTheDocument();
    expect(screen.getByText('CE MARK')).toBeInTheDocument();
    expect(screen.getByText('MDR')).toBeInTheDocument();
    expect(screen.getByText('IVD')).toBeInTheDocument();
    expect(screen.getByText('ISO')).toBeInTheDocument();
    expect(screen.getByText('OTHER')).toBeInTheDocument();
  });

  it('handles approvals with different regions', () => {
    const differentRegionApprovals = [
      { ...mockApprovals[0], region: 'US' },
      { ...mockApprovals[0], region: 'EU' },
      { ...mockApprovals[0], region: 'Germany' },
      { ...mockApprovals[0], region: 'Global' },
      { ...mockApprovals[0], region: 'APAC' },
      { ...mockApprovals[0], region: 'Canada' },
      { ...mockApprovals[0], region: 'Australia' }
    ];

    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalTable
            approvals={differentRegionApprovals}
            onViewDetails={mockOnViewDetails}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    expect(screen.getByText('US')).toBeInTheDocument();
    expect(screen.getByText('EU')).toBeInTheDocument();
    expect(screen.getByText('Germany')).toBeInTheDocument();
    expect(screen.getByText('Global')).toBeInTheDocument();
    expect(screen.getByText('APAC')).toBeInTheDocument();
    expect(screen.getByText('Canada')).toBeInTheDocument();
    expect(screen.getByText('Australia')).toBeInTheDocument();
  });

  it('handles approvals with different authorities', () => {
    const differentAuthorityApprovals = [
      { ...mockApprovals[0], authority: 'FDA' },
      { ...mockApprovals[0], authority: 'EMA' },
      { ...mockApprovals[0], authority: 'BfArM' },
      { ...mockApprovals[0], authority: 'ISO' },
      { ...mockApprovals[0], authority: 'IEC' },
      { ...mockApprovals[0], authority: 'Other' },
      { ...mockApprovals[0], authority: 'Health Canada' }
    ];

    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalTable
            approvals={differentAuthorityApprovals}
            onViewDetails={mockOnViewDetails}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    expect(screen.getByText('FDA')).toBeInTheDocument();
    expect(screen.getByText('EMA')).toBeInTheDocument();
    expect(screen.getByText('BfArM')).toBeInTheDocument();
    expect(screen.getByText('ISO')).toBeInTheDocument();
    expect(screen.getByText('IEC')).toBeInTheDocument();
    expect(screen.getByText('Other')).toBeInTheDocument();
    expect(screen.getByText('Health Canada')).toBeInTheDocument();
  });

  it('handles large number of approvals', () => {
    const largeApprovalsArray = Array.from({ length: 100 }, (_, i) => ({
      ...mockApprovals[0],
      id: `${i + 1}`,
      title: `Test Approval ${i + 1}`,
      reference_number: `K${i + 1}`
    }));

    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalTable
            approvals={largeApprovalsArray}
            onViewDetails={mockOnViewDetails}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    // ÃœberprÃ¼fe, dass alle 100 Zulassungen angezeigt werden
    expect(screen.getAllByText(/Test Approval \d+/)).toHaveLength(100);
    expect(screen.getAllByText(/K\d+/)).toHaveLength(100);
  });

  it('handles rapid button clicks', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalTable
            approvals={mockApprovals}
            onViewDetails={mockOnViewDetails}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    const viewButtons = screen.getAllByText('Details');
    
    // Klicke schnell auf mehrere Buttons
    fireEvent.click(viewButtons[0]);
    fireEvent.click(viewButtons[1]);
    fireEvent.click(viewButtons[2]);

    expect(mockOnViewDetails).toHaveBeenCalledTimes(3);
    expect(mockOnViewDetails).toHaveBeenCalledWith(mockApprovals[0]);
    expect(mockOnViewDetails).toHaveBeenCalledWith(mockApprovals[1]);
    expect(mockOnViewDetails).toHaveBeenCalledWith(mockApprovals[2]);
  });

  it('handles table sorting', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalTable
            approvals={mockApprovals}
            onViewDetails={mockOnViewDetails}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    // Klicke auf Titel-Header zum Sortieren
    const titleHeader = screen.getByText('Titel');
    fireEvent.click(titleHeader);

    // ÃœberprÃ¼fe, dass die Tabelle noch korrekt angezeigt wird
    expect(screen.getByText('Test FDA 510(k) Zulassung')).toBeInTheDocument();
    expect(screen.getByText('Test CE Mark Zulassung')).toBeInTheDocument();
    expect(screen.getByText('Test PMA Zulassung')).toBeInTheDocument();
  });

  it('handles table pagination', () => {
    const paginatedApprovals = Array.from({ length: 25 }, (_, i) => ({
      ...mockApprovals[0],
      id: `${i + 1}`,
      title: `Test Approval ${i + 1}`,
      reference_number: `K${i + 1}`
    }));

    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalTable
            approvals={paginatedApprovals}
            onViewDetails={mockOnViewDetails}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    // ÃœberprÃ¼fe, dass alle 25 Zulassungen angezeigt werden
    expect(screen.getAllByText(/Test Approval \d+/)).toHaveLength(25);
  });

  it('handles table with mixed data types', () => {
    const mixedDataApprovals = [
      { ...mockApprovals[0], priority: 'high' },
      { ...mockApprovals[0], priority: 'medium' },
      { ...mockApprovals[0], priority: 'low' },
      { ...mockApprovals[0], priority: null },
      { ...mockApprovals[0], priority: undefined }
    ];

    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalTable
            approvals={mixedDataApprovals}
            onViewDetails={mockOnViewDetails}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    expect(screen.getByText('HIGH')).toBeInTheDocument();
    expect(screen.getByText('MEDIUM')).toBeInTheDocument();
    expect(screen.getByText('LOW')).toBeInTheDocument();
    expect(screen.getAllByText('N/A')).toHaveLength(2); // FÃ¼r null und undefined
  });
});



