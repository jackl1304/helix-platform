import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

import { ProjectController } from './controllers/project.controller';
import { RegulatoryController } from './controllers/regulatory.controller';
import { ClinicalController } from './controllers/clinical.controller';
import { RiskController } from './controllers/risk.controller';

import { ProjectRequestBuilder } from './core/project-request-builder';
import { RegulatoryDatabaseService } from './services/regulatory-database.service';
import { ClinicalEvidenceService } from './services/clinical-evidence.service';
import { RiskAssessmentService } from './services/risk-assessment.service';
import { QualityManagementService } from './services/quality-management.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    HttpModule
  ],
  controllers: [
    ProjectController,
    RegulatoryController,
    ClinicalController,
    RiskController
  ],
  providers: [
    ProjectRequestBuilder,
    RegulatoryDatabaseService,
    ClinicalEvidenceService,
    RiskAssessmentService,
    QualityManagementService
  ],
})
export class AppModule {}