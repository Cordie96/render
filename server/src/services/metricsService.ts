import client from 'prom-client';
import { logger } from '../utils/logger';

// Create metrics
const activeRooms = new client.Gauge({
  name: 'youtube_party_active_rooms',
  help: 'Number of active rooms'
});

const connectedUsers = new client.Gauge({
  name: 'youtube_party_connected_users',
  help: 'Number of connected users'
});

const queueOperations = new client.Counter({
  name: 'youtube_party_queue_operations_total',
  help: 'Total number of queue operations',
  labelNames: ['operation']
});

const wsLatency = new client.Histogram({
  name: 'youtube_party_ws_latency_seconds',
  help: 'WebSocket message latency',
  buckets: [0.1, 0.5, 1, 2, 5]
});

const errors = new client.Counter({
  name: 'youtube_party_errors_total',
  help: 'Total number of errors',
  labelNames: ['type']
});

// Initialize metrics collection
client.collectDefaultMetrics();

// Add Loki logging
const lokiTransport = {
  log: (info: any) => {
    if (process.env.METRICS_ENABLED === 'true') {
      const { level, message, ...labels } = info;
      fetch(`${process.env.LOKI_URL}/loki/api/v1/push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streams: [{
            stream: {
              level,
              ...labels
            },
            values: [[Date.now().toString(), message]]
          }]
        })
      }).catch(console.error);
    }
    return info;
  }
};

logger.add(lokiTransport);

export const metrics = {
  activeRooms,
  connectedUsers,
  queueOperations,
  wsLatency,
  errors,
  
  // Helper methods
  incrementQueueOperation(operation: string) {
    queueOperations.inc({ operation });
  },

  recordWSLatency(latencyMs: number) {
    wsLatency.observe(latencyMs / 1000);
  },

  recordError(type: string) {
    errors.inc({ type });
  },

  updateRoomCount(count: number) {
    activeRooms.set(count);
  },

  updateUserCount(count: number) {
    connectedUsers.set(count);
  },

  // Add logging metrics
  logEvent(level: string, message: string, labels: Record<string, string> = {}) {
    logger.log({
      level,
      message,
      service: 'youtube-party',
      ...labels
    });
  }
}; 