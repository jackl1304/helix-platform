interface ChecklistItem {
  key: string;
  task: string;
  description?: string;
}

const checklists: Record<string, Record<string, ChecklistItem[]>> = {
  'EU': {
    'Class I': [
      { key: 'compliance:mdr_conformity', task: 'Konformitätserklärung nach MDR ausstellen', description: 'Hersteller erklärt, dass das Produkt den grundlegenden Sicherheits- und Leistungsanforderungen der MDR entspricht.' },
      { key: 'compliance:tech_doc_basic', task: 'Technische Dokumentation (Basis) erstellen', description: 'Grundlegende technische Dokumentation gemäß MDR Anhang II und III zur Demonstration der Konformität.' },
      { key: 'compliance:udi_registration', task: 'UDI-Registrierung durchführen', description: 'Registrierung der Unique Device Identification (UDI) in der EUDAMED-Datenbank zur eindeutigen Identifizierung des Produkts.' },
    ],
    'Class IIa': [
      { key: 'compliance:mdr_annex_ii_iii', task: 'Technische Dokumentation nach MDR Anhang II & III erstellen', description: 'Umfassende technische Dokumentation, die den gesamten Lebenszyklus des Produkts abdeckt, einschließlich Design, Herstellung und Leistungsdaten.' },
      { key: 'compliance:qms_iso_13485', task: 'QMS nach ISO 13485 etablieren', description: 'Implementierung eines Qualitätsmanagementsystems (QMS), das die Anforderungen der harmonisierten Norm ISO 13485 erfüllt.' },
      { key: 'compliance:notified_body_selection', task: 'Benannte Stelle auswählen und auditieren lassen', description: 'Auswahl einer Benannten Stelle und erfolgreiche Durchführung des Konformitätsbewertungsverfahrens (z.B. Audit nach Anhang IX).' },
      { key: 'compliance:clinical_evaluation_meddev', task: 'Klinische Bewertung nach MEDDEV 2.7/1 Rev. 4 durchführen', description: 'Systematische Sammlung und Bewertung klinischer Daten, um die Sicherheit und Leistung des Produkts nachzuweisen.' },
      { key: 'compliance:udi_implementation', task: 'UDI-Anforderungen umsetzen', description: 'Implementierung des UDI-Systems auf Produkt, Verpackung und in der Lieferkette gemäß MDR-Vorgaben.' },
    ],
    'Class IIb': [
      { key: 'compliance:mdr_annex_ii_iii', task: 'Technische Dokumentation nach MDR Anhang II & III erstellen', description: 'Umfassende technische Dokumentation, die den gesamten Lebenszyklus des Produkts abdeckt.' },
      { key: 'compliance:qms_iso_13485', task: 'QMS nach ISO 13485 etablieren', description: 'Implementierung eines Qualitätsmanagementsystems (QMS), das die Anforderungen der harmonisierten Norm ISO 13485 erfüllt.' },
      { key: 'compliance:notified_body_audit', task: 'Audit durch Benannte Stelle (Annex IX oder X/XI)', description: 'Konformitätsbewertung durch eine Benannte Stelle, die das QMS und die technische Dokumentation prüft.' },
      { key: 'compliance:clinical_evaluation_mdr', task: 'Klinische Bewertung nach MDR Anhang XIV Teil A durchführen', description: 'Erweiterte klinische Bewertung gemäß den strengeren Anforderungen der MDR.' },
      { key: 'compliance:pmcf_plan', task: 'PMCF-Plan erstellen', description: 'Erstellung eines Plans zur proaktiven Überwachung der klinischen Leistung nach dem Inverkehrbringen (Post-Market Clinical Follow-up).' },
    ],
    'Class III': [
      { key: 'compliance:mdr_annex_ii_iii', task: 'Technische Dokumentation nach MDR Anhang II & III erstellen', description: 'Umfassende technische Dokumentation, die den gesamten Lebenszyklus des Produkts abdeckt.' },
      { key: 'compliance:qms_iso_13485', task: 'QMS nach ISO 13485 etablieren', description: 'Implementierung eines Qualitätsmanagementsystems (QMS), das die Anforderungen der harmonisierten Norm ISO 13485 erfüllt.' },
      { key: 'compliance:notified_body_audit_full', task: 'Umfassendes Audit durch Benannte Stelle (Annex IX)', description: 'Vollständige Prüfung des QMS und der technischen Dokumentation durch eine Benannte Stelle.' },
      { key: 'compliance:clinical_investigation', task: 'Klinische Prüfung nach MDR Anhang XV durchführen', description: 'Durchführung einer klinischen Prüfung zur Generierung von Sicherheits- und Leistungsdaten.' },
      { key: 'compliance:expert_panel_consultation', task: 'Ggf. Konsultation eines Expertenpanels (Scrutiny-Verfahren)', description: 'Bei bestimmten Hochrisikoprodukten ist eine zusätzliche Prüfung durch ein unabhängiges Expertenpanel erforderlich.' },
    ],
  },
  'US': {
    'Class I': [{ key: 'compliance:fda_registration', task: 'Establishment Registration and Device Listing bei der FDA', description: 'Registrierung des Herstellungsbetriebs und Listung des Produkts bei der US-amerikanischen Food and Drug Administration (FDA).' }],
    'Class II': [
      { key: 'compliance:fda_510k', task: 'Premarket Notification (510(k)) vorbereiten und einreichen', description: 'Nachweis der substanziellen Äquivalenz zu einem bereits legal vermarkteten Produkt (Predicate Device).' },
      { key: 'compliance:fda_qsr', task: 'QSR (21 CFR Part 820) Compliance sicherstellen', description: 'Einhaltung der Quality System Regulation (QSR), die die Anforderungen an das QMS für in den USA vertriebene Medizinprodukte festlegt.' },
      { key: 'compliance:fda_design_controls', task: 'Design Controls nach 21 CFR 820.30 implementieren', description: 'Implementierung eines systematischen Prozesses zur Steuerung des Produktdesigns, um sicherzustellen, dass die Anforderungen erfüllt werden.' },
    ],
    'Class III': [
      { key: 'compliance:fda_pma', task: 'Premarket Approval (PMA) vorbereiten und einreichen', description: 'Umfassender wissenschaftlicher und regulatorischer Nachweis der Sicherheit und Wirksamkeit des Produkts bei der FDA.' },
      { key: 'compliance:fda_qsr', task: 'QSR (21 CFR Part 820) Compliance sicherstellen', description: 'Einhaltung der Quality System Regulation (QSR), die die Anforderungen an das QMS für in den USA vertriebene Medizinprodukte festlegt.' },
      { key: 'compliance:fda_clinical_trials', task: 'Klinische Studien nach FDA-Vorgaben durchführen', description: 'Durchführung klinischer Studien gemäß den FDA-Vorschriften (Investigational Device Exemption, IDE), um die Sicherheit und Wirksamkeit nachzuweisen.' },
    ],
  },
};

export const complianceChecklistService = {
  generateForProject(region?: string, deviceClass?: string): ChecklistItem[] {
    if (!region || !deviceClass) return [];
    const regionChecklists = checklists[region];
    if (!regionChecklists) return [];

    // Find the most specific checklist available, falling back to less specific ones if needed.
    return regionChecklists[deviceClass] || regionChecklists['default'] || [];
  },
};
