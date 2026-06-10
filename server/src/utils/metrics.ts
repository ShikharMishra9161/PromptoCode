/**
 * Metrics collection and aggregation utilities
 * Collects measurable system data for analysis
 */

// ─── Metric Types ──────────────────────────────────────────
export interface RequestMetric {
  endpoint: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  statusCode: number;
  responseTime: number; // milliseconds
  timestamp: Date;
  userId?: string;
  error?: string;
}

export interface MetricsAggregation {
  // Response time metrics (per endpoint)
  responseTimeAvg: Record<string, number>;
  responseTimeMin: Record<string, number>;
  responseTimeMax: Record<string, number>;
  responseTimeP95: Record<string, number>;
  
  // Request frequency
  requestCount: Record<string, number>;
  totalRequests: number;
  
  // Error tracking
  errorCount: Record<string, number>;
  errorRate: number;
  
  // Database operations
  dbWrites: number;
  dbReads: number;
  
  // Token usage
  totalTokensUsed: number;
  avgTokensPerGeneration: number;
  
  // User actions
  registrations: number;
  logins: number;
  uiGenerations: number;
  
  // Popular choices
  frameworkPopularity: Record<string, number>;
  stylePopularity: Record<string, number>;
  themePopularity: Record<string, number>;
}

// ─── In-Memory Metrics Store ───────────────────────────────
class MetricsCollector {
  private requestMetrics: RequestMetric[] = [];
  private dbWriteCount = 0;
  private dbReadCount = 0;

  // Record request metric
  recordRequest(metric: RequestMetric): void {
    this.requestMetrics.push(metric);
    // Keep only last 10,000 requests to avoid memory bloat
    if (this.requestMetrics.length > 10000) {
      this.requestMetrics = this.requestMetrics.slice(-10000);
    }
  }

  // Record database operation
  recordDbWrite(): void {
    this.dbWriteCount++;
  }

  recordDbRead(): void {
    this.dbReadCount++;
  }

  // Reset counters (call periodically, e.g., hourly)
  resetCounters(): void {
    this.dbWriteCount = 0;
    this.dbReadCount = 0;
  }

  // Get current metrics
  getMetrics(): {
    requests: RequestMetric[];
    dbWrites: number;
    dbReads: number;
  } {
    return {
      requests: this.requestMetrics,
      dbWrites: this.dbWriteCount,
      dbReads: this.dbReadCount,
    };
  }

  // Clear all metrics
  clearMetrics(): void {
    this.requestMetrics = [];
    this.dbWriteCount = 0;
    this.dbReadCount = 0;
  }
}

export const metricsCollector = new MetricsCollector();

// ─── Aggregation Calculations ──────────────────────────────

/**
 * Calculate percentile value (e.g., 95th percentile)
 */
export function calculatePercentile(
  values: number[],
  percentile: number
): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

/**
 * Calculate average response time per endpoint
 */
export function getAverageResponseTimes(
  metrics: RequestMetric[]
): Record<string, number> {
  const grouped: Record<string, number[]> = {};

  metrics.forEach(m => {
    if (!grouped[m.endpoint]) grouped[m.endpoint] = [];
    grouped[m.endpoint].push(m.responseTime);
  });

  const result: Record<string, number> = {};
  for (const [endpoint, times] of Object.entries(grouped)) {
    result[endpoint] = times.reduce((a, b) => a + b, 0) / times.length;
  }
  return result;
}

/**
 * Calculate min response time per endpoint
 */
export function getMinResponseTimes(
  metrics: RequestMetric[]
): Record<string, number> {
  const grouped: Record<string, number[]> = {};

  metrics.forEach(m => {
    if (!grouped[m.endpoint]) grouped[m.endpoint] = [];
    grouped[m.endpoint].push(m.responseTime);
  });

  const result: Record<string, number> = {};
  for (const [endpoint, times] of Object.entries(grouped)) {
    result[endpoint] = Math.min(...times);
  }
  return result;
}

/**
 * Calculate max response time per endpoint
 */
export function getMaxResponseTimes(
  metrics: RequestMetric[]
): Record<string, number> {
  const grouped: Record<string, number[]> = {};

  metrics.forEach(m => {
    if (!grouped[m.endpoint]) grouped[m.endpoint] = [];
    grouped[m.endpoint].push(m.responseTime);
  });

  const result: Record<string, number> = {};
  for (const [endpoint, times] of Object.entries(grouped)) {
    result[endpoint] = Math.max(...times);
  }
  return result;
}

/**
 * Calculate 95th percentile response time per endpoint
 */
export function getP95ResponseTimes(
  metrics: RequestMetric[]
): Record<string, number> {
  const grouped: Record<string, number[]> = {};

  metrics.forEach(m => {
    if (!grouped[m.endpoint]) grouped[m.endpoint] = [];
    grouped[m.endpoint].push(m.responseTime);
  });

  const result: Record<string, number> = {};
  for (const [endpoint, times] of Object.entries(grouped)) {
    result[endpoint] = calculatePercentile(times, 95);
  }
  return result;
}

/**
 * Count requests per endpoint
 */
export function getRequestCounts(
  metrics: RequestMetric[]
): Record<string, number> {
  const result: Record<string, number> = {};

  metrics.forEach(m => {
    if (!result[m.endpoint]) result[m.endpoint] = 0;
    result[m.endpoint]++;
  });

  return result;
}

/**
 * Count errors by status code
 */
export function getErrorCounts(
  metrics: RequestMetric[]
): Record<string, number> {
  const result: Record<string, number> = {};

  metrics.forEach(m => {
    if (m.statusCode >= 400) {
      const key = `${m.statusCode}`;
      if (!result[key]) result[key] = 0;
      result[key]++;
    }
  });

  return result;
}

/**
 * Calculate error rate
 */
export function getErrorRate(metrics: RequestMetric[]): number {
  if (metrics.length === 0) return 0;
  const errors = metrics.filter(m => m.statusCode >= 400).length;
  return (errors / metrics.length) * 100;
}
