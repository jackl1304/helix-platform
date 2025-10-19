/**
 * MedTech Data Platform - ApprovalDetailView Tests
 * Umfassende Tests fÃ¼r die ApprovalDetailView-Komponente
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import ApprovalDetailView from '../../components/approvals/ApprovalDetailView';
import { AuthProvider } from '../../contexts/AuthContext';
import { SettingsProvider } from '../../contexts/SettingsContext';

// Mock-Daten fÃ¼r Tests
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
  updated_at: '2024-01-01T00:00:00Z',
  full_text: 'VollstÃ¤ndiger Text der Zulassung mit allen Details und technischen Spezifikationen.',
  attachments: [
    'https://example.com/attachment1.pdf',
    'https://example.com/attachment2.pdf'
  ],
  related_documents: [
    'https://example.com/related1.pdf',
    'https://example.com/related2.pdf'
  ],
  detailed_analysis: {
    risk_assessment: 'Niedriges Risiko fÃ¼r Patienten und Anwender.',
    clinical_data: 'Umfassende klinische Studien mit positiven Ergebnissen.',
    regulatory_pathway: 'Standard 510(k) Pathway erfolgreich durchlaufen.',
    market_impact: 'Signifikante Marktchancen in den USA erwartet.',
    compliance_requirements: [
      'FDA 21 CFR Part 820',
      'ISO 13485:2016',
      'FDA Quality System Regulation'
    ]
  },
  metadata: {
    source: 'FDA Database',
    last_updated: '2024-01-15T10:30:00Z',
    confidence: 0.95,
    verification_status: 'verified'
  }
};

const mockOnClose = vi.fn();
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

describe.skip('ApprovalDetailView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders approval details correctly', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalDetailView
            approval={mockApproval}
            onClose={mockOnClose}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    // ÃœberprÃ¼fe, dass alle Zulassungsdetails angezeigt werden
    expect(screen.getByText('Test FDA 510(k) Zulassung')).toBeInTheDocument();
    expect(screen.getByText('FDA 510K')).toBeInTheDocument();
    expect(screen.getByText('APPROVED')).toBeInTheDocument();
    expect(screen.getByText('US')).toBeInTheDocument();
    expect(screen.getByText('FDA')).toBeInTheDocument();
    expect(screen.getByText('Test Medical Corp')).toBeInTheDocument();
    expect(screen.getByText('K123456')).toBeInTheDocument();
    expect(screen.getByText('15.01.2024')).toBeInTheDocument();
    expect(screen.getByText('HIGH')).toBeInTheDocument();
  });

  it('renders tab navigation correctly', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalDetailView
            approval={mockApproval}
            onClose={mockOnClose}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    // ÃœberprÃ¼fe, dass alle Tabs angezeigt werden
    expect(screen.getByText('Ãœbersicht')).toBeInTheDocument();
    expect(screen.getByText('Volltext')).toBeInTheDocument();
    expect(screen.getByText('AnhÃ¤nge')).toBeInTheDocument();
    expect(screen.getByText('Verwandte Dokumente')).toBeInTheDocument();
    expect(screen.getByText('Detaillierte Analyse')).toBeInTheDocument();
  });

  it('displays overview tab content correctly', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalDetailView
            approval={mockApproval}
            onClose={mockOnClose}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    // ÃœberprÃ¼fe, dass Ãœbersichts-Tab-Inhalt angezeigt wird
    expect(screen.getByText('Test FDA 510(k) Zulassung')).toBeInTheDocument();
    expect(screen.getByText('FDA 510K')).toBeInTheDocument();
    expect(screen.getByText('APPROVED')).toBeInTheDocument();
    expect(screen.getByText('US')).toBeInTheDocument();
    expect(screen.getByText('FDA')).toBeInTheDocument();
    expect(screen.getByText('Test Medical Corp')).toBeInTheDocument();
    expect(screen.getByText('K123456')).toBeInTheDocument();
    expect(screen.getByText('15.01.2024')).toBeInTheDocument();
    expect(screen.getByText('HIGH')).toBeInTheDocument();
  });

  it('displays full text tab content correctly', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalDetailView
            approval={mockApproval}
            onClose={mockOnClose}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    // Klicke auf Volltext-Tab
    const fullTextTab = screen.getByText('Volltext');
    fireEvent.click(fullTextTab);

    // ÃœberprÃ¼fe, dass Volltext-Inhalt angezeigt wird
    expect(screen.getByText('VollstÃ¤ndiger Text der Zulassung mit allen Details und technischen Spezifikationen.')).toBeInTheDocument();
  });

  it('displays attachments tab content correctly', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalDetailView
            approval={mockApproval}
            onClose={mockOnClose}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    // Klicke auf AnhÃ¤nge-Tab
    const attachmentsTab = screen.getByText('AnhÃ¤nge');
    fireEvent.click(attachmentsTab);

    // ÃœberprÃ¼fe, dass AnhÃ¤nge-Inhalt angezeigt wird
    expect(screen.getByText('attachment1.pdf')).toBeInTheDocument();
    expect(screen.getByText('attachment2.pdf')).toBeInTheDocument();
  });

  it('displays related documents tab content correctly', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalDetailView
            approval={mockApproval}
            onClose={mockOnClose}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    // Klicke auf Verwandte Dokumente-Tab
    const relatedDocsTab = screen.getByText('Verwandte Dokumente');
    fireEvent.click(relatedDocsTab);

    // ÃœberprÃ¼fe, dass verwandte Dokumente-Inhalt angezeigt wird
    expect(screen.getByText('related1.pdf')).toBeInTheDocument();
    expect(screen.getByText('related2.pdf')).toBeInTheDocument();
  });

  it('displays detailed analysis tab content correctly', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalDetailView
            approval={mockApproval}
            onClose={mockOnClose}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    // Klicke auf Detaillierte Analyse-Tab
    const analysisTab = screen.getByText('Detaillierte Analyse');
    fireEvent.click(analysisTab);

    // ÃœberprÃ¼fe, dass Analyse-Inhalt angezeigt wird
    expect(screen.getByText('Risikobewertung')).toBeInTheDocument();
    expect(screen.getByText('Niedriges Risiko fÃ¼r Patienten und Anwender.')).toBeInTheDocument();
    expect(screen.getByText('Klinische Daten')).toBeInTheDocument();
    expect(screen.getByText('Umfassende klinische Studien mit positiven Ergebnissen.')).toBeInTheDocument();
    expect(screen.getByText('Regulatorischer Weg')).toBeInTheDocument();
    expect(screen.getByText('Standard 510(k) Pathway erfolgreich durchlaufen.')).toBeInTheDocument();
    expect(screen.getByText('Marktauswirkung')).toBeInTheDocument();
    expect(screen.getByText('Signifikante Marktchancen in den USA erwartet.')).toBeInTheDocument();
    expect(screen.getByText('Compliance-Anforderungen')).toBeInTheDocument();
    expect(screen.getByText('FDA 21 CFR Part 820')).toBeInTheDocument();
    expect(screen.getByText('ISO 13485:2016')).toBeInTheDocument();
    expect(screen.getByText('FDA Quality System Regulation')).toBeInTheDocument();
  });

  it('handles close button click', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalDetailView
            approval={mockApproval}
            onClose={mockOnClose}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    const closeButton = screen.getByText('SchlieÃŸen');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('handles edit button click', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalDetailView
            approval={mockApproval}
            onClose={mockOnClose}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    const editButton = screen.getByText('Bearbeiten');
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockApproval);
  });

  it('handles delete button click', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalDetailView
            approval={mockApproval}
            onClose={mockOnClose}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    const deleteButton = screen.getByText('LÃ¶schen');
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith(mockApproval);
  });

  it('handles tab switching correctly', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalDetailView
            approval={mockApproval}
            onClose={mockOnClose}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    // Initial sollte Ãœbersicht-Tab aktiv sein
    expect(screen.getByText('Test FDA 510(k) Zulassung')).toBeInTheDocument();

    // Wechsle zu Volltext-Tab
    const fullTextTab = screen.getByText('Volltext');
    fireEvent.click(fullTextTab);

    // ÃœberprÃ¼fe, dass Volltext-Inhalt angezeigt wird
    expect(screen.getByText('VollstÃ¤ndiger Text der Zulassung mit allen Details und technischen Spezifikationen.')).toBeInTheDocument();

    // Wechsle zurÃ¼ck zu Ãœbersicht-Tab
    const overviewTab = screen.getByText('Ãœbersicht');
    fireEvent.click(overviewTab);

    // ÃœberprÃ¼fe, dass Ãœbersicht-Inhalt wieder angezeigt wird
    expect(screen.getByText('Test FDA 510(k) Zulassung')).toBeInTheDocument();
  });

  it('handles approval with missing full text', () => {
    const approvalWithoutFullText = { ...mockApproval, full_text: null };

    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalDetailView
            approval={approvalWithoutFullText}
            onClose={mockOnClose}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    // Klicke auf Volltext-Tab
    const fullTextTab = screen.getByText('Volltext');
    fireEvent.click(fullTextTab);

    // ÃœberprÃ¼fe, dass "Kein Volltext verfÃ¼gbar" angezeigt wird
    expect(screen.getByText('Kein Volltext verfÃ¼gbar')).toBeInTheDocument();
  });

  it('handles approval with empty attachments', () => {
    const approvalWithoutAttachments = { ...mockApproval, attachments: [] };

    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalDetailView
            approval={approvalWithoutAttachments}
            onClose={mockOnClose}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    // Klicke auf AnhÃ¤nge-Tab
    const attachmentsTab = screen.getByText('AnhÃ¤nge');
    fireEvent.click(attachmentsTab);

    // ÃœberprÃ¼fe, dass "Keine AnhÃ¤nge verfÃ¼gbar" angezeigt wird
    expect(screen.getByText('Keine AnhÃ¤nge verfÃ¼gbar')).toBeInTheDocument();
  });

  it('handles approval with empty related documents', () => {
    const approvalWithoutRelatedDocs = { ...mockApproval, related_documents: [] };

    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalDetailView
            approval={approvalWithoutRelatedDocs}
            onClose={mockOnClose}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    // Klicke auf Verwandte Dokumente-Tab
    const relatedDocsTab = screen.getByText('Verwandte Dokumente');
    fireEvent.click(relatedDocsTab);

    // ÃœberprÃ¼fe, dass "Keine verwandten Dokumente verfÃ¼gbar" angezeigt wird
    expect(screen.getByText('Keine verwandten Dokumente verfÃ¼gbar')).toBeInTheDocument();
  });

  it('handles approval with missing detailed analysis', () => {
    const approvalWithoutAnalysis = { ...mockApproval, detailed_analysis: null };

    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalDetailView
            approval={approvalWithoutAnalysis}
            onClose={mockOnClose}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    // Klicke auf Detaillierte Analyse-Tab
    const analysisTab = screen.getByText('Detaillierte Analyse');
    fireEvent.click(analysisTab);

    // ÃœberprÃ¼fe, dass "Keine detaillierte Analyse verfÃ¼gbar" angezeigt wird
    expect(screen.getByText('Keine detaillierte Analyse verfÃ¼gbar')).toBeInTheDocument();
  });

  it('handles approval with partial detailed analysis', () => {
    const approvalWithPartialAnalysis = {
      ...mockApproval,
      detailed_analysis: {
        risk_assessment: 'Niedriges Risiko fÃ¼r Patienten und Anwender.',
        clinical_data: null,
        regulatory_pathway: 'Standard 510(k) Pathway erfolgreich durchlaufen.',
        market_impact: null,
        compliance_requirements: []
      }
    };

    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalDetailView
            approval={approvalWithPartialAnalysis}
            onClose={mockOnClose}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    // Klicke auf Detaillierte Analyse-Tab
    const analysisTab = screen.getByText('Detaillierte Analyse');
    fireEvent.click(analysisTab);

    // ÃœberprÃ¼fe, dass verfÃ¼gbare Analyse-Inhalte angezeigt werden
    expect(screen.getByText('Risikobewertung')).toBeInTheDocument();
    expect(screen.getByText('Niedriges Risiko fÃ¼r Patienten und Anwender.')).toBeInTheDocument();
    expect(screen.getByText('Regulatorischer Weg')).toBeInTheDocument();
    expect(screen.getByText('Standard 510(k) Pathway erfolgreich durchlaufen.')).toBeInTheDocument();

    // ÃœberprÃ¼fe, dass fehlende Inhalte als "Nicht verfÃ¼gbar" angezeigt werden
    expect(screen.getByText('Klinische Daten')).toBeInTheDocument();
    expect(screen.getByText('Nicht verfÃ¼gbar')).toBeInTheDocument();
    expect(screen.getByText('Marktauswirkung')).toBeInTheDocument();
    expect(screen.getByText('Compliance-Anforderungen')).toBeInTheDocument();
  });

  it('handles approval with missing metadata', () => {
    const approvalWithoutMetadata = { ...mockApproval, metadata: null };

    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalDetailView
            approval={approvalWithoutMetadata}
            onClose={mockOnClose}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    // ÃœberprÃ¼fe, dass Zulassung ohne Metadaten korrekt angezeigt wird
    expect(screen.getByText('Test FDA 510(k) Zulassung')).toBeInTheDocument();
    expect(screen.getByText('FDA 510K')).toBeInTheDocument();
    expect(screen.getByText('APPROVED')).toBeInTheDocument();
  });

  it('handles approval with partial metadata', () => {
    const approvalWithPartialMetadata = {
      ...mockApproval,
      metadata: {
        source: 'FDA Database',
        last_updated: null,
        confidence: null,
        verification_status: null
      }
    };

    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalDetailView
            approval={approvalWithPartialMetadata}
            onClose={mockOnClose}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    // ÃœberprÃ¼fe, dass Zulassung mit partiellen Metadaten korrekt angezeigt wird
    expect(screen.getByText('Test FDA 510(k) Zulassung')).toBeInTheDocument();
    expect(screen.getByText('FDA 510K')).toBeInTheDocument();
    expect(screen.getByText('APPROVED')).toBeInTheDocument();
  });

  it('handles approval with very long title', () => {
    const approvalWithLongTitle = {
      ...mockApproval,
      title: 'Sehr lange Zulassung mit einem extrem langen Titel der Ã¼ber mehrere Zeilen gehen kÃ¶nnte und trotzdem korrekt angezeigt werden sollte ohne dass es zu Layout-Problemen kommt'
    };

    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalDetailView
            approval={approvalWithLongTitle}
            onClose={mockOnClose}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    // ÃœberprÃ¼fe, dass langer Titel korrekt angezeigt wird
    expect(screen.getByText(approvalWithLongTitle.title)).toBeInTheDocument();
  });

  it('handles approval with very long full text', () => {
    const approvalWithLongFullText = {
      ...mockApproval,
      full_text: 'Sehr langer Volltext der Zulassung mit vielen Details und technischen Spezifikationen. '.repeat(100)
    };

    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalDetailView
            approval={approvalWithLongFullText}
            onClose={mockOnClose}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    // Klicke auf Volltext-Tab
    const fullTextTab = screen.getByText('Volltext');
    fireEvent.click(fullTextTab);

    // ÃœberprÃ¼fe, dass langer Volltext korrekt angezeigt wird
    expect(screen.getByText(approvalWithLongFullText.full_text.substring(0, 100))).toBeInTheDocument();
  });

  it('handles approval with many attachments', () => {
    const approvalWithManyAttachments = {
      ...mockApproval,
      attachments: Array.from({ length: 50 }, (_, i) => `https://example.com/attachment${i + 1}.pdf`)
    };

    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalDetailView
            approval={approvalWithManyAttachments}
            onClose={mockOnClose}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    // Klicke auf AnhÃ¤nge-Tab
    const attachmentsTab = screen.getByText('AnhÃ¤nge');
    fireEvent.click(attachmentsTab);

    // ÃœberprÃ¼fe, dass viele AnhÃ¤nge korrekt angezeigt werden
    expect(screen.getByText('attachment1.pdf')).toBeInTheDocument();
    expect(screen.getByText('attachment50.pdf')).toBeInTheDocument();
  });

  it('handles approval with many related documents', () => {
    const approvalWithManyRelatedDocs = {
      ...mockApproval,
      related_documents: Array.from({ length: 50 }, (_, i) => `https://example.com/related${i + 1}.pdf`)
    };

    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalDetailView
            approval={approvalWithManyRelatedDocs}
            onClose={mockOnClose}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    // Klicke auf Verwandte Dokumente-Tab
    const relatedDocsTab = screen.getByText('Verwandte Dokumente');
    fireEvent.click(relatedDocsTab);

    // ÃœberprÃ¼fe, dass viele verwandte Dokumente korrekt angezeigt werden
    expect(screen.getByText('related1.pdf')).toBeInTheDocument();
    expect(screen.getByText('related50.pdf')).toBeInTheDocument();
  });

  it('handles approval with many compliance requirements', () => {
    const approvalWithManyComplianceReqs = {
      ...mockApproval,
      detailed_analysis: {
        ...mockApproval.detailed_analysis,
        compliance_requirements: Array.from({ length: 50 }, (_, i) => `Compliance Requirement ${i + 1}`)
      }
    };

    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalDetailView
            approval={approvalWithManyComplianceReqs}
            onClose={mockOnClose}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    // Klicke auf Detaillierte Analyse-Tab
    const analysisTab = screen.getByText('Detaillierte Analyse');
    fireEvent.click(analysisTab);

    // ÃœberprÃ¼fe, dass viele Compliance-Anforderungen korrekt angezeigt werden
    expect(screen.getByText('Compliance Requirement 1')).toBeInTheDocument();
    expect(screen.getByText('Compliance Requirement 50')).toBeInTheDocument();
  });

  it('handles approval with special characters in all fields', () => {
    const approvalWithSpecialChars = {
      ...mockApproval,
      title: 'Zulassung mit Sonderzeichen: & < > " \' / \\',
      applicant_name: 'Firma & Co. KG (Test)',
      reference_number: 'K-123/456 & 789',
      full_text: 'Volltext mit Sonderzeichen: & < > " \' / \\ und Umlauten: Ã¤ Ã¶ Ã¼ ÃŸ',
      detailed_analysis: {
        risk_assessment: 'Risikobewertung mit Sonderzeichen: & < > " \' / \\',
        clinical_data: 'Klinische Daten mit Umlauten: Ã¤ Ã¶ Ã¼ ÃŸ',
        regulatory_pathway: 'Regulatorischer Weg mit Sonderzeichen: & < > " \' / \\',
        market_impact: 'Marktauswirkung mit Umlauten: Ã¤ Ã¶ Ã¼ ÃŸ',
        compliance_requirements: [
          'FDA 21 CFR Part 820 & ISO 13485:2016',
          'EU MDR (2017/745) & IVDR (2017/746)',
          'FDA Quality System Regulation & ISO 14971:2019'
        ]
      }
    };

    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalDetailView
            approval={approvalWithSpecialChars}
            onClose={mockOnClose}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    // ÃœberprÃ¼fe, dass Sonderzeichen korrekt angezeigt werden
    expect(screen.getByText(approvalWithSpecialChars.title)).toBeInTheDocument();
    expect(screen.getByText(approvalWithSpecialChars.applicant_name)).toBeInTheDocument();
    expect(screen.getByText(approvalWithSpecialChars.reference_number)).toBeInTheDocument();
    expect(screen.getByText(approvalWithSpecialChars.full_text)).toBeInTheDocument();
    expect(screen.getByText(approvalWithSpecialChars.detailed_analysis.risk_assessment)).toBeInTheDocument();
    expect(screen.getByText(approvalWithSpecialChars.detailed_analysis.clinical_data)).toBeInTheDocument();
    expect(screen.getByText(approvalWithSpecialChars.detailed_analysis.regulatory_pathway)).toBeInTheDocument();
    expect(screen.getByText(approvalWithSpecialChars.detailed_analysis.market_impact)).toBeInTheDocument();
    expect(screen.getByText('FDA 21 CFR Part 820 & ISO 13485:2016')).toBeInTheDocument();
    expect(screen.getByText('EU MDR (2017/745) & IVDR (2017/746)')).toBeInTheDocument();
    expect(screen.getByText('FDA Quality System Regulation & ISO 14971:2019')).toBeInTheDocument();
  });

  it('handles approval with HTML content in full text', () => {
    const approvalWithHtmlContent = {
      ...mockApproval,
      full_text: '<h1>Ãœberschrift</h1><p>Absatz mit <strong>fettem</strong> und <em>kursivem</em> Text.</p><ul><li>Listenelement 1</li><li>Listenelement 2</li></ul>'
    };

    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalDetailView
            approval={approvalWithHtmlContent}
            onClose={mockOnClose}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    // Klicke auf Volltext-Tab
    const fullTextTab = screen.getByText('Volltext');
    fireEvent.click(fullTextTab);

    // ÃœberprÃ¼fe, dass HTML-Inhalt korrekt angezeigt wird
    expect(screen.getByText('Ãœberschrift')).toBeInTheDocument();
    expect(screen.getByText('Absatz mit fettem und kursivem Text.')).toBeInTheDocument();
    expect(screen.getByText('Listenelement 1')).toBeInTheDocument();
    expect(screen.getByText('Listenelement 2')).toBeInTheDocument();
  });

  it('handles approval with markdown content in full text', () => {
    const approvalWithMarkdownContent = {
      ...mockApproval,
      full_text: '# Ãœberschrift\n\n**Fetter Text** und *kursiver Text*.\n\n- Listenelement 1\n- Listenelement 2\n\n[Link](https://example.com)'
    };

    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalDetailView
            approval={approvalWithMarkdownContent}
            onClose={mockOnClose}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    // Klicke auf Volltext-Tab
    const fullTextTab = screen.getByText('Volltext');
    fireEvent.click(fullTextTab);

    // ÃœberprÃ¼fe, dass Markdown-Inhalt korrekt angezeigt wird
    expect(screen.getByText('Ãœberschrift')).toBeInTheDocument();
    expect(screen.getByText('Fetter Text')).toBeInTheDocument();
    expect(screen.getByText('kursiver Text')).toBeInTheDocument();
    expect(screen.getByText('Listenelement 1')).toBeInTheDocument();
    expect(screen.getByText('Listenelement 2')).toBeInTheDocument();
    expect(screen.getByText('Link')).toBeInTheDocument();
  });

  it('handles approval with JSON content in full text', () => {
    const approvalWithJsonContent = {
      ...mockApproval,
      full_text: JSON.stringify({
        title: 'Test Approval',
        status: 'approved',
        details: {
          type: 'FDA 510(k)',
          reference: 'K123456'
        }
      }, null, 2)
    };

    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalDetailView
            approval={approvalWithJsonContent}
            onClose={mockOnClose}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    // Klicke auf Volltext-Tab
    const fullTextTab = screen.getByText('Volltext');
    fireEvent.click(fullTextTab);

    // ÃœberprÃ¼fe, dass JSON-Inhalt korrekt angezeigt wird
    expect(screen.getByText('"title": "Test Approval"')).toBeInTheDocument();
    expect(screen.getByText('"status": "approved"')).toBeInTheDocument();
    expect(screen.getByText('"type": "FDA 510(k)"')).toBeInTheDocument();
    expect(screen.getByText('"reference": "K123456"')).toBeInTheDocument();
  });

  it('handles approval with XML content in full text', () => {
    const approvalWithXmlContent = {
      ...mockApproval,
      full_text: '<?xml version="1.0" encoding="UTF-8"?>\n<approval>\n  <title>Test Approval</title>\n  <status>approved</status>\n  <details>\n    <type>FDA 510(k)</type>\n    <reference>K123456</reference>\n  </details>\n</approval>'
    };

    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalDetailView
            approval={approvalWithXmlContent}
            onClose={mockOnClose}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    // Klicke auf Volltext-Tab
    const fullTextTab = screen.getByText('Volltext');
    fireEvent.click(fullTextTab);

    // ÃœberprÃ¼fe, dass XML-Inhalt korrekt angezeigt wird
    expect(screen.getByText('<?xml version="1.0" encoding="UTF-8"?>')).toBeInTheDocument();
    expect(screen.getByText('<title>Test Approval</title>')).toBeInTheDocument();
    expect(screen.getByText('<status>approved</status>')).toBeInTheDocument();
    expect(screen.getByText('<type>FDA 510(k)</type>')).toBeInTheDocument();
    expect(screen.getByText('<reference>K123456</reference>')).toBeInTheDocument();
  });

  it('handles approval with code content in full text', () => {
    const approvalWithCodeContent = {
      ...mockApproval,
      full_text: 'function testApproval() {\n  const approval = {\n    title: "Test Approval",\n    status: "approved",\n    type: "FDA 510(k)"\n  };\n  \n  return approval;\n}'
    };

    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalDetailView
            approval={approvalWithCodeContent}
            onClose={mockOnClose}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </SettingsProvider>
      </AuthProvider>
    );

    // Klicke auf Volltext-Tab
    const fullTextTab = screen.getByText('Volltext');
    fireEvent.click(fullTextTab);

    // ÃœberprÃ¼fe, dass Code-Inhalt korrekt angezeigt wird
    expect(screen.getByText('function testApproval() {')).toBeInTheDocument();
    expect(screen.getByText('const approval = {')).toBeInTheDocument();
    expect(screen.getByText('title: "Test Approval"')).toBeInTheDocument();
    expect(screen.getByText('status: "approved"')).toBeInTheDocument();
    expect(screen.getByText('type: "FDA 510(k)"')).toBeInTheDocument();
    expect(screen.getByText('return approval;')).toBeInTheDocument();
    expect(screen.getByText('}')).toBeInTheDocument();
  });
});



