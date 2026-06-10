import { Request, Response, NextFunction } from 'express';
import { metricsCollector } from '../utils/metrics';

/**
 * Middleware to track response times and request metrics
 * Attaches timestamp to request start and measures on response end
 */
export const metricsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Record request start time
  const startTime = Date.now();

  // Intercept res.json to capture status before it's sent
  const originalJson = res.json;
  res.json = function (body: any) {
    const responseTime = Date.now() - startTime;
    const endpoint = `${req.method} ${req.baseUrl}${req.path}`;
    
    // Record the metric
    metricsCollector.recordRequest({
      endpoint,
      method: req.method as any,
      statusCode: res.statusCode,
      responseTime,
      timestamp: new Date(),
      userId: (req.user as any)?._id?.toString(),
    });

    // Call original json method
    return originalJson.call(this, body);
  };

  // Also intercept res.end for non-JSON responses (like health check)
  const originalEnd = res.end;
  res.end = function (chunk?: any, encoding?: any) {
    // Avoid double-tracking if json was called
    if (!res.json.toString().includes('originalJson')) {
      const responseTime = Date.now() - startTime;
      const endpoint = `${req.method} ${req.baseUrl}${req.path}`;

      metricsCollector.recordRequest({
        endpoint,
        method: req.method as any,
        statusCode: res.statusCode,
        responseTime,
        timestamp: new Date(),
        userId: (req.user as any)?._id?.toString(),
      });
    }

    return originalEnd.call(this, chunk, encoding);
  };

  next();
};
