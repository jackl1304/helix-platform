import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';

/**
 * Security Middleware für Helix Platform
 * Implementiert moderne Sicherheitsstandards
 */

// Rate Limiting für verschiedene Endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minuten
  max: 5, // Max 5 Login-Versuche pro IP
  message: {
    error: 'Zu viele Anmeldeversuche. Bitte versuchen Sie es in 15 Minuten erneut.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minuten
  max: 100, // Max 100 API-Calls pro IP
  message: {
    error: 'API Rate Limit überschritten. Bitte versuchen Sie es später erneut.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Helmet Security Headers
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// CORS-Konfiguration (sicher)
export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Erlaubte Domains
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://helix-platform.com',
      'https://www.helix-platform.com',
      'https://deltaways-helix.de',
      'https://www.deltaways-helix.de'
    ];

    // In Entwicklung: Alle Origins erlauben
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    // In Produktion: Nur erlaubte Origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Nicht erlaubt durch CORS-Policy'), false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Subdomain']
};

// Passwort-Hashing Utilities
export class PasswordUtils {
  private static readonly SALT_ROUNDS = 12;

  static async hashPassword(password: string): Promise<string> {
    if (!password || password.length < 8) {
      throw new Error('Passwort muss mindestens 8 Zeichen lang sein');
    }
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    if (!password || !hashedPassword) {
      return false;
    }
    return bcrypt.compare(password, hashedPassword);
  }

  static validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Passwort muss mindestens 8 Zeichen lang sein');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Passwort muss mindestens einen Großbuchstaben enthalten');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Passwort muss mindestens einen Kleinbuchstaben enthalten');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Passwort muss mindestens eine Zahl enthalten');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Passwort muss mindestens ein Sonderzeichen enthalten');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Input Sanitization
export class InputSanitizer {
  static sanitizeString(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .substring(0, 1000); // Limit length
  }

  static sanitizeEmail(email: string): string {
    if (typeof email !== 'string') {
      return '';
    }
    
    const sanitized = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(sanitized)) {
      throw new Error('Ungültige E-Mail-Adresse');
    }
    
    return sanitized;
  }

  static sanitizeSQL(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }
    
    // Remove potential SQL injection patterns
    return input
      .replace(/['";\\]/g, '') // Remove quotes and backslashes
      .replace(/--/g, '') // Remove SQL comments
      .replace(/\/\*/g, '') // Remove block comments start
      .replace(/\*\//g, '') // Remove block comments end
      .replace(/union/gi, '') // Remove UNION
      .replace(/select/gi, '') // Remove SELECT
      .replace(/insert/gi, '') // Remove INSERT
      .replace(/update/gi, '') // Remove UPDATE
      .replace(/delete/gi, '') // Remove DELETE
      .replace(/drop/gi, '') // Remove DROP
      .substring(0, 500); // Limit length
  }
}

// Session Security
export const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'helix-super-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS
    maxAge: 24 * 60 * 60 * 1000, // 24 Stunden
    sameSite: 'strict' as const // CSRF Protection
  },
  name: 'helix-session' // Change default session name
};

// Security Headers Middleware
export const securityMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');
  
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
};

// Request Validation Middleware
export const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error: any) {
      res.status(400).json({
        error: 'Ungültige Anfrage',
        details: error.errors || error.message
      });
    }
  };
};

// Tenant Isolation Security
export const tenantSecurityMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const tenantId = req.headers['x-tenant-id'] as string;
  const tenantSubdomain = req.headers['x-tenant-subdomain'] as string;

  // Validate tenant access
  if (!tenantId && !tenantSubdomain) {
    return res.status(401).json({
      error: 'Tenant-Identifikation erforderlich'
    });
  }

  // Add tenant context to request
  (req as any).tenantContext = {
    tenantId,
    tenantSubdomain,
    timestamp: new Date().toISOString()
  };

  next();
};
