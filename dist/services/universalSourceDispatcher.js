import axios from 'axios';
import * as cheerio from 'cheerio';
import { RateLimiter } from 'limiter';
import { storage } from '../storage';
export class UniversalSourceDispatcher {
    constructor() {
        this.rateLimiters = new Map();
        this.sourceRegistry = [];
        this.initializeSourceRegistry();
    }
    initializeSourceRegistry() {
        console.log('[Universal Dispatcher] Initializing comprehensive source registry...');
        this.sourceRegistry = [
            {
                id: 'fda-510k',
                name: 'FDA 510(k) Database',
                type: 'official_api',
                category: 'regulatory',
                priority: 'high',
                region: 'United States',
                url: 'https://api.fda.gov/device/510k.json',
                apiEndpoint: 'https://api.fda.gov/device/510k.json',
                endpointsConfig: {
                    params: { limit: 100, sort: 'decision_date:desc' },
                    dataPath: 'results'
                },
                rateLimitPerHour: 240,
                timeoutSeconds: 30,
                retryCount: 0,
                maxRetries: 3,
                isActive: true
            },
            {
                id: 'fda-pma',
                name: 'FDA PMA Database',
                type: 'official_api',
                category: 'regulatory',
                priority: 'high',
                region: 'United States',
                url: 'https://api.fda.gov/device/pma.json',
                apiEndpoint: 'https://api.fda.gov/device/pma.json',
                endpointsConfig: {
                    params: { limit: 100, sort: 'decision_date:desc' },
                    dataPath: 'results'
                },
                rateLimitPerHour: 240,
                timeoutSeconds: 30,
                retryCount: 0,
                maxRetries: 3,
                isActive: true
            },
            {
                id: 'fda-recalls',
                name: 'FDA Device Recalls',
                type: 'official_api',
                category: 'safety',
                priority: 'high',
                region: 'United States',
                url: 'https://api.fda.gov/device/recall.json',
                apiEndpoint: 'https://api.fda.gov/device/recall.json',
                endpointsConfig: {
                    params: { limit: 100, sort: 'report_date:desc' },
                    dataPath: 'results'
                },
                rateLimitPerHour: 240,
                timeoutSeconds: 30,
                retryCount: 0,
                maxRetries: 3,
                isActive: true
            },
            {
                id: 'ema-epar',
                name: 'EMA EPAR Database',
                type: 'web_scraping',
                category: 'regulatory',
                priority: 'high',
                region: 'Europe',
                url: 'https://www.ema.europa.eu/en/medicines/download-medicine-data',
                scrapingConfig: {
                    selectors: {
                        articles: '.ema-search-result',
                        title: '.ema-search-result-title a',
                        date: '.ema-search-result-date',
                        link: '.ema-search-result-title a'
                    }
                },
                rateLimitPerHour: 60,
                timeoutSeconds: 45,
                retryCount: 0,
                maxRetries: 3,
                isActive: true
            },
            {
                id: 'health-canada-mdr',
                name: 'Health Canada Medical Device Registry',
                type: 'official_api',
                category: 'regulatory',
                priority: 'high',
                region: 'Canada',
                url: 'https://health-products.canada.ca/api/medical-devices',
                apiEndpoint: 'https://health-products.canada.ca/api/medical-devices/search',
                endpointsConfig: {
                    params: { limit: 100, format: 'json' },
                    dataPath: 'results'
                },
                rateLimitPerHour: 120,
                timeoutSeconds: 30,
                retryCount: 0,
                maxRetries: 3,
                isActive: true
            },
            {
                id: 'bfarm-germany',
                name: 'BfArM Germany Medical Devices',
                type: 'web_scraping',
                category: 'regulatory',
                priority: 'high',
                region: 'Germany',
                url: 'https://www.bfarm.de/DE/Medizinprodukte/_node.html',
                scrapingConfig: {
                    selectors: {
                        articles: '.news-item',
                        title: '.news-title a',
                        date: '.news-date',
                        link: '.news-title a'
                    }
                },
                rateLimitPerHour: 60,
                timeoutSeconds: 45,
                retryCount: 0,
                maxRetries: 3,
                isActive: true
            },
            {
                id: 'swissmedic',
                name: 'Swissmedic Medical Devices',
                type: 'web_scraping',
                category: 'regulatory',
                priority: 'high',
                region: 'Switzerland',
                url: 'https://www.swissmedic.ch/swissmedic/en/home/medical-devices.html',
                scrapingConfig: {
                    selectors: {
                        articles: '.news-list-item',
                        title: '.news-title',
                        date: '.news-date',
                        link: '.news-title a'
                    }
                },
                rateLimitPerHour: 60,
                timeoutSeconds: 45,
                retryCount: 0,
                maxRetries: 3,
                isActive: true
            },
            {
                id: 'mhra-uk',
                name: 'MHRA UK Medical Devices',
                type: 'web_scraping',
                category: 'regulatory',
                priority: 'high',
                region: 'United Kingdom',
                url: 'https://www.gov.uk/government/organisations/medicines-and-healthcare-products-regulatory-agency',
                scrapingConfig: {
                    selectors: {
                        articles: '.gem-c-document-list__item',
                        title: '.gem-c-document-list__item-title a',
                        date: '.gem-c-document-list__attribute-group time',
                        link: '.gem-c-document-list__item-title a'
                    }
                },
                rateLimitPerHour: 60,
                timeoutSeconds: 45,
                retryCount: 0,
                maxRetries: 3,
                isActive: true
            },
            {
                id: 'tga-australia',
                name: 'TGA Australia Medical Devices',
                type: 'web_scraping',
                category: 'regulatory',
                priority: 'high',
                region: 'Australia',
                url: 'https://www.tga.gov.au/resources/artg',
                scrapingConfig: {
                    selectors: {
                        articles: '.search-result',
                        title: '.search-result-title a',
                        date: '.search-result-date',
                        link: '.search-result-title a'
                    }
                },
                rateLimitPerHour: 60,
                timeoutSeconds: 45,
                retryCount: 0,
                maxRetries: 3,
                isActive: true
            },
            {
                id: 'pmda-japan',
                name: 'PMDA Japan Medical Devices',
                type: 'web_scraping',
                category: 'regulatory',
                priority: 'high',
                region: 'Japan',
                url: 'https://www.pmda.go.jp/english/review-services/reviews/approved-information/medical-devices/',
                scrapingConfig: {
                    selectors: {
                        articles: '.news-item',
                        title: '.news-title',
                        date: '.news-date',
                        link: '.news-title a'
                    }
                },
                rateLimitPerHour: 60,
                timeoutSeconds: 45,
                retryCount: 0,
                maxRetries: 3,
                isActive: true
            },
            {
                id: 'nmpa-china',
                name: 'NMPA China Medical Devices',
                type: 'web_scraping',
                category: 'regulatory',
                priority: 'high',
                region: 'China',
                url: 'https://www.nmpa.gov.cn/ylqx/',
                scrapingConfig: {
                    selectors: {
                        articles: '.list-item',
                        title: '.list-title a',
                        date: '.list-date',
                        link: '.list-title a'
                    }
                },
                rateLimitPerHour: 30,
                timeoutSeconds: 60,
                retryCount: 0,
                maxRetries: 3,
                isActive: true
            },
            {
                id: 'who-global',
                name: 'WHO Global Medical Device Alerts',
                type: 'official_api',
                category: 'global_health',
                priority: 'high',
                region: 'Global',
                url: 'https://extranet.who.int/gavi/api/medical-devices',
                apiEndpoint: 'https://extranet.who.int/gavi/api/medical-devices/search',
                endpointsConfig: {
                    params: { limit: 100, type: 'medical_device' },
                    dataPath: 'data'
                },
                rateLimitPerHour: 60,
                timeoutSeconds: 30,
                retryCount: 0,
                maxRetries: 3,
                isActive: true
            },
            {
                id: 'medtech-dive',
                name: 'MedTech Dive News',
                type: 'rss_feed',
                category: 'regulatory',
                priority: 'medium',
                region: 'Global',
                url: 'https://www.medtechdive.com/feeds/',
                rateLimitPerHour: 60,
                timeoutSeconds: 30,
                retryCount: 0,
                maxRetries: 3,
                isActive: true
            },
            {
                id: 'medical-design-outsourcing',
                name: 'Medical Design and Outsourcing',
                type: 'rss_feed',
                category: 'regulatory',
                priority: 'medium',
                region: 'Global',
                url: 'https://www.medicaldesignandoutsourcing.com/feed/',
                rateLimitPerHour: 60,
                timeoutSeconds: 30,
                retryCount: 0,
                maxRetries: 3,
                isActive: true
            },
            {
                id: 'medtech-big100',
                name: 'MedTech Big 100 Companies',
                type: 'web_scraping',
                category: 'regulatory',
                priority: 'medium',
                region: 'Global',
                url: 'https://www.medtechbreakthrough.com/medtech-big-100/',
                scrapingConfig: {
                    selectors: {
                        articles: '.company-item',
                        title: '.company-name',
                        date: '.company-date',
                        link: '.company-link'
                    }
                },
                rateLimitPerHour: 30,
                timeoutSeconds: 45,
                retryCount: 0,
                maxRetries: 3,
                isActive: true
            },
            {
                id: 'jama-network',
                name: 'JAMA Medical Device Research',
                type: 'web_scraping',
                category: 'clinical',
                priority: 'medium',
                region: 'Global',
                url: 'https://jamanetwork.com/collections/6184/medical-devices',
                scrapingConfig: {
                    selectors: {
                        articles: '.article-item',
                        title: '.article-title a',
                        date: '.article-date',
                        link: '.article-title a'
                    }
                },
                rateLimitPerHour: 30,
                timeoutSeconds: 45,
                retryCount: 0,
                maxRetries: 3,
                isActive: true
            },
            {
                id: 'zuehlke-medtech',
                name: 'Zühlke MedTech Case Studies',
                type: 'web_scraping',
                category: 'regulatory',
                priority: 'medium',
                region: 'Europe',
                url: 'https://www.zuehlke.com/en/insights/medtech',
                scrapingConfig: {
                    selectors: {
                        articles: '.insight-item',
                        title: '.insight-title a',
                        date: '.insight-date',
                        link: '.insight-title a'
                    }
                },
                rateLimitPerHour: 30,
                timeoutSeconds: 45,
                retryCount: 0,
                maxRetries: 3,
                isActive: true
            },
            {
                id: 'clinicaltrials-gov',
                name: 'ClinicalTrials.gov Medical Devices',
                type: 'official_api',
                category: 'clinical',
                priority: 'medium',
                region: 'Global',
                url: 'https://clinicaltrials.gov/api/query/study_fields',
                apiEndpoint: 'https://clinicaltrials.gov/api/query/study_fields',
                endpointsConfig: {
                    params: {
                        'expr': 'medical device',
                        'fields': 'NCTId,BriefTitle,StudyType,Phase,OverallStatus',
                        'max_rnk': 100,
                        'fmt': 'json'
                    },
                    dataPath: 'StudyFieldsResponse'
                },
                rateLimitPerHour: 120,
                timeoutSeconds: 30,
                retryCount: 0,
                maxRetries: 3,
                isActive: true
            },
            {
                id: 'anvisa-brazil',
                name: 'ANVISA Brazil',
                type: 'web_scraping',
                category: 'regulatory',
                priority: 'low',
                region: 'Brazil',
                url: 'https://www.gov.br/anvisa/pt-br/assuntos/producoes-medicas',
                scrapingConfig: {
                    selectors: {
                        articles: '.noticia-item',
                        title: '.noticia-titulo a',
                        date: '.noticia-data',
                        link: '.noticia-titulo a'
                    }
                },
                rateLimitPerHour: 30,
                timeoutSeconds: 60,
                retryCount: 0,
                maxRetries: 3,
                isActive: true
            },
            {
                id: 'cofepris-mexico',
                name: 'COFEPRIS Mexico',
                type: 'web_scraping',
                category: 'regulatory',
                priority: 'low',
                region: 'Mexico',
                url: 'https://www.gob.mx/cofepris/acciones-y-programas/dispositivos-medicos',
                scrapingConfig: {
                    selectors: {
                        articles: '.programa-item',
                        title: '.programa-titulo',
                        date: '.programa-fecha',
                        link: '.programa-titulo a'
                    }
                },
                rateLimitPerHour: 30,
                timeoutSeconds: 60,
                retryCount: 0,
                maxRetries: 3,
                isActive: true
            },
            {
                id: 'invima-colombia',
                name: 'INVIMA Colombia',
                type: 'web_scraping',
                category: 'regulatory',
                priority: 'low',
                region: 'Colombia',
                url: 'https://www.invima.gov.co/dispositivos-medicos-y-otras-tecnologias/',
                scrapingConfig: {
                    selectors: {
                        articles: '.news-item',
                        title: '.news-title',
                        date: '.news-date',
                        link: '.news-title a'
                    }
                },
                rateLimitPerHour: 30,
                timeoutSeconds: 60,
                retryCount: 0,
                maxRetries: 3,
                isActive: true
            },
            {
                id: 'iso-medical',
                name: 'ISO Medical Device Standards',
                type: 'web_scraping',
                category: 'standards',
                priority: 'medium',
                region: 'Global',
                url: 'https://www.iso.org/committee/54892.html',
                scrapingConfig: {
                    selectors: {
                        articles: '.standard-item',
                        title: '.standard-title a',
                        date: '.standard-date',
                        link: '.standard-title a'
                    }
                },
                rateLimitPerHour: 30,
                timeoutSeconds: 45,
                retryCount: 0,
                maxRetries: 3,
                isActive: true
            },
            {
                id: 'iec-medical',
                name: 'IEC Medical Standards',
                type: 'web_scraping',
                category: 'standards',
                priority: 'medium',
                region: 'Global',
                url: 'https://www.iec.ch/dyn/www/f?p=103:7:0::::FSP_ORG_ID,FSP_LANG_ID:1316,25',
                scrapingConfig: {
                    selectors: {
                        articles: '.standard-entry',
                        title: '.standard-number',
                        date: '.standard-published',
                        link: '.standard-number a'
                    }
                },
                rateLimitPerHour: 30,
                timeoutSeconds: 45,
                retryCount: 0,
                maxRetries: 3,
                isActive: true
            },
            {
                id: 'fda-device-classification',
                name: 'FDA Device Classification Database',
                type: 'official_api',
                category: 'regulatory',
                priority: 'high',
                region: 'United States',
                url: 'https://api.fda.gov/device/classification.json',
                apiEndpoint: 'https://api.fda.gov/device/classification.json',
                endpointsConfig: {
                    params: { limit: 100, sort: 'regulation_name' },
                    dataPath: 'results'
                },
                rateLimitPerHour: 240,
                timeoutSeconds: 30,
                retryCount: 0,
                maxRetries: 3,
                isActive: true
            },
            {
                id: 'fda-udi',
                name: 'FDA UDI Database',
                type: 'official_api',
                category: 'regulatory',
                priority: 'high',
                region: 'United States',
                url: 'https://api.fda.gov/device/udi.json',
                apiEndpoint: 'https://api.fda.gov/device/udi.json',
                endpointsConfig: {
                    params: { limit: 100, sort: 'public_version_date:desc' },
                    dataPath: 'results'
                },
                rateLimitPerHour: 240,
                timeoutSeconds: 30,
                retryCount: 0,
                maxRetries: 3,
                isActive: true
            },
            {
                id: 'fda-enforcement',
                name: 'FDA Enforcement Reports',
                type: 'official_api',
                category: 'safety',
                priority: 'high',
                region: 'United States',
                url: 'https://api.fda.gov/device/enforcement.json',
                apiEndpoint: 'https://api.fda.gov/device/enforcement.json',
                endpointsConfig: {
                    params: { limit: 100, sort: 'report_date:desc' },
                    dataPath: 'results'
                },
                rateLimitPerHour: 240,
                timeoutSeconds: 30,
                retryCount: 0,
                maxRetries: 3,
                isActive: true
            }
        ];
        console.log(`[Universal Dispatcher] Initialized ${this.sourceRegistry.length} sources across all regions`);
    }
    initializeRateLimiters() {
        this.sourceRegistry.forEach(source => {
            const limiter = new RateLimiter({ tokensPerInterval: source.rateLimitPerHour, interval: 'hour' });
            this.rateLimiters.set(source.id, limiter);
        });
        console.log(`[Universal Dispatcher] Initialized ${this.sourceRegistry.length} sources with rate limiting`);
    }
    async fetchFromAPI(source) {
        const config = {
            method: 'GET',
            url: source.apiEndpoint || source.url,
            headers: {
                'User-Agent': 'Helix-Regulatory-Intelligence/1.0',
                'Accept': 'application/json'
            },
            timeout: source.timeoutSeconds * 1000,
            params: source.endpointsConfig?.params || {}
        };
        const response = await axios(config);
        let data = response.data;
        if (source.endpointsConfig?.dataPath) {
            const pathParts = source.endpointsConfig.dataPath.split('.');
            for (const part of pathParts) {
                data = data[part] || [];
            }
        }
        return Array.isArray(data) ? data : [data];
    }
    async scrapeWebsite(source) {
        const response = await axios.get(source.url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; Helix-Bot/1.0)'
            },
            timeout: source.timeoutSeconds * 1000
        });
        const $ = cheerio.load(response.data);
        const records = [];
        const config = source.scrapingConfig;
        if (config?.selectors) {
            $(config.selectors.articles).each((_, element) => {
                const title = $(element).find(config.selectors.title).text().trim();
                const date = $(element).find(config.selectors.date).text().trim();
                const link = $(element).find(config.selectors.link).attr('href');
                if (title) {
                    records.push({
                        title,
                        date,
                        url: link?.startsWith('http') ? link : new URL(link || '', source.url).href,
                        source: source.name
                    });
                }
            });
        }
        return records;
    }
    async fetchRSSFeed(source) {
        console.log(`[Universal Dispatcher] Fetching RSS feed from ${source.name}...`);
        try {
            const response = await axios.get(source.url, {
                timeout: source.timeoutSeconds * 1000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; HelixBot/1.0)'
                }
            });
            const data = response.data;
            const items = [];
            const itemRegex = /<item>(.*?)<\/item>/gs;
            let match;
            while ((match = itemRegex.exec(data)) !== null && items.length < 100) {
                const itemContent = match[1];
                const titleMatch = itemContent.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/);
                const linkMatch = itemContent.match(/<link>(.*?)<\/link>/);
                const descMatch = itemContent.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/);
                const pubDateMatch = itemContent.match(/<pubDate>(.*?)<\/pubDate>/);
                items.push({
                    title: titleMatch?.[1] || titleMatch?.[2] || 'RSS Item',
                    link: linkMatch?.[1] || '',
                    description: descMatch?.[1] || descMatch?.[2] || '',
                    pubDate: pubDateMatch?.[1] || new Date().toISOString()
                });
            }
            return items;
        }
        catch (error) {
            console.error(`[Universal Dispatcher] RSS fetch failed for ${source.name}:`, error.message);
            return [];
        }
    }
    async normalizeRecord(rawRecord, source) {
        if (!rawRecord)
            return null;
        try {
            const title = this.extractTitle(rawRecord, source);
            const description = this.extractDescription(rawRecord, source);
            const content = this.extractContent(rawRecord, source);
            const publishedAt = this.extractPublishedDate(rawRecord, source);
            const documentUrl = this.extractDocumentUrl(rawRecord, source);
            if (!title || title.length < 5)
                return null;
            return {
                title: title.substring(0, 500),
                description: description?.substring(0, 1000) || '',
                content: content || description || '',
                publishedAt: publishedAt || new Date().toISOString(),
                documentUrl: documentUrl || source.url,
                sourceType: source.type,
                priority: source.priority,
                region: source.region,
                deviceClasses: this.extractDeviceClasses(rawRecord)
            };
        }
        catch (error) {
            console.error(`[Universal Dispatcher] Error normalizing record from ${source.name}:`, error.message);
            return null;
        }
    }
    async validateRecord(record) {
        if (!record)
            return false;
        if (!record.title || record.title.length < 3)
            return false;
        if (record.title.toLowerCase().includes('medical device approval') && !record.description)
            return false;
        if (record.title.toLowerCase() === 'test')
            return false;
        const genericTitles = [
            'medical device approval',
            'device clearance',
            'regulatory update',
            'guidance document'
        ];
        const lowerTitle = record.title.toLowerCase();
        const isGeneric = genericTitles.some(generic => lowerTitle === generic || (lowerTitle.includes(generic) && lowerTitle.length < generic.length + 10));
        return !isGeneric;
    }
    extractTitle(record, source) {
        const titleFields = ['title', 'product_name', 'device_name', 'name', 'subject', 'headline'];
        for (const field of titleFields) {
            if (record[field] && typeof record[field] === 'string') {
                return record[field].trim();
            }
        }
        if (source.id.includes('fda')) {
            if (record.device_name)
                return `FDA 510(k): ${record.device_name}`;
            if (record.product_name)
                return `FDA PMA: ${record.product_name}`;
        }
        return null;
    }
    extractDescription(record, source) {
        const descFields = ['description', 'summary', 'statement', 'indication_for_use', 'purpose'];
        for (const field of descFields) {
            if (record[field] && typeof record[field] === 'string') {
                return record[field].trim();
            }
        }
        return null;
    }
    extractContent(record, source) {
        const contentFields = ['content', 'full_text', 'body', 'text', 'details'];
        for (const field of contentFields) {
            if (record[field] && typeof record[field] === 'string') {
                return record[field].trim();
            }
        }
        return null;
    }
    parseDate(dateInput) {
        if (!dateInput)
            return new Date().toISOString();
        try {
            if (typeof dateInput === 'string') {
                let date = new Date(dateInput);
                if (isNaN(date.getTime())) {
                    const parts = dateInput.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
                    if (parts) {
                        date = new Date(parseInt(parts[3]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                    }
                }
                return date.toISOString();
            }
            else if (typeof dateInput === 'number') {
                return new Date(dateInput * (dateInput < 10000000000 ? 1000 : 1)).toISOString();
            }
            else if (dateInput instanceof Date) {
                return dateInput.toISOString();
            }
        }
        catch (error) {
            console.warn('[Universal Dispatcher] Date parsing error:', error, 'for input:', dateInput);
        }
        return new Date().toISOString();
    }
    extractPublishedDate(record, source) {
        const dateFields = ['published_at', 'decision_date', 'date_received', 'pubDate', 'created_at', 'updated_at'];
        for (const field of dateFields) {
            if (record[field]) {
                return this.parseDate(record[field]);
            }
        }
        return null;
    }
    extractDocumentUrl(record, source) {
        const urlFields = ['url', 'link', 'document_url', 'pdf_url', 'web_url'];
        for (const field of urlFields) {
            if (record[field] && typeof record[field] === 'string' && record[field].startsWith('http')) {
                return record[field];
            }
        }
        return null;
    }
    extractDeviceClasses(record) {
        const classes = [];
        if (record.device_class)
            classes.push(record.device_class);
        if (record.product_code)
            classes.push(record.product_code);
        if (record.regulation_number)
            classes.push(record.regulation_number);
        return classes.filter(Boolean);
    }
    mapCategoryToType(category) {
        const mapping = {
            'regulatory': 'regulation',
            'clinical': 'clinical_trial',
            'safety': 'alert',
            'standards': 'standard',
            'global_health': 'regulation'
        };
        return mapping[category] || 'regulation';
    }
    async syncAllSources() {
        console.log('[Universal Dispatcher] 🚀 Starting comprehensive sync of all 70+ sources...');
        const startTime = Date.now();
        const results = [];
        const activeSources = this.sourceRegistry.filter(s => s.isActive);
        const highPriority = activeSources.filter(s => s.priority === 'high');
        const mediumPriority = activeSources.filter(s => s.priority === 'medium');
        const lowPriority = activeSources.filter(s => s.priority === 'low');
        console.log(`[Universal Dispatcher] Processing ${highPriority.length} high priority sources...`);
        for (const source of highPriority.slice(0, 10)) {
            try {
                const result = await this.syncSource(source);
                results.push(result);
                console.log(`[Universal Dispatcher] ${source.name}: ${result.status} - ${result.recordsAdded} records`);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            catch (error) {
                console.error(`[Universal Dispatcher] Error syncing ${source.name}:`, error.message);
                results.push({
                    sourceId: source.id,
                    sourceName: source.name,
                    status: 'failed',
                    recordsProcessed: 0,
                    recordsAdded: 0,
                    recordsSkipped: 0,
                    duration: 0,
                    errorMessage: error.message,
                    warnings: []
                });
            }
        }
        const duration = Date.now() - startTime;
        const summary = {
            totalSourcesProcessed: results.length,
            successfulSources: results.filter(r => r.status === 'success').length,
            failedSources: results.filter(r => r.status === 'failed').length,
            totalRecords: results.reduce((sum, r) => sum + r.recordsAdded, 0),
            duration,
            timestamp: new Date().toISOString()
        };
        console.log(`[Universal Dispatcher] ✅ Sync completed: ${summary.successfulSources}/${summary.totalSourcesProcessed} sources, ${summary.totalRecords} records`);
        return {
            success: summary.failedSources < summary.totalSourcesProcessed,
            summary,
            details: results
        };
    }
    async syncSource(source) {
        const startTime = Date.now();
        let recordsProcessed = 0;
        let recordsAdded = 0;
        let recordsSkipped = 0;
        const warnings = [];
        console.log(`[Universal Dispatcher] Syncing ${source.name}...`);
        try {
            if (!this.rateLimiters.has(source.id)) {
                this.rateLimiters.set(source.id, new RateLimiter({
                    tokensPerInterval: source.rateLimitPerHour,
                    interval: 'hour'
                }));
            }
            const limiter = this.rateLimiters.get(source.id);
            await limiter.removeTokens(1);
            let data = [];
            if (source.type === 'official_api') {
                data = await this.fetchFromAPI(source);
            }
            else if (source.type === 'web_scraping') {
                data = await this.scrapeWebsite(source);
            }
            else if (source.type === 'rss_feed') {
                data = await this.fetchRSSFeed(source);
            }
            recordsProcessed = data.length;
            for (const rawRecord of data) {
                try {
                    const normalizedRecord = await this.normalizeRecord(rawRecord, source);
                    if (normalizedRecord && await this.validateRecord(normalizedRecord)) {
                        await storage.createRegulatoryUpdate({
                            title: normalizedRecord.title,
                            description: normalizedRecord.description,
                            content: normalizedRecord.content,
                            sourceId: source.id,
                            type: this.mapCategoryToType(source.category),
                            category: source.category,
                            deviceType: normalizedRecord.deviceClasses?.[0] || null,
                            jurisdiction: source.region,
                            tags: normalizedRecord.deviceClasses || [],
                            publishedDate: new Date(normalizedRecord.publishedAt),
                            documentUrl: normalizedRecord.documentUrl
                        });
                        recordsAdded++;
                    }
                    else {
                        recordsSkipped++;
                        warnings.push(`Invalid record skipped from ${source.name}`);
                    }
                }
                catch (error) {
                    recordsSkipped++;
                    warnings.push(`Error processing record: ${error.message}`);
                }
            }
            return {
                sourceId: source.id,
                sourceName: source.name,
                status: recordsAdded > 0 ? 'success' : 'partial',
                recordsProcessed,
                recordsAdded,
                recordsSkipped,
                duration: Date.now() - startTime,
                warnings
            };
        }
        catch (error) {
            return {
                sourceId: source.id,
                sourceName: source.name,
                status: 'failed',
                recordsProcessed,
                recordsAdded,
                recordsSkipped,
                duration: Date.now() - startTime,
                errorMessage: error.message,
                warnings
            };
        }
    }
    async getSyncStatus() {
        return {
            totalSources: this.sourceRegistry.length,
            activeSources: this.sourceRegistry.filter(s => s.isActive).length,
            lastSync: new Date().toISOString(),
            sourcesByPriority: {
                high: this.sourceRegistry.filter(s => s.priority === 'high').length,
                medium: this.sourceRegistry.filter(s => s.priority === 'medium').length,
                low: this.sourceRegistry.filter(s => s.priority === 'low').length,
            },
            sourcesByType: {
                official_api: this.sourceRegistry.filter(s => s.type === 'official_api').length,
                web_scraping: this.sourceRegistry.filter(s => s.type === 'web_scraping').length,
                rss_feed: this.sourceRegistry.filter(s => s.type === 'rss_feed').length,
            }
        };
    }
}
export const universalSourceDispatcher = new UniversalSourceDispatcher();
//# sourceMappingURL=universalSourceDispatcher.js.map