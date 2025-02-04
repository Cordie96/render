import express from 'express';
import { createClient } from 'redis';
import { workerMetrics } from './services/workerMetrics';
import { workerLogger as logger } from './utils/workerLogger';
import helmet from 'helmet';
import { validateWorkerEnv } from './utils/workerEnv';

const env = validateWorkerEnv();
const app = express();

// Security middleware
app.use(helmet());
app.use((req, res, next) => {
  // Only allow requests from Prometheus
  const allowedIPs = env.PROMETHEUS_IPS.split(',');
  if (!allowedIPs.includes(req.ip)) {
    logger.warn('Unauthorized health check access attempt', { ip: req.ip });
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
});

const redis = createClient({
  url: env.REDIS_URL
});

app.get('/health', async (req, res) => {
  try {
    // Check Redis connection
    const redisConnected = redis.isOpen;
    if (!redisConnected) {
      throw new Error('Redis not connected');
    }

    // Check queue length
    const queueLength = await redis.lLen('queue:items');
    const queueHealthy = queueLength < 1000; // Arbitrary threshold

    // Get worker metrics
    const metrics = {
      queueLength,
      activeWorkers: await workerMetrics.activeWorkers.get(),
      errorRate: (await workerMetrics.queueErrors.get()).value,
      processingRate: (await workerMetrics.queueProcessingTime.get()).rate
    };

    // Add security headers
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
    });

    if (!queueHealthy) {
      return res.status(503).json({
        status: 'unhealthy',
        reason: 'Queue backlog too high',
        metrics
      });
    }

    return res.json({
      status: 'healthy',
      metrics
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    return res.status(503).json({
      status: 'unhealthy',
      reason: error.message
    });
  }
});

const port = env.HEALTH_PORT;
app.listen(port, () => {
  logger.info(`Worker health check server listening on port ${port}`);
}); 