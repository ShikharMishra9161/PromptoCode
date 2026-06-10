import { metricsCollector } from '../utils/metrics';

/**
 * Database operation metrics tracking
 * Wrap Mongoose queries to track reads and writes
 */

/**
 * Track a database write operation
 * Call this before/after User.create(), History.create(), entry.save(), etc.
 * 
 * Usage:
 *   const user = await User.create(data);
 *   trackDbWrite();
 */
export function trackDbWrite(): void {
  metricsCollector.recordDbWrite();
}

/**
 * Track a database read operation
 * Call this for User.findOne(), History.find(), History.countDocuments(), etc.
 * 
 * Usage:
 *   const user = await User.findById(id);
 *   trackDbRead();
 */
export function trackDbRead(): void {
  metricsCollector.recordDbRead();
}

/**
 * Wrap User model operations
 * This HOF wraps any User operation and tracks it
 * 
 * Usage:
 *   const user = await withDbRead(() => User.findById(id))();
 */
export function withDbRead<T>(
  fn: () => Promise<T>
): () => Promise<T> {
  return async () => {
    const result = await fn();
    trackDbRead();
    return result;
  };
}

export function withDbWrite<T>(
  fn: () => Promise<T>
): () => Promise<T> {
  return async () => {
    const result = await fn();
    trackDbWrite();
    return result;
  };
}
