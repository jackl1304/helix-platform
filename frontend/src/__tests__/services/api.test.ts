/**
 * MedTech Data Platform - API Service Tests
 * Umfassende Tests fÃ¼r die API-Service-Funktionen
 */

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as api from '../../services/api';

// Mock von fetch
global.fetch = vi.fn();

// Mock-Daten
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

const mockApprovalsData = {
  items: [mockApproval],
  total: 1
};

describe.skip('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe.skip('approvalsApi.getApprovals', () => {
    it('should fetch approvals successfully', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => mockApprovalsData,
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

      const result = await api.approvalsApi.getApprovals();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/approvals',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result).toEqual(mockApprovalsData);
    });

    it('should handle API error responses', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ error: 'Server error' }),
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

      await expect(api.approvalsApi.getApprovals()).rejects.toThrow('HTTP error! status: 500');
    });

    it('should handle network errors', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

      await expect(api.approvalsApi.getApprovals()).rejects.toThrow('Network error');
    });

    it('should handle JSON parsing errors', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

      await expect(api.approvalsApi.getApprovals()).rejects.toThrow('Invalid JSON');
    });
  });

  describe.skip('approvalsApi.getApprovalById', () => {
    it('should fetch approval by ID successfully', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => mockApproval,
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

      const result = await api.approvalsApi.getApprovalById('1');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/approvals/1',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result).toEqual(mockApproval);
    });

    it('should handle 404 error for non-existent approval', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ error: 'Approval not found' }),
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

      await expect(api.approvalsApi.getApprovalById('999')).rejects.toThrow('HTTP error! status: 404');
    });
  });

  describe.skip('approvalsApi.createApproval', () => {
    it('should create approval successfully', async () => {
      const newApproval = {
        title: 'New Test Approval',
        approval_type: 'fda_510k',
        status: 'pending',
        region: 'US',
        authority: 'FDA',
        applicant_name: 'New Test Corp',
        reference_number: 'K999999',
        priority: 'medium'
      };

      const mockResponse = {
        ok: true,
        status: 201,
        json: async () => ({ ...newApproval, id: '2' }),
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

      const result = await api.approvalsApi.createApproval(newApproval);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/approvals',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(newApproval),
        })
      );
      expect(result).toEqual({ ...newApproval, id: '2' });
    });

    it('should handle validation errors', async () => {
      const invalidApproval = {
        title: '', // Invalid: empty title
        approval_type: 'invalid_type',
        status: 'invalid_status',
        region: 'US',
        authority: 'FDA'
      };

      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ error: 'Validation failed' }),
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

      await expect(api.approvalsApi.createApproval(invalidApproval)).rejects.toThrow('HTTP error! status: 400');
    });
  });

  describe.skip('approvalsApi.updateApproval', () => {
    it('should update approval successfully', async () => {
      const updatedApproval = { ...mockApproval, title: 'Updated Title' };

      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => updatedApproval,
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

      const result = await api.approvalsApi.updateApproval('1', updatedApproval);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/approvals/1',
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(updatedApproval),
        })
      );
      expect(result).toEqual(updatedApproval);
    });

    it('should handle update of non-existent approval', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ error: 'Approval not found' }),
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

      await expect(api.approvalsApi.updateApproval('999', mockApproval)).rejects.toThrow('HTTP error! status: 404');
    });
  });

  describe.skip('approvalsApi.deleteApproval', () => {
    it('should delete approval successfully', async () => {
      const mockResponse = {
        ok: true,
        status: 204,
        json: async () => null,
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

      await api.approvalsApi.deleteApproval('1');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/approvals/1',
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should handle deletion of non-existent approval', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ error: 'Approval not found' }),
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

      await expect(api.approvalsApi.deleteApproval('999')).rejects.toThrow('HTTP error! status: 404');
    });
  });

  describe.skip('Error handling', () => {
    it('should handle timeout errors', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Request timeout'));

      await expect(api.approvalsApi.getApprovals()).rejects.toThrow('Request timeout');
    });

    it('should handle CORS errors', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('CORS error'));

      await expect(api.approvalsApi.getApprovals()).rejects.toThrow('CORS error');
    });

    it('should handle malformed responses', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => 'invalid json',
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

      await expect(api.approvalsApi.getApprovals()).rejects.toThrow();
    });

    it('should handle empty responses', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => null,
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

      const result = await api.approvalsApi.getApprovals();
      expect(result).toBeNull();
    });
  });

  describe.skip('Authentication', () => {
    it('should include authentication headers when token is available', async () => {
      // Mock localStorage
      const mockLocalStorage = {
        getItem: vi.fn().mockReturnValue('test-token'),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      };
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true,
      });

      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => mockApprovalsData,
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

      await api.approvalsApi.getApprovals();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/approvals',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
          }),
        })
      );
    });

    it('should work without authentication token', async () => {
      // Mock localStorage without token
      const mockLocalStorage = {
        getItem: vi.fn().mockReturnValue(null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      };
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true,
      });

      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => mockApprovalsData,
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

      await api.approvalsApi.getApprovals();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/approvals',
        expect.objectContaining({
          headers: expect.not.objectContaining({
            'Authorization': expect.any(String),
          }),
        })
      );
    });
  });

  describe.skip('Request configuration', () => {
    it('should use correct base URL', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => mockApprovalsData,
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

      await api.approvalsApi.getApprovals();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/approvals',
        expect.any(Object)
      );
    });

    it('should set correct content type headers', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => mockApprovalsData,
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

      await api.approvalsApi.getApprovals();

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should handle different HTTP methods correctly', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => mockApproval,
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

      // Test GET
      await api.approvalsApi.getApprovals();
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'GET' })
      );

      // Test POST
      await api.approvalsApi.createApproval(mockApproval);
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'POST' })
      );

      // Test PUT
      await api.approvalsApi.updateApproval('1', mockApproval);
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'PUT' })
      );

      // Test DELETE
      await api.approvalsApi.deleteApproval('1');
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe.skip('Data validation', () => {
    it('should handle valid approval data', async () => {
      const validApproval = {
        title: 'Valid Approval',
        approval_type: 'fda_510k',
        status: 'approved',
        region: 'US',
        authority: 'FDA',
        applicant_name: 'Valid Corp',
        reference_number: 'K123456',
        priority: 'high'
      };

      const mockResponse = {
        ok: true,
        status: 201,
        json: async () => ({ ...validApproval, id: '1' }),
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

      const result = await api.approvalsApi.createApproval(validApproval);
      expect(result).toEqual({ ...validApproval, id: '1' });
    });

    it('should handle missing required fields', async () => {
      const incompleteApproval = {
        title: 'Incomplete Approval',
        // Missing required fields
      };

      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ error: 'Missing required fields' }),
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

      await expect(api.approvalsApi.createApproval(incompleteApproval)).rejects.toThrow('HTTP error! status: 400');
    });
  });
});


