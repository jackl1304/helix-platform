/**
 * MedTech Data Platform - useApprovals Hook Tests
 * Umfassende Tests für den useApprovals Hook
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';

import { useApprovals } from '../../hooks/useApprovals';

// Mock der API-Funktionen
vi.mock('../../services/api', () => ({
  approvalsApi: {
    getApprovals: vi.fn(),
    getApprovalById: vi.fn(),
    createApproval: vi.fn(),
    updateApproval: vi.fn(),
    deleteApproval: vi.fn()
  }
}));

// Mock-Daten
const mockApprovalsData = {
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
};

// Test-Wrapper-Komponente
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useApprovals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should fetch approvals successfully', async () => {
    const { approvalsApi } = await import('../../services/api');
    vi.mocked(approvalsApi.getApprovals).mockResolvedValue(mockApprovalsData);

    const { result } = renderHook(() => useApprovals(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockApprovalsData);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle loading state', async () => {
    const { approvalsApi } = await import('../../services/api');
    vi.mocked(approvalsApi.getApprovals).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockApprovalsData), 100))
    );

    const { result } = renderHook(() => useApprovals(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it('should handle error state', async () => {
    const { approvalsApi } = await import('../../services/api');
    const mockError = new Error('API Error');
    vi.mocked(approvalsApi.getApprovals).mockRejectedValue(mockError);

    const { result } = renderHook(() => useApprovals(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(mockError);
    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  it('should refetch data when refetch is called', async () => {
    const { approvalsApi } = await import('../../services/api');
    vi.mocked(approvalsApi.getApprovals).mockResolvedValue(mockApprovalsData);

    const { result } = renderHook(() => useApprovals(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Rufe refetch auf
    result.current.refetch();

    await waitFor(() => {
      expect(approvalsApi.getApprovals).toHaveBeenCalledTimes(2);
    });
  });

  it('should handle empty data response', async () => {
    const { approvalsApi } = await import('../../services/api');
    const emptyData = { items: [], total: 0 };
    vi.mocked(approvalsApi.getApprovals).mockResolvedValue(emptyData);

    const { result } = renderHook(() => useApprovals(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(emptyData);
    expect(result.current.data.items).toHaveLength(0);
  });

  it('should handle network timeout error', async () => {
    const { approvalsApi } = await import('../../services/api');
    const timeoutError = new Error('Request timeout');
    vi.mocked(approvalsApi.getApprovals).mockRejectedValue(timeoutError);

    const { result } = renderHook(() => useApprovals(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(timeoutError);
  });

  it('should handle malformed response data', async () => {
    const { approvalsApi } = await import('../../services/api');
    const malformedData = { invalid: 'data' };
    vi.mocked(approvalsApi.getApprovals).mockResolvedValue(malformedData);

    const { result } = renderHook(() => useApprovals(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(malformedData);
  });

  it('should handle API rate limiting error', async () => {
    const { approvalsApi } = await import('../../services/api');
    const rateLimitError = new Error('Rate limit exceeded');
    vi.mocked(approvalsApi.getApprovals).mockRejectedValue(rateLimitError);

    const { result } = renderHook(() => useApprovals(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(rateLimitError);
  });

  it('should handle server error (500)', async () => {
    const { approvalsApi } = await import('../../services/api');
    const serverError = new Error('Internal Server Error');
    vi.mocked(approvalsApi.getApprovals).mockRejectedValue(serverError);

    const { result } = renderHook(() => useApprovals(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(serverError);
  });

  it('should handle not found error (404)', async () => {
    const { approvalsApi } = await import('../../services/api');
    const notFoundError = new Error('Not Found');
    vi.mocked(approvalsApi.getApprovals).mockRejectedValue(notFoundError);

    const { result } = renderHook(() => useApprovals(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(notFoundError);
  });

  it('should handle unauthorized error (401)', async () => {
    const { approvalsApi } = await import('../../services/api');
    const unauthorizedError = new Error('Unauthorized');
    vi.mocked(approvalsApi.getApprovals).mockRejectedValue(unauthorizedError);

    const { result } = renderHook(() => useApprovals(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(unauthorizedError);
  });

  it('should handle forbidden error (403)', async () => {
    const { approvalsApi } = await import('../../services/api');
    const forbiddenError = new Error('Forbidden');
    vi.mocked(approvalsApi.getApprovals).mockRejectedValue(forbiddenError);

    const { result } = renderHook(() => useApprovals(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(forbiddenError);
  });

  it('should handle bad request error (400)', async () => {
    const { approvalsApi } = await import('../../services/api');
    const badRequestError = new Error('Bad Request');
    vi.mocked(approvalsApi.getApprovals).mockRejectedValue(badRequestError);

    const { result } = renderHook(() => useApprovals(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(badRequestError);
  });

  it('should handle large dataset response', async () => {
    const { approvalsApi } = await import('../../services/api');
    const largeDataset = {
      items: Array.from({ length: 1000 }, (_, i) => ({
        id: `${i + 1}`,
        title: `Test Approval ${i + 1}`,
        approval_type: 'fda_510k',
        status: 'approved',
        region: 'US',
        authority: 'FDA',
        applicant_name: `Test Corp ${i + 1}`,
        reference_number: `K${i + 1}`,
        decision_date: '2024-01-15',
        priority: 'high',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      })),
      total: 1000
    };
    vi.mocked(approvalsApi.getApprovals).mockResolvedValue(largeDataset);

    const { result } = renderHook(() => useApprovals(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(largeDataset);
    expect(result.current.data.items).toHaveLength(1000);
  });

  it('should handle concurrent requests', async () => {
    const { approvalsApi } = await import('../../services/api');
    vi.mocked(approvalsApi.getApprovals).mockResolvedValue(mockApprovalsData);

    const { result: result1 } = renderHook(() => useApprovals(), {
      wrapper: createWrapper(),
    });

    const { result: result2 } = renderHook(() => useApprovals(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result1.current.isSuccess).toBe(true);
      expect(result2.current.isSuccess).toBe(true);
    });

    expect(result1.current.data).toEqual(mockApprovalsData);
    expect(result2.current.data).toEqual(mockApprovalsData);
  });

  it('should handle data updates', async () => {
    const { approvalsApi } = await import('../../services/api');
    vi.mocked(approvalsApi.getApprovals).mockResolvedValue(mockApprovalsData);

    const { result } = renderHook(() => useApprovals(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Simuliere Datenupdate
    const updatedData = { ...mockApprovalsData, total: 3 };
    vi.mocked(approvalsApi.getApprovals).mockResolvedValue(updatedData);

    result.current.refetch();

    await waitFor(() => {
      expect(result.current.data).toEqual(updatedData);
    });
  });

  it('should handle null response', async () => {
    const { approvalsApi } = await import('../../services/api');
    vi.mocked(approvalsApi.getApprovals).mockResolvedValue(null);

    const { result } = renderHook(() => useApprovals(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeNull();
  });

  it('should handle undefined response', async () => {
    const { approvalsApi } = await import('../../services/api');
    vi.mocked(approvalsApi.getApprovals).mockResolvedValue(undefined);

    const { result } = renderHook(() => useApprovals(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeUndefined();
  });

  it('should provide correct status flags', async () => {
    const { approvalsApi } = await import('../../services/api');
    vi.mocked(approvalsApi.getApprovals).mockResolvedValue(mockApprovalsData);

    const { result } = renderHook(() => useApprovals(), {
      wrapper: createWrapper(),
    });

    // Initial loading state
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Success state
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.isError).toBe(false);
  });

  it('should handle API function not being available', async () => {
    const { approvalsApi } = await import('../../services/api');
    vi.mocked(approvalsApi.getApprovals).mockImplementation(() => {
      throw new Error('Function not available');
    });

    const { result } = renderHook(() => useApprovals(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(new Error('Function not available'));
  });
});
