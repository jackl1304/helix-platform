import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { Logger } from '../services/logger.service';

const logger = new Logger('Security');

// ==========================================
// PASSWORD UTILITIES
// ==========================================

export class PasswordUtils {
  private static readonly SALT_ROUNDS = 12;

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// ==========================================
// INPUT SANITIZATION
// ==========================================

export class InputSanitizer {
  static sanitizeString(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/['"]/g, '') // Remove quotes to prevent injection
      .substring(0, 1000); // Limit length
  }

  static sanitizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  static sanitizeObject(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value);
      } else if (typeof value === 'object') {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
}

// ==========================================
// VALIDATION SCHEMAS
// ==========================================

export const AuthSchemas = {
  login: z.object({
    email: z.string().email('Invalid email format').min(1, 'Email is required'),
    password: z.string().min(8, 'Password must be at least 8 characters')
  }),

  register: z.object({
    email: z.string().email('Invalid email format').min(1, 'Email is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    tenantId: z.string().min(1, 'Tenant ID is required')
  }),

  changePassword: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters')
  })
};

export const RegulatoryUpdateSchemas = {
  create: z.object({
    title: z.string().min(1, 'Title is required').max(500, 'Title too long'),
    content: z.string().min(1, 'Content is required').max(10000, 'Content too long'),
    source: z.string().min(1, 'Source is required').max(200, 'Source too long'),
    jurisdiction: z.string().min(1, 'Jurisdiction is required').max(100, 'Jurisdiction too long'),
    type: z.enum(['regulation', 'guidance', 'warning', 'approval', 'recall']),
    priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium')
  }),

  update: z.object({
    title: z.string().min(1, 'Title is required').max(500, 'Title too long').optional(),
    content: z.string().min(1, 'Content is required').max(10000, 'Content too long').optional(),
    source: z.string().min(1, 'Source is required').max(200, 'Source too long').optional(),
    jurisdiction: z.string().min(1, 'Jurisdiction is required').max(100, 'Jurisdiction too long').optional(),
    type: z.enum(['regulation', 'guidance', 'warning', 'approval', 'recall']).optional(),
    priority: z.enum(['low', 'medium', 'high', 'critical']).optional()
  })
};

// ==========================================
// RATE LIMITING
// ==========================================

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 login attempts per 15 minutes per IP
  message: {
    error: 'Too many login attempts from this IP',
    message: 'Please try again after 15 minutes',
    retryAfter: 15 * 60 // seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip} on auth endpoint`);
    res.status(429).json({
      error: 'Too many login attempts',
      message: 'Please try again after 15 minutes',
      retryAfter: 15 * 60
    });
  }
});

export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 API requests per 15 minutes per IP
  message: {
    error: 'Too many API requests',
    message: 'Please try again after 15 minutes',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`API rate limit exceeded for IP: ${req.ip} on ${req.path}`);
    res.status(429).json({
      error: 'Too many API requests',
      message: 'Please try again after 15 minutes',
      retryAfter: 15 * 60
    });
  }
});

export const strictRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 requests per 15 minutes per IP
  message: {
    error: 'Rate limit exceeded',
    message: 'Please try again after 15 minutes',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Strict rate limit exceeded for IP: ${req.ip} on ${req.path}`);
    res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Please try again after 15 minutes',
      retryAfter: 15 * 60
    });
  }
});

// ==========================================
// CORS CONFIGURATION
// ==========================================

export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = process.env.NODE_ENV === 'production' 
      ? ['https://www.deltaways-helix.de', 'https://helix-platform.com']
      : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'];

    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Subdomain', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

// ==========================================
// SECURITY HEADERS
// ==========================================

export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// ==========================================
// VALIDATION MIDDLEWARE
// ==========================================

export const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Sanitize input first
      req.body = InputSanitizer.sanitizeObject(req.body);
      req.query = InputSanitizer.sanitizeObject(req.query);
      req.params = InputSanitizer.sanitizeObject(req.params);

      // Validate with Zod
      const validatedData = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });

      // Replace request data with validated data
      req.body = validatedData.body;
      req.query = validatedData.query;
      req.params = validatedData.params;

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn(`Validation failed for ${req.path}:`, error.errors);
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Invalid request data',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      
      logger.error(`Validation middleware error for ${req.path}:`, error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Validation failed'
      });
    }
  };
};

// ==========================================
// SECURITY MIDDLEWARE
// ==========================================

export const securityMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Remove potentially dangerous headers
  delete req.headers['x-forwarded-host'];
  delete req.headers['x-forwarded-proto'];
  
  // Log security-relevant requests
  if (req.path.includes('admin') || req.path.includes('auth')) {
    logger.info(`Security-sensitive request: ${req.method} ${req.path} from IP: ${req.ip}`);
  }
  
  next();
};

// ==========================================
// ERROR HANDLING
// ==========================================

export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Unhandled error on ${req.method} ${req.path}:`, error);

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      message: error.message,
      ...(isDevelopment && { stack: error.stack })
    });
  }

  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required'
    });
  }

  if (error.name === 'ForbiddenError') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Access denied'
    });
  }

  // Generic error response
  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred',
    ...(isDevelopment && { stack: error.stack })
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.path} from IP: ${req.ip}`);
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`
  });
};
