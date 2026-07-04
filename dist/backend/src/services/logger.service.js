import winston from 'winston';
import path from 'path';
import fs from 'fs';
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}
const logFormat = winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston.format.errors({ stack: true }), winston.format.json(), winston.format.prettyPrint());
const consoleFormat = winston.format.combine(winston.format.colorize(), winston.format.timestamp({ format: 'HH:mm:ss' }), winston.format.printf(({ timestamp, level, message, label, ...meta }) => {
    const labelStr = label ? `[${label}]` : '';
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} ${level} ${labelStr} ${message} ${metaStr}`;
}));
const createLogger = (label) => {
    return winston.createLogger({
        level: process.env.LOG_LEVEL || 'info',
        format: logFormat,
        defaultMeta: { service: 'helix-platform', label },
        transports: [
            new winston.transports.File({
                filename: path.join(logsDir, 'error.log'),
                level: 'error',
                maxsize: 5242880,
                maxFiles: 5,
                format: winston.format.combine(winston.format.timestamp(), winston.format.json())
            }),
            new winston.transports.File({
                filename: path.join(logsDir, 'combined.log'),
                maxsize: 5242880,
                maxFiles: 10,
                format: winston.format.combine(winston.format.timestamp(), winston.format.json())
            })
        ],
        ...(process.env.NODE_ENV !== 'production' && {
            transports: [
                new winston.transports.Console({
                    format: consoleFormat
                })
            ]
        })
    });
};
export class Logger {
    constructor(label) {
        this.logger = createLogger(label);
    }
    info(message, meta) {
        this.logger.info(message, meta);
    }
    warn(message, meta) {
        this.logger.warn(message, meta);
    }
    error(message, meta) {
        this.logger.error(message, meta);
    }
    debug(message, meta) {
        this.logger.debug(message, meta);
    }
    security(message, meta) {
        this.logger.warn(`[SECURITY] ${message}`, { ...meta, type: 'security' });
    }
    performance(message, duration, meta) {
        this.logger.info(`[PERFORMANCE] ${message}`, {
            ...meta,
            type: 'performance',
            duration: `${duration}ms`
        });
    }
    apiRequest(method, path, statusCode, duration, meta) {
        this.logger.info(`[API] ${method} ${path} ${statusCode}`, {
            ...meta,
            type: 'api_request',
            method,
            path,
            statusCode,
            duration: `${duration}ms`
        });
    }
    dbOperation(operation, table, duration, meta) {
        this.logger.debug(`[DB] ${operation} on ${table}`, {
            ...meta,
            type: 'db_operation',
            operation,
            table,
            duration: `${duration}ms`
        });
    }
}
export const apiLogger = new Logger('API');
export const businessLogger = new Logger('BUSINESS_LOGIC');
export const securityLogger = new Logger('SECURITY');
export const dbLogger = new Logger('DATABASE');
export const systemLogger = new Logger('SYSTEM');
export const authLogger = new Logger('AUTH');
export const requestLogger = (req, res, next) => {
    const start = Date.now();
    apiLogger.info(`Incoming request: ${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        contentType: req.get('Content-Type')
    });
    const originalEnd = res.end;
    res.end = function (chunk, encoding) {
        const duration = Date.now() - start;
        apiLogger.apiRequest(req.method, req.path, res.statusCode, duration, {
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
        originalEnd.call(this, chunk, encoding);
    };
    next();
};
export const logError = (error, context) => {
    systemLogger.error(`Unhandled error: ${error.message}`, {
        stack: error.stack,
        context
    });
};
export const logPerformance = (operation, startTime, meta) => {
    const duration = Date.now() - startTime;
    systemLogger.performance(`${operation} completed`, duration, meta);
};
export default Logger;
//# sourceMappingURL=logger.service.js.map