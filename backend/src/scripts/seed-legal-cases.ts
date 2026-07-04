/**
 * Seed Script for Legal Cases
 * Creates sample legal cases for local development
 */

import { getDatabase } from '../db';
import { legalCases } from '../../../shared/schema';
import { Logger } from '../services/logger.service';

const logger = new Logger('SeedScript');

// Sample legal cases data
const sampleCases = [
  {
    id: 'lc_001',
    tenantId: 'demo-medical-tech',
    caseNumber: 'VI ZR 123/24',
    title: 'BGH Urteil - Medizinproduktehaftung bei fehlerhaften Implantaten',
    court: 'BGH',
    jurisdiction: 'DE',
    decisionDate: new Date('2024-03-15'),
    summary: 'Der BGH hat entschieden, dass Hersteller von Medizinprodukten für Schäden haften, die durch fehlerhafte Produkte verursacht werden, auch wenn der Fehler erst nach der Zulassung bekannt wird.',
    content: 'In diesem wegweisenden Urteil hat der Bundesgerichtshof (BGH) die Haftung von Medizinprodukteherstellern für fehlerhafte Implantate geklärt. Der Kläger hatte ein Hüftimplantat erhalten, das nach der Implantation zu schwerwiegenden Komplikationen führte. Der BGH entschied, dass der Hersteller auch dann haftet, wenn der Produktfehler erst nach der Zulassung durch die Behörden bekannt wird. Dies erweitert die Haftungspflichten von Medizinprodukteherstellern erheblich.',
    verdict: 'Hersteller haftet für Produktfehler',
    damages: 'Schmerzensgeld und Schadensersatz in Höhe von 150.000 EUR',
    impactLevel: 'high',
    keywords: ['Medizinproduktehaftung', 'BGH', 'Implantat', 'Produkthaftung', 'Deutschland']
  },
  {
    id: 'lc_002',
    tenantId: 'demo-medical-tech',
    caseNumber: 'C-123/2024',
    title: 'EuGH Urteil - CE-Kennzeichnung und MDR-Compliance',
    court: 'EuGH',
    jurisdiction: 'EU',
    decisionDate: new Date('2024-02-20'),
    summary: 'Der Europäische Gerichtshof hat klargestellt, dass die CE-Kennzeichnung allein nicht ausreicht, um MDR-Compliance nachzuweisen. Hersteller müssen umfassende technische Dokumentation vorlegen.',
    content: 'Der EuGH hat in diesem wichtigen Urteil die Anforderungen an die CE-Kennzeichnung unter der Medical Device Regulation (MDR) präzisiert. Das Gericht entschied, dass die CE-Kennzeichnung allein nicht als Nachweis der MDR-Compliance ausreicht. Hersteller müssen vielmehr umfassende technische Dokumentation vorlegen können, die alle Anforderungen der MDR erfüllt. Dies hat erhebliche Auswirkungen auf die Compliance-Strategien von Medizinprodukteherstellern in der EU.',
    verdict: 'CE-Kennzeichnung allein nicht ausreichend',
    damages: 'Nicht zutreffend (Verfahrensrecht)',
    impactLevel: 'high',
    keywords: ['CE-Kennzeichnung', 'MDR', 'EuGH', 'Compliance', 'EU']
  },
  {
    id: 'lc_003',
    tenantId: 'demo-medical-tech',
    caseNumber: 'K 12/24',
    title: 'OLG München - Arzthaftung bei Verwendung nicht zugelassener Medizinprodukte',
    court: 'OLG München',
    jurisdiction: 'DE',
    decisionDate: new Date('2024-01-10'),
    summary: 'Das OLG München hat entschieden, dass Ärzte haften, wenn sie nicht zugelassene Medizinprodukte verwenden, auch wenn diese im Ausland zugelassen sind.',
    content: 'Das Oberlandesgericht München hat in diesem Urteil die Haftung von Ärzten bei der Verwendung nicht zugelassener Medizinprodukte geklärt. Der behandelnde Arzt hatte ein Medizinprodukt verwendet, das in Deutschland nicht zugelassen war, aber in einem anderen EU-Land eine Zulassung hatte. Das Gericht entschied, dass Ärzte verpflichtet sind, nur zugelassene Medizinprodukte zu verwenden und für Schäden haften, die durch nicht zugelassene Produkte verursacht werden.',
    verdict: 'Arzt haftet für Verwendung nicht zugelassener Produkte',
    damages: 'Schadensersatz in Höhe von 80.000 EUR',
    impactLevel: 'medium',
    keywords: ['Arzthaftung', 'OLG München', 'Zulassung', 'Medizinprodukte', 'Deutschland']
  },
  {
    id: 'lc_004',
    tenantId: 'demo-medical-tech',
    caseNumber: 'FDA v. MedTech Corp.',
    title: 'FDA Enforcement Action - Unauthorized Medical Device Marketing',
    court: 'US District Court',
    jurisdiction: 'US',
    decisionDate: new Date('2024-04-05'),
    summary: 'US-Bundesgericht bestätigt FDA-Strafen gegen Medizinproduktehersteller für unerlaubtes Inverkehrbringen von nicht zugelassenen Geräten.',
    content: 'Ein US-Bundesgericht hat die Strafen der FDA gegen einen Medizinproduktehersteller bestätigt, der Geräte ohne FDA-Zulassung vermarktet hatte. Das Gericht entschied, dass die FDA berechtigt war, erhebliche Geldstrafen zu verhängen und den Verkauf der Produkte zu stoppen. Dies unterstreicht die Bedeutung der FDA-Compliance für Medizinproduktehersteller, die auf dem US-Markt tätig sind.',
    verdict: 'FDA-Strafen bestätigt',
    damages: 'Geldstrafe in Höhe von 2,5 Mio. USD',
    impactLevel: 'high',
    keywords: ['FDA', 'USA', 'Enforcement', 'Zulassung', 'Strafen']
  },
  {
    id: 'lc_005',
    tenantId: 'demo-medical-tech',
    caseNumber: 'BVerfG 1 BvR 456/24',
    title: 'BVerfG - Datenschutz bei Medizinprodukten mit KI-Funktionen',
    court: 'BVerfG',
    jurisdiction: 'DE',
    decisionDate: new Date('2024-05-12'),
    summary: 'Das Bundesverfassungsgericht hat entschieden, dass Medizinprodukte mit KI-Funktionen besondere Datenschutzanforderungen erfüllen müssen.',
    content: 'Das Bundesverfassungsgericht hat in diesem wichtigen Urteil die Datenschutzanforderungen für Medizinprodukte mit KI-Funktionen präzisiert. Das Gericht entschied, dass solche Produkte besondere Anforderungen an die Datenverarbeitung erfüllen müssen, insbesondere im Hinblick auf die Transparenz der KI-Algorithmen und die Rechte der betroffenen Personen. Dies hat erhebliche Auswirkungen auf die Entwicklung und Zulassung von KI-basierten Medizinprodukten in Deutschland.',
    verdict: 'Besondere Datenschutzanforderungen für KI-Produkte',
    damages: 'Nicht zutreffend (Verfassungsrecht)',
    impactLevel: 'high',
    keywords: ['Datenschutz', 'KI', 'BVerfG', 'Medizinprodukte', 'Deutschland']
  }
];

// Generate additional cases to reach ~65
function generateAdditionalCases(count: number) {
  const courts = ['BGH', 'OLG München', 'OLG Frankfurt', 'OLG Hamburg', 'LG Berlin', 'LG München', 'EuGH', 'US District Court', 'UK High Court'];
  const jurisdictions = ['DE', 'EU', 'US', 'UK', 'FR', 'IT', 'ES'];
  const impactLevels = ['low', 'medium', 'high', 'critical'];
  
  const cases = [];
  for (let i = 0; i < count; i++) {
    const court = courts[i % courts.length];
    const jurisdiction = jurisdictions[i % jurisdictions.length];
    const impactLevel = impactLevels[i % impactLevels.length];
    const date = new Date();
    date.setDate(date.getDate() - (i % 180)); // Spread over last 180 days
    
    cases.push({
      id: `lc_${String(i + 6).padStart(3, '0')}`,
      tenantId: 'demo-medical-tech',
      caseNumber: `${jurisdiction}-${String(i + 6).padStart(4, '0')}/24`,
      title: `${court} Urteil - Medizinproduktehaftung Fall ${i + 6}`,
      court,
      jurisdiction,
      decisionDate: date,
      summary: `Wichtiges Urteil des ${court} zur Medizinproduktehaftung. Der Fall betrifft die Haftung von Herstellern für Produktfehler und Compliance-Anforderungen.`,
      content: `In diesem Verfahren vor dem ${court} ging es um die Haftung von Medizinprodukteherstellern für Produktfehler. Das Gericht hat wichtige Grundsätze zur Produkthaftung und Compliance-Anforderungen etabliert. Dieses Urteil hat erhebliche Auswirkungen auf die Praxis der Medizinprodukteindustrie in ${jurisdiction}.`,
      verdict: 'Hersteller haftet für Produktfehler',
      damages: i % 3 === 0 ? `Schadensersatz in Höhe von ${(Math.random() * 200 + 50).toFixed(0)}.000 EUR` : 'Nicht zutreffend',
      impactLevel,
      keywords: ['Medizinproduktehaftung', court, jurisdiction, 'Produkthaftung', 'Compliance']
    });
  }
  return cases;
}

export async function seedLegalCases(): Promise<void> {
  try {
    logger.info('Starting legal cases seed...');
    const db = getDatabase();
    
    // Check if cases already exist
    const existing = await db.select().from(legalCases).limit(1);
    if (existing.length > 0) {
      logger.info('Legal cases already exist, skipping seed');
      return;
    }
    
    // Combine sample and generated cases
    const allCases = [...sampleCases, ...generateAdditionalCases(60)];
    
    logger.info(`Inserting ${allCases.length} legal cases...`);
    
    // Insert in batches
    const batchSize = 20;
    for (let i = 0; i < allCases.length; i += batchSize) {
      const batch = allCases.slice(i, i + batchSize);
      await db.insert(legalCases).values(batch);
      logger.info(`Inserted batch ${Math.floor(i / batchSize) + 1} (${batch.length} cases)`);
    }
    
    logger.info(`✅ Successfully seeded ${allCases.length} legal cases`);
  } catch (error) {
    logger.error('Error seeding legal cases', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedLegalCases()
    .then(() => {
      logger.info('Seed completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seed failed', { error });
      process.exit(1);
    });
}

