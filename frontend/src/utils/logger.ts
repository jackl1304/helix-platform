// ==========================================
// FRONTEND LOGGER UTILITY
// ==========================================

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: any;
  stack?: string;
}

class Logger {
  private context: string;
  private minLevel: LogLevel;

  constructor(context: string) {
    this.context = context;
    this.minLevel = this.getLogLevelFromEnv();
  }

  private getLogLevelFromEnv(): LogLevel {
    const envLevel = process.env.VITE_LOG_LEVEL?.toUpperCase();
    switch (envLevel) {
      case 'DEBUG': return LogLevel.DEBUG;
      case 'INFO': return LogLevel.INFO;
      case 'WARN': return LogLevel.WARN;
      case 'ERROR': return LogLevel.ERROR;
      default: return process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.minLevel;
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    const context = this.context ? `[${this.context}]` : '';
    
    let formatted = `${timestamp} ${levelName} ${context} ${message}`;
    
    if (data) {
      formatted += ` ${JSON.stringify(data, null, 2)}`;
    }
    
    return formatted;
  }

  private log(level: LogLevel, message: string, data?: any): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const formattedMessage = this.formatMessage(level, message, data);
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.context,
      data
    };

    // Console logging with appropriate method
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage);
        if (data?.stack) {
          console.error('Stack trace:', data.stack);
        }
        break;
    }

    // Send to external logging service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalLogger(logEntry);
    }
  }

  private async sendToExternalLogger(logEntry: LogEntry): Promise<void> {
    try {
      // Only send ERROR and WARN logs to external service
      if (logEntry.level < LogLevel.WARN) {
        return;
      }

      // TODO: Implement external logging service integration
      // For now, we'll just store in localStorage for debugging
      const logs = JSON.parse(localStorage.getItem('helix_logs') || '[]');
      logs.push(logEntry);
      
      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      localStorage.setItem('helix_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to send log to external service:', error);
    }
  }

  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, data?: any): void {
    this.log(LogLevel.ERROR, message, data);
  }

  // Specialized logging methods
  apiRequest(method: string, url: string, data?: any): void {
    this.debug(`API Request: ${method} ${url}`, data);
  }

  apiResponse(method: string, url: string, status: number, data?: any): void {
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.DEBUG;
    this.log(level, `API Response: ${method} ${url} ${status}`, data);
  }

  userAction(action: string, data?: any): void {
    this.info(`User Action: ${action}`, data);
  }

  performance(operation: string, duration: number, data?: any): void {
    this.info(`Performance: ${operation} took ${duration}ms`, data);
  }

  security(event: string, data?: any): void {
    this.warn(`Security Event: ${event}`, data);
  }

  // Error logging with stack trace
  errorWithStack(message: string, error: Error, data?: any): void {
    this.error(message, {
      ...data,
      error: error.message,
      stack: error.stack
    });
  }
}

// ==========================================
// LOGGER INSTANCES
// ==========================================

export const apiLogger = new Logger('API');
export const componentLogger = new Logger('COMPONENT');
export const serviceLogger = new Logger('SERVICE');
export const securityLogger = new Logger('SECURITY');
export const performanceLogger = new Logger('PERFORMANCE');

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

export function createLogger(context: string): Logger {
  return new Logger(context);
}

export function logError(error: Error, context?: string, additionalData?: any): void {
  const logger = new Logger(context || 'ERROR');
  logger.errorWithStack('Unhandled error occurred', error, additionalData);
}

export function logPerformance(operation: string, startTime: number, additionalData?: any): void {
  const duration = Date.now() - startTime;
  performanceLogger.performance(operation, duration, additionalData);
}

// ==========================================
// PERFORMANCE MONITORING
// ==========================================

export class PerformanceMonitor {
  private timers: Map<string, number> = new Map();

  start(operation: string): void {
    this.timers.set(operation, Date.now());
  }

  end(operation: string, additionalData?: any): number {
    const startTime = this.timers.get(operation);
    if (!startTime) {
      console.warn(`Performance timer not found for operation: ${operation}`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.timers.delete(operation);
    
    performanceLogger.performance(operation, duration, additionalData);
    return duration;
  }

  measure<T>(operation: string, fn: () => T | Promise<T>, additionalData?: any): T | Promise<T> {
    this.start(operation);
    
    try {
      const result = fn();
      
      if (result instanceof Promise) {
        return result.finally(() => {
          this.end(operation, additionalData);
        });
      } else {
        this.end(operation, additionalData);
        return result;
      }
    } catch (error) {
      this.end(operation, { ...additionalData, error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();

// ==========================================
// ERROR BOUNDARY LOGGING
// ==========================================

export function logReactError(error: Error, errorInfo: any, componentName?: string): void {
  const logger = new Logger(componentName || 'REACT_ERROR_BOUNDARY');
  logger.errorWithStack('React error boundary caught error', error, {
    componentStack: errorInfo.componentStack,
    errorBoundary: errorInfo.errorBoundary
  });
}

// ==========================================
// DEFAULT EXPORT
// ==========================================

export default Logger;
