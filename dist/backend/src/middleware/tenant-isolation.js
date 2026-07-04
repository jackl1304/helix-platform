import { z } from 'zod';
import { Logger } from '../services/logger.service';
const logger = new Logger('TenantIsolation');
const TenantSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1).max(100),
    subdomain: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
    colorScheme: z.string().default('blue'),
    subscriptionTier: z.enum(['basic', 'professional', 'enterprise']).default('basic'),
    settings: z.record(z.any()).default({})
});
const UserSchema = z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    name: z.string().min(1).max(100),
    role: z.enum(['admin', 'user', 'viewer']).default('user'),
    tenantId: z.string().uuid(),
    isActive: z.boolean().default(true)
});
export const tenantIsolationMiddleware = async (req, res, next) => {
    try {
        const startTime = Date.now();
        let tenantId = extractTenantId(req);
        if (!tenantId && req.method === 'GET') {
            logger.debug('No tenant ID found, using default tenant for public read access', {
                path: req.path,
                method: req.method
            });
            tenantId = 'demo-medical-tech';
        }
        if (!tenantId && req.method === 'GET') {
            tenantId = 'demo-medical-tech';
        }
        if (!tenantId) {
            logger.warn('No tenant ID found in request', {
                path: req.path,
                method: req.method,
                ip: req.ip
            });
            res.status(400).json({
                success: false,
                error: 'Tenant required',
                message: 'Tenant identification is required for this request'
            });
            return;
        }
        if (!isValidTenantId(tenantId)) {
            logger.warn('Invalid tenant ID format', {
                tenantId,
                path: req.path,
                method: req.method,
                ip: req.ip
            });
            res.status(400).json({
                error: 'Invalid tenant',
                message: 'Invalid tenant identification format'
            });
            return;
        }
        let tenant = null;
        try {
            tenant = await getTenantById(tenantId);
        }
        catch (error) {
            logger.error('Error fetching tenant', {
                error: error instanceof Error ? error.message : 'Unknown error',
                tenantId,
                path: req.path
            });
            if (req.method === 'GET') {
                tenantId = 'demo-medical-tech';
                tenant = await getTenantById(tenantId);
            }
        }
        if (!tenant) {
            if (req.method === 'GET') {
                logger.debug('Using default tenant for public read access', {
                    path: req.path,
                    method: req.method
                });
                tenantId = 'demo-medical-tech';
                tenant = await getTenantById(tenantId);
                if (!tenant) {
                    logger.error('Default tenant not found - this should not happen');
                    res.status(500).json({
                        error: 'Internal server error',
                        message: 'System configuration error'
                    });
                    return;
                }
            }
            else {
                logger.warn('Tenant not found', {
                    tenantId,
                    path: req.path,
                    method: req.method,
                    ip: req.ip
                });
                res.status(404).json({
                    error: 'Tenant not found',
                    message: 'The specified tenant does not exist'
                });
                return;
            }
        }
        if (!tenant.isActive) {
            logger.warn('Inactive tenant access attempt', {
                tenantId,
                path: req.path,
                method: req.method,
                ip: req.ip
            });
            res.status(403).json({
                error: 'Tenant inactive',
                message: 'This tenant account is currently inactive'
            });
            return;
        }
        req.tenant = tenant;
        req.tenantId = tenantId;
        logger.debug('Tenant isolation successful', {
            tenantId,
            tenantName: tenant.name,
            subscriptionTier: tenant.subscriptionTier,
            path: req.path,
            method: req.method,
            duration: Date.now() - startTime
        });
        next();
    }
    catch (error) {
        logger.error('Tenant isolation middleware error', {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            path: req.path,
            method: req.method,
            ip: req.ip
        });
        if (req.method === 'GET' && !res.headersSent) {
            logger.warn('Tenant isolation error on GET request, attempting to continue with default tenant');
            try {
                const defaultTenantId = 'demo-medical-tech';
                const defaultTenant = await getTenantById(defaultTenantId);
                if (defaultTenant) {
                    req.tenant = defaultTenant;
                    req.tenantId = defaultTenantId;
                    logger.debug('Using default tenant after error');
                    return next();
                }
            }
            catch (fallbackError) {
                logger.error('Failed to use default tenant fallback', {
                    error: fallbackError instanceof Error ? fallbackError.message : 'Unknown error'
                });
            }
        }
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: 'Failed to process tenant isolation'
            });
        }
    }
};
export const userAuthenticationMiddleware = async (req, res, next) => {
    try {
        const sessionUser = req.session?.user;
        if (!sessionUser) {
            logger.warn('Unauthenticated access attempt', {
                path: req.path,
                method: req.method,
                ip: req.ip
            });
            res.status(401).json({
                error: 'Authentication required',
                message: 'Valid authentication is required for this request'
            });
            return;
        }
        const user = sessionUser;
        if (!isValidUUID(user.id) || !isValidUUID(user.tenantId)) {
            logger.warn('Invalid user session data', {
                userId: user.id,
                tenantId: user.tenantId,
                path: req.path,
                method: req.method,
                ip: req.ip
            });
            res.status(401).json({
                error: 'Invalid session',
                message: 'User session is invalid'
            });
            return;
        }
        if (req.tenantId && user.tenantId !== req.tenantId) {
            logger.warn('Tenant mismatch in user session', {
                sessionTenantId: user.tenantId,
                requestTenantId: req.tenantId,
                userId: user.id,
                path: req.path,
                method: req.method,
                ip: req.ip
            });
            res.status(403).json({
                error: 'Tenant mismatch',
                message: 'User session tenant does not match request tenant'
            });
            return;
        }
        const userData = await getUserById(user.id);
        if (!userData || !userData.isActive) {
            logger.warn('Inactive or non-existent user access attempt', {
                userId: user.id,
                path: req.path,
                method: req.method,
                ip: req.ip
            });
            res.status(401).json({
                error: 'User inactive',
                message: 'User account is inactive or does not exist'
            });
            return;
        }
        req.user = userData;
        req.userId = user.id;
        logger.debug('User authentication successful', {
            userId: user.id,
            userEmail: user.email,
            userRole: user.role,
            tenantId: user.tenantId,
            path: req.path,
            method: req.method
        });
        next();
    }
    catch (error) {
        logger.error('User authentication middleware error', {
            error: error instanceof Error ? error.message : 'Unknown error',
            path: req.path,
            method: req.method,
            ip: req.ip
        });
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to process user authentication'
        });
    }
};
export const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            logger.warn('Role check failed - no user in request', {
                path: req.path,
                method: req.method,
                ip: req.ip
            });
            res.status(401).json({
                error: 'Authentication required',
                message: 'User authentication is required'
            });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            logger.warn('Insufficient permissions', {
                userId: req.user.id,
                userRole: req.user.role,
                requiredRoles: allowedRoles,
                path: req.path,
                method: req.method,
                ip: req.ip
            });
            res.status(403).json({
                error: 'Insufficient permissions',
                message: `Required role: ${allowedRoles.join(' or ')}`
            });
            return;
        }
        logger.debug('Role check passed', {
            userId: req.user.id,
            userRole: req.user.role,
            path: req.path,
            method: req.method
        });
        next();
    };
};
function extractTenantId(req) {
    const headerTenantId = req.headers['x-tenant-id'];
    if (headerTenantId) {
        return headerTenantId;
    }
    const hostHeader = req.headers.host;
    if (hostHeader) {
        const host = hostHeader.split(':')[0];
        if (host && host !== 'localhost' && host !== '127.0.0.1' && host !== '::1') {
            const segments = host.split('.');
            if (segments.length > 2) {
                const subdomain = segments[0];
                if (subdomain && subdomain !== 'www' && subdomain !== 'api') {
                    return subdomain;
                }
            }
        }
    }
    const queryTenantId = req.query.tenantId;
    if (queryTenantId) {
        return queryTenantId;
    }
    const sessionUser = req.session?.user;
    if (sessionUser?.tenantId) {
        return sessionUser.tenantId;
    }
    return null;
}
function isValidUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}
function isValidTenantId(tenantId) {
    const allowedDemoTenants = new Set([
        'demo-medical-tech',
        '11111111-1111-4111-8111-111111111111'
    ]);
    return allowedDemoTenants.has(tenantId) || isValidUUID(tenantId);
}
async function getTenantById(tenantId) {
    if (tenantId === 'demo-medical-tech') {
        return {
            id: 'demo-medical-tech',
            name: 'Demo Medical Tech',
            subdomain: 'demo-medical',
            colorScheme: 'blue',
            subscriptionTier: 'professional',
            settings: {},
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true
        };
    }
    if (tenantId === 'demo-medical-tech' || tenantId === '11111111-1111-4111-8111-111111111111') {
        return {
            id: tenantId,
            name: tenantId === 'demo-medical-tech' ? 'Demo Medical Tech' : 'Default Tenant',
            subdomain: tenantId === 'demo-medical-tech' ? 'demo-medical' : 'default',
            colorScheme: 'blue',
            subscriptionTier: 'professional',
            settings: {},
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true
        };
    }
    return null;
}
async function getUserById(userId) {
    if (userId === 'demo-user') {
        return {
            id: 'demo-user',
            email: 'demo@medical-tech.com',
            name: 'Demo User',
            role: 'admin',
            tenantId: 'demo-medical-tech',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }
    return null;
}
export class TenantDataIsolation {
    static addTenantFilter(query, tenantId) {
        return {
            ...query,
            tenantId
        };
    }
    static validateTenantAccess(userTenantId, requestedTenantId) {
        return userTenantId === requestedTenantId;
    }
    static sanitizeDataForTenant(data, tenantId) {
        const sanitized = { ...data };
        delete sanitized.tenantId;
        delete sanitized.tenant;
        sanitized.tenantId = tenantId;
        return sanitized;
    }
}
//# sourceMappingURL=tenant-isolation.js.map