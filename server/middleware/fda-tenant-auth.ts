import { Request, Response, NextFunction } from 'express';
import { TenantRequest } from './tenant-isolation';

/**
 * FDA Tenant Authentication Middleware
 * Ensures all FDA API endpoints are properly scoped to authenticated tenant
 * Prevents cross-tenant data access vulnerability
 */
export const fdaTenantAuthMiddleware = (
  req: TenantRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if user is authenticated
    if (!req.session?.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'FDA API access requires valid tenant authentication'
      });
    }

    const user = req.session.user;

    // Ensure user has a valid tenant
    if (!user.tenantId) {
      return res.status(403).json({
        error: 'Tenant required',
        message: 'Valid tenant assignment required for FDA API access'
      });
    }

    // Block super admin access to tenant-scoped FDA data
    if (user.role === 'super_admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Super admin cannot access tenant-scoped FDA data'
      });
    }

    // Set authenticated tenant context
    req.tenant = {
      id: user.tenantId,
      name: 'Authenticated Tenant', // Will be populated from DB in production
      subdomain: 'tenant',
      colorScheme: 'blue',
      subscriptionTier: 'professional',
      settings: {}
    };

    req.user = user;

    // Remove any tenantId from query parameters to prevent tampering
    if ('tenantId' in req.query) {
      delete req.query.tenantId;
      console.warn('[FDA-SECURITY] Removed tenantId from query parameters to prevent cross-tenant access');
    }

    // Remove any tenantId from request body to prevent tampering
    if (req.body && 'tenantId' in req.body) {
      delete req.body.tenantId;
      console.warn('[FDA-SECURITY] Removed tenantId from request body to prevent cross-tenant access');
    }

    console.log(`[FDA-AUTH] Authenticated FDA API access for tenant: ${user.tenantId}, user: ${user.email}`);
    
    next();
  } catch (error) {
    console.error('[FDA-AUTH] FDA tenant authentication error:', error);
    return res.status(500).json({
      error: 'Authentication error',
      message: 'Failed to validate FDA API access'
    });
  }
};

/**
 * Helper function to get authenticated tenant ID from request
 * Use this in FDA routes instead of reading tenantId from query/body
 */
export const getAuthenticatedTenantId = (req: TenantRequest): string => {
  if (!req.user?.tenantId) {
    throw new Error('No authenticated tenant found in request');
  }
  return req.user.tenantId;
};