import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { redis } from '../setup.worker';
import { workerMetrics } from '../../services/workerMetrics';

const app = express();
require('../../worker-health');

describe('Worker Health Check', () => {
  beforeAll(() => {
    process.env.PROMETHEUS_IPS = '127.0.0.1';
  });

  it('returns healthy status when everything is ok', async () => {
    const response = await request(app)
      .get('/health')
      .set('X-Forwarded-For', '127.0.0.1');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('healthy');
    expect(response.body.metrics).toBeDefined();
  });

  it('returns unhealthy status when queue is too long', async () => {
    // Add many items to queue
    for (let i = 0; i < 1100; i++) {
      await redis.lPush('queue:items', JSON.stringify({ type: 'test' }));
    }

    const response = await request(app)
      .get('/health')
      .set('X-Forwarded-For', '127.0.0.1');

    expect(response.status).toBe(503);
    expect(response.body.status).toBe('unhealthy');
    expect(response.body.reason).toBe('Queue backlog too high');
  });

  it('blocks unauthorized IPs', async () => {
    const response = await request(app)
      .get('/health')
      .set('X-Forwarded-For', '1.2.3.4');

    expect(response.status).toBe(403);
  });
}); 