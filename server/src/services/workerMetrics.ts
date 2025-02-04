import client from 'prom-client';

// Queue metrics
const queueLength = new client.Gauge({
  name: 'youtube_party_queue_length',
  help: 'Current number of items in the queue'
});

const queueProcessingTime = new client.Histogram({
  name: 'youtube_party_queue_processing_seconds',
  help: 'Time taken to process queue items',
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

const queueErrors = new client.Counter({
  name: 'youtube_party_queue_errors_total',
  help: 'Total number of queue processing errors',
  labelNames: ['type']
});

const jobRetries = new client.Counter({
  name: 'youtube_party_job_retries_total',
  help: 'Total number of job retries',
  labelNames: ['jobType']
});

const activeWorkers = new client.Gauge({
  name: 'youtube_party_active_workers',
  help: 'Number of active worker processes'
});

// Rate limit metrics
const rateLimitEvents = new client.Counter({
  name: 'youtube_party_rate_limit_events_total',
  help: 'Total number of rate limit events',
  labelNames: ['type']
});

const circuitBreakerEvents = new client.Counter({
  name: 'youtube_party_circuit_breaker_events_total',
  help: 'Total number of circuit breaker events',
  labelNames: ['type']
});

// Worker coordination metrics
const workerCoordination = new client.Gauge({
  name: 'youtube_party_worker_coordination_info',
  help: 'Worker coordination information',
  labelNames: ['worker_id', 'status']
});

const workerHeartbeat = new client.Gauge({
  name: 'youtube_party_worker_heartbeat_timestamp',
  help: 'Last heartbeat timestamp for each worker',
  labelNames: ['worker_id']
});

const workerLoad = new client.Gauge({
  name: 'youtube_party_worker_load',
  help: 'Current load per worker',
  labelNames: ['worker_id']
});

const workDistribution = new client.Histogram({
  name: 'youtube_party_work_distribution_ratio',
  help: 'Ratio of work items to active workers',
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

// Initialize metrics collection
client.collectDefaultMetrics();

export const workerMetrics = {
  queueLength,
  queueProcessingTime,
  queueErrors,
  jobRetries,
  activeWorkers,
  rateLimitEvents,
  circuitBreakerEvents,
  workerCoordination,
  workerHeartbeat,
  workerLoad,
  workDistribution,

  // Helper methods
  startProcessing(jobType: string) {
    return queueProcessingTime.startTimer();
  },

  recordError(type: string) {
    queueErrors.inc({ type });
  },

  recordRetry(jobType: string) {
    jobRetries.inc({ jobType });
  },

  updateQueueLength(length: number) {
    queueLength.set(length);
  },

  setActiveWorkers(count: number) {
    activeWorkers.set(count);
  },

  recordEvent(type: string) {
    if (type.startsWith('rate_limit')) {
      rateLimitEvents.inc({ type });
    } else if (type.startsWith('circuit_breaker')) {
      circuitBreakerEvents.inc({ type });
    }
  },

  updateWorkerStatus(workerId: string, status: string) {
    workerCoordination.set({ worker_id: workerId, status }, 1);
  },

  updateHeartbeat(workerId: string) {
    workerHeartbeat.set({ worker_id: workerId }, Date.now());
  },

  updateWorkerLoad(workerId: string, load: number) {
    workerLoad.set({ worker_id: workerId }, load);
  },

  recordWorkDistribution(ratio: number) {
    workDistribution.observe(ratio);
  }
}; 