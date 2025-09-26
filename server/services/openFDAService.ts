import { db } from '../db';
import { businessLogger, LoggingUtils } from '../utils/logger';
import { fdaDrugLabels, fdaAdverseEvents, fdaDeviceRecalls } from '../../shared/schema';
import { eq, and, desc, asc, count } from 'drizzle-orm';

interface OpenFDAConfig {
  baseUrl: string;
  rateLimit: {
    requestsPerHour: number;
    requestsPerDay: number;
  };
}

interface DrugLabelResponse {
  meta: {
    disclaimer: string;
    license: string;
    last_updated: string;
    results: {
      skip: number;
      limit: number;
      total: number;
    };
  };
  results: Array<{
    application_number: string[];
    brand_name: string[];
    generic_name: string[];
    manufacturer_name: string[];
    product_type: string[];
    route: string[];
    active_ingredient: string[];
    indications_and_usage: string[];
    dosage_and_administration: string[];
    contraindications: string[];
    warnings: string[];
    adverse_reactions: string[];
    drug_interactions: string[];
    pregnancy: string[];
    ndc: string[];
    labeling_revision_date: string;
    approval_date: string;
  }>;
}

interface AdverseEventResponse {
  meta: {
    disclaimer: string;
    license: string;
    last_updated: string;
    results: {
      skip: number;
      limit: number;
      total: number;
    };
  };
  results: Array<{
    safetyreportid: string;
    receiptdate: string;
    transmissiondate: string;
    patient: {
      patientage: string;
      patientsex: string;
      patientweight: string;
      drug: Array<{
        medicinalproduct: string;
        drugcharacterization: string;
        drugindicationmeddraversion: string;
        drugadditional: string;
      }>;
      reaction: Array<{
        reactionmeddrapt: string;
        reactionoutcome: string;
      }>;
    };
    reporttype: string;
    qualification: string;
    occurcountry: string;
    reportercountry: string;
    seriousness: string;
    serious: number;
  }>;
}

interface DeviceRecallResponse {
  meta: {
    disclaimer: string;
    license: string;
    last_updated: string;
    results: {
      skip: number;
      limit: number;
      total: number;
    };
  };
  results: Array<{
    recall_number: string;
    device_name: string;
    manufacturer_name: string;
    device_class: string;
    product_code: string;
    reason_for_recall: string;
    distribution_pattern: string;
    k_number: string;
    pma_number: string;
    recall_initiation_date: string;
    report_date: string;
    termination_date: string;
    status: string;
    recall_classification: string;
  }>;
}

export class OpenFDAService {
  private config: OpenFDAConfig;
  private requestCount: { hour: number; day: number; lastReset: { hour: number; day: number } };

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

  private parseDate(dateString: string): Date | null {
    try {
      // Handle common FDA date formats
      if (!dateString || dateString.trim() === '') {
        return null;
      }
      
      // Remove any trailing/leading whitespace
      const cleanDateString = dateString.trim();
      
      // Try parsing the date
      const date = new Date(cleanDateString);
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.warn(`[OpenFDA] Invalid date string: "${dateString}"`);
        return null;
      }
      
      return date;
    } catch (error) {
      console.warn(`[OpenFDA] Error parsing date "${dateString}":`, error);
      return null;
    }
  }

  private checkRateLimit(): boolean {
    const now = Date.now();
    const hoursSinceReset = (now - this.requestCount.lastReset.hour) / (1000 * 60 * 60);
    const daysSinceReset = (now - this.requestCount.lastReset.day) / (1000 * 60 * 60 * 24);

    // Reset hourly counter
    if (hoursSinceReset >= 1) {
      this.requestCount.hour = 0;
      this.requestCount.lastReset.hour = now;
    }

    // Reset daily counter
    if (daysSinceReset >= 1) {
      this.requestCount.day = 0;
      this.requestCount.lastReset.day = now;
    }

    // Check limits
    if (this.requestCount.hour >= this.config.rateLimit.requestsPerHour) {
      throw new Error('OpenFDA API hourly rate limit exceeded');
    }

    if (this.requestCount.day >= this.config.rateLimit.requestsPerDay) {
      throw new Error('OpenFDA API daily rate limit exceeded');
    }

    return true;
  }

  private async makeRequest(endpoint: string, params: Record<string, string> = {}): Promise<any> {
    this.checkRateLimit();

    const url = new URL(`${this.config.baseUrl}${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    logger.info('Making request to: ${url.toString()}', { context: 'OpenFDA' });

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
      logger.info('Request successful, got ${data.results?.length || 0} results', { context: 'OpenFDA' });
      
      return data;
    } catch (error) {
      logger.error('[OpenFDA] Request failed:', error);
      throw error;
    }
  }

  // FDA Drug Labels API
  async fetchDrugLabels(search?: string, limit: number = 100): Promise<DrugLabelResponse> {
    const params: Record<string, string> = { limit: limit.toString() };
    
    if (search) {
      params.search = search;
    }

    return this.makeRequest('/drug/label.json', params);
  }

  async storeDrugLabels(labels: DrugLabelResponse['results'], tenantId: string): Promise<void> {
    logger.info('Storing ${labels.length} drug labels in database', { context: 'OpenFDA' });

    for (const label of labels) {
      try {
        // Check if record already exists to avoid duplicates
        const appNumber = label.application_number?.[0] || '';
        const existingRecord = await db.select().from(fdaDrugLabels)
          .where(and(
            eq(fdaDrugLabels.applicationNumber, appNumber),
            eq(fdaDrugLabels.tenantId, tenantId)
          ))
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
      } catch (error) {
        logger.error('[OpenFDA] Error storing drug label:', error);
      }
    }
  }

  // FDA Adverse Events API
  async fetchAdverseEvents(search?: string, limit: number = 100): Promise<AdverseEventResponse> {
    const params: Record<string, string> = { limit: limit.toString() };
    
    if (search) {
      params.search = search;
    }

    return this.makeRequest('/drug/event.json', params);
  }

  async storeAdverseEvents(events: AdverseEventResponse['results'], tenantId: string): Promise<void> {
    logger.info('Storing ${events.length} adverse events in database', { context: 'OpenFDA' });

    for (const event of events) {
      try {
        // Check if record already exists to avoid duplicates
        const existingRecord = await db.select().from(fdaAdverseEvents)
          .where(and(
            eq(fdaAdverseEvents.safetyReportId, event.safetyreportid),
            eq(fdaAdverseEvents.tenantId, tenantId)
          ))
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
      } catch (error) {
        logger.error('[OpenFDA] Error storing adverse event:', error);
      }
    }
  }

  // FDA Device Recalls API
  async fetchDeviceRecalls(search?: string, limit: number = 100): Promise<DeviceRecallResponse> {
    const params: Record<string, string> = { limit: limit.toString() };
    
    if (search) {
      params.search = search;
    }

    return this.makeRequest('/device/recall.json', params);
  }

  async storeDeviceRecalls(recalls: DeviceRecallResponse['results'], tenantId: string): Promise<void> {
    logger.info('Storing ${recalls.length} device recalls in database', { context: 'OpenFDA' });

    for (const recall of recalls) {
      try {
        // Skip records with missing required fields
        if (!recall.recall_number || recall.recall_number.trim() === '') {
          console.warn(`[OpenFDA] Skipping device recall with missing recall_number:`, recall);
          continue;
        }
        
        // Check if record already exists to avoid duplicates
        const existingRecord = await db.select().from(fdaDeviceRecalls)
          .where(and(
            eq(fdaDeviceRecalls.recallNumber, recall.recall_number),
            eq(fdaDeviceRecalls.tenantId, tenantId)
          ))
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
      } catch (error) {
        logger.error('[OpenFDA] Error storing device recall:', error);
      }
    }
  }

  // Combined data fetch and store operations
  async syncDrugLabels(tenantId: string, search?: string): Promise<{ success: boolean; count: number; message: string }> {
    try {
      logger.info('Starting drug labels sync...', { context: 'OpenFDA' });
      const response = await this.fetchDrugLabels(search, 100);
      
      if (response.results && response.results.length > 0) {
        await this.storeDrugLabels(response.results, tenantId);
        return {
          success: true,
          count: response.results.length,
          message: `Successfully synced ${response.results.length} drug labels`
        };
      } else {
        return {
          success: true,
          count: 0,
          message: 'No new drug labels found'
        };
      }
    } catch (error) {
      logger.error('[OpenFDA] Drug labels sync failed:', error);
      return {
        success: false,
        count: 0,
        message: `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async syncAdverseEvents(tenantId: string, search?: string): Promise<{ success: boolean; count: number; message: string }> {
    try {
      logger.info('Starting adverse events sync...', { context: 'OpenFDA' });
      const response = await this.fetchAdverseEvents(search, 100);
      
      if (response.results && response.results.length > 0) {
        await this.storeAdverseEvents(response.results, tenantId);
        return {
          success: true,
          count: response.results.length,
          message: `Successfully synced ${response.results.length} adverse events`
        };
      } else {
        return {
          success: true,
          count: 0,
          message: 'No new adverse events found'
        };
      }
    } catch (error) {
      logger.error('[OpenFDA] Adverse events sync failed:', error);
      return {
        success: false,
        count: 0,
        message: `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async syncDeviceRecalls(tenantId: string, search?: string): Promise<{ success: boolean; count: number; message: string }> {
    try {
      logger.info('Starting device recalls sync...', { context: 'OpenFDA' });
      const response = await this.fetchDeviceRecalls(search, 100);
      
      if (response.results && response.results.length > 0) {
        await this.storeDeviceRecalls(response.results, tenantId);
        return {
          success: true,
          count: response.results.length,
          message: `Successfully synced ${response.results.length} device recalls`
        };
      } else {
        return {
          success: true,
          count: 0,
          message: 'No new device recalls found'
        };
      }
    } catch (error) {
      logger.error('[OpenFDA] Device recalls sync failed:', error);
      return {
        success: false,
        count: 0,
        message: `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Get stored data from database
  async getDrugLabels(tenantId?: string, limit: number = 50) {
    const query = db.select().from(fdaDrugLabels).orderBy(desc(fdaDrugLabels.createdAt)).limit(limit);
    
    if (tenantId) {
      return query.where(eq(fdaDrugLabels.tenantId, tenantId));
    }
    
    return query;
  }

  async getAdverseEvents(tenantId?: string, limit: number = 50) {
    const query = db.select().from(fdaAdverseEvents).orderBy(desc(fdaAdverseEvents.createdAt)).limit(limit);
    
    if (tenantId) {
      return query.where(eq(fdaAdverseEvents.tenantId, tenantId));
    }
    
    return query;
  }

  async getDeviceRecalls(tenantId?: string, limit: number = 50) {
    const query = db.select().from(fdaDeviceRecalls).orderBy(desc(fdaDeviceRecalls.createdAt)).limit(limit);
    
    if (tenantId) {
      return query.where(eq(fdaDeviceRecalls.tenantId, tenantId));
    }
    
    return query;
  }

  // Search functionality
  async searchDrugLabels(searchTerm: string, tenantId?: string, limit: number = 50) {
    // This would implement full-text search when needed
    // For now, simple LIKE search
    const query = db.select().from(fdaDrugLabels)
      .where(
        and(
          tenantId ? eq(fdaDrugLabels.tenantId, tenantId) : undefined,
          // Simple search in multiple fields - would be replaced with proper full-text search
        )
      )
      .orderBy(desc(fdaDrugLabels.createdAt))
      .limit(limit);
    
    return query;
  }

  // Statistics and analytics
  async getStatistics(tenantId?: string) {
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

// Export singleton instance
export const openFDAService = new OpenFDAService();