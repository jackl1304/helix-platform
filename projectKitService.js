import { Logger } from './logger.service';
import { storage } from '../storage';
import { emailService } from './emailService';
import { v4 as uuidv4 } from 'uuid';

export class ProjectKitService {
    constructor() {
        this.logger = new Logger('ProjectKitService');
        this.currentUser = 'current.user@example.com'; // Annahme: Es gibt einen angemeldeten Benutzer
    }

    /**
     * Generiert ein komplettes "Regulatory Project Kit" basierend auf einer Produktidee.
     * @param productIdea - Die vom Entwickler eingegebene Produktidee.
     * @param targetRegion - Die Zielregion (z.B. 'EU', 'US', 'Global').
     * @returns Ein strukturiertes Projekt-Kit-Objekt.
     */
    async generateProjectKit(productIdea, targetRegion = 'Global') {
        this.logger.info(`Generating new Regulatory Project Kit for: "${productIdea}" in region: ${targetRegion}`);

        // 1. Analysiere die Produktidee und extrahiere Schlüsselwörter
        const keywords = this.analyzeProductIdea(productIdea);

        // 2. Suche nach relevanten Daten in der gesamten Plattform
        const relevantApprovals = await storage.findApprovalsByKeywords(keywords, 10);
        const relevantArticles = await storage.findKnowledgeArticlesByKeywords(keywords, 5);

        // 3. Bestimme die wahrscheinliche Geräteklasse und den regulatorischen Pfad
        const { deviceClass, regulatoryPathway } = this.determineRegulatoryProfile(relevantApprovals);

        // 4. Generiere Zeit- & Kostenabschätzung
        const estimation = this.estimateTimeAndCost(deviceClass, regulatoryPathway);

        // 5. Generiere die erforderlichen Dokumentvorlagen
        const documentTemplates = this.generateDocumentTemplates(deviceClass, targetRegion, productIdea, relevantApprovals);

        // 6. Erstelle eine zusammenfassende Analyse
        const summary = this.createExecutiveSummary(productIdea, deviceClass, regulatoryPathway, relevantApprovals, estimation);

        const projectKit = {
            id: `proj-kit-${Date.now()}`,
            owner: this.currentUser,
            sharedWith: [],
            activityLog: [],
            productIdea,
            createdAt: new Date().toISOString(),
            summary,
            regulatoryProfile: {
                targetRegion,
                estimatedDeviceClass: deviceClass,
                likelyRegulatoryPathway: regulatoryPathway,
            },
            estimation,
            documentTemplates,
            supportingData: {
                relevantApprovals: relevantApprovals.map(a => ({ id: a.id, title: a.title, authority: a.authority })),
                relevantKnowledgeArticles: relevantArticles.map(a => ({ id: a.id, title: a.title, category: a.category })),
            },
        };

        // NEU: Speichere das generierte Kit
        await this.saveProjectKit(projectKit);
        this._logActivity(projectKit, `Projekt-Kit erstellt.`, this.currentUser);

        this.logger.info(`Successfully generated and saved Project Kit: ${projectKit.id}`);
        return projectKit;
    }

    async saveProjectKit(kit) {
        // Annahme: storage.js hat eine Methode zum Speichern
        if (!storage.projectNotebook) {
            storage.projectNotebook = [];
        }
        storage.projectNotebook.unshift(kit); // Oben einfügen
        this.logger.info(`Saved kit "${kit.productIdea}" to notebook.`);
    }

    async getProjectKits() {
        return storage.projectNotebook || [];
    }

    async deleteProjectKit(kitId) {
        storage.projectNotebook = (storage.projectNotebook || []).filter(kit => kit.id !== kitId);
        this.logger.info(`Deleted kit with id: ${kitId}`);
        return true;
    }

    async updateDocumentStatus(kitId, documentId, status) {
        const kit = (storage.projectNotebook || []).find(k => k.id === kitId);
        if (!kit) return false;

        const document = kit.documentTemplates.find(d => d.id === documentId);
        if (!document) return false;

        document.status = status;
        this.logger.info(`Updated status of document ${documentId} in kit ${kitId} to ${status.name}`);
        this._logActivity(kit, `Status von "${document.title}" zu "${status.name}" geändert.`, this.currentUser);
        return kit;
    }

    async addCommentToDocument(kitId, documentId, commentData, attachment) {
        const kit = (storage.projectNotebook || []).find(k => k.id === kitId);
        if (!kit) return null;

        const document = kit.documentTemplates.find(d => d.id === documentId);
        if (!document) return null;

        if (!document.comments) {
            document.comments = [];
        }

        const newComment = {
            id: `comment-${uuidv4()}`,
            ...commentData,
            createdAt: new Date().toISOString(),
            attachment: attachment || null
        };
        document.comments.push(newComment);

        let logMessage = `Kommentar zu "${document.title}" hinzugefügt.`;
        if (attachment) logMessage += ` Mit Anhang: "${attachment.fileName}".`;
        this._logActivity(kit, logMessage, this.currentUser);
        return kit;
    }

    async shareProjectKit(kitId, email) {
        const kit = (storage.projectNotebook || []).find(k => k.id === kitId);
        if (!kit) return false;

        if (!kit.sharedWith.includes(email)) {
            kit.sharedWith.push(email);
            this._logActivity(kit, `Projekt geteilt mit ${email}.`, this.currentUser);

            // NEU: E-Mail-Benachrichtigung senden
            const subject = `Ein Projekt wurde mit Ihnen geteilt: ${kit.productIdea}`;
            const body = `
                Hallo,

                der Benutzer ${kit.owner} hat das Projekt-Kit "${kit.productIdea}" mit Ihnen auf der Helix-Plattform geteilt.

                Sie können es jetzt in Ihrer Projektmappe einsehen.

                Viele Grüße,
                Ihr Helix-Team
            `;
            await emailService.sendEmail(email, subject, body);
        }

        return true;
    }

    _logActivity(kit, message, user) {
        if (!kit.activityLog) {
            kit.activityLog = [];
        }
        kit.activityLog.unshift({
            id: `log-${uuidv4()}`,
            message, user, timestamp: new Date().toISOString()
        });
    }
    /**
     * Analysiert die Produktidee und extrahiert relevante Schlüsselwörter.
     * @param idea - Die Produktidee.
     * @returns Ein Array von Schlüsselwörtern.
     */
    analyzeProductIdea(idea) {
        const commonWords = new Set(['ein', 'eine', 'für', 'und', 'mit', 'als', 'von', 'zu']);
        const keywords = idea.toLowerCase()
            .replace(/[^a-z0-9äöüß\s-]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 2 && !commonWords.has(word));

        // Füge branchenspezifische Begriffe hinzu
        if (idea.includes('kardio')) keywords.push('cardiovascular');
        if (idea.includes('orthopäd')) keywords.push('orthopedic');
        if (idea.includes('ki') || idea.includes('ai')) keywords.push('ai', 'software', 'samd');

        return [...new Set(keywords)];
    }

    /**
     * Bestimmt die wahrscheinliche Geräteklasse und den Zulassungsweg.
     * @param approvals - Relevante, bereits existierende Zulassungen.
     * @returns Ein Objekt mit Geräteklasse und Zulassungsweg.
     */
    determineRegulatoryProfile(approvals) {
        if (approvals.length === 0) {
            return { deviceClass: 'IIa (geschätzt)', regulatoryPathway: 'Standard Conformity Assessment (MDR)' };
        }
        // Simple Logik: Nehme die häufigste Klasse aus ähnlichen Produkten
        const classCounts = approvals.reduce((acc, curr) => {
            const dc = curr.deviceClass || 'Unbekannt';
            acc[dc] = (acc[dc] || 0) + 1;
            return acc;
        }, {});

        const dominantClass = Object.keys(classCounts).reduce((a, b) => classCounts[a] > classCounts[b] ? a : b);
        const pathway = dominantClass.includes('III') || dominantClass.includes('PMA') ? 'PMA / Notified Body Opinion' : '510(k) / CE-Zertifizierung nach MDR';

        return { deviceClass: dominantClass, regulatoryPathway: pathway };
    }

    /**
     * Generiert eine Liste von notwendigen Dokumentvorlagen.
     * @param deviceClass - Die geschätzte Geräteklasse.
     * @param region - Die Zielregion.
     * @param productIdea - Die Produktidee zur Personalisierung.
     * @returns Ein Array von Dokumentvorlagen.
     */
    generateDocumentTemplates(deviceClass, region, productIdea, relevantApprovals) {
        const potentialRisks = this._extractRisksFromApprovals(relevantApprovals);
        const generationDate = new Date().toLocaleDateString('de-DE');
        const context = {
            PRODUCT_NAME: productIdea,
            DEVICE_CLASS: deviceClass,
            DATE: generationDate,
            REGION: region,
            RELEVANT_APPROVALS: relevantApprovals,
            POTENTIAL_RISKS: potentialRisks,
        };

        const templates = [
            {
                id: 'doc_product_spec',
                title: `Produktspezifikation für "${productIdea}"`,
                category: 'Planung',
                status: { id: 'todo', name: 'To Do' },
                content: this._getTemplateContent('product_spec', context),
                comments: []
            },
            {
                id: 'doc_risk_management',
                title: 'Risikomanagement-Plan (ISO 14971)',
                category: 'Sicherheit',
                status: { id: 'todo', name: 'To Do' },
                content: this._getTemplateContent('risk_management', context),
                comments: []
            },
            {
                id: 'doc_clinical_eval',
                title: 'Plan für die klinische Bewertung (MDR)',
                category: 'Klinik',
                status: { id: 'todo', name: 'To Do' },
                content: this._getTemplateContent('clinical_eval', context),
                comments: []
            },
            {
                id: 'doc_tech_doc',
                title: 'Technische Dokumentation (MDR Anhang II & III)',
                category: 'Dokumentation',
                status: { id: 'todo', name: 'To Do' },
                content: this._getTemplateContent('tech_doc', context),
                comments: []
            },
        ];

        if (deviceClass.includes('IIb') || deviceClass.includes('III')) {
            templates.push({ id: 'doc_pms_plan', title: 'Post-Market Surveillance (PMS) Plan', category: 'Post-Market', status: { id: 'todo', name: 'To Do' }, content: this._getTemplateContent('pms_plan', context), comments: [] });
        }
        if (productIdea.toLowerCase().includes('software') || productIdea.toLowerCase().includes('ki')) {
            templates.push({ id: 'doc_software_lifecycle', title: 'Software-Lebenszyklus-Prozess (IEC 62304)', category: 'Software', status: { id: 'todo', name: 'To Do' }, content: this._getTemplateContent('software_lifecycle', context), comments: [] });
        }

        return templates;
    }

    /**
     * Erstellt eine Management-Zusammenfassung für das Projekt-Kit.
     */
    createExecutiveSummary(productIdea, deviceClass, regulatoryPathway, approvals, estimation) {
        return `Executive Summary für das Projekt: "${productIdea}".
        - **Zielmarkt:** Global, mit Fokus auf EU/US.
        - **Geschätzte Geräteklasse:** ${deviceClass}. Dies basiert auf ${approvals.length} ähnlichen, bereits zugelassenen Produkten.
        - **Wahrscheinlicher Zulassungsweg:** ${regulatoryPathway}.
        - **Geschätzter Zeitrahmen:** ${estimation.estimatedTime}.
        - **Geschätzte Kosten (Zulassung):** ${estimation.estimatedCost}.
        - **Kritische Erfolgsfaktoren:** Eine robuste klinische Bewertung und ein lückenloser Risikomanagement-Plan sind entscheidend.
        - **Empfehlung:** Beginnen Sie mit der Ausarbeitung der bereitgestellten Dokumentvorlagen, insbesondere der Produktspezifikation und des Risikomanagement-Plans.`;
    }

    /**
     * Generiert eine vorläufige Zeit- und Kostenabschätzung.
     * @param deviceClass - Die geschätzte Geräteklasse.
     * @param regulatoryPathway - Der wahrscheinliche Zulassungsweg.
     * @returns Ein Objekt mit Zeit- und Kostenschätzungen.
     */
    estimateTimeAndCost(deviceClass, regulatoryPathway) {
        let baseTime = 12; // Monate
        let baseCost = 50000; // EUR

        if (deviceClass.includes('IIa')) {
            baseTime = 12; baseCost = 75000;
        } else if (deviceClass.includes('IIb')) {
            baseTime = 18; baseCost = 150000;
        } else if (deviceClass.includes('III') || deviceClass.includes('PMA')) {
            baseTime = 36; baseCost = 500000;
        } else if (deviceClass.includes('I')) {
            baseTime = 6; baseCost = 25000;
        }

        // Füge Varianz hinzu
        const timeVariance = baseTime * 0.25;
        const costVariance = baseCost * 0.3;

        const estimatedTime = `${Math.round(baseTime - timeVariance)}-${Math.round(baseTime + timeVariance)} Monate`;
        const estimatedCost = `${(baseCost - costVariance).toLocaleString('de-DE')} - ${(baseCost + costVariance).toLocaleString('de-DE')} EUR`;

        return {
            estimatedTime,
            estimatedCost,
            criticalFactors: "Kosten und Zeitrahmen sind stark von der Qualität der Technischen Dokumentation, der Notwendigkeit klinischer Studien und der Auslastung der Benannten Stellen abhängig."
        };
    }

    /**
     * Stellt vorausgefüllte Inhalte für Dokumentvorlagen bereit.
     * @param templateId - Die ID der Vorlage.
     * @param context - Das Kontextobjekt mit den zu ersetzenden Werten.
     * @returns Den vorausgefüllten Inhalt als String.
     */
    _getTemplateContent(templateId, context) {
        const templates = {
            product_spec: `
# Produktspezifikation
- **Produktname:** ${context.PRODUCT_NAME}
- **Datum:** ${context.DATE}
- **Version:** 1.0
- **Zweckbestimmung:** [Zweckbestimmung hier einfügen]
- **Ziel-Geräteklasse:** ${context.DEVICE_CLASS}
            `,
            risk_management: `
# Risikomanagement-Plan (nach ISO 14971)
- **Produkt:** ${context.PRODUCT_NAME}
- **Datum:** ${context.DATE}
- **Geltungsbereich:** Dieser Plan deckt den gesamten Lebenszyklus des Produkts ab.
- **Verantwortlichkeiten:** [Rollen und Verantwortlichkeiten hier definieren]

### Potenzielle Risiken (basierend auf ähnlichen Produkten)
${context.POTENTIAL_RISKS.length > 0
    ? context.POTENTIAL_RISKS.map(risk => `- ${risk}`).join('\n')
    : "- Keine spezifischen Risiken aus den analysierten Daten extrahiert. Beginnen Sie mit einer Standard-Gefährdungsanalyse."
}

[Weitere Risiken hier identifizieren und bewerten]
            `,
            software_lifecycle: `
# Software-Lebenszyklus-Prozess (nach IEC 62304)
- **Produkt:** ${context.PRODUCT_NAME}
- **Datum:** ${context.DATE}
- **Software-Sicherheitsklassifizierung:** [Klasse A/B/C basierend auf Risikoanalyse festlegen]
            `,
            clinical_eval: `
# Plan für die klinische Bewertung (gemäß MDR)
- **Produkt:** ${context.PRODUCT_NAME}
- **Datum:** ${context.DATE}
- **Umfang der Bewertung:** [Umfang und Methode der klinischen Bewertung hier beschreiben]
            `,
            default: `Dieses Dokument wurde am ${context.DATE} für das Produkt "${context.PRODUCT_NAME}" generiert.`
        };
        return (templates[templateId] || templates.default).trim();
    }

    /**
     * Extrahiert eine Liste potenzieller Risiken aus den Daten ähnlicher Zulassungen.
     * @param {Array} approvals - Eine Liste von Zulassungsobjekten.
     * @returns {Array<string>} Eine Liste von identifizierten Risikobeschreibungen.
     */
    _extractRisksFromApprovals(approvals) {
        const riskSet = new Set();
        if (!approvals) return [];

        approvals.forEach(approval => {
            const riskText = approval.detailedAnalysis?.riskAssessment;
            if (riskText) {
                // Heuristik: Suche nach Aufzählungszeichen, die oft für Risikolisten verwendet werden.
                const lines = riskText.split('\n');
                lines.forEach(line => {
                    const trimmedLine = line.trim();
                    if (trimmedLine.startsWith('-') || trimmedLine.startsWith('*') || trimmedLine.startsWith('•')) {
                        const risk = trimmedLine.substring(1).trim().replace(/^Risiko: /i, '');
                        if (risk.length > 10) { // Nur aussagekräftige Risiken hinzufügen
                            riskSet.add(risk);
                        }
                    }
                });
            }
        });

        return Array.from(riskSet);
    }
}

export const projectKitService = new ProjectKitService();
