import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';
import { workerLogger as logger } from '../utils/workerLogger';
import { workerMetrics } from './workerMetrics';
import { WorkerError, ErrorSeverity } from './workerErrorHandler';

export class WorkerRecovery {
  private prisma: PrismaClient;
  private redis: ReturnType<typeof createClient>;
  private errorCount: number = 0;
  private readonly errorThreshold: number;

  constructor(
    prisma: PrismaClient,
    redis: ReturnType<typeof createClient>,
    errorThreshold = Number(process.env.WORKER_ERROR_THRESHOLD) || 10
  ) {
    this.prisma = prisma;
    this.redis = redis;
    this.errorThreshold = errorThreshold;
  }

  async handleRecovery(error: WorkerError): Promise<void> {
    this.errorCount++;
    
    try {
      // Check if we need to initiate recovery
      if (this.errorCount >= this.errorThreshold) {
        await this.initiateRecovery(error);
        return;
      }

      // Handle specific error types
      switch (error.severity) {
        case ErrorSeverity.CRITICAL:
          await this.handleCriticalRecovery(error);
          break;
        case ErrorSeverity.HIGH:
          await this.handleHighPriorityRecovery(error);
          break;
        default:
          await this.handleStandardRecovery(error);
      }
    } catch (recoveryError) {
      logger.error('Recovery failed:', recoveryError);
      workerMetrics.recordEvent('recovery_failed');
      throw recoveryError;
    }
  }

  private async initiateRecovery(error: WorkerError): Promise<void> {
    logger.warn('Initiating worker recovery', {
      errorCount: this.errorCount,
      threshold: this.errorThreshold
    });

    // Save current state
    await this.saveWorkerState();

    // Clean up resources
    await this.cleanupResources();

    // Reset error count
    this.errorCount = 0;

    // Record recovery metrics
    workerMetrics.recordEvent('recovery_initiated');
  }

  private async handleCriticalRecovery(error: WorkerError): Promise<void> {
    logger.error('Critical error recovery:', error);

    // Pause queue processing
    await this.pauseQueueProcessing();

    // Save diagnostic information
    await this.saveDiagnostics(error);

    // Notify administrators
    await this.sendAlert(error);

    workerMetrics.recordEvent('critical_recovery_attempted');
  }

  private async handleHighPriorityRecovery(error: WorkerError): Promise<void> {
    logger.warn('High priority recovery:', error);

    // Attempt to recover stuck items
    await this.recoverStuckItems();

    // Verify database connections
    await this.verifyConnections();

    workerMetrics.recordEvent('high_priority_recovery_attempted');
  }

  private async handleStandardRecovery(error: WorkerError): Promise<void> {
    logger.info('Standard recovery:', error);

    // Basic cleanup
    await this.cleanupResources();

    workerMetrics.recordEvent('standard_recovery_attempted');
  }

  private async saveWorkerState(): Promise<void> {
    const state = {
      timestamp: new Date(),
      errorCount: this.errorCount,
      metrics: await workerMetrics.getSnapshot()
    };

    await this.redis.set(
      'worker:recovery:state',
      JSON.stringify(state),
      { EX: 3600 } // Expire after 1 hour
    );
  }

  private async cleanupResources(): Promise<void> {
    // Clean up any temporary data
    await this.redis.del('worker:processing');
    
    // Reset metrics
    await workerMetrics.reset();
  }

  private async pauseQueueProcessing(): Promise<void> {
    await this.redis.set('worker:paused', '1', { EX: 300 }); // Pause for 5 minutes
    workerMetrics.recordEvent('queue_processing_paused');
  }

  private async saveDiagnostics(error: WorkerError): Promise<void> {
    const diagnostics = {
      error: {
        message: error.message,
        stack: error.stack,
        context: error.context
      },
      state: await this.getWorkerState(),
      metrics: await workerMetrics.getSnapshot()
    };

    await this.redis.set(
      `worker:diagnostics:${Date.now()}`,
      JSON.stringify(diagnostics),
      { EX: 86400 } // Keep for 24 hours
    );
  }

  private async sendAlert(error: WorkerError): Promise<void> {
    // This could integrate with your alert system
    logger.error('Worker alert:', {
      error: error.message,
      severity: error.severity,
      context: error.context
    });
    
    workerMetrics.recordEvent('alert_sent');
  }

  private async recoverStuckItems(): Promise<void> {
    const processingItems = await this.redis.lRange('worker:processing', 0, -1);
    
    for (const item of processingItems) {
      await this.redis.lPush('queue:items', item);
    }
    
    await this.redis.del('worker:processing');
  }

  private async verifyConnections(): Promise<void> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      await this.redis.ping();
    } catch (error) {
      throw new Error('Failed to verify connections: ' + error.message);
    }
  }

  private async getWorkerState(): Promise<any> {
    const state = await this.redis.get('worker:recovery:state');
    return state ? JSON.parse(state) : null;
  }
} 