import { createClient } from 'redis';
import { workerLogger as logger } from '../utils/workerLogger';
import { workerMetrics } from './workerMetrics';

export class RateLimiter {
  private redis;
  private windowSizeInSeconds: number;
  private maxRequests: number;

  constructor(redis: ReturnType<typeof createClient>, windowSize = 60, maxRequests = 1000) {
    this.redis = redis;
    this.windowSizeInSeconds = windowSize;
    this.maxRequests = maxRequests;
  }

  async isRateLimited(key: string): Promise<boolean> {
    const now = Date.now();
    const windowStart = now - (this.windowSizeInSeconds * 1000);

    try {
      // Remove old entries
      await this.redis.zRemRangeByScore(`ratelimit:${key}`, 0, windowStart);

      // Count requests in current window
      const requestCount = await this.redis.zCard(`ratelimit:${key}`);

      if (requestCount >= this.maxRequests) {
        workerMetrics.recordError('rate_limit_exceeded');
        logger.warn('Rate limit exceeded', { key, requestCount });
        return true;
      }

      // Add current request
      await this.redis.zAdd(`ratelimit:${key}`, { score: now, value: now.toString() });
      return false;
    } catch (error) {
      logger.error('Rate limiter error:', error);
      return false; // Fail open
    }
  }
} 