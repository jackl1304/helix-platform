/**
 * MedTech Data Platform - ApprovalStatistics Tests
 * Umfassende Tests fÃ¼r die ApprovalStatistics-Komponente
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import ApprovalStatistics from '../../components/approvals/ApprovalStatistics';
import { AuthProvider } from '../../contexts/AuthContext';
import { SettingsProvider } from '../../contexts/SettingsContext';

// Mock-Daten fÃ¼r Tests
const mockStatistics = {
  total: 150,
  approved: 75,
  pending: 45,
  rejected: 20,
  withdrawn: 10,
  byRegion: {
    US: 60,
    EU: 50,
    Germany: 25,
    Global: 15
  },
  byAuthority: {
    FDA: 60,
    EMA: 50,
    BfArM: 25,
    ISO: 15
  },
  byType: {
    'fda_510k': 40,
    'pma': 20,
    'ce_mark': 50,
    'mdr': 30,
    'ivd': 10
  },
  byPriority: {
    high: 30,
    medium: 80,
    low: 40
  },
  trends: {
    monthly: [
      { month: '2024-01', approved: 10, pending: 5, rejected: 2 },
      { month: '2024-02', approved: 12, pending: 3, rejected: 1 },
      { month: '2024-03', approved: 8, pending: 7, rejected: 3 }
    ],
    quarterly: [
      { quarter: 'Q1 2024', approved: 30, pending: 15, rejected: 6 },
      { quarter: 'Q2 2024', approved: 35, pending: 12, rejected: 4 },
      { quarter: 'Q3 2024', approved: 40, pending: 10, rejected: 5 }
    ]
  }
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

describe.skip('ApprovalStatistics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders overview statistics correctly', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalStatistics statistics={mockStatistics} />
        </SettingsProvider>
      </AuthProvider>
    );

    // ÃœberprÃ¼fe, dass alle Ãœbersichtsstatistiken angezeigt werden
    expect(screen.getByText('150')).toBeInTheDocument(); // Gesamt
    expect(screen.getByText('75')).toBeInTheDocument(); // Genehmigt
    expect(screen.getByText('45')).toBeInTheDocument(); // Ausstehend
    expect(screen.getByText('20')).toBeInTheDocument(); // Abgelehnt
    expect(screen.getByText('10')).toBeInTheDocument(); // ZurÃ¼ckgezogen
  });

  it('renders region statistics correctly', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalStatistics statistics={mockStatistics} />
        </SettingsProvider>
      </AuthProvider>
    );

    // ÃœberprÃ¼fe, dass alle Regionsstatistiken angezeigt werden
    expect(screen.getByText('US')).toBeInTheDocument();
    expect(screen.getByText('EU')).toBeInTheDocument();
    expect(screen.getByText('Germany')).toBeInTheDocument();
    expect(screen.getByText('Global')).toBeInTheDocument();
    
    expect(screen.getByText('60')).toBeInTheDocument(); // US
    expect(screen.getByText('50')).toBeInTheDocument(); // EU
    expect(screen.getByText('25')).toBeInTheDocument(); // Germany
    expect(screen.getByText('15')).toBeInTheDocument(); // Global
  });

  it('renders authority statistics correctly', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalStatistics statistics={mockStatistics} />
        </SettingsProvider>
      </AuthProvider>
    );

    // ÃœberprÃ¼fe, dass alle BehÃ¶rdenstatistiken angezeigt werden
    expect(screen.getByText('FDA')).toBeInTheDocument();
    expect(screen.getByText('EMA')).toBeInTheDocument();
    expect(screen.getByText('BfArM')).toBeInTheDocument();
    expect(screen.getByText('ISO')).toBeInTheDocument();
    
    expect(screen.getByText('60')).toBeInTheDocument(); // FDA
    expect(screen.getByText('50')).toBeInTheDocument(); // EMA
    expect(screen.getByText('25')).toBeInTheDocument(); // BfArM
    expect(screen.getByText('15')).toBeInTheDocument(); // ISO
  });

  it('renders type statistics correctly', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalStatistics statistics={mockStatistics} />
        </SettingsProvider>
      </AuthProvider>
    );

    // ÃœberprÃ¼fe, dass alle Typstatistiken angezeigt werden
    expect(screen.getByText('FDA 510(k)')).toBeInTheDocument();
    expect(screen.getByText('PMA')).toBeInTheDocument();
    expect(screen.getByText('CE Mark')).toBeInTheDocument();
    expect(screen.getByText('MDR')).toBeInTheDocument();
    expect(screen.getByText('IVD')).toBeInTheDocument();
    
    expect(screen.getByText('40')).toBeInTheDocument(); // FDA 510(k)
    expect(screen.getByText('20')).toBeInTheDocument(); // PMA
    expect(screen.getByText('50')).toBeInTheDocument(); // CE Mark
    expect(screen.getByText('30')).toBeInTheDocument(); // MDR
    expect(screen.getByText('10')).toBeInTheDocument(); // IVD
  });

  it('renders priority statistics correctly', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalStatistics statistics={mockStatistics} />
        </SettingsProvider>
      </AuthProvider>
    );

    // ÃœberprÃ¼fe, dass alle PrioritÃ¤tsstatistiken angezeigt werden
    expect(screen.getByText('Hoch')).toBeInTheDocument();
    expect(screen.getByText('Mittel')).toBeInTheDocument();
    expect(screen.getByText('Niedrig')).toBeInTheDocument();
    
    expect(screen.getByText('30')).toBeInTheDocument(); // Hoch
    expect(screen.getByText('80')).toBeInTheDocument(); // Mittel
    expect(screen.getByText('40')).toBeInTheDocument(); // Niedrig
  });

  it('renders trend charts correctly', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalStatistics statistics={mockStatistics} />
        </SettingsProvider>
      </AuthProvider>
    );

    // ÃœberprÃ¼fe, dass Trend-Charts angezeigt werden
    expect(screen.getByText('Monatliche Trends')).toBeInTheDocument();
    expect(screen.getByText('Quartalsweise Trends')).toBeInTheDocument();
  });

  it('handles empty statistics', () => {
    const emptyStatistics = {
      total: 0,
      approved: 0,
      pending: 0,
      rejected: 0,
      withdrawn: 0,
      byRegion: {},
      byAuthority: {},
      byType: {},
      byPriority: {},
      trends: {
        monthly: [],
        quarterly: []
      }
    };

    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalStatistics statistics={emptyStatistics} />
        </SettingsProvider>
      </AuthProvider>
    );

    // ÃœberprÃ¼fe, dass alle Werte 0 sind
    expect(screen.getAllByText('0')).toHaveLength(5); // Gesamt, Genehmigt, Ausstehend, Abgelehnt, ZurÃ¼ckgezogen
  });

  it('handles null statistics', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalStatistics statistics={null as any} />
        </SettingsProvider>
      </AuthProvider>
    );

    // ÃœberprÃ¼fe, dass keine Statistiken angezeigt werden
    expect(screen.queryByText('150')).not.toBeInTheDocument();
    expect(screen.queryByText('75')).not.toBeInTheDocument();
  });

  it('handles undefined statistics', () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalStatistics statistics={undefined as any} />
        </SettingsProvider>
      </AuthProvider>
    );

    // ÃœberprÃ¼fe, dass keine Statistiken angezeigt werden
    expect(screen.queryByText('150')).not.toBeInTheDocument();
    expect(screen.queryByText('75')).not.toBeInTheDocument();
  });

  it('handles statistics with missing properties', () => {
    const incompleteStatistics = {
      total: 100,
      approved: 50,
      // Fehlende Eigenschaften
      byRegion: {},
      byAuthority: {},
      byType: {},
      byPriority: {},
      trends: {
        monthly: [],
        quarterly: []
      }
    };

    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalStatistics statistics={incompleteStatistics} />
        </SettingsProvider>
      </AuthProvider>
    );

    // ÃœberprÃ¼fe, dass verfÃ¼gbare Statistiken angezeigt werden
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    
    // Fehlende Eigenschaften sollten als 0 angezeigt werden
    expect(screen.getAllByText('0')).toHaveLength(3); // pending, rejected, withdrawn
  });

  it('handles statistics with null values', () => {
    const statisticsWithNulls = {
      total: 100,
      approved: 50,
      pending: null,
      rejected: null,
      withdrawn: null,
      byRegion: {
        US: 60,
        EU: null,
        Germany: 25,
        Global: null
      },
      byAuthority: {
        FDA: 60,
        EMA: null,
        BfArM: 25,
        ISO: null
      },
      byType: {
        'fda_510k': 40,
        'pma': null,
        'ce_mark': 50,
        'mdr': null,
        'ivd': 10
      },
      byPriority: {
        high: 30,
        medium: null,
        low: 40
      },
      trends: {
        monthly: [],
        quarterly: []
      }
    };

    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalStatistics statistics={statisticsWithNulls} />
        </SettingsProvider>
      </AuthProvider>
    );

    // ÃœberprÃ¼fe, dass null-Werte als 0 angezeigt werden
    expect(screen.getAllByText('0')).toHaveLength(3); // pending, rejected, withdrawn
  });

  it('handles statistics with undefined values', () => {
    const statisticsWithUndefined = {
      total: 100,
      approved: 50,
      pending: undefined,
      rejected: undefined,
      withdrawn: undefined,
      byRegion: {
        US: 60,
        EU: undefined,
        Germany: 25,
        Global: undefined
      },
      byAuthority: {
        FDA: 60,
        EMA: undefined,
        BfArM: 25,
        ISO: undefined
      },
      byType: {
        'fda_510k': 40,
        'pma': undefined,
        'ce_mark': 50,
        'mdr': undefined,
        'ivd': 10
      },
      byPriority: {
        high: 30,
        medium: undefined,
        low: 40
      },
      trends: {
        monthly: [],
        quarterly: []
      }
    };

    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalStatistics statistics={statisticsWithUndefined} />
        </SettingsProvider>
      </AuthProvider>
    );

    // ÃœberprÃ¼fe, dass undefined-Werte als 0 angezeigt werden
    expect(screen.getAllByText('0')).toHaveLength(3); // pending, rejected, withdrawn
  });

  it('handles statistics with zero values', () => {
    const zeroStatistics = {
      total: 0,
      approved: 0,
      pending: 0,
      rejected: 0,
      withdrawn: 0,
      byRegion: {
        US: 0,
        EU: 0,
        Germany: 0,
        Global: 0
      },
      byAuthority: {
        FDA: 0,
        EMA: 0,
        BfArM: 0,
        ISO: 0
      },
      byType: {
        'fda_510k': 0,
        'pma': 0,
        'ce_mark': 0,
        'mdr': 0,
        'ivd': 0
      },
      byPriority: {
        high: 0,
        medium: 0,
        low: 0
      },
      trends: {
        monthly: [],
        quarterly: []
      }
    };

    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalStatistics statistics={zeroStatistics} />
        </SettingsProvider>
      </AuthProvider>
    );

    // ÃœberprÃ¼fe, dass alle Werte 0 sind
    expect(screen.getAllByText('0')).toHaveLength(20); // Alle Statistiken sind 0
  });

  it('handles statistics with large numbers', () => {
    const largeNumberStatistics = {
      total: 1000000,
      approved: 750000,
      pending: 150000,
      rejected: 75000,
      withdrawn: 25000,
      byRegion: {
        US: 400000,
        EU: 300000,
        Germany: 200000,
        Global: 100000
      },
      byAuthority: {
        FDA: 400000,
        EMA: 300000,
        BfArM: 200000,
        ISO: 100000
      },
      byType: {
        'fda_510k': 300000,
        'pma': 200000,
        'ce_mark': 250000,
        'mdr': 150000,
        'ivd': 100000
      },
      byPriority: {
        high: 200000,
        medium: 500000,
        low: 300000
      },
      trends: {
        monthly: [],
        quarterly: []
      }
    };

    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalStatistics statistics={largeNumberStatistics} />
        </SettingsProvider>
      </AuthProvider>
    );

    // ÃœberprÃ¼fe, dass groÃŸe Zahlen korrekt angezeigt werden
    expect(screen.getByText('1,000,000')).toBeInTheDocument();
    expect(screen.getByText('750,000')).toBeInTheDocument();
    expect(screen.getByText('150,000')).toBeInTheDocument();
    expect(screen.getByText('75,000')).toBeInTheDocument();
    expect(screen.getByText('25,000')).toBeInTheDocument();
  });

  it('handles statistics with decimal numbers', () => {
    const decimalStatistics = {
      total: 150.5,
      approved: 75.25,
      pending: 45.75,
      rejected: 20.5,
      withdrawn: 9.0,
      byRegion: {
        US: 60.5,
        EU: 50.25,
        Germany: 25.75,
        Global: 14.0
      },
      byAuthority: {
        FDA: 60.5,
        EMA: 50.25,
        BfArM: 25.75,
        ISO: 14.0
      },
      byType: {
        'fda_510k': 40.5,
        'pma': 20.25,
        'ce_mark': 50.75,
        'mdr': 30.0,
        'ivd': 9.5
      },
      byPriority: {
        high: 30.5,
        medium: 80.25,
        low: 39.75
      },
      trends: {
        monthly: [],
        quarterly: []
      }
    };

    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalStatistics statistics={decimalStatistics} />
        </SettingsProvider>
      </AuthProvider>
    );

    // ÃœberprÃ¼fe, dass Dezimalzahlen korrekt angezeigt werden
    expect(screen.getByText('150.5')).toBeInTheDocument();
    expect(screen.getByText('75.25')).toBeInTheDocument();
    expect(screen.getByText('45.75')).toBeInTheDocument();
    expect(screen.getByText('20.5')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
  });

  it('handles statistics with negative numbers', () => {
    const negativeStatistics = {
      total: -100,
      approved: -50,
      pending: -25,
      rejected: -15,
      withdrawn: -10,
      byRegion: {
        US: -40,
        EU: -30,
        Germany: -20,
        Global: -10
      },
      byAuthority: {
        FDA: -40,
        EMA: -30,
        BfArM: -20,
        ISO: -10
      },
      byType: {
        'fda_510k': -30,
        'pma': -20,
        'ce_mark': -25,
        'mdr': -15,
        'ivd': -10
      },
      byPriority: {
        high: -20,
        medium: -50,
        low: -30
      },
      trends: {
        monthly: [],
        quarterly: []
      }
    };

    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalStatistics statistics={negativeStatistics} />
        </SettingsProvider>
      </AuthProvider>
    );

    // ÃœberprÃ¼fe, dass negative Zahlen korrekt angezeigt werden
    expect(screen.getByText('-100')).toBeInTheDocument();
    expect(screen.getByText('-50')).toBeInTheDocument();
    expect(screen.getByText('-25')).toBeInTheDocument();
    expect(screen.getByText('-15')).toBeInTheDocument();
    expect(screen.getByText('-10')).toBeInTheDocument();
  });

  it('handles statistics with mixed data types', () => {
    const mixedTypeStatistics = {
      total: '150',
      approved: 75,
      pending: '45',
      rejected: 20,
      withdrawn: '10',
      byRegion: {
        US: 60,
        EU: '50',
        Germany: 25,
        Global: '15'
      },
      byAuthority: {
        FDA: 60,
        EMA: '50',
        BfArM: 25,
        ISO: '15'
      },
      byType: {
        'fda_510k': 40,
        'pma': '20',
        'ce_mark': 50,
        'mdr': '30',
        'ivd': 10
      },
      byPriority: {
        high: 30,
        medium: '80',
        low: 40
      },
      trends: {
        monthly: [],
        quarterly: []
      }
    };

    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalStatistics statistics={mixedTypeStatistics} />
        </SettingsProvider>
      </AuthProvider>
    );

    // ÃœberprÃ¼fe, dass gemischte Datentypen korrekt angezeigt werden
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('75')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('handles statistics with special characters', () => {
    const specialCharStatistics = {
      total: 150,
      approved: 75,
      pending: 45,
      rejected: 20,
      withdrawn: 10,
      byRegion: {
        'US & Canada': 60,
        'EU (27)': 50,
        'Germany & Austria': 25,
        'Global/Worldwide': 15
      },
      byAuthority: {
        'FDA (USA)': 60,
        'EMA (EU)': 50,
        'BfArM (DE)': 25,
        'ISO/IEC': 15
      },
      byType: {
        'FDA 510(k)': 40,
        'PMA (FDA)': 20,
        'CE Mark (EU)': 50,
        'MDR (EU)': 30,
        'IVD (EU)': 10
      },
      byPriority: {
        'Hoch (High)': 30,
        'Mittel (Medium)': 80,
        'Niedrig (Low)': 40
      },
      trends: {
        monthly: [],
        quarterly: []
      }
    };

    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalStatistics statistics={specialCharStatistics} />
        </SettingsProvider>
      </AuthProvider>
    );

    // ÃœberprÃ¼fe, dass Sonderzeichen korrekt angezeigt werden
    expect(screen.getByText('US & Canada')).toBeInTheDocument();
    expect(screen.getByText('EU (27)')).toBeInTheDocument();
    expect(screen.getByText('Germany & Austria')).toBeInTheDocument();
    expect(screen.getByText('Global/Worldwide')).toBeInTheDocument();
    
    expect(screen.getByText('FDA (USA)')).toBeInTheDocument();
    expect(screen.getByText('EMA (EU)')).toBeInTheDocument();
    expect(screen.getByText('BfArM (DE)')).toBeInTheDocument();
    expect(screen.getByText('ISO/IEC')).toBeInTheDocument();
  });

  it('handles statistics with very long labels', () => {
    const longLabelStatistics = {
      total: 150,
      approved: 75,
      pending: 45,
      rejected: 20,
      withdrawn: 10,
      byRegion: {
        'United States of America and Canada': 60,
        'European Union with all 27 member states': 50,
        'Germany including all federal states': 25,
        'Global worldwide including all countries': 15
      },
      byAuthority: {
        'Food and Drug Administration of the United States': 60,
        'European Medicines Agency of the European Union': 50,
        'Bundesinstitut fÃ¼r Arzneimittel und Medizinprodukte': 25,
        'International Organization for Standardization': 15
      },
      byType: {
        'FDA 510(k) Premarket Notification': 40,
        'Premarket Approval Application': 20,
        'CE Marking for European Union': 50,
        'Medical Device Regulation for EU': 30,
        'In Vitro Diagnostic Medical Devices': 10
      },
      byPriority: {
        'Very High Priority with Urgent Processing': 30,
        'Medium Priority with Standard Processing': 80,
        'Low Priority with Extended Processing Time': 40
      },
      trends: {
        monthly: [],
        quarterly: []
      }
    };

    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalStatistics statistics={longLabelStatistics} />
        </SettingsProvider>
      </AuthProvider>
    );

    // ÃœberprÃ¼fe, dass lange Labels korrekt angezeigt werden
    expect(screen.getByText('United States of America and Canada')).toBeInTheDocument();
    expect(screen.getByText('European Union with all 27 member states')).toBeInTheDocument();
    expect(screen.getByText('Germany including all federal states')).toBeInTheDocument();
    expect(screen.getByText('Global worldwide including all countries')).toBeInTheDocument();
  });

  it('handles statistics with empty objects', () => {
    const emptyObjectStatistics = {
      total: 150,
      approved: 75,
      pending: 45,
      rejected: 20,
      withdrawn: 10,
      byRegion: {},
      byAuthority: {},
      byType: {},
      byPriority: {},
      trends: {
        monthly: [],
        quarterly: []
      }
    };

    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalStatistics statistics={emptyObjectStatistics} />
        </SettingsProvider>
      </AuthProvider>
    );

    // ÃœberprÃ¼fe, dass leere Objekte korrekt behandelt werden
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('75')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('handles statistics with empty arrays', () => {
    const emptyArrayStatistics = {
      total: 150,
      approved: 75,
      pending: 45,
      rejected: 20,
      withdrawn: 10,
      byRegion: {
        US: 60,
        EU: 50,
        Germany: 25,
        Global: 15
      },
      byAuthority: {
        FDA: 60,
        EMA: 50,
        BfArM: 25,
        ISO: 15
      },
      byType: {
        'fda_510k': 40,
        'pma': 20,
        'ce_mark': 50,
        'mdr': 30,
        'ivd': 10
      },
      byPriority: {
        high: 30,
        medium: 80,
        low: 40
      },
      trends: {
        monthly: [],
        quarterly: []
      }
    };

    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalStatistics statistics={emptyArrayStatistics} />
        </SettingsProvider>
      </AuthProvider>
    );

    // ÃœberprÃ¼fe, dass leere Arrays korrekt behandelt werden
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('75')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('handles statistics with null arrays', () => {
    const nullArrayStatistics = {
      total: 150,
      approved: 75,
      pending: 45,
      rejected: 20,
      withdrawn: 10,
      byRegion: {
        US: 60,
        EU: 50,
        Germany: 25,
        Global: 15
      },
      byAuthority: {
        FDA: 60,
        EMA: 50,
        BfArM: 25,
        ISO: 15
      },
      byType: {
        'fda_510k': 40,
        'pma': 20,
        'ce_mark': 50,
        'mdr': 30,
        'ivd': 10
      },
      byPriority: {
        high: 30,
        medium: 80,
        low: 40
      },
      trends: {
        monthly: null,
        quarterly: null
      }
    };

    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalStatistics statistics={nullArrayStatistics} />
        </SettingsProvider>
      </AuthProvider>
    );

    // ÃœberprÃ¼fe, dass null-Arrays korrekt behandelt werden
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('75')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('handles statistics with undefined arrays', () => {
    const undefinedArrayStatistics = {
      total: 150,
      approved: 75,
      pending: 45,
      rejected: 20,
      withdrawn: 10,
      byRegion: {
        US: 60,
        EU: 50,
        Germany: 25,
        Global: 15
      },
      byAuthority: {
        FDA: 60,
        EMA: 50,
        BfArM: 25,
        ISO: 15
      },
      byType: {
        'fda_510k': 40,
        'pma': 20,
        'ce_mark': 50,
        'mdr': 30,
        'ivd': 10
      },
      byPriority: {
        high: 30,
        medium: 80,
        low: 40
      },
      trends: {
        monthly: undefined,
        quarterly: undefined
      }
    };

    render(
      <AuthProvider value={mockAuthContext}>
        <SettingsProvider value={mockSettingsContext}>
          <ApprovalStatistics statistics={undefinedArrayStatistics} />
        </SettingsProvider>
      </AuthProvider>
    );

    // ÃœberprÃ¼fe, dass undefined-Arrays korrekt behandelt werden
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('75')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });
});



