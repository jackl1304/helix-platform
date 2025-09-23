// ==========================================
// REGULATORY UPDATES API SERVICE
// ==========================================

import { Logger } from '../utils/logger';

const logger = new Logger('RegulatoryUpdatesAPI');

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface RegulatoryUpdate {
  id: string;
  title: string;
  content: string;
  source: string;
  jurisdiction: string;
  type: 'regulation' | 'guidance' | 'warning' | 'approval' | 'recall';
  priority: 'low' | 'medium' | 'high' | 'critical';
  publishedDate: string;
  effectiveDate?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  relatedDocuments?: string[];
  impactLevel?: 'low' | 'medium' | 'high' | 'critical';
}

export interface CreateRegulatoryUpdateData {
  title: string;
  content: string;
  source: string;
  jurisdiction: string;
  type: 'regulation' | 'guidance' | 'warning' | 'approval' | 'recall';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  publishedDate?: string;
  effectiveDate?: string;
  tags?: string[];
  relatedDocuments?: string[];
  impactLevel?: 'low' | 'medium' | 'high' | 'critical';
}

export interface UpdateRegulatoryUpdateData {
  title?: string;
  content?: string;
  source?: string;
  jurisdiction?: string;
  type?: 'regulation' | 'guidance' | 'warning' | 'approval' | 'recall';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  publishedDate?: string;
  effectiveDate?: string;
  tags?: string[];
  relatedDocuments?: string[];
  impactLevel?: 'low' | 'medium' | 'high' | 'critical';
}

export interface ListRegulatoryUpdatesParams {
  page?: number;
  limit?: number;
  jurisdiction?: string;
  type?: 'regulation' | 'guidance' | 'warning' | 'approval' | 'recall';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  search?: string;
  sortBy?: 'publishedDate' | 'createdAt' | 'priority' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface RegulatoryUpdatesListResponse {
  success: boolean;
  data: RegulatoryUpdate[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    jurisdiction?: string;
    type?: string;
    priority?: string;
    search?: string;
  };
}

export interface RegulatoryUpdatesStats {
  total: number;
  byType: Record<string, number>;
  byJurisdiction: Record<string, number>;
  byPriority: Record<string, number>;
  recentCount: number;
  criticalCount: number;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

// ==========================================
// API BASE CONFIGURATION
// ==========================================

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3000';
const API_VERSION = 'v1';

class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// ==========================================
// HTTP CLIENT
// ==========================================

class HTTPClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers
      },
      credentials: 'include' // Include cookies for session-based auth
    };

    logger.debug(`API Request: ${options.method || 'GET'} ${url}`, {
      headers: config.headers,
      body: config.body
    });

    try {
      const response = await fetch(url, config);
      
      // Parse response
      let data: any;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      logger.debug(`API Response: ${response.status}`, {
        status: response.status,
        statusText: response.statusText,
        data: data
      });

      // Handle error responses
      if (!response.ok) {
        throw new APIError(
          data.message || data.error || `HTTP ${response.status}`,
          response.status,
          data
        );
      }

      return data;

    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }

      logger.error('API request failed', {
        url,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      throw new APIError(
        'Network request failed',
        0,
        { originalError: error }
      );
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${this.baseURL}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return this.request<T>(url.pathname + url.search, {
      method: 'GET'
    });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE'
    });
  }
}

// ==========================================
// API CLIENT INSTANCE
// ==========================================

const apiClient = new HTTPClient(`${API_BASE_URL}/api/${API_VERSION}`);

// ==========================================
// REGULATORY UPDATES API SERVICE
// ==========================================

export class RegulatoryUpdatesAPI {
  
  /**
   * List regulatory updates with filtering and pagination
   */
  static async list(params: ListRegulatoryUpdatesParams = {}): Promise<RegulatoryUpdatesListResponse> {
    try {
      logger.info('Fetching regulatory updates list', { params });
      
      const response = await apiClient.get<RegulatoryUpdatesListResponse>('/regulatory-updates', params);
      
      logger.info('Regulatory updates list fetched successfully', {
        count: response.data.length,
        totalCount: response.pagination.totalCount,
        page: response.pagination.page
      });
      
      return response;
    } catch (error) {
      logger.error('Failed to fetch regulatory updates list', {
        error: error instanceof Error ? error.message : 'Unknown error',
        params
      });
      throw error;
    }
  }

  /**
   * Get a specific regulatory update by ID
   */
  static async getById(id: string): Promise<RegulatoryUpdate> {
    try {
      logger.info('Fetching regulatory update by ID', { id });
      
      const response = await apiClient.get<APIResponse<RegulatoryUpdate>>(`/regulatory-updates/${id}`);
      
      if (!response.success || !response.data) {
        throw new APIError('Regulatory update not found', 404);
      }
      
      logger.info('Regulatory update fetched successfully', { id });
      
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch regulatory update', {
        error: error instanceof Error ? error.message : 'Unknown error',
        id
      });
      throw error;
    }
  }

  /**
   * Create a new regulatory update
   */
  static async create(data: CreateRegulatoryUpdateData): Promise<RegulatoryUpdate> {
    try {
      logger.info('Creating regulatory update', { title: data.title, type: data.type });
      
      const response = await apiClient.post<APIResponse<RegulatoryUpdate>>('/regulatory-updates', data);
      
      if (!response.success || !response.data) {
        throw new APIError('Failed to create regulatory update', 500);
      }
      
      logger.info('Regulatory update created successfully', { id: response.data.id });
      
      return response.data;
    } catch (error) {
      logger.error('Failed to create regulatory update', {
        error: error instanceof Error ? error.message : 'Unknown error',
        data
      });
      throw error;
    }
  }

  /**
   * Update an existing regulatory update
   */
  static async update(id: string, data: UpdateRegulatoryUpdateData): Promise<RegulatoryUpdate> {
    try {
      logger.info('Updating regulatory update', { id, updateFields: Object.keys(data) });
      
      const response = await apiClient.put<APIResponse<RegulatoryUpdate>>(`/regulatory-updates/${id}`, data);
      
      if (!response.success || !response.data) {
        throw new APIError('Failed to update regulatory update', 500);
      }
      
      logger.info('Regulatory update updated successfully', { id });
      
      return response.data;
    } catch (error) {
      logger.error('Failed to update regulatory update', {
        error: error instanceof Error ? error.message : 'Unknown error',
        id,
        data
      });
      throw error;
    }
  }

  /**
   * Delete a regulatory update
   */
  static async delete(id: string): Promise<void> {
    try {
      logger.info('Deleting regulatory update', { id });
      
      const response = await apiClient.delete<APIResponse>(`/regulatory-updates/${id}`);
      
      if (!response.success) {
        throw new APIError('Failed to delete regulatory update', 500);
      }
      
      logger.info('Regulatory update deleted successfully', { id });
    } catch (error) {
      logger.error('Failed to delete regulatory update', {
        error: error instanceof Error ? error.message : 'Unknown error',
        id
      });
      throw error;
    }
  }

  /**
   * Get recent regulatory updates
   */
  static async getRecent(limit: number = 10): Promise<RegulatoryUpdate[]> {
    try {
      logger.info('Fetching recent regulatory updates', { limit });
      
      const response = await apiClient.get<APIResponse<RegulatoryUpdate[]>>('/regulatory-updates/recent', { limit });
      
      if (!response.success || !response.data) {
        throw new APIError('Failed to fetch recent regulatory updates', 500);
      }
      
      logger.info('Recent regulatory updates fetched successfully', { count: response.data.length });
      
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch recent regulatory updates', {
        error: error instanceof Error ? error.message : 'Unknown error',
        limit
      });
      throw error;
    }
  }

  /**
   * Get regulatory updates statistics
   */
  static async getStats(): Promise<RegulatoryUpdatesStats> {
    try {
      logger.info('Fetching regulatory updates statistics');
      
      const response = await apiClient.get<APIResponse<RegulatoryUpdatesStats>>('/regulatory-updates/stats');
      
      if (!response.success || !response.data) {
        throw new APIError('Failed to fetch regulatory updates statistics', 500);
      }
      
      logger.info('Regulatory updates statistics fetched successfully');
      
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch regulatory updates statistics', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }
}

// ==========================================
// HEALTH CHECK API
// ==========================================

export class HealthAPI {
  /**
   * Check API health
   */
  static async check(): Promise<any> {
    try {
      const response = await apiClient.get('/health');
      return response;
    } catch (error) {
      logger.error('Health check failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get system information
   */
  static async getSystemInfo(): Promise<any> {
    try {
      const response = await apiClient.get('/system/info');
      return response;
    } catch (error) {
      logger.error('Failed to get system info', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }
}

// ==========================================
// EXPORTS
// ==========================================

export { APIError };
export default RegulatoryUpdatesAPI;
