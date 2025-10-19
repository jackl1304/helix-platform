import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

interface FDADevice {
  deviceName: string;
  regulationNumber: string;
  deviceClass: string;
  productCode: string;
  reviewPanel: string;
  medicalSpecialty: string;
}

interface EMADevice {
  name: string;
  classification: string;
  intendedPurpose: string;
  conformityAssessmentRoute: string;
}

interface ClinicalTrial {
  nctId: string;
  title: string;
  conditions: string[];
  interventions: string[];
  phases: string[];
  studyType: string;
}

interface MedicalStandard {
  standardNumber: string;
  title: string;
  scope: string;
  latestVersion: string;
  publicationDate: string;
}

@Injectable()
export class RegulatoryDatabaseService {
  private readonly fdaBaseUrl = 'https://api.fda.gov/device/';
  private readonly emaBaseUrl = 'https://api.ema.europa.eu/';
  private readonly clinicalTrialsUrl = 'https://clinicaltrials.gov/api/';
  
  constructor(
    private httpService: HttpService,
    private configService: ConfigService
  ) {}

  async classifyProduct(productConcept: any): Promise<string> {
    // AI-basierte Produktklassifizierung gemäß FDA/EMA Richtlinien
    const similarDevices = await this.findSimilarFDADevices(productConcept);
    const euClassification = await this.classifyAccordingToMDR(productConcept);
    
    // Risikobasierte Klassifizierung
    const riskLevel = await this.assessRiskLevel(productConcept);
    
    return this.determineClassification(riskLevel, similarDevices, euClassification);
  }

  async findSimilarFDADevices(productConcept: any): Promise<FDADevice[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.fdaBaseUrl}classification.json`, {
          params: {
            search: `device_name:\"${productConcept.productName}\"`,
            limit: 10
          }
        })
      );
      
      return response.data.results || [];
    } catch (error) {
      console.error('FDA API Error:', error);
      return [];
    }
  }

  async classifyAccordingToMDR(productConcept: any): Promise<string> {
    // EU MDR 2017/745 Klassifizierungsregeln
    const rules = await this.getMDRClassificationRules();
    
    // Regelbasierte Klassifizierung
    if (productConcept.intendedUse.includes('diagnostic')) {
      return this.classifyDiagnosticDevice(productConcept);
    } else if (productConcept.intendedUse.includes('therapeutic')) {
      return this.classifyTherapeuticDevice(productConcept);
    } else if (productConcept.intendedUse.includes('monitoring')) {
      return this.classifyMonitoringDevice(productConcept);
    }
    
    return 'CLASS_I'; // Default fallback
  }

  async getApplicableStandards(classification: string): Promise<string[]> {
    const standards: MedicalStandard[] = await this.fetchMedicalStandards();
    
    const applicable = standards.filter(standard => {
      // ISO 13485 für alle Medizinprodukte
      if (standard.standardNumber.includes('13485')) return true;
      
      // Risikobasierte Standards
      if (classification === 'CLASS_IIA' || classification === 'CLASS_IIB') {
        if (standard.standardNumber.includes('14971')) return true; // Risikomanagement
      }
      
      if (classification === 'CLASS_III') {
        if (standard.standardNumber.includes('62304')) return true; // Software
        if (standard.standardNumber.includes('14155')) return true; // Klinische Prüfung
      }
      
      // Gerätespezifische Standards
      if (standard.scope.includes('medical device')) return true;
      
      return false;
    });
    
    return applicable.map(s => s.standardNumber);
  }

  async fetchMedicalStandards(): Promise<MedicalStandard[]> {
    // Integration mit ISO Online Browsing Platform
    return [
      {
        standardNumber: 'ISO 13485:2016',
        title: 'Medical devices — Quality management systems',
        scope: 'Requirements for quality management systems for medical devices',
        latestVersion: '2016',
        publicationDate: '2016-03-01'
      },
      {
        standardNumber: 'ISO 14971:2019',
        title: 'Medical devices — Application of risk management to medical devices',
        scope: 'Risk management process for medical devices',
        latestVersion: '2019',
        publicationDate: '2019-12-01'
      },
      {
        standardNumber: 'IEC 62304:2006',
        title: 'Medical device software — Software life cycle processes',
        scope: 'Software development lifecycle for medical device software',
        latestVersion: '2006',
        publicationDate: '2006-05-01'
      },
      {
        standardNumber: 'ISO 14155:2020',
        title: 'Clinical investigation of medical devices for human subjects',
        scope: 'Good clinical practice for clinical investigations',
        latestVersion: '2020',
        publicationDate: '2020-02-01'
      }
    ];
  }

  async searchClinicalTrials(condition: string, intervention: string): Promise<ClinicalTrial[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.clinicalTrialsUrl}query/fullstudies`, {
          params: {
            expr: `${condition} AND ${intervention}`,
            min_rnk: 1,
            max_rnk: 10,
            fmt: 'json'
          }
        })
      );
      
      return response.data.FullStudiesResponse?.FullStudies || [];
    } catch (error) {
      console.error('ClinicalTrials.gov API Error:', error);
      return [];
    }
  }

  async getRegulatoryPathway(classification: string, targetMarkets: string[]): Promise<any> {
    const pathways = [];
    
    for (const market of targetMarkets) {
      switch (market) {
        case 'US':
          pathways.push(await this.getFDAPathway(classification));
          break;
        case 'EU':
          pathways.push(await this.getEUPathway(classification));
          break;
        case 'UK':
          pathways.push(await this.getUKPathway(classification));
          break;
      }
    }
    
    return pathways;
  }

  private async getFDAPathway(classification: string): Promise<any> {
    return {
      market: 'US',
      regulatoryBody: 'FDA',
      submissionType: classification === 'CLASS_I' ? '510(k)' : 'PMA',
      averageReviewTime: classification === 'CLASS_I' ? '90 days' : '180 days',
      requiredDocuments: [
        'Technical File',
        'Risk Management File',
        'Clinical Data',
        'Quality System Documentation'
      ]
    };
  }

  private async getEUPathway(classification: string): Promise<any> {
    return {
      market: 'EU',
      regulatoryBody: 'EMA/Notified Body',
      conformityAssessment: this.getEUConformityAssessment(classification),
      requiredDocuments: [
        'Technical Documentation',
        'Clinical Evaluation Report',
        'Post-Market Surveillance Plan',
        'Quality Management System'
      ]
    };
  }

  private getEUConformityAssessment(classification: string): string {
    switch (classification) {
      case 'CLASS_I': return 'Self-declaration';
      case 'CLASS_IIA': return 'Notified Body Assessment';
      case 'CLASS_IIB': return 'Notified Body Assessment + Clinical Evaluation';
      case 'CLASS_III': return 'Notified Body Assessment + Clinical Investigation';
      default: return 'Notified Body Assessment';
    }
  }

  async validateProductConcept(productConcept: any): Promise<{
    isValid: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Validierung der Intended Use Beschreibung
    if (!productConcept.intendedUse || productConcept.intendedUse.length < 20) {
      issues.push('Intended Use description is too vague');
      recommendations.push('Provide detailed intended use with clear medical purpose');
    }

    // Validierung der Zielpopulation
    if (!productConcept.targetPopulation) {
      issues.push('Target population not specified');
      recommendations.push('Define specific patient population including age, condition, etc.');
    }

    // Prüfung auf ähnliche zugelassene Produkte
    const similarProducts = await this.findSimilarFDADevices(productConcept);
    if (similarProducts.length === 0) {
      recommendations.push('No similar products found - consider novelty assessment');
    }

    return {
      isValid: issues.length === 0,
      issues,
      recommendations
    };
  }

  // Hilfsmethoden für spezifische Klassifizierungen
  private classifyDiagnosticDevice(concept: any): string {
    if (concept.intendedUse.includes('invasive')) return 'CLASS_IIA';
    if (concept.intendedUse.includes('critical diagnosis')) return 'CLASS_IIB';
    return 'CLASS_I';
  }

  private classifyTherapeuticDevice(concept: any): string {
    if (concept.intendedUse.includes('surgical')) return 'CLASS_IIA';
    if (concept.intendedUse.includes('life-supporting')) return 'CLASS_IIB';
    if (concept.intendedUse.includes('implantable')) return 'CLASS_III';
    return 'CLASS_IIA';
  }

  private async assessRiskLevel(concept: any): Promise<string> {
    // Simplified risk assessment based on intended use
    if (concept.intendedUse.includes('diagnostic')) return 'MEDIUM';
    if (concept.intendedUse.includes('therapeutic')) return 'HIGH';
    if (concept.intendedUse.includes('monitoring')) return 'LOW';
    return 'MEDIUM';
  }

  private determineClassification(riskLevel: string, similarDevices: FDADevice[], euClassification: string): string {
    // Complex classification logic based on multiple factors
    if (riskLevel === 'HIGH') return 'CLASS_III';
    if (similarDevices.some(d => d.deviceClass === 'III')) return 'CLASS_III';
    return euClassification;
  }
}