import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, label, ...meta }) => {
    const labelStr = label ? `[${label}]` : '';
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} ${level} ${labelStr} ${message} ${metaStr}`;
  })
);

// Create base logger configuration
const createLogger = (label: string): winston.Logger => {
  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'helix-platform', label },
    transports: [
      // Error log file
      new winston.transports.File({
        filename: path.join(logsDir, 'error.log'),
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        )
      }),
      
      // Combined log file
      new winston.transports.File({
        filename: path.join(logsDir, 'combined.log'),
        maxsize: 5242880, // 5MB
        maxFiles: 10,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        )
      })
    ],
    
    // Add console transport in development
    ...(process.env.NODE_ENV !== 'production' && {
      transports: [
        new winston.transports.Console({
          format: consoleFormat
        })
      ]
    })
  });
};

// Specialized loggers
export class Logger {
  private logger: winston.Logger;
  
  constructor(label: string) {
    this.logger = createLogger(label);
  }

  info(message: string, meta?: any) {
    this.logger.info(message, meta);
  }

  warn(message: string, meta?: any) {
    this.logger.warn(message, meta);
  }

  error(message: string, meta?: any) {
    this.logger.error(message, meta);
  }

  debug(message: string, meta?: any) {
    this.logger.debug(message, meta);
  }

  // Security-specific logging
  security(message: string, meta?: any) {
    this.logger.warn(`[SECURITY] ${message}`, { ...meta, type: 'security' });
  }

  // Performance logging
  performance(message: string, duration: number, meta?: any) {
    this.logger.info(`[PERFORMANCE] ${message}`, { 
      ...meta, 
      type: 'performance', 
      duration: `${duration}ms` 
    });
  }

  // API request logging
  apiRequest(method: string, path: string, statusCode: number, duration: number, meta?: any) {
    this.logger.info(`[API] ${method} ${path} ${statusCode}`, {
      ...meta,
      type: 'api_request',
      method,
      path,
      statusCode,
      duration: `${duration}ms`
    });
  }

  // Database operation logging
  dbOperation(operation: string, table: string, duration: number, meta?: any) {
    this.logger.debug(`[DB] ${operation} on ${table}`, {
      ...meta,
      type: 'db_operation',
      operation,
      table,
      duration: `${duration}ms`
    });
  }
}

// Pre-configured loggers for different components
export const apiLogger = new Logger('API');
export const businessLogger = new Logger('BUSINESS_LOGIC');
export const securityLogger = new Logger('SECURITY');
export const dbLogger = new Logger('DATABASE');
export const systemLogger = new Logger('SYSTEM');
export const authLogger = new Logger('AUTH');

// Request logging middleware
export const requestLogger = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  // Log request
  apiLogger.info(`Incoming request: ${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    contentType: req.get('Content-Type')
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    const duration = Date.now() - start;
    
    apiLogger.apiRequest(req.method, req.path, res.statusCode, duration, {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    originalEnd.call(this, chunk, encoding);
  };

  next();
};

// Error logging utility
export const logError = (error: Error, context?: any) => {
  systemLogger.error(`Unhandled error: ${error.message}`, {
    stack: error.stack,
    context
  });
};

// Performance monitoring utility
export const logPerformance = (operation: string, startTime: number, meta?: any) => {
  const duration = Date.now() - startTime;
  systemLogger.performance(`${operation} completed`, duration, meta);
};

export default Logger;
