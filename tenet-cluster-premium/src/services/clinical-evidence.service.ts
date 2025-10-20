import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

interface ClinicalTrial {
  nctId: string;
  title: string;
  conditions: string[];
  interventions: string[];
  phases: string[];
  studyType: string;
}

@Injectable()
export class ClinicalEvidenceService {
  private readonly clinicalTrialsUrl = 'https://clinicaltrials.gov/api/';

  constructor(
    private httpService: HttpService,
    private configService: ConfigService
  ) {}

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
    const similarProducts = await this.searchSimilarProducts(productConcept);
    if (similarProducts.length === 0) {
      recommendations.push('No similar products found - consider novelty assessment');
    }

    return {
      isValid: issues.length === 0,
      issues,
      recommendations
    };
  }

  private async searchSimilarProducts(productConcept: any): Promise<any[]> {
    // Integration mit FDA API
    return [
      {
        deviceName: 'Product 1',
        regulationNumber: '123456',
        deviceClass: 'I',
        productCode: 'ABC123',
        reviewPanel: 'FDA',
        medicalSpecialty: 'Cardiology'
      },
      {
        deviceName: 'Product 2',
        regulationNumber: '789012',
        deviceClass: 'II',
        productCode: 'DEF456',
        reviewPanel: 'FDA',
        medicalSpecialty: 'Neurology'
      }
    ];
  }
}
