import { db } from "../db.js";
import { websiteAnalytics } from "../../shared/schema";
import { UAParser } from "ua-parser-js";
function parseUserAgent(userAgent) {
    const parser = new UAParser(userAgent);
    const result = parser.getResult();
    return {
        browser: `${result.browser.name} ${result.browser.version}`,
        device: result.device.model || result.device.type || 'Desktop',
        os: `${result.os.name} ${result.os.version}`
    };
}
function getLocationFromIP(ip) {
    if (ip.startsWith('127.') || ip === '::1' || ip.startsWith('192.168.')) {
        return { country: 'Deutschland', city: 'Lokal' };
    }
    return { country: 'Unbekannt', city: 'Unbekannt' };
}
export const analyticsMiddleware = async (req, res, next) => {
    try {
        if (req.path.includes('/assets/') ||
            req.path.includes('.css') ||
            req.path.includes('.js') ||
            req.path.includes('.ico') ||
            req.path.includes('.png') ||
            req.path.includes('.jpg') ||
            req.path.includes('.svg') ||
            req.path.includes('/api/health')) {
            return next();
        }
        const userAgent = req.get('User-Agent') || '';
        const { browser, device, os } = parseUserAgent(userAgent);
        const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
        const { country, city } = getLocationFromIP(ipAddress);
        const sessionId = req.session?.id || `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
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
            utm_source: req.query.utm_source || null,
            utm_medium: req.query.utm_medium || null,
            utm_campaign: req.query.utm_campaign || null,
        });
        if (!req.sessionId) {
            req.sessionId = sessionId;
        }
        next();
    }
    catch (error) {
        console.error('[Analytics] Fehler beim Tracking:', error);
        next();
    }
};
//# sourceMappingURL=analyticsMiddleware.js.map