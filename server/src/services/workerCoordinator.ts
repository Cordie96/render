import { createClient } from 'redis';
import { workerLogger as logger } from '../utils/workerLogger';
import { workerMetrics } from './workerMetrics';

interface WorkerInfo {
  id: string;
  startTime: number;
  lastHeartbeat: number;
  status: 'active' | 'draining' | 'stopped';
  metrics: {
    queueLength: number;
    processingRate: number;
    errorRate: number;
  };
}

export class WorkerCoordinator {
  private readonly redis;
  private readonly workerId: string;
  private heartbeatInterval: NodeJS.Timer | null = null;
  private readonly heartbeatTimeoutMs = 30000; // 30 seconds

  constructor(redis: ReturnType<typeof createClient>) {
    this.redis = redis;
    this.workerId = `worker:${process.pid}:${Date.now()}`;
  }

  async start(): Promise<void> {
    try {
      await this.registerWorker();
      this.startHeartbeat();
      await this.updateActiveWorkers();
      workerMetrics.updateWorkerStatus(this.workerId, 'active');
      logger.info('Worker coordinator started', { workerId: this.workerId });
    } catch (error) {
      logger.error('Failed to start worker coordinator:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    try {
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
      }
      await this.updateWorkerStatus('stopped');
      workerMetrics.updateWorkerStatus(this.workerId, 'stopped');
      await this.redis.del(`worker:${this.workerId}`);
      await this.updateActiveWorkers();
      logger.info('Worker coordinator stopped', { workerId: this.workerId });
    } catch (error) {
      logger.error('Error stopping worker coordinator:', error);
      throw error;
    }
  }

  async shouldProcessWork(): Promise<boolean> {
    try {
      const workerInfo = await this.getWorkerInfo();
      if (!workerInfo) return false;

      if (workerInfo.status !== 'active') return false;

      const activeWorkers = await this.getActiveWorkers();
      const queueLength = await this.redis.lLen('queue:items');
      const workerLoad = queueLength / activeWorkers.length;

      workerMetrics.recordWorkDistribution(workerLoad);
      workerMetrics.updateWorkerLoad(this.workerId, workerLoad);

      const currentMetrics = await workerMetrics.getSnapshot();
      return currentMetrics.processingRate < workerLoad;
    } catch (error) {
      logger.error('Error checking work status:', error);
      return false;
    }
  }

  private async registerWorker(): Promise<void> {
    const workerInfo: WorkerInfo = {
      id: this.workerId,
      startTime: Date.now(),
      lastHeartbeat: Date.now(),
      status: 'active',
      metrics: {
        queueLength: 0,
        processingRate: 0,
        errorRate: 0
      }
    };

    await this.redis.set(
      `worker:${this.workerId}`,
      JSON.stringify(workerInfo),
      { EX: 60 }
    );
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(async () => {
      try {
        await this.updateHeartbeat();
      } catch (error) {
        logger.error('Heartbeat update failed:', error);
      }
    }, 15000); // Every 15 seconds
  }

  private async updateHeartbeat(): Promise<void> {
    const metrics = await workerMetrics.getSnapshot();
    const workerInfo = await this.getWorkerInfo();

    if (workerInfo) {
      workerInfo.lastHeartbeat = Date.now();
      workerInfo.metrics = {
        queueLength: metrics.queueLength,
        processingRate: metrics.processingRate,
        errorRate: metrics.errorRate
      };

      workerMetrics.updateHeartbeat(this.workerId);
      await this.redis.set(
        `worker:${this.workerId}`,
        JSON.stringify(workerInfo),
        { EX: 60 }
      );
    }
  }

  private async updateWorkerStatus(status: WorkerInfo['status']): Promise<void> {
    const workerInfo = await this.getWorkerInfo();
    if (workerInfo) {
      workerInfo.status = status;
      await this.redis.set(
        `worker:${this.workerId}`,
        JSON.stringify(workerInfo),
        { EX: 60 }
      );
    }
  }

  private async getWorkerInfo(): Promise<WorkerInfo | null> {
    const data = await this.redis.get(`worker:${this.workerId}`);
    return data ? JSON.parse(data) : null;
  }

  private async getActiveWorkers(): Promise<WorkerInfo[]> {
    const workers: WorkerInfo[] = [];
    const keys = await this.redis.keys('worker:*');
    
    for (const key of keys) {
      const data = await this.redis.get(key);
      if (data) {
        const worker = JSON.parse(data) as WorkerInfo;
        if (worker.status === 'active' && 
            Date.now() - worker.lastHeartbeat < this.heartbeatTimeoutMs) {
          workers.push(worker);
        }
      }
    }

    return workers;
  }

  private async updateActiveWorkers(): Promise<void> {
    const activeWorkers = await this.getActiveWorkers();
    workerMetrics.setActiveWorkers(activeWorkers.length);
  }
} 