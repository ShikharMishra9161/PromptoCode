import { Router } from 'express';
import {
  getMetrics,
  getRequestLogs,
  clearMetrics,
} from '../controllers/metrics.controller';

const router = Router();

/**
 * GET /api/metrics
 * Returns aggregated system metrics
 * - Response times (avg, min, max, p95) per endpoint
 * - Request counts per endpoint
 * - Error rates and counts
 * - Database operation counts
 * - Token usage statistics
 * - Popular UI choices (frameworks, styles, themes)
 */
router.get('/', getMetrics);

/**
 * GET /api/metrics/logs
 * Returns detailed request logs (for debugging)
 * Query params:
 *   - limit: number of logs to return (default 50, max 500)
 */
router.get('/logs', getRequestLogs);

/**
 * POST /api/metrics/clear
 * Clears all collected metrics (use for testing)
 */
router.post('/clear', clearMetrics);

export { router as metricsRouter };
