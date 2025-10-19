import { Injectable } from '@nestjs/common';

interface QualityProcess {
  processName: string;
  description: string;
  requiredDocuments: string[];
  responsibleParty: string;
  frequency: string;
}

interface QualitySystem {
  processes: QualityProcess[];
  documentation: string[];
  complianceStatus: 'COMPLIANT' | 'PARTIAL' | 'NON_COMPLIANT';
  gaps: string[];
  recommendations: string[];
}

@Injectable()
export class QualityManagementService {
  
  async establishQualitySystem(productType: string, classification: string): Promise<QualitySystem> {
    const processes = await this.defineQualityProcesses(productType, classification);
    const documentation = await this.generateRequiredDocumentation(productType, classification);
    const complianceStatus = await this.assessComplianceStatus(processes, documentation);
    const gaps = await this.identifyComplianceGaps(processes, documentation);
    const recommendations = await this.generateImprovementRecommendations(gaps);
    
    return {
      processes,
      documentation,
      complianceStatus,
      gaps,
      recommendations
    };
  }

  async generateQualityManual(productType: string): Promise<string> {
    const manualSections = [
      'Quality Policy and Objectives',
      'Organizational Structure and Responsibilities',
      'Resource Management',
      'Product Realization Processes',
      'Measurement, Analysis and Improvement'
    ];
    
    return `# Quality Management Manual - ${productType}

## Based on ISO 13485:2016 Requirements

${manualSections.map(section => `### ${section}\n\nContent for ${section}...`).join('\n\n')}`;
  }

  async createDocumentControlSystem(): Promise<any> {
    return {
      documentTypes: [
        'Quality Manual',
        'Procedures',
        'Work Instructions',
        'Records',
        'Forms'
      ],
      controlMeasures: [
        'Document Approval before issue',
        'Document Review and update',
        'Change Control',
        'Document Distribution Control',
        'Obsolete Document Control'
      ],
      templates: await this.generateDocumentTemplates()
    };
  }

  async implementCorrectiveActions(): Promise<any> {
    return {
      process: 'CAPA (Corrective and Preventive Action)',
      steps: [
        'Problem Identification',
        'Root Cause Analysis',
        'Action Plan Development',
        'Implementation',
        'Effectiveness Verification'
      ],
      tools: [
        '5 Whys Analysis',
        'Fishbone Diagram',
        'PDCA Cycle',
        'Risk Assessment'
      ],
      records: [
        'Non-conformance Reports',
        'Corrective Action Requests',
        'Effectiveness Review Records'
      ]
    };
  }

  private async defineQualityProcesses(productType: string, classification: string): Promise<QualityProcess[]> {
    const baseProcesses: QualityProcess[] = [
      {
        processName: 'Management Responsibility',
        description: 'Establish quality policy, objectives, and management commitment',
        requiredDocuments: ['Quality Manual', 'Quality Policy', 'Management Review Records'],
        responsibleParty: 'Top Management',
        frequency: 'Annual'
      },
      {
        processName: 'Resource Management',
        description: 'Provide adequate resources, infrastructure, and work environment',
        requiredDocuments: ['Training Records', 'Equipment Calibration Records', 'Facility Records'],
        responsibleParty: 'HR/Operations',
        frequency: 'Continuous'
      },
      {
        processName: 'Product Realization',
        description: 'Plan and control product design, development, and production',
        requiredDocuments: ['Design History File', 'Production Records', 'Validation Records'],
        responsibleParty: 'R&D/Production',
        frequency: 'Project-based'
      },
      {
        processName: 'Measurement, Analysis and Improvement',
        description: 'Monitor, measure, analyze, and improve the QMS',
        requiredDocuments: ['Audit Reports', 'Customer Feedback', 'Performance Metrics'],
        responsibleParty: 'Quality Department',
        frequency: 'Monthly/Quarterly'
      }
    ];

    // Produktspezifische Prozesse
    if (classification === 'CLASS_II' || classification === 'CLASS_III') {
      baseProcesses.push({
        processName: 'Risk Management',
        description: 'Systematic risk management throughout product lifecycle',
        requiredDocuments: ['Risk Management File', 'Risk Management Plan', 'Risk Assessment Reports'],
        responsibleParty: 'Quality/R&D',
        frequency: 'Continuous'
      });
    }

    if (productType.includes('software')) {
      baseProcesses.push({
        processName: 'Software Development',
        description: 'Structured software development lifecycle per IEC 62304',
        requiredDocuments: ['Software Requirements', 'Architecture Design', 'Test Protocols', 'Validation Reports'],
        responsibleParty: 'Software Development',
        frequency: 'Project-based'
      });
    }

    return baseProcesses;
  }

  private async generateRequiredDocumentation(productType: string, classification: string): Promise<string[]> {
    const documentation: string[] = [
      'Quality Manual',
      'Quality Policy',
      'Procedures Manual',
      'Document Control Procedure',
      'Records Control Procedure',
      'Management Review Procedure',
      'Training Procedure',
      'Infrastructure Management Procedure'
    ];

    // Design and Development Documentation
    documentation.push(
      'Design and Development Procedure',
      'Design Inputs/Outputs',
      'Design Verification/Validation',
      'Design Transfer Procedure'
    );

    // Production and Service Provision
    documentation.push(
      'Production Control Procedure',
      'Process Validation Procedure',
      'Purchasing Control Procedure',
      'Service Provision Procedure'
    );

    // Monitoring and Measurement
    documentation.push(
      'Monitoring and Measurement Procedure',
      'Internal Audit Procedure',
      'Product Monitoring Procedure',
      'Customer Feedback Procedure'
    );

    // Control of Non-conforming Product
    documentation.push(
      'Control of Non-conforming Product Procedure',
      'Corrective and Preventive Action Procedure',
      'Data Analysis Procedure'
    );

    // Risikomanagement für höhere Klassen
    if (classification === 'CLASS_II' || classification === 'CLASS_III') {
      documentation.push(
        'Risk Management Procedure',
        'Risk Management Plan',
        'Risk Management File'
      );
    }

    // Software-spezifische Dokumentation
    if (productType.includes('software')) {
      documentation.push(
        'Software Development Procedure',
        'Software Requirements Specification',
        'Software Architecture Document',
        'Software Verification and Validation Plan'
      );
    }

    return documentation;
  }

  private async assessComplianceStatus(processes: QualityProcess[], documentation: string[]): Promise<'COMPLIANT' | 'PARTIAL' | 'NON_COMPLIANT'> {
    // Simplified compliance assessment
    const requiredProcesses = await this.getISO13485RequiredProcesses();
    const requiredDocs = await this.getISO13485RequiredDocuments();
    
    const processCoverage = processes.length / requiredProcesses.length;
    const docCoverage = documentation.length / requiredDocs.length;
    
    if (processCoverage >= 0.9 && docCoverage >= 0.9) return 'COMPLIANT';
    if (processCoverage >= 0.7 && docCoverage >= 0.7) return 'PARTIAL';
    return 'NON_COMPLIANT';
  }

  private async identifyComplianceGaps(processes: QualityProcess[], documentation: string[]): Promise<string[]> {
    const gaps: string[] = [];
    const requiredProcesses = await this.getISO13485RequiredProcesses();
    const requiredDocs = await this.getISO13485RequiredDocuments();
    
    // Process gaps
    requiredProcesses.forEach(requiredProcess => {
      if (!processes.some(p => p.processName === requiredProcess)) {
        gaps.push(`Missing process: ${requiredProcess}`);
      }
    });
    
    // Documentation gaps
    requiredDocs.forEach(requiredDoc => {
      if (!documentation.some(d => d === requiredDoc)) {
        gaps.push(`Missing documentation: ${requiredDoc}`);
      }
    });
    
    return gaps;
  }

  private async generateImprovementRecommendations(gaps: string[]): Promise<string[]> {
    const recommendations: string[] = [];
    
    gaps.forEach(gap => {
      if (gap.includes('Missing process')) {
        recommendations.push(`Establish ${gap.replace('Missing process: ', '')} process`);
      } else if (gap.includes('Missing documentation')) {
        recommendations.push(`Develop ${gap.replace('Missing documentation: ', '')}`);
      }
    });
    
    // Allgemeine Empfehlungen
    recommendations.push('Conduct gap analysis against ISO 13485 requirements');
    recommendations.push('Develop implementation timeline');
    recommendations.push('Assign responsible parties for each gap');
    recommendations.push('Establish monitoring and measurement system');
    
    return recommendations;
  }

  private async generateDocumentTemplates(): Promise<any[]> {
    return [
      {
        name: 'Quality Manual Template',
        description: 'Complete template for Quality Management Manual',
        sections: ['Quality Policy', 'Organizational Structure', 'Process Interactions']
      },
      {
        name: 'Procedure Template',
        description: 'Standard template for quality procedures',
        sections: ['Purpose', 'Scope', 'Responsibilities', 'Procedure', 'Records']
      },
      {
        name: 'Work Instruction Template',
        description: 'Template for detailed work instructions',
        sections: ['Objective', 'Equipment', 'Steps', 'Precautions', 'Records']
      },
      {
        name: 'Form Template',
        description: 'Standard form template for quality records',
        sections: ['Header', 'Body', 'Approval Section', 'Revision History']
      }
    ];
  }

  private async getISO13485RequiredProcesses(): Promise<string[]> {
    return [
      'Management Responsibility',
      'Resource Management',
      'Product Realization',
      'Measurement, Analysis and Improvement',
      'Risk Management',
      'Design and Development',
      'Purchasing',
      'Production and Service Provision',
      'Control of Monitoring and Measuring Equipment'
    ];
  }

  private async getISO13485RequiredDocuments(): Promise<string[]> {
    return [
      'Quality Manual',
      'Quality Policy',
      'Quality Objectives',
      'Procedures',
      'Work Instructions',
      'Records',
      'Forms'
    ];
  }

  async performInternalAudit(): Promise<any> {
    return {
      auditPlan: await this.generateAuditPlan(),
      checklists: await this.generateAuditChecklists(),
      reporting: await this.generateAuditReportTemplate()
    };
  }

  private async generateAuditPlan(): Promise<any> {
    return {
      scope: 'Complete QMS audit',
      criteria: 'ISO 13485:2016',
      methodology: 'Process-based auditing',
      schedule: 'Annual audit plan',
      resources: 'Trained internal auditors'
    };
  }

  private async generateAuditChecklists(): Promise<any[]> {
    return [
      {
        process: 'Management Responsibility',
        questions: [
          'Is quality policy established and communicated?',
          'Are quality objectives measurable and monitored?',
          'Is management review conducted regularly?'
        ]
      },
      {
        process: 'Design and Development',
        questions: [
          'Are design inputs clearly defined?',
          'Is design verification and validation performed?',
          'Are design changes controlled?'
        ]
      }
    ];
  }

  private async generateAuditReportTemplate(): Promise<any> {
    return {
      sections: [
        'Executive Summary',
        'Audit Scope and Objectives',
        'Audit Findings',
        'Non-conformities',
        'Opportunities for Improvement',
        'Conclusion'
      ],
      grading: ['Major Non-conformity', 'Minor Non-conformity', 'Observation']
    };
  }
}