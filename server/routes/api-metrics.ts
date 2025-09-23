/**
 * API Metrics Routes
 * Endpoints für Performance-Monitoring und Analytics
 */

import express from 'express';
import { cacheService } from '../services/cacheService';
import { Logger } from '../services/logger.service';

const router = express.Router();
const logger = new Logger('ApiMetrics');

/**
 * Prometheus-formatierte Metriken
 */
router.get('/metrics', async (req, res) => {
  try {
    const cacheStats = cacheService.getStats();
    
    const metrics = [
      '# HELP helix_cache_hits_total Total cache hits',
      '# TYPE helix_cache_hits_total counter',
      `helix_cache_hits_total ${cacheStats.hits}`,
      '',
      '# HELP helix_cache_misses_total Total cache misses',
      '# TYPE helix_cache_misses_total counter',
      `helix_cache_misses_total ${cacheStats.misses}`,
      '',
      '# HELP helix_cache_hit_rate Cache hit rate percentage',
      '# TYPE helix_cache_hit_rate gauge',
      `helix_cache_hit_rate ${cacheStats.hitRate}`,
      '',
      '# HELP helix_cache_memory_usage_bytes Cache memory usage in bytes',
      '# TYPE helix_cache_memory_usage_bytes gauge',
      `helix_cache_memory_usage_bytes ${cacheStats.memoryUsage}`,
      '',
      '# HELP helix_cache_size Cache size (number of entries)',
      '# TYPE helix_cache_size gauge',
      `helix_cache_size ${cacheService.getSize()}`,
      '',
      '# HELP helix_api_requests_total Total API requests',
      '# TYPE helix_api_requests_total counter',
      `helix_api_requests_total ${req.headers['x-request-count'] || 0}`,
      '',
      '# HELP helix_uptime_seconds Application uptime in seconds',
      '# TYPE helix_uptime_seconds gauge',
      `helix_uptime_seconds ${process.uptime()}`
    ].join('\n');

    res.set('Content-Type', 'text/plain');
    res.send(metrics);
  } catch (error) {
    logger.error('Metrics endpoint error', { error: (error as Error).message });
    res.status(500).json({ error: 'Failed to generate metrics' });
  }
});

/**
 * Health Check mit detaillierten Informationen
 */
router.get('/health', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cache: cacheService.getStats(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0'
    };

    res.json(health);
  } catch (error) {
    logger.error('Health check error', { error: (error as Error).message });
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: (error as Error).message
    });
  }
});

/**
 * Performance-Statistiken
 */
router.get('/performance', async (req, res) => {
  try {
    const performance = {
      timestamp: new Date().toISOString(),
      memory: {
        rss: process.memoryUsage().rss,
        heapTotal: process.memoryUsage().heapTotal,
        heapUsed: process.memoryUsage().heapUsed,
        external: process.memoryUsage().external
      },
      cpu: process.cpuUsage(),
      uptime: process.uptime(),
      cache: cacheService.getStats(),
      platform: process.platform,
      nodeVersion: process.version,
      pid: process.pid
    };

    res.json(performance);
  } catch (error) {
    logger.error('Performance stats error', { error: (error as Error).message });
    res.status(500).json({ error: 'Failed to get performance stats' });
  }
});

/**
 * Cache-Statistiken
 */
router.get('/cache', async (req, res) => {
  try {
    const stats = cacheService.getStats();
    res.json({
      timestamp: new Date().toISOString(),
      ...stats,
      size: cacheService.getSize()
    });
  } catch (error) {
    logger.error('Cache stats error', { error: (error as Error).message });
    res.status(500).json({ error: 'Failed to get cache stats' });
  }
});

/**
 * Cache leeren
 */
router.delete('/cache', async (req, res) => {
  try {
    await cacheService.clear();
    logger.info('Cache cleared via API');
    res.json({ message: 'Cache cleared successfully' });
  } catch (error) {
    logger.error('Cache clear error', { error: (error as Error).message });
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

export default router;
