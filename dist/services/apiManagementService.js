import { storage } from '../storage';
export class APIManagementService {
    constructor() {
        this.dataSources = new Map();
        this.rateLimits = new Map();
        this.initialized = false;
        this.initializeDataSources();
    }
    async initializeDataSources() {
        try {
            console.log('[API Management] Loading data sources from database...');
            const dbSources = await storage.getActiveDataSources();
            console.log(`[API Management] Found ${dbSources.length} active data sources in database`);
            for (const dbSource of dbSources) {
                if (dbSource.id && dbSource.name) {
                    const endpoint = dbSource.apiEndpoint ||
                        dbSource.endpoint ||
                        dbSource.url ||
                        '';
                    let lastSync;
                    if (dbSource.lastSync) {
                        lastSync = typeof dbSource.lastSync === 'string'
                            ? new Date(dbSource.lastSync)
                            : dbSource.lastSync;
                    }
                    const mappedSource = {
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
            console.log(`[API Management] Successfully registered ${this.dataSources.size} data sources`);
            this.initialized = true;
            this.logSourceDistribution();
        }
        catch (error) {
            console.error('[API Management] Error loading from database, using fallback sources:', error);
            this.initializeFallbackSources();
        }
    }
    initializeFallbackSources() {
        this.registerDataSource({
            id: 'fda_openfda',
            name: 'FDA OpenFDA API',
            type: 'official_api',
            endpoint: 'https://api.fda.gov',
            requiresAuth: false,
            priority: 'high',
            region: 'United States',
            status: 'active',
            errorCount: 0
        });
        this.registerDataSource({
            id: 'ema_pms',
            name: 'EMA Product Management Service',
            type: 'official_api',
            endpoint: 'https://api.ema.europa.eu',
            requiresAuth: true,
            priority: 'high',
            region: 'European Union',
            status: 'testing',
            errorCount: 0
        });
        this.registerDataSource({
            id: 'mhra_more',
            name: 'MHRA MORE Platform API',
            type: 'official_api',
            endpoint: 'https://www.gov.uk/api/more',
            requiresAuth: true,
            priority: 'medium',
            region: 'United Kingdom',
            status: 'testing',
            errorCount: 0
        });
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
        console.log(`[API Management] Fallback initialization complete with ${this.dataSources.size} sources`);
        this.initialized = true;
    }
    mapSourceType(dbType) {
        if (dbType?.toLowerCase().includes('api'))
            return 'official_api';
        if (dbType?.toLowerCase().includes('scraping') || dbType?.toLowerCase().includes('web'))
            return 'web_scraping';
        if (dbType?.toLowerCase().includes('partner') || dbType?.toLowerCase().includes('grip'))
            return 'partner_api';
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
                return 'web_scraping';
        }
    }
    requiresAuthentication(type, name) {
        const authRequiredKeywords = ['ema', 'mhra', 'more', 'portal', 'authenticated', 'private'];
        const typeName = `${type} ${name}`.toLowerCase();
        return authRequiredKeywords.some(keyword => typeName.includes(keyword));
    }
    determinePriority(type, region) {
        const highPriorityRegions = ['united states', 'european union', 'germany', 'france', 'japan'];
        const highPriorityTypes = ['fda', 'ema', 'bfarm', 'ansm', 'pmda'];
        const typeStr = type?.toLowerCase() || '';
        const regionStr = region?.toLowerCase() || '';
        if (highPriorityRegions.some(r => regionStr.includes(r)) ||
            highPriorityTypes.some(t => typeStr.includes(t))) {
            return 'high';
        }
        if (typeStr.includes('regulatory') || typeStr.includes('government') || typeStr.includes('official')) {
            return 'medium';
        }
        return 'low';
    }
    logSourceDistribution() {
        const byType = new Map();
        const byRegion = new Map();
        const byStatus = new Map();
        for (const source of this.dataSources.values()) {
            byType.set(source.type, (byType.get(source.type) || 0) + 1);
            byRegion.set(source.region, (byRegion.get(source.region) || 0) + 1);
            byStatus.set(source.status, (byStatus.get(source.status) || 0) + 1);
        }
        console.log('[API Management] Source distribution:');
        console.log('  By Type:', Object.fromEntries(byType));
        console.log('  By Region:', Object.fromEntries(byRegion));
        console.log('  By Status:', Object.fromEntries(byStatus));
    }
    async ensureInitialized() {
        if (!this.initialized) {
            console.log('[API Management] Waiting for initialization to complete...');
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
    registerDataSource(source) {
        this.dataSources.set(source.id, source);
        console.log(`[API Management] Registered data source: ${source.name} (${source.type})`);
    }
    async checkRateLimit(sourceId) {
        const limit = this.rateLimits.get(sourceId);
        if (!limit)
            return true;
        if (limit.resetTime < new Date()) {
            this.rateLimits.delete(sourceId);
            return true;
        }
        return limit.requests > 0;
    }
    updateRateLimit(sourceId, requestsRemaining, resetTime) {
        this.rateLimits.set(sourceId, {
            requests: requestsRemaining,
            resetTime
        });
    }
    async callAPI(sourceId, endpoint, options) {
        await this.ensureInitialized();
        const source = this.dataSources.get(sourceId);
        if (!source) {
            console.error(`[API Management] Unknown data source: ${sourceId}. Available sources:`, Array.from(this.dataSources.keys()));
            return { success: false, error: `Unknown data source: ${sourceId}` };
        }
        if (!(await this.checkRateLimit(sourceId))) {
            return {
                success: false,
                error: 'Rate limit exceeded',
                nextSyncTime: this.rateLimits.get(sourceId)?.resetTime || new Date()
            };
        }
        try {
            const response = await this.executeAPICall(source, endpoint, options);
            source.errorCount = 0;
            source.lastSync = new Date();
            return {
                success: true,
                data: response.data,
                rateLimitRemaining: response.rateLimitRemaining
            };
        }
        catch (error) {
            source.errorCount++;
            if (source.errorCount >= 5) {
                source.status = 'inactive';
                console.error(`[API Management] Deactivating source ${sourceId} due to repeated errors`);
            }
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async executeAPICall(source, endpoint, options) {
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
    async callOfficialAPI(url, source, options) {
        const headers = {
            'User-Agent': 'Helix-Regulatory-Intelligence/1.0',
            'Accept': 'application/json'
        };
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
        const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
        const rateLimitReset = response.headers.get('X-RateLimit-Reset');
        if (rateLimitRemaining && rateLimitReset) {
            this.updateRateLimit(source.id, parseInt(rateLimitRemaining), new Date(parseInt(rateLimitReset) * 1000));
        }
        return {
            data: await response.json(),
            rateLimitRemaining: rateLimitRemaining ? parseInt(rateLimitRemaining) : undefined
        };
    }
    async scrapeWebsite(url, source, options) {
        console.log(`[API Management] Web scraping ${url} - Implementation needed`);
        return {
            data: [],
            rateLimitRemaining: undefined
        };
    }
    async callPartnerAPI(url, source, options) {
        console.log(`[API Management] Partner API call to ${url}`);
        return {
            data: [],
            rateLimitRemaining: undefined
        };
    }
    getActiveDataSources() {
        return Array.from(this.dataSources.values()).filter(source => source.status === 'active');
    }
    getDataSourcesByRegion(region) {
        return Array.from(this.dataSources.values()).filter(source => source.region === region);
    }
    getUnauthenticatedSources() {
        return Array.from(this.dataSources.values()).filter(source => source.requiresAuth && source.status === 'testing');
    }
    async performHealthCheck() {
        const results = [];
        let healthy = 0;
        let unhealthy = 0;
        for (const source of this.dataSources.values()) {
            try {
                const result = await this.callAPI(source.id, '/health', { timeout: 5000 });
                if (result.success) {
                    healthy++;
                    results.push({ sourceId: source.id, status: 'healthy', lastSync: source.lastSync });
                }
                else {
                    unhealthy++;
                    results.push({ sourceId: source.id, status: 'unhealthy', error: result.error });
                }
            }
            catch (error) {
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
//# sourceMappingURL=apiManagementService.js.map