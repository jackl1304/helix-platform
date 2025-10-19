import { z } from 'zod';
import { RegulatoryDatabaseService } from '../services/regulatory-database.service';
import { ClinicalEvidenceService } from '../services/clinical-evidence.service';
import { QualityManagementService } from '../services/quality-management.service';
import { RiskAssessmentService } from '../services/risk-assessment.service';

export const HealthcareProductType = z.enum([
  'DIAGNOSTIC_DEVICE',
  'THERAPEUTIC_DEVICE', 
  'MONITORING_DEVICE',
  'IMPLANTABLE_DEVICE',
  'SOFTWARE_MEDICAL_DEVICE',
  'PHARMACEUTICAL_DRUG',
  'BIOTECH_PRODUCT',
  'DIGITAL_HEALTH_APP',
  'TELEMEDICINE_PLATFORM',
  'AI_DIAGNOSTIC_TOOL',
  'MEDICAL_EQUIPMENT',
  'IN_VITRO_DIAGNOSTIC',
  'ACTIVE_IMPLANTABLE',
  'COMBINATION_PRODUCT'
]);

export const DevelopmentPhase = z.enum([
  'IDEA_CONCEPT',
  'DESIGN_DEVELOPMENT',
  'PRECLINICAL_VALIDATION',
  'CLINICAL_TRIAL',
  'REGULATORY_APPROVAL',
  'POST_MARKET_SURVEILLANCE'
]);

export const RegulatoryClassification = z.enum([
  'CLASS_I',
  'CLASS_IIA',
  'CLASS_IIB',
  'CLASS_III',
  'HIGH_RISK_PHARMA',
  'LOW_RISK_PHARMA',
  'BIOLOGICS',
  'GENE_THERAPY'
]);

export const ProjectRequestSchema = z.object({
  // Grundinformationen
  projectId: z.string().uuid(),
  productName: z.string().min(1).max(200),
  productType: HealthcareProductType,
  intendedUse: z.string().min(10).max(1000),
  targetPatientPopulation: z.string(),
  
  // Technische Spezifikation
  technicalDescription: z.string().min(50),
  keyFeatures: z.array(z.string()),
  innovationAspects: z.array(z.string()),
  
  // Regulatorische Informationen
  regulatoryClassification: RegulatoryClassification,
  targetMarkets: z.array(z.enum(['US', 'EU', 'UK', 'CHINA', 'JAPAN', 'CANADA', 'AUSTRALIA'])),
  applicableStandards: z.array(z.string()),
  
  // Entwicklungsplan
  currentPhase: DevelopmentPhase,
  timeline: z.object({
    conceptCompletion: z.date(),
    prototypeDevelopment: z.date(),
    preclinicalTesting: z.date(),
    clinicalTrialStart: z.date(),
    regulatorySubmission: z.date(),
    marketLaunch: z.date()
  }),
  
  // Ressourcen & Budget
  estimatedBudget: z.number().positive(),
  teamSize: z.number().int().positive(),
  requiredExpertise: z.array(z.string()),
  
  // Risikoanalyse
  knownRisks: z.array(z.object({
    riskType: z.string(),
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    mitigationStrategy: z.string()
  })),
  
  // Erfolgskriterien
  successMetrics: z.array(z.object({
    metric: z.string(),
    targetValue: z.string(),
    measurementMethod: z.string()
  }))
});

export type ProjectRequest = z.infer<typeof ProjectRequestSchema>;

export class ProjectRequestBuilder {
  private regulatoryService: RegulatoryDatabaseService;
  private clinicalService: ClinicalEvidenceService;
  private qualityService: QualityManagementService;
  private riskService: RiskAssessmentService;
  
  constructor() {
    this.regulatoryService = new RegulatoryDatabaseService();
    this.clinicalService = new ClinicalEvidenceService();
    this.qualityService = new QualityManagementService();
    this.riskService = new RiskAssessmentService();
  }
  
  async createProjectRequest(productConcept: {
    productName: string;
    productType: string;
    intendedUse: string;
    targetPopulation: string;
  }): Promise<ProjectRequest> {
    // Automatische Klassifizierung basierend auf Produkttyp
    const classification = await this.regulatoryService.classifyProduct(productConcept);
    
    // Evidenz-basierte Risikoanalyse
    const riskAssessment = await this.riskService.assessProductRisks(productConcept);
    
    // Standards und Richtlinien identifizieren
    const applicableStandards = await this.regulatoryService.getApplicableStandards(classification);
    
    // Klinische Evidenz-Anforderungen
    const clinicalRequirements = await this.clinicalService.getEvidenceRequirements(productConcept);
    
    const projectRequest: ProjectRequest = {
      projectId: crypto.randomUUID(),
      productName: productConcept.productName,
      productType: productConcept.productType as any,
      intendedUse: productConcept.intendedUse,
      targetPatientPopulation: productConcept.targetPopulation,
      technicalDescription: await this.generateTechnicalDescription(productConcept),
      keyFeatures: await this.identifyKeyFeatures(productConcept),
      innovationAspects: await this.identifyInnovationAspects(productConcept),
      regulatoryClassification: classification,
      targetMarkets: ['US', 'EU'], // Standardmärkte
      applicableStandards,
      currentPhase: 'IDEA_CONCEPT',
      timeline: await this.generateRealisticTimeline(classification),
      estimatedBudget: await this.estimateBudget(classification, productConcept),
      teamSize: await this.calculateTeamSize(classification),
      requiredExpertise: await this.identifyRequiredExpertise(classification),
      knownRisks: riskAssessment.identifiedRisks,
      successMetrics: await this.defineSuccessMetrics(productConcept)
    };
    
    return ProjectRequestSchema.parse(projectRequest);
  }
  
  private async generateTechnicalDescription(concept: any): Promise<string> {
    // AI-generierte technische Beschreibung basierend auf ähnlichen Produkten
    const similarProducts = await this.regulatoryService.findSimilarProducts(concept);
    return `Technische Beschreibung für ${concept.productName} basierend auf ${similarProducts.length} ähnlichen Produkten.`;
  }
  
  private async identifyKeyFeatures(concept: any): Promise<string[]> {
    // Automatische Identifikation von Schlüsselfeatures
    const features = await this.regulatoryService.analyzeMarketNeeds(concept);
    return features.map(f => f.feature);
  }
  
  private async generateRealisticTimeline(classification: string) {
    // Realistische Timeline basierend auf regulatorischer Klassifizierung
    const baseDate = new Date();
    const timelineData = await this.regulatoryService.getAverageTimelines(classification);
    
    return {
      conceptCompletion: new Date(baseDate.setMonth(baseDate.getMonth() + 3)),
      prototypeDevelopment: new Date(baseDate.setMonth(baseDate.getMonth() + 6)),
      preclinicalTesting: new Date(baseDate.setMonth(baseDate.getMonth() + 12)),
      clinicalTrialStart: new Date(baseDate.setMonth(baseDate.getMonth() + 18)),
      regulatorySubmission: new Date(baseDate.setMonth(baseDate.getMonth() + 36)),
      marketLaunch: new Date(baseDate.setMonth(baseDate.getMonth() + 48))
    };
  }
  
  async generateDocumentationPackage(projectRequest: ProjectRequest) {
    return {
      projectBrief: await this.generateProjectBrief(projectRequest),
      regulatoryChecklist: await this.generateRegulatoryChecklist(projectRequest),
      riskManagementFile: await this.generateRiskManagementFile(projectRequest),
      qualityPlan: await this.generateQualityPlan(projectRequest),
      clinicalDevelopmentPlan: await this.generateClinicalPlan(projectRequest),
      budgetProposal: await this.generateBudgetProposal(projectRequest)
    };
  }
  
  // Dokumentgenerierungsmethoden...
  private async generateProjectBrief(project: ProjectRequest) {
    return {
      title: `Projektbrief: ${project.productName}`,
      content: `# ${project.productName}\n\n## Intended Use\n${project.intendedUse}\n\n## Regulatory Pathway\n${project.regulatoryClassification}`
    };
  }
}