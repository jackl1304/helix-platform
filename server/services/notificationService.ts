/**
 * Notification Service für Helix Platform
 * Implementiert E-Mail, Push und In-App-Benachrichtigungen
 */

import { Logger } from './logger.service';
import { neon } from '@neondatabase/serverless';

interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  variables: string[];
}

interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
  categories: string[];
}

interface NotificationData {
  userId: string;
  tenantId: string;
  type: 'regulatory_update' | 'legal_case' | 'system' | 'security' | 'newsletter';
  title: string;
  message: string;
  data?: any;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  templateId?: string;
  templateVariables?: Record<string, any>;
}

export class NotificationService {
  private static instance: NotificationService;
  private logger = new Logger('NotificationService');
  private sql = neon(process.env.DATABASE_URL!);
  private templates: Map<string, NotificationTemplate> = new Map();

  private constructor() {
    this.initializeTemplates();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Initialisiert Notification-Templates
   */
  private initializeTemplates() {
    const templates: NotificationTemplate[] = [
      {
        id: 'regulatory_update',
        name: 'Regulatory Update Notification',
        subject: 'Neues Regulatory Update: {{title}}',
        htmlBody: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Neues Regulatory Update</h2>
            <h3>{{title}}</h3>
            <p><strong>Quelle:</strong> {{source}}</p>
            <p><strong>Region:</strong> {{region}}</p>
            <p><strong>Priorität:</strong> {{priority}}</p>
            <p>{{summary}}</p>
            <a href="{{url}}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Update ansehen</a>
          </div>
        `,
        textBody: `
          Neues Regulatory Update: {{title}}
          
          Quelle: {{source}}
          Region: {{region}}
          Priorität: {{priority}}
          
          {{summary}}
          
          Link: {{url}}
        `,
        variables: ['title', 'source', 'region', 'priority', 'summary', 'url']
      },
      {
        id: 'legal_case',
        name: 'Legal Case Notification',
        subject: 'Neuer Legal Case: {{title}}',
        htmlBody: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Neuer Legal Case</h2>
            <h3>{{title}}</h3>
            <p><strong>Gericht:</strong> {{court}}</p>
            <p><strong>Jurisdiktion:</strong> {{jurisdiction}}</p>
            <p><strong>Entscheidungsdatum:</strong> {{decisionDate}}</p>
            <p><strong>Impact Level:</strong> {{impactLevel}}</p>
            <p>{{summary}}</p>
            <a href="{{url}}" style="background-color: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Case ansehen</a>
          </div>
        `,
        textBody: `
          Neuer Legal Case: {{title}}
          
          Gericht: {{court}}
          Jurisdiktion: {{jurisdiction}}
          Entscheidungsdatum: {{decisionDate}}
          Impact Level: {{impactLevel}}
          
          {{summary}}
          
          Link: {{url}}
        `,
        variables: ['title', 'court', 'jurisdiction', 'decisionDate', 'impactLevel', 'summary', 'url']
      },
      {
        id: 'security_alert',
        name: 'Security Alert',
        subject: 'Sicherheitswarnung: {{title}}',
        htmlBody: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #dc2626; padding: 20px;">
            <h2 style="color: #dc2626;">🚨 SICHERHEITSWARNUNG</h2>
            <h3>{{title}}</h3>
            <p><strong>Zeit:</strong> {{timestamp}}</p>
            <p><strong>IP-Adresse:</strong> {{ipAddress}}</p>
            <p><strong>User Agent:</strong> {{userAgent}}</p>
            <p>{{message}}</p>
            <p style="color: #dc2626; font-weight: bold;">Bitte überprüfen Sie sofort Ihre Sicherheitseinstellungen!</p>
          </div>
        `,
        textBody: `
          🚨 SICHERHEITSWARNUNG: {{title}}
          
          Zeit: {{timestamp}}
          IP-Adresse: {{ipAddress}}
          User Agent: {{userAgent}}
          
          {{message}}
          
          Bitte überprüfen Sie sofort Ihre Sicherheitseinstellungen!
        `,
        variables: ['title', 'timestamp', 'ipAddress', 'userAgent', 'message']
      }
    ];

    templates.forEach(template => {
      this.templates.set(template.id, template);
    });

    this.logger.info('Notification templates initialized', { count: templates.length });
  }

  /**
   * Sendet eine Benachrichtigung
   */
  async sendNotification(notification: NotificationData): Promise<boolean> {
    try {
      this.logger.info('Sending notification', {
        userId: notification.userId,
        type: notification.type,
        priority: notification.priority
      });

      // Hole User-Präferenzen
      const preferences = await this.getUserPreferences(notification.userId);
      
      // Speichere In-App-Benachrichtigung
      await this.saveInAppNotification(notification);

      // Sende E-Mail falls aktiviert
      if (preferences.email && this.shouldSendEmail(notification, preferences)) {
        await this.sendEmail(notification);
      }

      // Sende Push-Benachrichtigung falls aktiviert
      if (preferences.push && this.shouldSendPush(notification, preferences)) {
        await this.sendPush(notification);
      }

      return true;
    } catch (error) {
      this.logger.error('Notification send error', {
        userId: notification.userId,
        type: notification.type,
        error: (error as Error).message
      });
      return false;
    }
  }

  /**
   * Sendet Bulk-Benachrichtigungen
   */
  async sendBulkNotifications(notifications: NotificationData[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    // Verarbeite in Batches von 10
    const batchSize = 10;
    for (let i = 0; i < notifications.length; i += batchSize) {
      const batch = notifications.slice(i, i + batchSize);
      const promises = batch.map(notification => this.sendNotification(notification));
      
      try {
        const results = await Promise.allSettled(promises);
        results.forEach(result => {
          if (result.status === 'fulfilled' && result.value) {
            success++;
          } else {
            failed++;
          }
        });
      } catch (error) {
        this.logger.error('Bulk notification batch error', {
          batchIndex: Math.floor(i / batchSize),
          error: (error as Error).message
        });
        failed += batch.length;
      }
    }

    this.logger.info('Bulk notifications completed', { success, failed });
    return { success, failed };
  }

  /**
   * Sendet Regulatory Update-Benachrichtigungen
   */
  async notifyRegulatoryUpdate(
    update: any,
    targetUsers: string[],
    tenantId: string
  ): Promise<void> {
    const notifications: NotificationData[] = targetUsers.map(userId => ({
      userId,
      tenantId,
      type: 'regulatory_update',
      title: update.title,
      message: update.description || update.summary,
      data: {
        updateId: update.id,
        source: update.source_id,
        region: update.jurisdiction,
        priority: update.priority
      },
      priority: this.mapPriority(update.priority),
      templateId: 'regulatory_update',
      templateVariables: {
        title: update.title,
        source: update.source_id,
        region: update.jurisdiction,
        priority: update.priority,
        summary: update.description || update.summary,
        url: `${process.env.FRONTEND_URL}/regulatory-updates/${update.id}`
      }
    }));

    await this.sendBulkNotifications(notifications);
  }

  /**
   * Sendet Legal Case-Benachrichtigungen
   */
  async notifyLegalCase(
    legalCase: any,
    targetUsers: string[],
    tenantId: string
  ): Promise<void> {
    const notifications: NotificationData[] = targetUsers.map(userId => ({
      userId,
      tenantId,
      type: 'legal_case',
      title: legalCase.title,
      message: legalCase.summary,
      data: {
        caseId: legalCase.id,
        court: legalCase.court,
        jurisdiction: legalCase.jurisdiction
      },
      priority: this.mapImpactLevel(legalCase.impactLevel),
      templateId: 'legal_case',
      templateVariables: {
        title: legalCase.title,
        court: legalCase.court,
        jurisdiction: legalCase.jurisdiction,
        decisionDate: legalCase.decisionDate,
        impactLevel: legalCase.impactLevel,
        summary: legalCase.summary,
        url: `${process.env.FRONTEND_URL}/legal-cases/${legalCase.id}`
      }
    }));

    await this.sendBulkNotifications(notifications);
  }

  /**
   * Sendet Sicherheitswarnungen
   */
  async notifySecurityAlert(
    alert: {
      title: string;
      message: string;
      ipAddress?: string;
      userAgent?: string;
      userId?: string;
    },
    tenantId: string
  ): Promise<void> {
    const notification: NotificationData = {
      userId: alert.userId || 'system',
      tenantId,
      type: 'security',
      title: alert.title,
      message: alert.message,
      priority: 'urgent',
      templateId: 'security_alert',
      templateVariables: {
        title: alert.title,
        timestamp: new Date().toISOString(),
        ipAddress: alert.ipAddress || 'unknown',
        userAgent: alert.userAgent || 'unknown',
        message: alert.message
      }
    };

    await this.sendNotification(notification);
  }

  /**
   * Holt User-Präferenzen
   */
  private async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      const result = await this.sql`
        SELECT notification_preferences FROM users WHERE id = ${userId}
      `;

      if (result[0]?.notification_preferences) {
        return JSON.parse(result[0].notification_preferences);
      }

      // Default-Präferenzen
      return {
        email: true,
        push: false,
        inApp: true,
        frequency: 'immediate',
        categories: ['regulatory_update', 'legal_case', 'security']
      };
    } catch (error) {
      this.logger.error('Get user preferences error', { userId, error: (error as Error).message });
      return {
        email: true,
        push: false,
        inApp: true,
        frequency: 'immediate',
        categories: ['regulatory_update', 'legal_case', 'security']
      };
    }
  }

  /**
   * Speichert In-App-Benachrichtigung
   */
  private async saveInAppNotification(notification: NotificationData): Promise<void> {
    try {
      await this.sql`
        INSERT INTO notifications (
          user_id, tenant_id, type, title, message, data, priority, created_at
        ) VALUES (
          ${notification.userId},
          ${notification.tenantId},
          ${notification.type},
          ${notification.title},
          ${notification.message},
          ${JSON.stringify(notification.data || {})},
          ${notification.priority},
          NOW()
        )
      `;
    } catch (error) {
      this.logger.error('Save in-app notification error', {
        userId: notification.userId,
        error: (error as Error).message
      });
    }
  }

  /**
   * Sendet E-Mail
   */
  private async sendEmail(notification: NotificationData): Promise<void> {
    try {
      // Hier würde die E-Mail-Logik implementiert werden
      // Z.B. mit SendGrid, Nodemailer, etc.
      
      this.logger.info('Email notification sent', {
        userId: notification.userId,
        type: notification.type,
        templateId: notification.templateId
      });
    } catch (error) {
      this.logger.error('Email send error', {
        userId: notification.userId,
        error: (error as Error).message
      });
    }
  }

  /**
   * Sendet Push-Benachrichtigung
   */
  private async sendPush(notification: NotificationData): Promise<void> {
    try {
      // Hier würde die Push-Notification-Logik implementiert werden
      // Z.B. mit Firebase, OneSignal, etc.
      
      this.logger.info('Push notification sent', {
        userId: notification.userId,
        type: notification.type
      });
    } catch (error) {
      this.logger.error('Push send error', {
        userId: notification.userId,
        error: (error as Error).message
      });
    }
  }

  /**
   * Prüft ob E-Mail gesendet werden soll
   */
  private shouldSendEmail(notification: NotificationData, preferences: NotificationPreferences): boolean {
    if (!preferences.email) return false;
    if (!preferences.categories.includes(notification.type)) return false;
    
    // Urgent Notifications immer senden
    if (notification.priority === 'urgent') return true;
    
    // Weitere Logik basierend auf Frequenz-Einstellungen
    return true;
  }

  /**
   * Prüft ob Push gesendet werden soll
   */
  private shouldSendPush(notification: NotificationData, preferences: NotificationPreferences): boolean {
    if (!preferences.push) return false;
    if (!preferences.categories.includes(notification.type)) return false;
    
    // Push nur für wichtige Benachrichtigungen
    return ['high', 'urgent'].includes(notification.priority);
  }

  /**
   * Mappt Priorität
   */
  private mapPriority(priority: string): 'low' | 'medium' | 'high' | 'urgent' {
    switch (priority?.toLowerCase()) {
      case 'critical':
      case 'urgent':
        return 'urgent';
      case 'high':
        return 'high';
      case 'medium':
        return 'medium';
      default:
        return 'low';
    }
  }

  /**
   * Mappt Impact Level
   */
  private mapImpactLevel(impactLevel: string): 'low' | 'medium' | 'high' | 'urgent' {
    switch (impactLevel?.toLowerCase()) {
      case 'critical':
        return 'urgent';
      case 'high':
        return 'high';
      case 'medium':
        return 'medium';
      default:
        return 'low';
    }
  }
}

// Singleton-Instanz
export const notificationService = NotificationService.getInstance();
