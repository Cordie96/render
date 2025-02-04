import winston from 'winston';
import { workerMetrics } from '../services/workerMetrics';

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json(),
  winston.format.metadata({
    fillExcept: ['message', 'level', 'timestamp']
  })
);

export const workerLogger = winston.createLogger({
  levels: logLevels,
  format: logFormat,
  defaultMeta: { service: 'worker' },
  transports: [
    new winston.transports.Console({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    }),
  ],
});

// Add Loki transport if metrics are enabled
if (process.env.METRICS_ENABLED === 'true') {
  workerLogger.on('data', (log) => {
    const { level, message, metadata } = log;
    workerMetrics.logEvent(level, message, metadata);
  });
} 