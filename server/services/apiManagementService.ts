import { storage } from '../storage';
import { businessLogger, LoggingUtils } from '../utils/logger';
import type { InsertRegulatoryUpdate } from '@shared/schema';

// Type definition for database source objects returned by storage.getActiveDataSources()
export interface DatabaseSource {
  id: string;
  name: string;
  description?: string;
  url?: string;
  apiEndpoint?: string;
  country?: string;
  region?: string;
  type: string;
  category?: string;
  language?: string;
  isActive: boolean;
  lastSync?: Date | string;
  syncFrequency?: string;
  authRequired?: boolean;
  apiKey?: string;
  metadata?: any;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  // Additional transformed properties from storage transformation
  endpoint?: string;
}

/**
 * Zentrales API-Management-System für alle Datenquellen
 * Basierend auf der Deep Search Analyse der verfügbaren APIs
 */

export interface DataSource {
  id: string;
  name: string;
  type: 'official_api' | 'web_scraping' | 'partner_api';
  endpoint?: string;
  requiresAuth: boolean;
  priority: 'high' | 'medium' | 'low';
  region: string;
  status: 'active' | 'inactive' | 'testing';
  lastSync?: Date;
  errorCount: number;
}

export interface APIResponse {
  success: boolean;
  data?: any[];
  error?: string;
  rateLimitRemaining?: number;
  nextSyncTime?: Date;
}

export class APIManagementService {
  private dataSources: Map<string, DataSource> = new Map();
  private rateLimits: Map<string, { requests: number; resetTime: Date }> = new Map();
  private initialized: boolean = false;

  constructor() {
    this.initializeDataSources();
  }

  private async initializeDataSources() {
    try {
      apiLogger.info('Loading data sources from database...', { context: 'API Management' });
      
      // Load active data sources from database
      const dbSources = await storage.getActiveDataSources();
      apiLogger.info('Found ${dbSources.length} active data sources in database', { context: 'API Management' });
      
      // Map database sources to APIManagementService format
      for (const dbSource of dbSources as DatabaseSource[]) {
        if (dbSource.id && dbSource.name) {
          // Extract endpoint from multiple possible sources
          const endpoint = dbSource.apiEndpoint || 
                          dbSource.endpoint || 
                          dbSource.url || 
                          '';
          
          // Parse lastSync from various possible formats
          let lastSync: Date | undefined;
          if (dbSource.lastSync) {
            lastSync = typeof dbSource.lastSync === 'string' 
              ? new Date(dbSource.lastSync) 
              : dbSource.lastSync;
          }
          
          const mappedSource: DataSource = {
            id: dbSource.id,
            name: dbSource.name,
            type: this.mapSourceType(dbSource.type || 'unknown'),
            endpoint: endpoint,
            requiresAuth: dbSource.authRequired || this.requiresAuthentication(dbSource.type || '', dbSource.name),
            priority: this.determinePriority(dbSource.type || '', dbSource.region || ''),
            region: dbSource.region || 'Unknown',
            status: dbSource.isActive ? 'active' : 'inactive',
            lastSync: lastSync,
            errorCount: 0
          };
          
          this.registerDataSource(mappedSource);
        }
      }
      
      apiLogger.info('Successfully registered ${this.dataSources.size} data sources', { context: 'API Management' });
      this.initialized = true;
      
      // Log source distribution by type and region
      this.logSourceDistribution();
      
    } catch (error) {
      logger.error('[API Management] Error loading from database, using fallback sources:', error);
      this.initializeFallbackSources();
    }
  }
  
  private initializeFallbackSources() {
    // Priorität 1: Offizielle APIs mit direktem Zugang
    this.registerDataSource({
      id: 'fda_openfda',
      name: 'FDA OpenFDA API',
      type: 'official_api',
      endpoint: 'https://api.fda.gov',
      requiresAuth: false, // API Key empfohlen aber nicht erforderlich
      priority: 'high',
      region: 'United States',
      status: 'active',
      errorCount: 0
    });

    // Priorität 2: APIs mit Registrierungsanforderung
    this.registerDataSource({
      id: 'ema_pms',
      name: 'EMA Product Management Service',
      type: 'official_api',
      endpoint: 'https://api.ema.europa.eu',
      requiresAuth: true, // Erfordert EMA-Benutzerkonto
      priority: 'high',
      region: 'European Union',
      status: 'testing', // Benötigt Zugangsdaten
      errorCount: 0
    });

    this.registerDataSource({
      id: 'mhra_more',
      name: 'MHRA MORE Platform API',
      type: 'official_api',
      endpoint: 'https://www.gov.uk/api/more',
      requiresAuth: true, // Erfordert MORE Portal Registrierung
      priority: 'medium',
      region: 'United Kingdom',
      status: 'testing', // Benötigt Zugangsdaten
      errorCount: 0
    });

    // Priorität 3: Web Scraping für Behörden ohne APIs
    this.registerDataSource({
      id: 'bfarm_scraping',
      name: 'BfArM Web Scraping',
      type: 'web_scraping',
      endpoint: 'https://www.bfarm.de',
      requiresAuth: false,
      priority: 'medium',
      region: 'Germany',
      status: 'active',
      errorCount: 0
    });

    this.registerDataSource({
      id: 'swissmedic_scraping',
      name: 'Swissmedic Web Scraping',
      type: 'web_scraping',
      endpoint: 'https://www.swissmedic.ch',
      requiresAuth: false,
      priority: 'medium',
      region: 'Switzerland',
      status: 'active',
      errorCount: 0
    });

    this.registerDataSource({
      id: 'health_canada_scraping',
      name: 'Health Canada Web Scraping',
      type: 'web_scraping',
      endpoint: 'https://www.canada.ca/en/health-canada',
      requiresAuth: false,
      priority: 'medium',
      region: 'Canada',
      status: 'active',
      errorCount: 0
    });
    
    apiLogger.info('Fallback initialization complete with ${this.dataSources.size} sources', { context: 'API Management' });
    this.initialized = true;
  }
  
  /**
   * Map database source type to APIManagementService type
   */
  private mapSourceType(dbType: string): 'official_api' | 'web_scraping' | 'partner_api' {
    if (dbType?.toLowerCase().includes('api')) return 'official_api';
    if (dbType?.toLowerCase().includes('scraping') || dbType?.toLowerCase().includes('web')) return 'web_scraping';
    if (dbType?.toLowerCase().includes('partner') || dbType?.toLowerCase().includes('grip')) return 'partner_api';
    
    // Default mapping for common types
    switch (dbType?.toLowerCase()) {
      case 'regulatory':
      case 'official':
      case 'government':
        return 'official_api';
      case 'rss':
      case 'newsletter':
      case 'publication':
        return 'web_scraping';
      default:
        return 'web_scraping'; // Conservative default
    }
  }
  
  /**
   * Determine if source requires authentication
   */
  private requiresAuthentication(type: string, name: string): boolean {
    const authRequiredKeywords = ['ema', 'mhra', 'more', 'portal', 'authenticated', 'private'];
    const typeName = `${type} ${name}`.toLowerCase();
    return authRequiredKeywords.some(keyword => typeName.includes(keyword));
  }
  
  /**
   * Determine source priority based on type and region
   */
  private determinePriority(type: string, region: string): 'high' | 'medium' | 'low' {
    // High priority for major regulatory bodies
    const highPriorityRegions = ['united states', 'european union', 'germany', 'france', 'japan'];
    const highPriorityTypes = ['fda', 'ema', 'bfarm', 'ansm', 'pmda'];
    
    const typeStr = type?.toLowerCase() || '';
    const regionStr = region?.toLowerCase() || '';
    
    if (highPriorityRegions.some(r => regionStr.includes(r)) || 
        highPriorityTypes.some(t => typeStr.includes(t))) {
      return 'high';
    }
    
    // Medium priority for regulatory type sources
    if (typeStr.includes('regulatory') || typeStr.includes('government') || typeStr.includes('official')) {
      return 'medium';
    }
    
    return 'low';
  }
  
  /**
   * Log source distribution for debugging
   */
  private logSourceDistribution() {
    const byType = new Map<string, number>();
    const byRegion = new Map<string, number>();
    const byStatus = new Map<string, number>();
    
    for (const source of this.dataSources.values()) {
      byType.set(source.type, (byType.get(source.type) || 0) + 1);
      byRegion.set(source.region, (byRegion.get(source.region) || 0) + 1);
      byStatus.set(source.status, (byStatus.get(source.status) || 0) + 1);
    }
    
    apiLogger.info('Source distribution:', { context: 'API Management' });
    logger.info('  By Type:', Object.fromEntries(byType));
    logger.info('  By Region:', Object.fromEntries(byRegion));
    logger.info('  By Status:', Object.fromEntries(byStatus));
  }
  
  /**
   * Ensure initialization is complete before API calls
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      apiLogger.info('Waiting for initialization to complete...', { context: 'API Management' });
      // Simple retry mechanism
      let retries = 0;
      while (!this.initialized && retries < 10) {
        await new Promise(resolve => setTimeout(resolve, 500));
        retries++;
      }
      if (!this.initialized) {
        throw new Error('API Management Service failed to initialize');
      }
    }
  }

  private registerDataSource(source: DataSource) {
    this.dataSources.set(source.id, source);
    apiLogger.info('Registered data source: ${source.name} (${source.type})', { context: 'API Management' });
  }

  /**
   * Rate Limiting Management
   */
  private async checkRateLimit(sourceId: string): Promise<boolean> {
    const limit = this.rateLimits.get(sourceId);
    if (!limit) return true;

    if (limit.resetTime < new Date()) {
      this.rateLimits.delete(sourceId);
      return true;
    }

    return limit.requests > 0;
  }

  private updateRateLimit(sourceId: string, requestsRemaining: number, resetTime: Date) {
    this.rateLimits.set(sourceId, {
      requests: requestsRemaining,
      resetTime
    });
  }

  /**
   * Zentrale API-Aufruf-Methode mit einheitlichem Error Handling
   */
  async callAPI(sourceId: string, endpoint: string, options?: any): Promise<APIResponse> {
    await this.ensureInitialized();
    
    const source = this.dataSources.get(sourceId);
    if (!source) {
      logger.error('[API Management] Unknown data source: ${sourceId}. Available sources:', Array.from(this.dataSources.keys()));
      return { success: false, error: `Unknown data source: ${sourceId}` };
    }

    // Rate Limit Check
    if (!(await this.checkRateLimit(sourceId))) {
      return { 
        success: false, 
        error: 'Rate limit exceeded',
        nextSyncTime: this.rateLimits.get(sourceId)?.resetTime || new Date()
      };
    }

    try {
      const response = await this.executeAPICall(source, endpoint, options);
      
      // Success - Reset error count
      source.errorCount = 0;
      source.lastSync = new Date();
      
      return {
        success: true,
        data: response.data,
        rateLimitRemaining: response.rateLimitRemaining
      };

    } catch (error) {
      source.errorCount++;
      
      // Automatic deactivation after 5 consecutive errors
      if (source.errorCount >= 5) {
        source.status = 'inactive';
        apiLogger.error('Deactivating source ${sourceId} due to repeated errors', { context: 'API Management' });
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async executeAPICall(source: DataSource, endpoint: string, options?: any): Promise<any> {
    const fullUrl = `${source.endpoint}${endpoint}`;
    
    switch (source.type) {
      case 'official_api':
        return await this.callOfficialAPI(fullUrl, source, options);
      case 'web_scraping':
        return await this.scrapeWebsite(fullUrl, source, options);
      case 'partner_api':
        return await this.callPartnerAPI(fullUrl, source, options);
      default:
        throw new Error(`Unsupported source type: ${source.type}`);
    }
  }

  private async callOfficialAPI(url: string, source: DataSource, options?: any): Promise<any> {
    const headers: Record<string, string> = {
      'User-Agent': 'Helix-Regulatory-Intelligence/1.0',
      'Accept': 'application/json'
    };

    // Add authentication headers if required
    if (source.requiresAuth && options?.apiKey) {
      headers['Authorization'] = `Bearer ${options.apiKey}`;
    }

    const response = await fetch(url, {
      method: options?.method || 'GET',
      headers,
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Extract rate limit info from headers
    const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
    const rateLimitReset = response.headers.get('X-RateLimit-Reset');

    if (rateLimitRemaining && rateLimitReset) {
      this.updateRateLimit(
        source.id,
        parseInt(rateLimitRemaining),
        new Date(parseInt(rateLimitReset) * 1000)
      );
    }

    return {
      data: await response.json(),
      rateLimitRemaining: rateLimitRemaining ? parseInt(rateLimitRemaining) : undefined
    };
  }

  private async scrapeWebsite(url: string, source: DataSource, options?: any): Promise<any> {
    // 🔴 MOCK DATA - Web Scraping Implementation würde hier erfolgen
    // 🔴 MOCK DATA - Für jetzt Placeholder mit Logging - AUTHENTIC SCRAPER REQUIRED
    apiLogger.info('Web scraping ${url} - Implementation needed', { context: 'API Management' });
    
    // Return structured data format
    return {
      data: [],
      rateLimitRemaining: undefined
    };
  }

  private async callPartnerAPI(url: string, source: DataSource, options?: any): Promise<any> {
    // Partner API calls (wie GRIP) würden hier implementiert
    apiLogger.info('Partner API call to ${url}', { context: 'API Management' });
    
    return {
      data: [],
      rateLimitRemaining: undefined
    };
  }

  /**
   * Get all active data sources
   */
  getActiveDataSources(): DataSource[] {
    return Array.from(this.dataSources.values()).filter(source => source.status === 'active');
  }

  /**
   * Get data sources by region
   */
  getDataSourcesByRegion(region: string): DataSource[] {
    return Array.from(this.dataSources.values()).filter(source => source.region === region);
  }

  /**
   * Get data sources requiring authentication
   */
  getUnauthenticatedSources(): DataSource[] {
    return Array.from(this.dataSources.values()).filter(
      source => source.requiresAuth && source.status === 'testing'
    );
  }

  /**
   * Health check for all data sources
   */
  async performHealthCheck(): Promise<{ healthy: number; unhealthy: number; details: any[] }> {
    const results = [];
    let healthy = 0;
    let unhealthy = 0;

    for (const source of this.dataSources.values()) {
      try {
        // Simple health check endpoint
        const result = await this.callAPI(source.id, '/health', { timeout: 5000 });
        if (result.success) {
          healthy++;
          results.push({ sourceId: source.id, status: 'healthy', lastSync: source.lastSync });
        } else {
          unhealthy++;
          results.push({ sourceId: source.id, status: 'unhealthy', error: result.error });
        }
      } catch (error) {
        unhealthy++;
        results.push({ 
          sourceId: source.id, 
          status: 'unhealthy', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    return { healthy, unhealthy, details: results };
  }
}

export const apiManagementService = new APIManagementService();