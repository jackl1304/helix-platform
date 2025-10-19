import { Injectable } from '@nestjs/common';

interface Risk {
  riskType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  probability: 'RARE' | 'UNLIKELY' | 'POSSIBLE' | 'LIKELY' | 'CERTAIN';
  impact: string;
  mitigationStrategy: string;
  residualRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

interface RiskAssessment {
  identifiedRisks: Risk[];
  overallRiskLevel: string;
  riskBenefitRatio: 'FAVORABLE' | 'ACCEPTABLE' | 'UNFAVORABLE';
  recommendations: string[];
}

@Injectable()
export class RiskAssessmentService {
  
  async assessProductRisks(productConcept: any): Promise<RiskAssessment> {
    const risks: Risk[] = [];
    
    // Technische Risiken
    risks.push(...await this.assessTechnicalRisks(productConcept));
    
    // Klinische Risiken
    risks.push(...await this.assessClinicalRisks(productConcept));
    
    // Regulatorische Risiken
    risks.push(...await this.assessRegulatoryRisks(productConcept));
    
    // Kommerzielle Risiken
    risks.push(...await this.assessCommercialRisks(productConcept));
    
    const overallRiskLevel = this.calculateOverallRiskLevel(risks);
    const riskBenefitRatio = await this.assessRiskBenefitRatio(productConcept, risks);
    const recommendations = this.generateRiskMitigationRecommendations(risks);
    
    return {
      identifiedRisks: risks,
      overallRiskLevel,
      riskBenefitRatio,
      recommendations
    };
  }

  private async assessTechnicalRisks(productConcept: any): Promise<Risk[]> {
    const technicalRisks: Risk[] = [];
    
    // Material- und Kompatibilitätsrisiken
    if (productConcept.intendedUse.includes('implantable')) {
      technicalRisks.push({
        riskType: 'BIOCOMPATIBILITY',
        severity: 'HIGH',
        probability: 'POSSIBLE',
        impact: 'Tissue reaction, inflammation, rejection',
        mitigationStrategy: 'Comprehensive biocompatibility testing per ISO 10993',
        residualRisk: 'MEDIUM'
      });
    }
    
    // Software-Risiken
    if (productConcept.intendedUse.includes('software')) {
      technicalRisks.push({
        riskType: 'SOFTWARE_FAILURE',
        severity: 'CRITICAL',
        probability: 'POSSIBLE',
        impact: 'Incorrect diagnosis or treatment recommendation',
        mitigationStrategy: 'Robust software validation per IEC 62304',
        residualRisk: 'MEDIUM'
      });
    }
    
    // Elektrische Sicherheit
    if (productConcept.intendedUse.includes('electrical')) {
      technicalRisks.push({
        riskType: 'ELECTRICAL_SAFETY',
        severity: 'CRITICAL',
        probability: 'UNLIKELY',
        impact: 'Electric shock, thermal injury',
        mitigationStrategy: 'Compliance with IEC 60601-1 standards',
        residualRisk: 'LOW'
      });
    }
    
    return technicalRisks;
  }

  private async assessClinicalRisks(productConcept: any): Promise<Risk[]> {
    const clinicalRisks: Risk[] = [];
    
    // Patientenrisiken
    clinicalRisks.push({
      riskType: 'ADVERSE_EVENTS',
      severity: 'HIGH',
      probability: 'POSSIBLE',
      impact: 'Patient harm, complications',
      mitigationStrategy: 'Robust clinical trial design, post-market surveillance',
      residualRisk: 'MEDIUM'
    });
    
    // Wirksamkeitsrisiken
    clinicalRisks.push({
      riskType: 'INEFFECTIVENESS',
      severity: 'HIGH',
      probability: 'POSSIBLE',
      impact: 'Treatment failure, disease progression',
      mitigationStrategy: 'Adequate clinical evidence, comparative studies',
      residualRisk: 'MEDIUM'
    });
    
    // Anwendungsfehler
    clinicalRisks.push({
      riskType: 'USER_ERROR',
      severity: 'MEDIUM',
      probability: 'LIKELY',
      impact: 'Incorrect usage, reduced efficacy',
      mitigationStrategy: 'Usability engineering, comprehensive training',
      residualRisk: 'LOW'
    });
    
    return clinicalRisks;
  }

  private async assessRegulatoryRisks(productConcept: any): Promise<Risk[]> {
    const regulatoryRisks: Risk[] = [];
    
    // Zulassungsrisiken
    regulatoryRisks.push({
      riskType: 'REGULATORY_REJECTION',
      severity: 'HIGH',
      probability: 'POSSIBLE',
      impact: 'Delayed market entry, additional costs',
      mitigationStrategy: 'Early regulatory consultation, gap analysis',
      residualRisk: 'MEDIUM'
    });
    
    // Standards-Compliance
    regulatoryRisks.push({
      riskType: 'STANDARDS_NON_COMPLIANCE',
      severity: 'HIGH',
      probability: 'POSSIBLE',
      impact: 'Regulatory delays, product recalls',
      mitigationStrategy: 'Comprehensive standards analysis, third-party testing',
      residualRisk: 'LOW'
    });
    
    // Post-Market Surveillance
    regulatoryRisks.push({
      riskType: 'POST_MARKET_REQUIREMENTS',
      severity: 'MEDIUM',
      probability: 'CERTAIN',
      impact: 'Ongoing compliance costs, reporting obligations',
      mitigationStrategy: 'Proactive PMS plan, quality system implementation',
      residualRisk: 'LOW'
    });
    
    return regulatoryRisks;
  }

  private async assessCommercialRisks(productConcept: any): Promise<Risk[]> {
    const commercialRisks: Risk[] = [];
    
    // Marktakzeptanz
    commercialRisks.push({
      riskType: 'MARKET_ACCEPTANCE',
      severity: 'HIGH',
      probability: 'POSSIBLE',
      impact: 'Low sales, market penetration failure',
      mitigationStrategy: 'Market research, physician education, KOL engagement',
      residualRisk: 'MEDIUM'
    });
    
    // Wettbewerbsrisiken
    commercialRisks.push({
      riskType: 'COMPETITIVE_THREAT',
      severity: 'MEDIUM',
      probability: 'LIKELY',
      impact: 'Market share erosion, price pressure',
      mitigationStrategy: 'IP protection, continuous innovation, differentiation',
      residualRisk: 'MEDIUM'
    });
    
    // Kostendruck
    commercialRisks.push({
      riskType: 'COST_OVERRUNS',
      severity: 'HIGH',
      probability: 'POSSIBLE',
      impact: 'Budget exceedance, ROI reduction',
      mitigationStrategy: 'Robust project management, contingency planning',
      residualRisk: 'MEDIUM'
    });
    
    return commercialRisks;
  }

  private calculateOverallRiskLevel(risks: Risk[]): string {
    const riskScores = risks.map(risk => {
      const severityScore = this.getSeverityScore(risk.severity);
      const probabilityScore = this.getProbabilityScore(risk.probability);
      return severityScore * probabilityScore;
    });
    
    const averageScore = riskScores.reduce((a, b) => a + b, 0) / riskScores.length;
    
    if (averageScore >= 16) return 'CRITICAL';
    if (averageScore >= 9) return 'HIGH';
    if (averageScore >= 4) return 'MEDIUM';
    return 'LOW';
  }

  private async assessRiskBenefitRatio(productConcept: any, risks: Risk[]): Promise<'FAVORABLE' | 'ACCEPTABLE' | 'UNFAVORABLE'> {
    const benefitScore = await this.calculateBenefitScore(productConcept);
    const riskScore = risks.reduce((total, risk) => {
      return total + (this.getSeverityScore(risk.severity) * this.getProbabilityScore(risk.probability));
    }, 0);
    
    const ratio = benefitScore / riskScore;
    
    if (ratio > 3) return 'FAVORABLE';
    if (ratio > 1) return 'ACCEPTABLE';
    return 'UNFAVORABLE';
  }

  private async calculateBenefitScore(productConcept: any): Promise<number> {
    let score = 0;
    
    // Medizinischer Nutzen
    if (productConcept.intendedUse.includes('life-saving')) score += 10;
    if (productConcept.intendedUse.includes('quality of life')) score += 8;
    if (productConcept.intendedUse.includes('diagnostic')) score += 6;
    
    // Patientenpopulation
    if (productConcept.targetPopulation.includes('rare disease')) score += 5;
    if (productConcept.targetPopulation.includes('pediatric')) score += 4;
    
    // Innovation
    if (await this.isNovelTechnology(productConcept)) score += 7;
    
    return score;
  }

  private generateRiskMitigationRecommendations(risks: Risk[]): string[] {
    const recommendations: string[] = [];
    
    risks.forEach(risk => {
      if (risk.residualRisk === 'HIGH' || risk.residualRisk === 'CRITICAL') {
        recommendations.push(`Priority mitigation needed for ${risk.riskType}: ${risk.mitigationStrategy}`);
      }
    });
    
    // Allgemeine Empfehlungen
    recommendations.push('Implement comprehensive quality management system per ISO 13485');
    recommendations.push('Establish post-market surveillance system');
    recommendations.push('Develop robust clinical evaluation plan');
    
    return recommendations;
  }

  private getSeverityScore(severity: string): number {
    switch (severity) {
      case 'LOW': return 1;
      case 'MEDIUM': return 2;
      case 'HIGH': return 3;
      case 'CRITICAL': return 4;
      default: return 1;
    }
  }

  private getProbabilityScore(probability: string): number {
    switch (probability) {
      case 'RARE': return 1;
      case 'UNLIKELY': return 2;
      case 'POSSIBLE': return 3;
      case 'LIKELY': return 4;
      case 'CERTAIN': return 5;
      default: return 1;
    }
  }

  private async isNovelTechnology(productConcept: any): Promise<boolean> {
    // Simplified novelty assessment
    return productConcept.intendedUse.includes('innovative') || 
           productConcept.intendedUse.includes('breakthrough') ||
           productConcept.intendedUse.includes('first-in-class');
  }

  // Risiko-Matrix Methode nach ISO 14971
  generateRiskMatrix(risks: Risk[]): any {
    const matrix: any = {};
    
    risks.forEach(risk => {
      const key = `${risk.severity}_${risk.probability}`;
      if (!matrix[key]) {
        matrix[key] = [];
      }
      matrix[key].push(risk);
    });
    
    return matrix;
  }

  // FMEA-Analyse (Failure Mode and Effects Analysis)
  performFMEAAnalysis(productConcept: any): any {
    return {
      potentialFailureModes: await this.identifyFailureModes(productConcept),
      effectsAnalysis: await this.analyzeFailureEffects(productConcept),
      criticalityAssessment: await this.assessFailureCriticality(productConcept)
    };
  }

  private async identifyFailureModes(productConcept: any): Promise<string[]> {
    // Simplified FMEA failure mode identification
    const failureModes: string[] = [];
    
    if (productConcept.intendedUse.includes('software')) {
      failureModes.push('Software bug causing incorrect output');
      failureModes.push('User interface confusion leading to misuse');
      failureModes.push('Data corruption during processing');
    }
    
    if (productConcept.intendedUse.includes('mechanical')) {
      failureModes.push('Mechanical failure under stress');
      failureModes.push('Material degradation over time');
      failureModes.push('Assembly error during manufacturing');
    }
    
    return failureModes;
  }

  private async analyzeFailureEffects(productConcept: any): Promise<any> {
    return {
      patientSafety: 'Potential harm to patients',
      clinicalOutcome: 'Reduced treatment efficacy',
      regulatoryImpact: 'Compliance issues, recalls'
    };
  }

  private async assessFailureCriticality(productConcept: any): Promise<string> {
    return 'MEDIUM'; // Simplified assessment
  }
}