import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { Logger } from '../services/logger.service';
const logger = new Logger('Security');
export class PasswordUtils {
    static async hashPassword(password) {
        return bcrypt.hash(password, this.SALT_ROUNDS);
    }
    static async verifyPassword(password, hash) {
        return bcrypt.compare(password, hash);
    }
    static validatePasswordStrength(password) {
        const errors = [];
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
PasswordUtils.SALT_ROUNDS = 12;
export class InputSanitizer {
    static sanitizeString(input) {
        return input
            .trim()
            .replace(/[<>]/g, '')
            .replace(/['"]/g, '')
            .substring(0, 1000);
    }
    static sanitizeEmail(email) {
        return email.toLowerCase().trim();
    }
    static sanitizeObject(obj) {
        if (typeof obj !== 'object' || obj === null) {
            return obj;
        }
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'string') {
                sanitized[key] = this.sanitizeString(value);
            }
            else if (typeof value === 'object') {
                sanitized[key] = this.sanitizeObject(value);
            }
            else {
                sanitized[key] = value;
            }
        }
        return sanitized;
    }
}
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
export const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        error: 'Too many login attempts from this IP',
        message: 'Please try again after 15 minutes',
        retryAfter: 15 * 60
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
    windowMs: 15 * 60 * 1000,
    max: 100,
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
    windowMs: 15 * 60 * 1000,
    max: 10,
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
export const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = process.env.NODE_ENV === 'production'
            ? ['https://www.deltaways-helix.de', 'https://helix-platform.com']
            : [
                'http://localhost:3000',
                'http://localhost:5173',
                'http://127.0.0.1:5173',
                'http://localhost:5174',
                'http://127.0.0.1:3000'
            ];
        if (!origin) {
            logger.debug('CORS: Allowing request with no origin');
            return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) {
            logger.debug(`CORS: Allowing request from origin: ${origin}`);
            callback(null, true);
        }
        else {
            logger.warn(`CORS blocked request from origin: ${origin}`);
            if (process.env.NODE_ENV === 'development') {
                logger.warn(`CORS: Allowing blocked origin in development mode: ${origin}`);
                callback(null, true);
            }
            else {
                callback(new Error('Not allowed by CORS'), false);
            }
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Tenant-Subdomain',
        'X-Requested-With',
        'X-Tenant-ID',
        'Accept',
        'Cache-Control',
        'Origin'
    ],
    exposedHeaders: ['Content-Type', 'Content-Length', 'X-Total-Count'],
    credentials: true,
    maxAge: 86400
};
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
export const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            req.body = InputSanitizer.sanitizeObject(req.body);
            req.query = InputSanitizer.sanitizeObject(req.query);
            req.params = InputSanitizer.sanitizeObject(req.params);
            const validatedData = schema.parse({
                body: req.body,
                query: req.query,
                params: req.params
            });
            req.body = validatedData.body;
            req.query = validatedData.query;
            req.params = validatedData.params;
            return next();
        }
        catch (error) {
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
export const securityMiddleware = (req, res, next) => {
    delete req.headers['x-forwarded-host'];
    delete req.headers['x-forwarded-proto'];
    if (req.path.includes('admin') || req.path.includes('auth')) {
        logger.info(`Security-sensitive request: ${req.method} ${req.path} from IP: ${req.ip}`);
    }
    next();
};
export const errorHandler = (error, req, res, next) => {
    logger.error(`Unhandled error on ${req.method} ${req.path}:`, error);
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
    return res.status(500).json({
        error: 'Internal server error',
        message: 'An unexpected error occurred',
        ...(isDevelopment && { stack: error.stack })
    });
};
export const notFoundHandler = (req, res) => {
    logger.warn(`404 - Route not found: ${req.method} ${req.path} from IP: ${req.ip}`);
    res.status(404).json({
        error: 'Not found',
        message: `Route ${req.method} ${req.path} not found`
    });
};
//# sourceMappingURL=security.js.map