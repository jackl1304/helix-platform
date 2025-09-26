import { logger, LoggingUtils } from '../utils/logger';
// ========================================
// SAUBERER API SERVICE - NEU PROGRAMMIERT
// ========================================

const API_BASE_URL = 'http://localhost:3000/api';

interface ApiResponse<T> {
  data: T;
  success: boolean;
  timestamp: string;
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    console.log(`[API] ${options.method || 'GET'} ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    logger.info('[API] Success:', data);
    return data;
  }

  // Health Check
  async getHealth() {
    return this.request('/health');
  }

  // Dashboard Stats
  async getDashboardStats() {
    const response = await this.request<ApiResponse<any>>('/dashboard/stats');
    return response.data || {};
  }

  // Legal Cases
  async getLegalCases() {
    try {
      const response = await this.request<ApiResponse<any[]>>('/legal-cases');
      // Ensure we always return an array
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && typeof response.data === 'object') {
        // If data is an object, wrap it in an array
        return [response.data];
      } else {
        console.warn('[API] Legal cases data is not an array:', response.data);
        return [];
      }
    } catch (error) {
      logger.error('[API] Error fetching legal cases:', error);
      return [];
    }
  }

  // Regulatory Updates
  async getRegulatoryUpdates() {
    try {
      const response = await this.request<ApiResponse<any[]>>('/regulatory-updates');
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && typeof response.data === 'object') {
        return [response.data];
      } else {
        console.warn('[API] Regulatory updates data is not an array:', response.data);
        return [];
      }
    } catch (error) {
      logger.error('[API] Error fetching regulatory updates:', error);
      return [];
    }
  }

  // Data Sources
  async getDataSources() {
    const response = await this.request<ApiResponse<any[]>>('/data-sources');
    return response.data || [];
  }

  // Newsletter Sources
  async getNewsletterSources() {
    const response = await this.request<ApiResponse<any[]>>('/newsletter-sources');
    return response.data || [];
  }

  // Sync Status
  async getSyncStatus() {
    const response = await this.request<ApiResponse<any>>('/sync/status');
    return response.data || {};
  }

  // Trigger Sync
  async triggerSync() {
    const response = await this.request<ApiResponse<any>>('/sync/trigger', {
      method: 'POST',
    });
    return response.data || {};
  }
}

export const apiService = new ApiService();
export default apiService;

