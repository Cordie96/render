import { workerLogger as logger } from '../utils/workerLogger';
import { workerMetrics } from './workerMetrics';

enum CircuitState {
  CLOSED,
  OPEN,
  HALF_OPEN
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private readonly failureThreshold: number;
  private readonly resetTimeout: number;
  private readonly halfOpenMaxAttempts: number;
  private halfOpenAttempts: number = 0;

  constructor(
    failureThreshold = 5,
    resetTimeoutMs = 30000,
    halfOpenMaxAttempts = 3
  ) {
    this.failureThreshold = failureThreshold;
    this.resetTimeout = resetTimeoutMs;
    this.halfOpenMaxAttempts = halfOpenMaxAttempts;
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.isOpen()) {
      throw new Error('Circuit breaker is open');
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private isOpen(): boolean {
    if (this.state === CircuitState.CLOSED) {
      return false;
    }

    if (this.state === CircuitState.OPEN) {
      const now = Date.now();
      if (now - this.lastFailureTime >= this.resetTimeout) {
        this.state = CircuitState.HALF_OPEN;
        this.halfOpenAttempts = 0;
        logger.info('Circuit breaker entering half-open state');
        workerMetrics.recordEvent('circuit_breaker_half_open');
      }
      return true;
    }

    return this.halfOpenAttempts >= this.halfOpenMaxAttempts;
  }

  private onSuccess(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.CLOSED;
      this.failureCount = 0;
      this.halfOpenAttempts = 0;
      logger.info('Circuit breaker closed');
      workerMetrics.recordEvent('circuit_breaker_closed');
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN || 
        this.failureCount >= this.failureThreshold) {
      this.state = CircuitState.OPEN;
      logger.warn('Circuit breaker opened', { 
        failureCount: this.failureCount 
      });
      workerMetrics.recordEvent('circuit_breaker_opened');
    }
  }
} 