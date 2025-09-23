import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Logger } from '../services/logger.service';

const logger = new Logger('TenantIsolation');

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  colorScheme: string;
  subscriptionTier: 'basic' | 'professional' | 'enterprise';
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'viewer';
  tenantId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantRequest extends Request {
  tenant?: Tenant;
  user?: User;
  tenantId?: string;
  userId?: string;
}

// ==========================================
// VALIDATION SCHEMAS
// ==========================================

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

// ==========================================
// TENANT ISOLATION MIDDLEWARE
// ==========================================

export const tenantIsolationMiddleware = async (
  req: TenantRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const startTime = Date.now();
    
    // Extract tenant information from request
    const tenantId = extractTenantId(req);
    
    if (!tenantId) {
      logger.warn('No tenant ID found in request', {
        path: req.path,
        method: req.method,
        ip: req.ip
      });
      res.status(400).json({
        error: 'Tenant required',
        message: 'Tenant identification is required for this request'
      });
      return;
    }

    // Validate tenant ID format
    if (!isValidUUID(tenantId)) {
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

    // Get tenant information (in production, this would query the database)
    const tenant = await getTenantById(tenantId);
    
    if (!tenant) {
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

    // Check if tenant is active
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

    // Set tenant context
    req.tenant = tenant;
    req.tenantId = tenantId;

    // Log successful tenant isolation
    logger.debug('Tenant isolation successful', {
      tenantId,
      tenantName: tenant.name,
      subscriptionTier: tenant.subscriptionTier,
      path: req.path,
      method: req.method,
      duration: Date.now() - startTime
    });

    next();
  } catch (error) {
    logger.error('Tenant isolation middleware error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      path: req.path,
      method: req.method,
      ip: req.ip
    });
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process tenant isolation'
    });
  }
};

// ==========================================
// USER AUTHENTICATION MIDDLEWARE
// ==========================================

export const userAuthenticationMiddleware = async (
  req: TenantRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Check if user is authenticated
    if (!req.session?.user) {
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

    const user = req.session.user;
    
    // Validate user session
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

    // Verify tenant consistency
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

    // Get user information (in production, this would query the database)
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

    // Set user context
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
  } catch (error) {
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

// ==========================================
// ROLE-BASED ACCESS CONTROL
// ==========================================

export const requireRole = (allowedRoles: string[]) => {
  return (req: TenantRequest, res: Response, next: NextFunction): void => {
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

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function extractTenantId(req: TenantRequest): string | null {
  // Priority order for tenant ID extraction:
  // 1. Header (X-Tenant-ID)
  // 2. Subdomain (extract from Host header)
  // 3. Query parameter (tenantId)
  // 4. Session (if user is authenticated)

  // Check header
  const headerTenantId = req.headers['x-tenant-id'] as string;
  if (headerTenantId) {
    return headerTenantId;
  }

  // Check subdomain
  const host = req.headers.host;
  if (host) {
    const subdomain = host.split('.')[0];
    if (subdomain && subdomain !== 'www' && subdomain !== 'api') {
      return subdomain;
    }
  }

  // Check query parameter
  const queryTenantId = req.query.tenantId as string;
  if (queryTenantId) {
    return queryTenantId;
  }

  // Check session
  if (req.session?.user?.tenantId) {
    return req.session.user.tenantId;
  }

  return null;
}

function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Mock functions - in production, these would query the database
async function getTenantById(tenantId: string): Promise<Tenant | null> {
  // TODO: Replace with actual database query
  // For now, return mock data for demo-medical-tech tenant
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
  return null;
}

async function getUserById(userId: string): Promise<User | null> {
  // TODO: Replace with actual database query
  // For now, return mock data for demo user
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

// ==========================================
// TENANT DATA ISOLATION UTILITIES
// ==========================================

export class TenantDataIsolation {
  static addTenantFilter(query: any, tenantId: string): any {
    return {
      ...query,
      tenantId
    };
  }

  static validateTenantAccess(userTenantId: string, requestedTenantId: string): boolean {
    return userTenantId === requestedTenantId;
  }

  static sanitizeDataForTenant(data: any, tenantId: string): any {
    // Remove any tenant-specific sensitive data
    const sanitized = { ...data };
    delete sanitized.tenantId;
    delete sanitized.tenant;
    
    // Add tenant context
    sanitized.tenantId = tenantId;
    return sanitized;
  }
}
