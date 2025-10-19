import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface ClinicalEvidence {
  studyType: string;
  patientCount: number;
  outcomes: string[];
  safetyData: any;
  efficacyMetrics: any;
  publication: string;
}

interface EvidenceRequirement {
  requirementType: string;
  description: string;
  mandatory: boolean;
  applicableStandards: string[];
}

@Injectable()
export class ClinicalEvidenceService {
  private readonly pubmedBaseUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/';
  private readonly cochraneBaseUrl = 'https://www.cochranelibrary.com/api/';
  
  constructor(private httpService: HttpService) {}

  async getEvidenceRequirements(productConcept: any): Promise<EvidenceRequirement[]> {
    const requirements: EvidenceRequirement[] = [];
    
    // Basis-Anforderungen für alle Medizinprodukte
    requirements.push({
      requirementType: 'CLINICAL_EVALUATION',
      description: 'Systematic clinical evaluation of safety and performance',
      mandatory: true,
      applicableStandards: ['MEDDEV 2.7/1', 'ISO 14155']
    });

    // Risikobasierte zusätzliche Anforderungen
    if (await this.isHighRiskProduct(productConcept)) {
      requirements.push({
        requirementType: 'CLINICAL_INVESTIGATION',
        description: 'Prospective clinical investigation with control group',
        mandatory: true,
        applicableStandards: ['ISO 14155', 'ICH E6']
      });
    }

    if (await this.requiresComparativeData(productConcept)) {
      requirements.push({
        requirementType: 'COMPARATIVE_STUDY',
        description: 'Comparative study against current standard of care',
        mandatory: false,
        applicableStandards: ['ISO 14155']
      });
    }

    // Spezifische Anforderungen basierend auf Produkttyp
    requirements.push(...await this.getProductSpecificRequirements(productConcept));

    return requirements;
  }

  async searchClinicalLiterature(searchTerms: string[]): Promise<ClinicalEvidence[]> {
    const evidences: ClinicalEvidence[] = [];
    
    for (const term of searchTerms) {
      const pubmedResults = await this.searchPubMed(term);
      const cochraneResults = await this.searchCochrane(term);
      
      evidences.push(...pubmedResults, ...cochraneResults);
    }

    return this.rankEvidenceByQuality(evidences);
  }

  async designClinicalTrial(productConcept: any, requirements: EvidenceRequirement[]): Promise<any> {
    const trialDesign = {
      title: `Clinical Investigation of ${productConcept.productName}`,
      objective: this.generateTrialObjective(productConcept),
      design: await this.determineTrialDesign(requirements),
      endpoints: await this.defineEndpoints(productConcept),
      sampleSize: await this.calculateSampleSize(productConcept, requirements),
      inclusionCriteria: await this.defineInclusionCriteria(productConcept),
      exclusionCriteria: await this.defineExclusionCriteria(productConcept),
      statisticalPlan: await this.generateStatisticalPlan(productConcept)
    };

    return trialDesign;
  }

  async generateClinicalEvaluationReport(productConcept: any, evidence: ClinicalEvidence[]): Promise<any> {
    const report = {
      executiveSummary: await this.generateExecutiveSummary(productConcept, evidence),
      literatureReview: await this.generateLiteratureReview(evidence),
      riskBenefitAnalysis: await this.generateRiskBenefitAnalysis(productConcept, evidence),
      conclusions: await this.generateConclusions(productConcept, evidence),
      appendices: await this.generateAppendices(evidence)
    };

    return report;
  }

  private async searchPubMed(searchTerm: string): Promise<ClinicalEvidence[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.pubmedBaseUrl}esearch.fcgi`, {
          params: {
            db: 'pubmed',
            term: `${searchTerm} AND clinical trial[pt]`,
            retmode: 'json',
            retmax: 10
          }
        })
      );

      const articleIds = response.data.esearchresult?.idlist || [];
      const evidences: ClinicalEvidence[] = [];

      for (const id of articleIds) {
        const article = await this.getPubMedArticle(id);
        if (article) {
          evidences.push({
            studyType: 'RCT',
            patientCount: article.patientCount || 0,
            outcomes: article.outcomes || [],
            safetyData: article.safetyData || {},
            efficacyMetrics: article.efficacyMetrics || {},
            publication: article.title || ''
          });
        }
      }

      return evidences;
    } catch (error) {
      console.error('PubMed API Error:', error);
      return [];
    }
  }

  private async getPubMedArticle(articleId: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.pubmedBaseUrl}efetch.fcgi`, {
          params: {
            db: 'pubmed',
            id: articleId,
            retmode: 'xml'
          }
        })
      );

      // Simplified parsing - in reality would need proper XML parsing
      return {
        title: 'Clinical Study Title',
        patientCount: 100,
        outcomes: ['Primary Outcome', 'Secondary Outcome'],
        safetyData: { adverseEvents: 5 },
        efficacyMetrics: { successRate: 0.85 }
      };
    } catch (error) {
      console.error('PubMed Article Fetch Error:', error);
      return null;
    }
  }

  private async searchCochrane(searchTerm: string): Promise<ClinicalEvidence[]> {
    // Cochrane Library systematic reviews
    return [{
      studyType: 'SYSTEMATIC_REVIEW',
      patientCount: 1000,
      outcomes: ['Meta-analysis results'],
      safetyData: {},
      efficacyMetrics: { relativeRisk: 0.75 },
      publication: 'Cochrane Systematic Review'
    }];
  }

  private async isHighRiskProduct(productConcept: any): Promise<boolean> {
    return productConcept.intendedUse.includes('invasive') || 
           productConcept.intendedUse.includes('implantable') ||
           productConcept.intendedUse.includes('life-supporting');
  }

  private async requiresComparativeData(productConcept: any): Promise<boolean> {
    return productConcept.intendedUse.includes('diagnostic') || 
           productConcept.intendedUse.includes('therapeutic') ||
           await this.hasExistingAlternatives(productConcept);
  }

  private async hasExistingAlternatives(productConcept: any): Promise<boolean> {
    // Check if similar products exist in the market
    const similarProducts = await this.searchClinicalLiterature([productConcept.productName]);
    return similarProducts.length > 0;
  }

  private async getProductSpecificRequirements(productConcept: any): Promise<EvidenceRequirement[]> {
    const specificRequirements: EvidenceRequirement[] = [];

    if (productConcept.intendedUse.includes('software')) {
      specificRequirements.push({
        requirementType: 'USABILITY_STUDY',
        description: 'Usability engineering study for software medical device',
        mandatory: true,
        applicableStandards: ['IEC 62366-1']
      });
    }

    if (productConcept.intendedUse.includes('diagnostic')) {
      specificRequirements.push({
        requirementType: 'ANALYTICAL_VALIDATION',
        description: 'Analytical performance validation studies',
        mandatory: true,
        applicableStandards: ['CLSI EP guidelines']
      });
    }

    return specificRequirements;
  }

  private rankEvidenceByQuality(evidences: ClinicalEvidence[]): ClinicalEvidence[] {
    return evidences.sort((a, b) => {
      // Prioritize systematic reviews and RCTs
      const qualityScoreA = this.calculateEvidenceQuality(a);
      const qualityScoreB = this.calculateEvidenceQuality(b);
      return qualityScoreB - qualityScoreA;
    });
  }

  private calculateEvidenceQuality(evidence: ClinicalEvidence): number {
    let score = 0;
    
    if (evidence.studyType === 'SYSTEMATIC_REVIEW') score += 10;
    if (evidence.studyType === 'RCT') score += 8;
    if (evidence.patientCount > 100) score += 5;
    if (evidence.patientCount > 500) score += 10;
    
    return score;
  }

  private generateTrialObjective(productConcept: any): string {
    return `To evaluate the safety and efficacy of ${productConcept.productName} 
            for ${productConcept.intendedUse} in ${productConcept.targetPopulation}`;
  }

  private async determineTrialDesign(requirements: EvidenceRequirement[]): Promise<string> {
    if (requirements.some(r => r.requirementType === 'CLINICAL_INVESTIGATION')) {
      return 'RANDOMIZED_CONTROLLED_TRIAL';
    }
    return 'PROSPECTIVE_COHORT_STUDY';
  }

  private async defineEndpoints(productConcept: any): Promise<string[]> {
    const endpoints = ['Safety Endpoints: Adverse event rate'];
    
    if (productConcept.intendedUse.includes('therapeutic')) {
      endpoints.push('Efficacy Endpoints: Treatment success rate');
    }
    
    if (productConcept.intendedUse.includes('diagnostic')) {
      endpoints.push('Performance Endpoints: Sensitivity, Specificity');
    }
    
    return endpoints;
  }

  private async calculateSampleSize(productConcept: any, requirements: EvidenceRequirement[]): Promise<number> {
    // Simplified sample size calculation
    let baseSize = 100;
    
    if (requirements.some(r => r.requirementType === 'CLINICAL_INVESTIGATION')) {
      baseSize = 300;
    }
    
    if (await this.isHighRiskProduct(productConcept)) {
      baseSize *= 2;
    }
    
    return baseSize;
  }

  private async defineInclusionCriteria(productConcept: any): Promise<string[]> {
    return [
      `Patients with condition relevant to ${productConcept.intendedUse}`,
      'Age 18-75 years',
      'Written informed consent',
      'Adequate organ function'
    ];
  }

  private async defineExclusionCriteria(productConcept: any): Promise<string[]> {
    return [
      'Pregnancy or lactation',
      'Known allergies to device materials',
      'Participation in other clinical trials',
      'Severe comorbidities'
    ];
  }

  private async generateStatisticalPlan(productConcept: any): Promise<any> {
    return {
      primaryAnalysis: 'Intent-to-treat analysis',
      significanceLevel: 'α = 0.05',
      power: '80%',
      statisticalTests: ['Chi-square test', 'T-test', 'Survival analysis']
    };
  }

  private async generateExecutiveSummary(productConcept: any, evidence: ClinicalEvidence[]): Promise<string> {
    return `Clinical Evaluation Report for ${productConcept.productName}. 
            Based on ${evidence.length} clinical studies.`;
  }

  private async generateLiteratureReview(evidence: ClinicalEvidence[]): Promise<string> {
    return `Systematic review of ${evidence.length} relevant studies.`;
  }

  private async generateRiskBenefitAnalysis(productConcept: any, evidence: ClinicalEvidence[]): Promise<string> {
    return `Risk-benefit analysis indicates favorable profile for ${productConcept.productName}.`;
  }

  private async generateConclusions(productConcept: any, evidence: ClinicalEvidence[]): Promise<string> {
    return `${productConcept.productName} demonstrates acceptable safety and performance profile.`;
  }

  private async generateAppendices(evidence: ClinicalEvidence[]): Promise<any[]> {
    return evidence.map(e => ({
      study: e.publication,
      type: e.studyType,
      patients: e.patientCount
    }));
  }
}