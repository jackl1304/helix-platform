import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to ensure all API responses are JSON
 * This prevents accidental HTML responses from API routes
 */
export function ensureJsonResponse(req: Request, res: Response, next: NextFunction): void {
  // Store original json method
  const originalJson = res.json.bind(res);
  
  // Override json to ensure Content-Type is set
  res.json = function(data: any) {
    res.setHeader('Content-Type', 'application/json');
    return originalJson(data);
  };
  
  // Ensure no HTML responses
  const originalSend = res.send.bind(res);
  res.send = function(body: any) {
    // If it's an API route, force JSON
    if (req.path.startsWith('/api/')) {
      res.setHeader('Content-Type', 'application/json');
      if (typeof body === 'string' && body.trim().startsWith('<')) {
        // HTML detected in API route - convert to error JSON
        return originalJson({
          success: false,
          error: 'Invalid response format',
          message: 'API routes must return JSON, not HTML'
        });
      }
    }
    return originalSend(body);
  };
  
  next();
}

