export const fdaTenantAuthMiddleware = (req, res, next) => {
    try {
        if (!req.session?.user) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'FDA API access requires valid tenant authentication'
            });
        }
        const user = req.session.user;
        if (!user.tenantId) {
            return res.status(403).json({
                error: 'Tenant required',
                message: 'Valid tenant assignment required for FDA API access'
            });
        }
        if (user.role === 'super_admin') {
            return res.status(403).json({
                error: 'Access denied',
                message: 'Super admin cannot access tenant-scoped FDA data'
            });
        }
        req.tenant = {
            id: user.tenantId,
            name: 'Authenticated Tenant',
            subdomain: 'tenant',
            colorScheme: 'blue',
            subscriptionTier: 'professional',
            settings: {}
        };
        req.user = user;
        if ('tenantId' in req.query) {
            delete req.query.tenantId;
            console.warn('[FDA-SECURITY] Removed tenantId from query parameters to prevent cross-tenant access');
        }
        if (req.body && 'tenantId' in req.body) {
            delete req.body.tenantId;
            console.warn('[FDA-SECURITY] Removed tenantId from request body to prevent cross-tenant access');
        }
        console.log(`[FDA-AUTH] Authenticated FDA API access for tenant: ${user.tenantId}, user: ${user.email}`);
        next();
    }
    catch (error) {
        console.error('[FDA-AUTH] FDA tenant authentication error:', error);
        return res.status(500).json({
            error: 'Authentication error',
            message: 'Failed to validate FDA API access'
        });
    }
};
export const getAuthenticatedTenantId = (req) => {
    if (!req.user?.tenantId) {
        throw new Error('No authenticated tenant found in request');
    }
    return req.user.tenantId;
};
//# sourceMappingURL=fda-tenant-auth.js.map