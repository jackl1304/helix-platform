import { Logger } from '../services/logger.service';

/**
 * Zentraler Logger für die gesamte Anwendung
 * Ersetzt alle console.log Statements durch strukturiertes Logging
 */

// Logger-Instanzen für verschiedene Bereiche
export const authLogger = new Logger('Authentication');
export const dbLogger = new Logger('Database');
export const apiLogger = new Logger('API');
export const securityLogger = new Logger('Security');
export const performanceLogger = new Logger('Performance');
export const businessLogger = new Logger('BusinessLogic');

/**
 * Utility-Funktionen für häufige Logging-Szenarien
 */
export class LoggingUtils {
  /**
   * Loggt API-Aufrufe mit Metriken
   */
  static logApiCall(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    userId?: string,
    tenantId?: string
  ) {
    const logData = {
      method,
      url,
      statusCode,
      duration,
      userId,
      tenantId
    };

    if (statusCode >= 400) {
      apiLogger.error('API call failed', logData);
    } else if (duration > 1000) {
      apiLogger.warn('Slow API call', logData);
    } else {
      apiLogger.info('API call completed', logData);
    }
  }

  /**
   * Loggt Datenbank-Operationen
   */
  static logDbOperation(
    operation: string,
    table: string,
    duration: number,
    recordCount?: number,
    error?: Error
  ) {
    const logData = {
      operation,
      table,
      duration,
      recordCount
    };

    if (error) {
      dbLogger.error('Database operation failed', { ...logData, error: error.message });
    } else {
      dbLogger.info('Database operation completed', logData);
    }
  }

  /**
   * Loggt Authentifizierungs-Events
   */
  static logAuthEvent(
    event: 'login' | 'logout' | 'failed_login' | 'password_change',
    userId?: string,
    email?: string,
    ip?: string,
    userAgent?: string
  ) {
    const logData = {
      event,
      userId,
      email: email ? email.substring(0, 3) + '***' : undefined,
      ip,
      userAgent
    };

    if (event === 'failed_login') {
      securityLogger.warn('Authentication failure', logData);
    } else {
      authLogger.info('Authentication event', logData);
    }
  }

  /**
   * Loggt Performance-Metriken
   */
  static logPerformance(
    operation: string,
    duration: number,
    memoryUsage?: number,
    cpuUsage?: number
  ) {
    const logData = {
      operation,
      duration,
      memoryUsage,
      cpuUsage
    };

    if (duration > 5000) {
      performanceLogger.error('Critical performance issue', logData);
    } else if (duration > 1000) {
      performanceLogger.warn('Performance warning', logData);
    } else {
      performanceLogger.info('Performance metric', logData);
    }
  }

  /**
   * Loggt Business-Logic-Events
   */
  static logBusinessEvent(
    event: string,
    entity: string,
    entityId: string,
    userId?: string,
    tenantId?: string,
    metadata?: Record<string, any>
  ) {
    businessLogger.info('Business event', {
      event,
      entity,
      entityId,
      userId,
      tenantId,
      metadata
    });
  }

  /**
   * Loggt Sicherheits-Events
   */
  static logSecurityEvent(
    event: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    ip?: string,
    userAgent?: string,
    details?: Record<string, any>
  ) {
    const logData = {
      event,
      severity,
      ip,
      userAgent,
      details
    };

    switch (severity) {
      case 'critical':
        securityLogger.error('Critical security event', logData);
        break;
      case 'high':
        securityLogger.error('High severity security event', logData);
        break;
      case 'medium':
        securityLogger.warn('Medium severity security event', logData);
        break;
      case 'low':
        securityLogger.info('Low severity security event', logData);
        break;
    }
  }
}

/**
 * Ersetzt console.log/error/warn durch strukturiertes Logging
 */
export const replaceConsoleLogs = () => {
  if (process.env.NODE_ENV === 'production') {
    // In Produktion: console.log komplett deaktivieren
    console.log = () => {};
    console.warn = () => {};
    console.error = () => {};
  } else {
    // In Entwicklung: console.log durch Logger ersetzen
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    console.log = (...args: any[]) => {
      const message = args.join(' ');
      apiLogger.debug('Console log', { message });
    };

    console.warn = (...args: any[]) => {
      const message = args.join(' ');
      apiLogger.warn('Console warn', { message });
    };

    console.error = (...args: any[]) => {
      const message = args.join(' ');
      apiLogger.error('Console error', { message });
    };
  }
};

/**
 * Performance-Monitoring für Funktionen
 */
export function withPerformanceLogging<T extends (...args: any[]) => any>(
  fn: T,
  operationName: string,
  logger: Logger = performanceLogger
): T {
  return ((...args: any[]) => {
    const startTime = Date.now();
    const startMemory = process.memoryUsage().heapUsed;

    try {
      const result = fn(...args);
      
      // Handle both sync and async functions
      if (result instanceof Promise) {
        return result.then(
          (value) => {
            const duration = Date.now() - startTime;
            const endMemory = process.memoryUsage().heapUsed;
            
            LoggingUtils.logPerformance(
              operationName,
              duration,
              endMemory - startMemory
            );
            
            return value;
          },
          (error) => {
            const duration = Date.now() - startTime;
            logger.error(`Performance monitoring error for ${operationName}`, {
              duration,
              error: error.message
            });
            throw error;
          }
        );
      } else {
        const duration = Date.now() - startTime;
        const endMemory = process.memoryUsage().heapUsed;
        
        LoggingUtils.logPerformance(
          operationName,
          duration,
          endMemory - startMemory
        );
        
        return result;
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`Performance monitoring error for ${operationName}`, {
        duration,
        error: (error as Error).message
      });
      throw error;
    }
  }) as T;
}

/**
 * Error-Wrapper für besseres Error-Handling
 */
export function withErrorHandling<T extends (...args: any[]) => any>(
  fn: T,
  context: string,
  logger: Logger = apiLogger
): T {
  return ((...args: any[]) => {
    try {
      const result = fn(...args);
      
      if (result instanceof Promise) {
        return result.catch((error) => {
          logger.error(`Error in ${context}`, {
            error: error.message,
            stack: error.stack,
            args: args.map(arg => typeof arg === 'object' ? '[Object]' : String(arg))
          });
          throw error;
        });
      }
      
      return result;
    } catch (error) {
      logger.error(`Error in ${context}`, {
        error: (error as Error).message,
        stack: (error as Error).stack,
        args: args.map(arg => typeof arg === 'object' ? '[Object]' : String(arg))
      });
      throw error;
    }
  }) as T;
}
