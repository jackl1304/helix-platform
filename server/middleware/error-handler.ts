import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Logger } from '../services/logger.service';

const logger = new Logger('ErrorHandler');

/**
 * Verbesserte Error-Handling-Klassen
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly timestamp: string;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  public readonly field: string;
  public readonly receivedValue: any;
  public readonly expectedValue: any;

  constructor(
    message: string,
    field: string,
    receivedValue: any,
    expectedValue: any,
    statusCode: number = 400
  ) {
    super(message, statusCode);
    this.field = field;
    this.receivedValue = receivedValue;
    this.expectedValue = expectedValue;
  }
}

export class DatabaseError extends AppError {
  public readonly query?: string;
  public readonly parameters?: any[];

  constructor(message: string, query?: string, parameters?: any[], statusCode: number = 500) {
    super(message, statusCode);
    this.query = query;
    this.parameters = parameters;
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429);
  }
}

/**
 * Error-Handler-Funktionen
 */
export const isAppError = (error: any): error is AppError => {
  return error instanceof AppError;
};

export const isOperationalError = (error: AppError): boolean => {
  return error.isOperational;
};

export const formatErrorResponse = (error: AppError) => {
  const baseResponse = {
    error: error.message,
    timestamp: error.timestamp,
    statusCode: error.statusCode
  };

  // Add specific error details based on error type
  if (error instanceof ValidationError) {
    return {
      ...baseResponse,
      type: 'validation_error',
      field: error.field,
      receivedValue: error.receivedValue,
      expectedValue: error.expectedValue
    };
  }

  if (error instanceof DatabaseError) {
    return {
      ...baseResponse,
      type: 'database_error',
      // Don't expose sensitive query details in production
      ...(process.env.NODE_ENV === 'development' && {
        query: error.query,
        parameters: error.parameters
      })
    };
  }

  if (error instanceof AuthenticationError) {
    return {
      ...baseResponse,
      type: 'authentication_error'
    };
  }

  if (error instanceof AuthorizationError) {
    return {
      ...baseResponse,
      type: 'authorization_error'
    };
  }

  if (error instanceof NotFoundError) {
    return {
      ...baseResponse,
      type: 'not_found_error'
    };
  }

  if (error instanceof ConflictError) {
    return {
      ...baseResponse,
      type: 'conflict_error'
    };
  }

  if (error instanceof RateLimitError) {
    return {
      ...baseResponse,
      type: 'rate_limit_error'
    };
  }

  return {
    ...baseResponse,
    type: 'application_error'
  };
};

/**
 * Async Handler Wrapper
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Global Error Handler Middleware
 */
export const globalErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let processedError: AppError;

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const validationErrors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
      receivedValue: err.received
    }));
    
    processedError = new ValidationError(
      'Request validation failed',
      validationErrors[0]?.field || 'unknown',
      validationErrors[0]?.receivedValue,
      'valid input'
    );

    // Log validation errors (usually not critical)
    logger.warn('Validation error', {
      errors: validationErrors,
      url: req.originalUrl,
      method: req.method
    });
  }
  // Handle known application errors
  else if (isAppError(error)) {
    processedError = error;
  }
  // Handle unknown errors
  else {
    processedError = new AppError(
      process.env.NODE_ENV === 'production' 
        ? 'Internal server error'
        : error.message || 'Unknown error occurred',
      500,
      false // Mark as non-operational
    );

    // Log unknown errors as critical
    logger.error('Unknown error occurred', {
      error: error.message,
      stack: error.stack,
      url: req.originalUrl,
      method: req.method,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
  }

  // Log operational errors
  if (isOperationalError(processedError)) {
    logger.warn('Operational error occurred', {
      error: processedError.message,
      statusCode: processedError.statusCode,
      url: req.originalUrl,
      method: req.method,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
  }

  // Send error response
  const errorResponse = formatErrorResponse(processedError);
  res.status(processedError.statusCode).json(errorResponse);
};

/**
 * 404 Not Found Handler
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new NotFoundError(`Route ${req.originalUrl}`);
  
  logger.warn('Route not found', {
    url: req.originalUrl,
    method: req.method,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });

  next(error);
};

/**
 * Database Error Handler
 */
export const handleDatabaseError = (error: any, query?: string, parameters?: any[]): DatabaseError => {
  logger.error('Database error occurred', {
    error: error.message,
    query,
    parameters: parameters?.map(p => typeof p === 'string' ? p.substring(0, 100) : p),
    stack: error.stack
  });

  return new DatabaseError(
    'Database operation failed',
    query,
    parameters
  );
};

/**
 * API Error Handler
 */
export const handleAPIError = (error: any, endpoint?: string): AppError => {
  logger.error('API error occurred', {
    error: error.message,
    endpoint,
    stack: error.stack
  });

  if (error.code === 'ECONNREFUSED') {
    return new AppError('External service unavailable', 503);
  }

  if (error.code === 'ETIMEDOUT') {
    return new AppError('Request timeout', 408);
  }

  if (error.response?.status === 401) {
    return new AuthenticationError('API authentication failed');
  }

  if (error.response?.status === 403) {
    return new AuthorizationError('API access denied');
  }

  if (error.response?.status === 429) {
    return new RateLimitError('API rate limit exceeded');
  }

  return new AppError('External API error', 502);
};

/**
 * Validation Error Helper
 */
export const createValidationError = (
  field: string,
  receivedValue: any,
  expectedValue: any,
  customMessage?: string
): ValidationError => {
  const message = customMessage || `Invalid ${field}: expected ${expectedValue}, received ${receivedValue}`;
  return new ValidationError(message, field, receivedValue, expectedValue);
};

/**
 * Error Recovery Strategies
 */
export class ErrorRecovery {
  static async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          break;
        }

        logger.warn(`Operation failed, retrying (${attempt}/${maxRetries})`, {
          error: lastError.message,
          attempt,
          delayMs
        });

        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      }
    }

    throw lastError!;
  }

  static async fallbackOperation<T>(
    primaryOperation: () => Promise<T>,
    fallbackOperation: () => Promise<T>
  ): Promise<T> {
    try {
      return await primaryOperation();
    } catch (error) {
      logger.warn('Primary operation failed, using fallback', {
        error: (error as Error).message
      });

      return await fallbackOperation();
    }
  }
}
