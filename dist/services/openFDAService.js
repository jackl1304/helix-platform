import { db } from '../db';
import { fdaDrugLabels, fdaAdverseEvents, fdaDeviceRecalls } from '../../shared/schema';
import { eq, and, desc, count } from 'drizzle-orm';
export class OpenFDAService {
    constructor() {
        this.config = {
            baseUrl: 'https://api.fda.gov',
            rateLimit: {
                requestsPerHour: 1000,
                requestsPerDay: 40000
            }
        };
        this.requestCount = {
            hour: 0,
            day: 0,
            lastReset: {
                hour: Date.now(),
                day: Date.now()
            }
        };
    }
    parseDate(dateString) {
        try {
            if (!dateString || dateString.trim() === '') {
                return null;
            }
            const cleanDateString = dateString.trim();
            const date = new Date(cleanDateString);
            if (isNaN(date.getTime())) {
                console.warn(`[OpenFDA] Invalid date string: "${dateString}"`);
                return null;
            }
            return date;
        }
        catch (error) {
            console.warn(`[OpenFDA] Error parsing date "${dateString}":`, error);
            return null;
        }
    }
    checkRateLimit() {
        const now = Date.now();
        const hoursSinceReset = (now - this.requestCount.lastReset.hour) / (1000 * 60 * 60);
        const daysSinceReset = (now - this.requestCount.lastReset.day) / (1000 * 60 * 60 * 24);
        if (hoursSinceReset >= 1) {
            this.requestCount.hour = 0;
            this.requestCount.lastReset.hour = now;
        }
        if (daysSinceReset >= 1) {
            this.requestCount.day = 0;
            this.requestCount.lastReset.day = now;
        }
        if (this.requestCount.hour >= this.config.rateLimit.requestsPerHour) {
            throw new Error('OpenFDA API hourly rate limit exceeded');
        }
        if (this.requestCount.day >= this.config.rateLimit.requestsPerDay) {
            throw new Error('OpenFDA API daily rate limit exceeded');
        }
        return true;
    }
    async makeRequest(endpoint, params = {}) {
        this.checkRateLimit();
        const url = new URL(`${this.config.baseUrl}${endpoint}`);
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });
        console.log(`[OpenFDA] Making request to: ${url.toString()}`);
        try {
            const response = await fetch(url.toString(), {
                headers: {
                    'User-Agent': 'Helix-Regulatory-Intelligence/1.0'
                }
            });
            if (!response.ok) {
                throw new Error(`OpenFDA API error: ${response.status} ${response.statusText}`);
            }
            this.requestCount.hour++;
            this.requestCount.day++;
            const data = await response.json();
            console.log(`[OpenFDA] Request successful, got ${data.results?.length || 0} results`);
            return data;
        }
        catch (error) {
            console.error('[OpenFDA] Request failed:', error);
            throw error;
        }
    }
    async fetchDrugLabels(search, limit = 100) {
        const params = { limit: limit.toString() };
        if (search) {
            params.search = search;
        }
        return this.makeRequest('/drug/label.json', params);
    }
    async storeDrugLabels(labels, tenantId) {
        console.log(`[OpenFDA] Storing ${labels.length} drug labels in database`);
        for (const label of labels) {
            try {
                const appNumber = label.application_number?.[0] || '';
                const existingRecord = await db.select().from(fdaDrugLabels)
                    .where(and(eq(fdaDrugLabels.applicationNumber, appNumber), eq(fdaDrugLabels.tenantId, tenantId)))
                    .limit(1);
                if (existingRecord.length === 0) {
                    await db.insert(fdaDrugLabels).values({
                        tenantId,
                        applicationNumber: appNumber,
                        brandName: label.brand_name?.[0],
                        genericName: label.generic_name?.[0],
                        manufacturerName: label.manufacturer_name?.[0],
                        productType: label.product_type?.[0],
                        routeOfAdministration: label.route || [],
                        activeIngredients: { ingredients: label.active_ingredient || [] },
                        indicationsAndUsage: label.indications_and_usage?.[0],
                        dosageAndAdministration: label.dosage_and_administration?.[0],
                        contraindications: label.contraindications?.[0],
                        warnings: label.warnings?.[0],
                        adverseReactions: label.adverse_reactions?.[0],
                        drugInteractions: label.drug_interactions?.[0],
                        pregnancyCategory: label.pregnancy?.[0],
                        ndc: label.ndc || [],
                        labelingRevisionDate: label.labeling_revision_date ? this.parseDate(label.labeling_revision_date) : null,
                        fdaApprovalDate: label.approval_date ? this.parseDate(label.approval_date) : null,
                        rawData: label
                    });
                }
            }
            catch (error) {
                console.error('[OpenFDA] Error storing drug label:', error);
            }
        }
    }
    async fetchAdverseEvents(search, limit = 100) {
        const params = { limit: limit.toString() };
        if (search) {
            params.search = search;
        }
        return this.makeRequest('/drug/event.json', params);
    }
    async storeAdverseEvents(events, tenantId) {
        console.log(`[OpenFDA] Storing ${events.length} adverse events in database`);
        for (const event of events) {
            try {
                const existingRecord = await db.select().from(fdaAdverseEvents)
                    .where(and(eq(fdaAdverseEvents.safetyReportId, event.safetyreportid), eq(fdaAdverseEvents.tenantId, tenantId)))
                    .limit(1);
                if (existingRecord.length === 0) {
                    await db.insert(fdaAdverseEvents).values({
                        tenantId,
                        safetyReportId: event.safetyreportid,
                        receiptDate: event.receiptdate ? this.parseDate(event.receiptdate) : null,
                        transmissionDate: event.transmissiondate ? this.parseDate(event.transmissiondate) : null,
                        patientAge: event.patient?.patientage,
                        patientSex: event.patient?.patientsex,
                        patientWeight: event.patient?.patientweight,
                        drugs: { drugs: event.patient?.drug || [] },
                        reactions: { reactions: event.patient?.reaction || [] },
                        outcomes: event.patient?.reaction?.map(r => r.reactionoutcome) || [],
                        seriousness: event.seriousness,
                        reportType: event.reporttype,
                        qualification: event.qualification,
                        country: event.occurcountry || event.reportercountry,
                        rawData: event
                    });
                }
            }
            catch (error) {
                console.error('[OpenFDA] Error storing adverse event:', error);
            }
        }
    }
    async fetchDeviceRecalls(search, limit = 100) {
        const params = { limit: limit.toString() };
        if (search) {
            params.search = search;
        }
        return this.makeRequest('/device/recall.json', params);
    }
    async storeDeviceRecalls(recalls, tenantId) {
        console.log(`[OpenFDA] Storing ${recalls.length} device recalls in database`);
        for (const recall of recalls) {
            try {
                if (!recall.recall_number || recall.recall_number.trim() === '') {
                    console.warn(`[OpenFDA] Skipping device recall with missing recall_number:`, recall);
                    continue;
                }
                const existingRecord = await db.select().from(fdaDeviceRecalls)
                    .where(and(eq(fdaDeviceRecalls.recallNumber, recall.recall_number), eq(fdaDeviceRecalls.tenantId, tenantId)))
                    .limit(1);
                if (existingRecord.length === 0) {
                    await db.insert(fdaDeviceRecalls).values({
                        tenantId,
                        recallNumber: recall.recall_number,
                        deviceName: recall.device_name,
                        manufacturer: recall.manufacturer_name,
                        deviceClass: recall.device_class,
                        productCode: recall.product_code,
                        recallReason: recall.reason_for_recall,
                        distributionPattern: recall.distribution_pattern,
                        kNumber: recall.k_number,
                        pmaNumber: recall.pma_number,
                        recallInitiationDate: recall.recall_initiation_date ? this.parseDate(recall.recall_initiation_date) : null,
                        reportDate: recall.report_date ? this.parseDate(recall.report_date) : null,
                        terminationDate: recall.termination_date ? this.parseDate(recall.termination_date) : null,
                        recallStatus: recall.status,
                        recallClassification: recall.recall_classification,
                        rawData: recall
                    });
                }
            }
            catch (error) {
                console.error('[OpenFDA] Error storing device recall:', error);
            }
        }
    }
    async syncDrugLabels(tenantId, search) {
        try {
            console.log('[OpenFDA] Starting drug labels sync...');
            const response = await this.fetchDrugLabels(search, 100);
            if (response.results && response.results.length > 0) {
                await this.storeDrugLabels(response.results, tenantId);
                return {
                    success: true,
                    count: response.results.length,
                    message: `Successfully synced ${response.results.length} drug labels`
                };
            }
            else {
                return {
                    success: true,
                    count: 0,
                    message: 'No new drug labels found'
                };
            }
        }
        catch (error) {
            console.error('[OpenFDA] Drug labels sync failed:', error);
            return {
                success: false,
                count: 0,
                message: `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    async syncAdverseEvents(tenantId, search) {
        try {
            console.log('[OpenFDA] Starting adverse events sync...');
            const response = await this.fetchAdverseEvents(search, 100);
            if (response.results && response.results.length > 0) {
                await this.storeAdverseEvents(response.results, tenantId);
                return {
                    success: true,
                    count: response.results.length,
                    message: `Successfully synced ${response.results.length} adverse events`
                };
            }
            else {
                return {
                    success: true,
                    count: 0,
                    message: 'No new adverse events found'
                };
            }
        }
        catch (error) {
            console.error('[OpenFDA] Adverse events sync failed:', error);
            return {
                success: false,
                count: 0,
                message: `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    async syncDeviceRecalls(tenantId, search) {
        try {
            console.log('[OpenFDA] Starting device recalls sync...');
            const response = await this.fetchDeviceRecalls(search, 100);
            if (response.results && response.results.length > 0) {
                await this.storeDeviceRecalls(response.results, tenantId);
                return {
                    success: true,
                    count: response.results.length,
                    message: `Successfully synced ${response.results.length} device recalls`
                };
            }
            else {
                return {
                    success: true,
                    count: 0,
                    message: 'No new device recalls found'
                };
            }
        }
        catch (error) {
            console.error('[OpenFDA] Device recalls sync failed:', error);
            return {
                success: false,
                count: 0,
                message: `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    async getDrugLabels(tenantId, limit = 50) {
        const query = db.select().from(fdaDrugLabels).orderBy(desc(fdaDrugLabels.createdAt)).limit(limit);
        if (tenantId) {
            return query.where(eq(fdaDrugLabels.tenantId, tenantId));
        }
        return query;
    }
    async getAdverseEvents(tenantId, limit = 50) {
        const query = db.select().from(fdaAdverseEvents).orderBy(desc(fdaAdverseEvents.createdAt)).limit(limit);
        if (tenantId) {
            return query.where(eq(fdaAdverseEvents.tenantId, tenantId));
        }
        return query;
    }
    async getDeviceRecalls(tenantId, limit = 50) {
        const query = db.select().from(fdaDeviceRecalls).orderBy(desc(fdaDeviceRecalls.createdAt)).limit(limit);
        if (tenantId) {
            return query.where(eq(fdaDeviceRecalls.tenantId, tenantId));
        }
        return query;
    }
    async searchDrugLabels(searchTerm, tenantId, limit = 50) {
        const query = db.select().from(fdaDrugLabels)
            .where(and(tenantId ? eq(fdaDrugLabels.tenantId, tenantId) : undefined))
            .orderBy(desc(fdaDrugLabels.createdAt))
            .limit(limit);
        return query;
    }
    async getStatistics(tenantId) {
        const drugLabelsQuery = db.select({ count: count() }).from(fdaDrugLabels);
        const adverseEventsQuery = db.select({ count: count() }).from(fdaAdverseEvents);
        const deviceRecallsQuery = db.select({ count: count() }).from(fdaDeviceRecalls);
        if (tenantId) {
            drugLabelsQuery.where(eq(fdaDrugLabels.tenantId, tenantId));
            adverseEventsQuery.where(eq(fdaAdverseEvents.tenantId, tenantId));
            deviceRecallsQuery.where(eq(fdaDeviceRecalls.tenantId, tenantId));
        }
        const [drugLabelsCount] = await drugLabelsQuery;
        const [adverseEventsCount] = await adverseEventsQuery;
        const [deviceRecallsCount] = await deviceRecallsQuery;
        return {
            drugLabels: drugLabelsCount.count,
            adverseEvents: adverseEventsCount.count,
            deviceRecalls: deviceRecallsCount.count,
            totalRecords: drugLabelsCount.count + adverseEventsCount.count + deviceRecallsCount.count
        };
    }
}
export const openFDAService = new OpenFDAService();
//# sourceMappingURL=openFDAService.js.map