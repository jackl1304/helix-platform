import express from 'express';
import { logger, LoggingUtils } from '../utils/logger';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './api-routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// SAUBERER SERVER - NEU PROGRAMMIERT
// ========================================

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info('${req.method} ${req.path}', { context: '${new Date().toISOString()}' });
  next();
});

// API Routes
app.use('/api', apiRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Helix API Server v2.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/health',
      'GET /api/dashboard/stats',
      'GET /api/legal-cases',
      'GET /api/regulatory-updates',
      'GET /api/data-sources',
      'GET /api/newsletter-sources',
      'GET /api/sync/status',
      'POST /api/sync/trigger'
    ]
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Server Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  logger.info('🚀 Helix API Server v2.0 running on http://localhost:${PORT}');
  logger.info('📊 Health check: http://localhost:${PORT}/api/health');
  logger.info('⚖️  Legal cases: http://localhost:${PORT}/api/legal-cases');
  logger.info('📋 Regulatory updates: http://localhost:${PORT}/api/regulatory-updates');
});

export default app;

