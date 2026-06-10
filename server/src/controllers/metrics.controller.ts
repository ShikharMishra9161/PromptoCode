import { Request, Response, NextFunction } from 'express';
import { metricsCollector } from '../utils/metrics';
import {
  getAverageResponseTimes,
  getMinResponseTimes,
  getMaxResponseTimes,
  getP95ResponseTimes,
  getRequestCounts,
  getErrorCounts,
  getErrorRate,
  MetricsAggregation,
} from '../utils/metrics';
import { History } from '../models/History.model';
import { AppError } from '../middleware/errorHandler';

/**
 * Get aggregated system metrics
 * Used by admin dashboards to monitor system health
 */
export const getMetrics = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { requests, dbWrites, dbReads } = metricsCollector.getMetrics();
    const totalRequests = requests.length;

    // Response time calculations
    const avgResponseTimes = getAverageResponseTimes(requests);
    const minResponseTimes = getMinResponseTimes(requests);
    const maxResponseTimes = getMaxResponseTimes(requests);
    const p95ResponseTimes = getP95ResponseTimes(requests);

    // Request counts per endpoint
    const requestCounts = getRequestCounts(requests);

    // Error tracking
    const errorCounts = getErrorCounts(requests);
    const errorRate = getErrorRate(requests);

    // Token usage from database
    const tokenStats = await History.aggregate([
      {
        $group: {
          _id: null,
          totalTokens: { $sum: '$tokensUsed' },
          count: { $sum: 1 },
          avgTokens: { $avg: '$tokensUsed' },
        },
      },
    ]);

    const totalTokensUsed = tokenStats[0]?.totalTokens ?? 0;
    const generationCount = tokenStats[0]?.count ?? 0;
    const avgTokensPerGeneration = tokenStats[0]?.avgTokens ?? 0;

    // Popular choices
    const frameworkStats = await History.aggregate([
      { $group: { _id: '$framework', count: { $sum: 1 } } },
    ]);

    const styleStats = await History.aggregate([
      { $group: { _id: '$style', count: { $sum: 1 } } },
    ]);

    const themeStats = await History.aggregate([
      { $group: { _id: '$theme', count: { $sum: 1 } } },
    ]);

    const frameworkPopularity = frameworkStats.reduce(
      (acc, { _id, count }) => {
        acc[_id] = count;
        return acc;
      },
      {} as Record<string, number>
    );

    const stylePopularity = styleStats.reduce(
      (acc, { _id, count }) => {
        acc[_id] = count;
        return acc;
      },
      {} as Record<string, number>
    );

    const themePopularity = themeStats.reduce(
      (acc, { _id, count }) => {
        acc[_id] = count;
        return acc;
      },
      {} as Record<string, number>
    );

    // Count registrations (users created after app startup - approximate)
    const userCount = await (require('../models/User.model').User).countDocuments();

    const aggregation: MetricsAggregation = {
      responseTimeAvg: avgResponseTimes,
      responseTimeMin: minResponseTimes,
      responseTimeMax: maxResponseTimes,
      responseTimeP95: p95ResponseTimes,
      requestCount: requestCounts,
      totalRequests,
      errorCount: errorCounts,
      errorRate,
      dbWrites,
      dbReads,
      totalTokensUsed,
      avgTokensPerGeneration,
      registrations: userCount,
      logins: requestCounts['POST /api/auth/login'] ?? 0,
      uiGenerations: generationCount,
      frameworkPopularity,
      stylePopularity,
      themePopularity,
    };

    res.json({ success: true, data: aggregation });
  } catch (error) {
    next(error);
  }
};

/**
 * Get detailed request logs (last N requests)
 * Useful for debugging specific issues
 */
export const getRequestLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 500);
    const { requests } = metricsCollector.getMetrics();

    // Get last N requests
    const logs = requests.slice(-limit).reverse();

    res.json({ success: true, data: { logs, total: requests.length } });
  } catch (error) {
    next(error);
  }
};

/**
 * Clear all collected metrics
 * Use for testing or resetting metrics
 */
export const clearMetrics = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    metricsCollector.clearMetrics();
    res.json({ success: true, data: { message: 'Metrics cleared' } });
  } catch (error) {
    next(error);
  }
};
