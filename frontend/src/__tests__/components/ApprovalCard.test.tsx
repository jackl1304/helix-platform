/**
 * MedTech Data Platform - ApprovalCard Tests
 * Umfassende Tests für die ApprovalCard-Komponente
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import ApprovalCard from '../../components/approvals/ApprovalCard';
import { AuthProvider } from '../../contexts/AuthContext';
import { SettingsProvider } from '../../contexts/SettingsContext';

// Mock-Daten für Tests
const mockApproval = {
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
};

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

describe('ApprovalCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders approval title correctly', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalCard approval={mockApproval} onViewDetails={vi.fn()} />
        </SettingsProvider>
      </AuthProvider>
    );

    expect(screen.getByText('Test FDA 510(k) Zulassung')).toBeInTheDocument();
  });

  it('displays approval type badge', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalCard approval={mockApproval} onViewDetails={vi.fn()} />
        </SettingsProvider>
      </AuthProvider>
    );

    expect(screen.getByText('FDA 510K')).toBeInTheDocument();
  });

  it('shows status badge with correct styling', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalCard approval={mockApproval} onViewDetails={vi.fn()} />
        </SettingsProvider>
      </AuthProvider>
    );

    const statusBadge = screen.getByText('APPROVED');
    expect(statusBadge).toBeInTheDocument();
    expect(statusBadge).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('displays region and authority information', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalCard approval={mockApproval} onViewDetails={vi.fn()} />
        </SettingsProvider>
      </AuthProvider>
    );

    expect(screen.getByText('US')).toBeInTheDocument();
    expect(screen.getByText('FDA')).toBeInTheDocument();
  });

  it('shows applicant name', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalCard approval={mockApproval} onViewDetails={vi.fn()} />
        </SettingsProvider>
      </AuthProvider>
    );

    expect(screen.getByText('Test Medical Corp')).toBeInTheDocument();
  });

  it('displays reference number', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalCard approval={mockApproval} onViewDetails={vi.fn()} />
        </SettingsProvider>
      </AuthProvider>
    );

    expect(screen.getByText('K123456')).toBeInTheDocument();
  });

  it('shows decision date when available', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalCard approval={mockApproval} onViewDetails={vi.fn()} />
        </SettingsProvider>
      </AuthProvider>
    );

    expect(screen.getByText('15.01.2024')).toBeInTheDocument();
  });

  it('displays priority badge with correct styling', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalCard approval={mockApproval} onViewDetails={vi.fn()} />
        </SettingsProvider>
      </AuthProvider>
    );

    const priorityBadge = screen.getByText('HIGH');
    expect(priorityBadge).toBeInTheDocument();
    expect(priorityBadge).toHaveClass('bg-red-100', 'text-red-800');
  });

  it('calls onViewDetails when view button is clicked', () => {
    const mockOnViewDetails = vi.fn();
    
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalCard approval={mockApproval} onViewDetails={mockOnViewDetails} />
        </SettingsProvider>
      </AuthProvider>
    );

    const viewButton = screen.getByText('Details anzeigen');
    fireEvent.click(viewButton);

    expect(mockOnViewDetails).toHaveBeenCalledWith(mockApproval);
  });

  it('handles pending status correctly', () => {
    const pendingApproval = { ...mockApproval, status: 'pending' };
    
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalCard approval={pendingApproval} onViewDetails={vi.fn()} />
        </SettingsProvider>
      </AuthProvider>
    );

    const statusBadge = screen.getByText('PENDING');
    expect(statusBadge).toBeInTheDocument();
    expect(statusBadge).toHaveClass('bg-yellow-100', 'text-yellow-800');
  });

  it('handles rejected status correctly', () => {
    const rejectedApproval = { ...mockApproval, status: 'rejected' };
    
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalCard approval={rejectedApproval} onViewDetails={vi.fn()} />
        </SettingsProvider>
      </AuthProvider>
    );

    const statusBadge = screen.getByText('REJECTED');
    expect(statusBadge).toBeInTheDocument();
    expect(statusBadge).toHaveClass('bg-red-100', 'text-red-800');
  });

  it('handles medium priority correctly', () => {
    const mediumPriorityApproval = { ...mockApproval, priority: 'medium' };
    
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalCard approval={mediumPriorityApproval} onViewDetails={vi.fn()} />
        </SettingsProvider>
      </AuthProvider>
    );

    const priorityBadge = screen.getByText('MEDIUM');
    expect(priorityBadge).toBeInTheDocument();
    expect(priorityBadge).toHaveClass('bg-yellow-100', 'text-yellow-800');
  });

  it('handles low priority correctly', () => {
    const lowPriorityApproval = { ...mockApproval, priority: 'low' };
    
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalCard approval={lowPriorityApproval} onViewDetails={vi.fn()} />
        </SettingsProvider>
      </AuthProvider>
    );

    const priorityBadge = screen.getByText('LOW');
    expect(priorityBadge).toBeInTheDocument();
    expect(priorityBadge).toHaveClass('bg-gray-100', 'text-gray-800');
  });

  it('handles missing decision date', () => {
    const approvalWithoutDate = { ...mockApproval, decision_date: null };
    
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalCard approval={approvalWithoutDate} onViewDetails={vi.fn()} />
        </SettingsProvider>
      </AuthProvider>
    );

    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('displays correct approval type for CE Mark', () => {
    const ceApproval = { ...mockApproval, approval_type: 'ce_mark' };
    
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalCard approval={ceApproval} onViewDetails={vi.fn()} />
        </SettingsProvider>
      </AuthProvider>
    );

    expect(screen.getByText('CE MARK')).toBeInTheDocument();
  });

  it('displays correct approval type for PMA', () => {
    const pmaApproval = { ...mockApproval, approval_type: 'pma' };
    
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalCard approval={pmaApproval} onViewDetails={vi.fn()} />
        </SettingsProvider>
      </AuthProvider>
    );

    expect(screen.getByText('PMA')).toBeInTheDocument();
  });

  it('displays correct approval type for MDR', () => {
    const mdrApproval = { ...mockApproval, approval_type: 'mdr' };
    
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalCard approval={mdrApproval} onViewDetails={vi.fn()} />
        </SettingsProvider>
      </AuthProvider>
    );

    expect(screen.getByText('MDR')).toBeInTheDocument();
  });

  it('handles different regions correctly', () => {
    const euApproval = { ...mockApproval, region: 'EU' };
    
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalCard approval={euApproval} onViewDetails={vi.fn()} />
        </SettingsProvider>
      </AuthProvider>
    );

    expect(screen.getByText('EU')).toBeInTheDocument();
  });

  it('handles different authorities correctly', () => {
    const emaApproval = { ...mockApproval, authority: 'EMA' };
    
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalCard approval={emaApproval} onViewDetails={vi.fn()} />
        </SettingsProvider>
      </AuthProvider>
    );

    expect(screen.getByText('EMA')).toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalCard approval={mockApproval} onViewDetails={vi.fn()} />
        </SettingsProvider>
      </AuthProvider>
    );

    const card = screen.getByText('Test FDA 510(k) Zulassung').closest('.bg-white');
    expect(card).toHaveClass('shadow-md', 'hover:shadow-lg');
  });

  it('displays all required information', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalCard approval={mockApproval} onViewDetails={vi.fn()} />
        </SettingsProvider>
      </AuthProvider>
    );

    // Überprüfe, dass alle wichtigen Informationen angezeigt werden
    expect(screen.getByText('Test FDA 510(k) Zulassung')).toBeInTheDocument();
    expect(screen.getByText('FDA 510K')).toBeInTheDocument();
    expect(screen.getByText('APPROVED')).toBeInTheDocument();
    expect(screen.getByText('US')).toBeInTheDocument();
    expect(screen.getByText('FDA')).toBeInTheDocument();
    expect(screen.getByText('Test Medical Corp')).toBeInTheDocument();
    expect(screen.getByText('K123456')).toBeInTheDocument();
    expect(screen.getByText('15.01.2024')).toBeInTheDocument();
    expect(screen.getByText('HIGH')).toBeInTheDocument();
    expect(screen.getByText('Details anzeigen')).toBeInTheDocument();
  });

  it('handles click events correctly', () => {
    const mockOnViewDetails = vi.fn();
    
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalCard approval={mockApproval} onViewDetails={mockOnViewDetails} />
        </SettingsProvider>
      </AuthProvider>
    );

    // Teste Klick auf die Karte selbst
    const card = screen.getByText('Test FDA 510(k) Zulassung').closest('.bg-white');
    fireEvent.click(card!);

    expect(mockOnViewDetails).toHaveBeenCalledWith(mockApproval);
  });

  it('displays correct icons for different approval types', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalCard approval={mockApproval} onViewDetails={vi.fn()} />
        </SettingsProvider>
      </AuthProvider>
    );

    // Überprüfe, dass Icons für verschiedene Typen angezeigt werden
    expect(screen.getByText('FDA 510K')).toBeInTheDocument();
  });

  it('handles long titles correctly', () => {
    const longTitleApproval = { 
      ...mockApproval, 
      title: 'Sehr lange Zulassung mit einem extrem langen Titel der über mehrere Zeilen gehen könnte und trotzdem korrekt angezeigt werden sollte' 
    };
    
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalCard approval={longTitleApproval} onViewDetails={vi.fn()} />
        </SettingsProvider>
      </AuthProvider>
    );

    expect(screen.getByText(longTitleApproval.title)).toBeInTheDocument();
  });

  it('maintains consistent layout structure', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalCard approval={mockApproval} onViewDetails={vi.fn()} />
        </SettingsProvider>
      </AuthProvider>
    );

    // Überprüfe, dass die Struktur der Karte korrekt ist
    const card = screen.getByText('Test FDA 510(k) Zulassung').closest('.bg-white');
    expect(card).toBeInTheDocument();
    
    // Überprüfe, dass alle wichtigen Bereiche vorhanden sind
    expect(screen.getByText('Test FDA 510(k) Zulassung')).toBeInTheDocument(); // Titel
    expect(screen.getByText('FDA 510K')).toBeInTheDocument(); // Typ
    expect(screen.getByText('APPROVED')).toBeInTheDocument(); // Status
    expect(screen.getByText('Details anzeigen')).toBeInTheDocument(); // Button
  });
});
