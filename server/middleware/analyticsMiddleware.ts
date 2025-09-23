import { Request, Response, NextFunction } from "express";
import { apiLogger, LoggingUtils } from '../utils/logger';
import { db } from "../db.js";
import { websiteAnalytics } from "../../shared/schema";
import { UAParser } from "ua-parser-js";

interface AnalyticsRequest extends Request {
  tenantId?: string;
  user?: {
    id: string;
    username: string;
  };
  sessionId?: string;
}

// Utility-Funktion zum Erkennen von Browser/Device/OS
function parseUserAgent(userAgent: string) {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();
  
  return {
    browser: `${result.browser.name} ${result.browser.version}`,
    device: result.device.model || result.device.type || 'Desktop',
    os: `${result.os.name} ${result.os.version}`
  };
}

// Vereinfachte IP-Geolocation (könnte erweitert werden)
function getLocationFromIP(ip: string) {
  // Für Production könnte hier eine echte Geolocation-API verwendet werden
  if (ip.startsWith('127.') || ip === '::1' || ip.startsWith('192.168.')) {
    return { country: 'Deutschland', city: 'Lokal' };
  }
  return { country: 'Unbekannt', city: 'Unbekannt' };
}

export const analyticsMiddleware = async (
  req: AnalyticsRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Nur HTML-Seiten und API-Aufrufe tracken, nicht Assets
    if (
      req.path.includes('/assets/') ||
      req.path.includes('.css') ||
      req.path.includes('.js') ||
      req.path.includes('.ico') ||
      req.path.includes('.png') ||
      req.path.includes('.jpg') ||
      req.path.includes('.svg') ||
      req.path.includes('/api/health')
    ) {
      return next();
    }

    // User-Agent parsen
    const userAgent = req.get('User-Agent') || '';
    const { browser, device, os } = parseUserAgent(userAgent);
    
    // IP-Adresse ermitteln
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const { country, city } = getLocationFromIP(ipAddress);
    
    // Session-ID aus Session oder generieren
    const sessionId = req.session?.id || `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    // Analytics-Eintrag erstellen
    await db.insert(websiteAnalytics).values({
      tenantId: req.tenantId || null,
      userId: req.user?.id || null,
      sessionId,
      page: req.path,
      userAgent,
      ipAddress,
      country,
      city,
      device,
      browser,
      os,
      referrer: req.get('Referer') || null,
      utm_source: req.query.utm_source as string || null,
      utm_medium: req.query.utm_medium as string || null,
      utm_campaign: req.query.utm_campaign as string || null,
    });

    // Füge Session-ID zum Request hinzu falls nicht vorhanden
    if (!req.sessionId) {
      req.sessionId = sessionId;
    }

    next();
  } catch (error) {
    // Analytics-Fehler sollen die Anwendung nicht beeinträchtigen
    logger.error('[Analytics] Fehler beim Tracking:', error);
    next();
  }
};