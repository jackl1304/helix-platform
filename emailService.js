import { Logger } from './logger.service';

class EmailService {
    constructor() {
        this.logger = new Logger('EmailService');
    }

    /**
     * Simuliert das Senden einer E-Mail.
     * In einer echten Anwendung würde hier die Logik für einen E-Mail-Provider (z.B. SendGrid, Nodemailer) stehen.
     * @param {string} to - Die E-Mail-Adresse des Empfängers.
     * @param {string} subject - Der Betreff der E-Mail.
     * @param {string} body - Der Inhalt der E-Mail.
     * @returns {Promise<void>}
     */
    async sendEmail(to, subject, body) {
        this.logger.info(`--- SIMULATING EMAIL SEND ---`);
        this.logger.info(`To: ${to}`);
        this.logger.info(`Subject: ${subject}`);
        this.logger.info(`Body: \n${body}`);
        this.logger.info(`-----------------------------`);
        return Promise.resolve();
    }
}

export const emailService = new EmailService();
