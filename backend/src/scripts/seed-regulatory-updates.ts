/**
 * Seed Script for Regulatory Updates
 * Creates sample regulatory updates for local development
 */

import { getDatabase } from '../db';
import { regulatoryUpdates } from '../../../shared/schema';
import { Logger } from '../services/logger.service';

const logger = new Logger('SeedScript');

// Sample regulatory updates data
const sampleUpdates = [
  {
    id: 'ru_001',
    tenantId: 'demo-medical-tech',
    title: 'FDA Issues New AI/ML Guidance for Medical Devices',
    description: 'The FDA has released new guidance documents for AI/ML-based medical devices, focusing on software as a medical device (SaMD) classification and validation requirements.',
    content: 'The U.S. Food and Drug Administration (FDA) has published comprehensive guidance for manufacturers developing artificial intelligence and machine learning (AI/ML) enabled medical devices. The guidance addresses key areas including premarket submissions, clinical evaluation, and post-market surveillance. Manufacturers are advised to implement robust validation protocols and maintain detailed documentation of AI/ML model training and performance metrics.',
    type: 'guidance',
    category: 'regulatory',
    jurisdiction: 'US',
    publishedDate: new Date('2024-01-15'),
    priority: 2,
    tags: ['FDA', 'AI/ML', 'SaMD', 'guidance'],
    sourceId: 'fda-001'
  },
  {
    id: 'ru_002',
    tenantId: 'demo-medical-tech',
    title: 'EU MDR Post-Market Surveillance Updates',
    description: 'Updated requirements for post-market surveillance under the EU Medical Device Regulation (MDR) 2017/745.',
    content: 'The European Commission has updated post-market surveillance requirements under MDR 2017/745. Key changes include enhanced reporting obligations for serious incidents, expanded periodic safety update report (PSUR) requirements, and new requirements for trend reporting. Manufacturers must ensure their quality management systems are updated to reflect these changes by Q2 2024.',
    type: 'regulation',
    category: 'regulatory',
    jurisdiction: 'EU',
    publishedDate: new Date('2024-01-14'),
    priority: 3,
    tags: ['EU', 'MDR', 'post-market', 'surveillance'],
    sourceId: 'ema-001'
  },
  {
    id: 'ru_003',
    tenantId: 'demo-medical-tech',
    title: 'MHRA UK Medical Device Regulation Updates',
    description: 'The UK Medicines and Healthcare products Regulatory Agency (MHRA) has published new guidance for medical device manufacturers post-Brexit.',
    content: 'Following the UK\'s exit from the EU, the MHRA has established new regulatory pathways for medical devices. The UKCA marking system is now required for devices placed on the UK market. Manufacturers must ensure compliance with UK MDR 2002 and submit applications through the new MHRA portal. Transition periods apply until 2025 for certain device classes.',
    type: 'regulation',
    category: 'regulatory',
    jurisdiction: 'UK',
    publishedDate: new Date('2024-01-13'),
    priority: 2,
    tags: ['UK', 'MHRA', 'UKCA', 'Brexit'],
    sourceId: 'mhra-001'
  },
  {
    id: 'ru_004',
    tenantId: 'demo-medical-tech',
    title: 'FDA 510(k) Clearance - Class II Medical Devices',
    description: 'New FDA 510(k) clearance requirements for Class II medical devices, including updated submission templates and review timelines.',
    content: 'The FDA has updated the 510(k) submission process for Class II medical devices. Key updates include new electronic submission templates, streamlined review processes, and updated guidance on substantial equivalence determinations. Manufacturers should review the updated FDA guidance documents and ensure submissions comply with the new requirements.',
    type: 'guidance',
    category: 'approval',
    jurisdiction: 'US',
    publishedDate: new Date('2024-01-12'),
    priority: 2,
    tags: ['FDA', '510(k)', 'Class II', 'clearance'],
    sourceId: 'fda-002'
  },
  {
    id: 'ru_005',
    tenantId: 'demo-medical-tech',
    title: 'Global Safety Alert - Cardiovascular Devices',
    description: 'International safety alert issued for specific cardiovascular device models. Manufacturers advised to review quality controls.',
    content: 'A global safety alert has been issued for certain cardiovascular device models following reports of device failures in clinical settings. Regulatory authorities worldwide are coordinating investigations. Manufacturers of affected devices are required to conduct immediate risk assessments and implement corrective actions. Affected manufacturers should contact their local regulatory authorities immediately.',
    type: 'warning',
    category: 'safety',
    jurisdiction: 'Global',
    publishedDate: new Date('2024-01-11'),
    priority: 4,
    tags: ['safety', 'alert', 'cardiovascular', 'global'],
    sourceId: 'who-001'
  },
  {
    id: 'ru_006',
    tenantId: 'demo-medical-tech',
    title: 'Health Canada Medical Device Licensing Updates',
    description: 'Health Canada has updated medical device licensing requirements and introduced new pathways for expedited review.',
    content: 'Health Canada has introduced new expedited review pathways for innovative medical devices that address unmet medical needs. The new pathways include priority review for breakthrough devices and accelerated access for devices treating rare conditions. Manufacturers must meet specific eligibility criteria and provide comprehensive clinical evidence.',
    type: 'regulation',
    category: 'regulatory',
    jurisdiction: 'Canada',
    publishedDate: new Date('2024-01-10'),
    priority: 2,
    tags: ['Canada', 'Health Canada', 'licensing', 'expedited'],
    sourceId: 'hc-001'
  },
  {
    id: 'ru_007',
    tenantId: 'demo-medical-tech',
    title: 'BfArM German Medical Device Regulation',
    description: 'The German Federal Institute for Drugs and Medical Devices (BfArM) has published updated guidance for medical device manufacturers.',
    content: 'BfArM has released updated guidance documents for medical device manufacturers operating in Germany. The guidance covers MDR compliance, clinical evaluation requirements, and post-market surveillance obligations. German manufacturers must ensure full compliance with both EU MDR and national requirements.',
    type: 'guidance',
    category: 'regulatory',
    jurisdiction: 'Germany',
    publishedDate: new Date('2024-01-09'),
    priority: 2,
    tags: ['Germany', 'BfArM', 'MDR', 'guidance'],
    sourceId: 'bfarm-001'
  },
  {
    id: 'ru_008',
    tenantId: 'demo-medical-tech',
    title: 'TGA Australia Medical Device Registration',
    description: 'Therapeutic Goods Administration (TGA) Australia has updated medical device registration requirements.',
    content: 'TGA Australia has updated the Australian Register of Therapeutic Goods (ARTG) requirements for medical devices. Key changes include updated conformity assessment procedures, new requirements for software as a medical device, and enhanced post-market monitoring. Manufacturers must ensure compliance with the updated Therapeutic Goods (Medical Devices) Regulations.',
    type: 'regulation',
    category: 'regulatory',
    jurisdiction: 'Australia',
    publishedDate: new Date('2024-01-08'),
    priority: 2,
    tags: ['Australia', 'TGA', 'ARTG', 'registration'],
    sourceId: 'tga-001'
  },
  {
    id: 'ru_009',
    tenantId: 'demo-medical-tech',
    title: 'PMDA Japan Medical Device Approval Process',
    description: 'Pharmaceuticals and Medical Devices Agency (PMDA) Japan has streamlined the medical device approval process.',
    content: 'PMDA Japan has introduced streamlined approval processes for certain medical device categories. The new processes reduce review times for low-risk devices and provide clearer guidance on documentation requirements. Manufacturers should review the updated PMDA guidance documents and ensure submissions meet the new standards.',
    type: 'guidance',
    category: 'regulatory',
    jurisdiction: 'Japan',
    publishedDate: new Date('2024-01-07'),
    priority: 2,
    tags: ['Japan', 'PMDA', 'approval', 'streamlined'],
    sourceId: 'pmda-001'
  },
  {
    id: 'ru_010',
    tenantId: 'demo-medical-tech',
    title: 'ANVISA Brazil Medical Device Regulation',
    description: 'Brazilian Health Regulatory Agency (ANVISA) has published new regulations for medical device registration.',
    content: 'ANVISA has published updated regulations for medical device registration in Brazil. The new regulations align more closely with international standards and include updated requirements for clinical evaluation, quality management systems, and post-market surveillance. Manufacturers must ensure compliance with RDC 185/2001 and related regulations.',
    type: 'regulation',
    category: 'regulatory',
    jurisdiction: 'Brazil',
    publishedDate: new Date('2024-01-06'),
    priority: 2,
    tags: ['Brazil', 'ANVISA', 'registration', 'regulation'],
    sourceId: 'anvisa-001'
  }
];

// Generate additional updates to reach ~100
function generateAdditionalUpdates(count: number) {
  const jurisdictions = ['US', 'EU', 'UK', 'Canada', 'Australia', 'Japan', 'Brazil', 'Germany', 'Global'];
  const types = ['regulation', 'guidance', 'warning', 'approval', 'recall'];
  const sources = ['FDA', 'EMA', 'MHRA', 'Health Canada', 'TGA', 'PMDA', 'ANVISA', 'BfArM', 'WHO'];
  const categories = ['regulatory', 'safety', 'approval', 'clinical'];
  
  const updates = [];
  for (let i = 0; i < count; i++) {
    const jurisdiction = jurisdictions[i % jurisdictions.length];
    const type = types[i % types.length];
    const source = sources[i % sources.length];
    const category = categories[i % categories.length];
    const date = new Date();
    date.setDate(date.getDate() - (i % 90)); // Spread over last 90 days
    
    updates.push({
      id: `ru_${String(i + 11).padStart(3, '0')}`,
      tenantId: 'demo-medical-tech',
      title: `${source} ${type.charAt(0).toUpperCase() + type.slice(1)} Update - Medical Device Compliance ${i + 11}`,
      description: `Important ${type} update from ${source} affecting medical device manufacturers in ${jurisdiction}.`,
      content: `This regulatory update from ${source} addresses key compliance requirements for medical device manufacturers operating in ${jurisdiction}. The update covers ${type} requirements and provides guidance on implementation timelines and compliance obligations. Manufacturers should review the full guidance document and ensure their quality management systems are updated accordingly.`,
      type,
      category,
      jurisdiction,
      publishedDate: date,
      priority: (i % 4) + 1, // Priority 1-4
      tags: [source.toLowerCase(), type, jurisdiction.toLowerCase(), 'compliance'],
      sourceId: `${source.toLowerCase()}-${String(i + 11).padStart(3, '0')}`
    });
  }
  return updates;
}

export async function seedRegulatoryUpdates(): Promise<void> {
  try {
    logger.info('Starting regulatory updates seed...');
    const db = getDatabase();
    
    // Check if updates already exist
    const existing = await db.select().from(regulatoryUpdates).limit(1);
    if (existing.length > 0) {
      logger.info('Regulatory updates already exist, skipping seed');
      return;
    }
    
    // Combine sample and generated updates
    const allUpdates = [...sampleUpdates, ...generateAdditionalUpdates(90)];
    
    logger.info(`Inserting ${allUpdates.length} regulatory updates...`);
    
    // Insert in batches
    const batchSize = 20;
    for (let i = 0; i < allUpdates.length; i += batchSize) {
      const batch = allUpdates.slice(i, i + batchSize);
      await db.insert(regulatoryUpdates).values(batch);
      logger.info(`Inserted batch ${Math.floor(i / batchSize) + 1} (${batch.length} updates)`);
    }
    
    logger.info(`✅ Successfully seeded ${allUpdates.length} regulatory updates`);
  } catch (error) {
    logger.error('Error seeding regulatory updates', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedRegulatoryUpdates()
    .then(() => {
      logger.info('Seed completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seed failed', { error });
      process.exit(1);
    });
}

