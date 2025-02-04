import { z } from 'zod';

const workerEnvSchema = z.object({
  // Required environment variables
  REDIS_URL: z.string().url(),
  DATABASE_URL: z.string().url(),
  HEALTH_PORT: z.string().transform(Number),
  PROMETHEUS_IPS: z.string(),
  WORKER_AUTH_TOKEN: z.string().min(1),
  
  // Optional environment variables with defaults
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  METRICS_ENABLED: z.enum(['true', 'false']).default('false'),
});

export type WorkerEnv = z.infer<typeof workerEnvSchema>;

export function validateWorkerEnv(): WorkerEnv {
  try {
    return workerEnvSchema.parse(process.env);
  } catch (error) {
    console.error('Invalid worker environment configuration:', error);
    process.exit(1);
  }
} 