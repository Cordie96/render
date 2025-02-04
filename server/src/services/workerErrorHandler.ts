import { workerLogger as logger } from '../utils/workerLogger';
import { workerMetrics } from './workerMetrics';

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface WorkerError extends Error {
  severity?: ErrorSeverity;
  retryable?: boolean;
  context?: Record<string, any>;
}

export class WorkerErrorHandler {
  private readonly maxRetries: number;
  private readonly backoffMs: number;

  constructor(maxRetries = 3, backoffMs = 1000) {
    this.maxRetries = maxRetries;
    this.backoffMs = backoffMs;
  }

  async handleError(error: WorkerError, retryCount: number, context: Record<string, any> = {}): Promise<void> {
    const severity = error.severity || this.determineSeverity(error);
    const retryable = error.retryable ?? this.isRetryable(error);
    const enrichedContext = { ...context, ...error.context };

    // Log error with context
    logger.error('Worker error:', {
      error: error.message,
      stack: error.stack,
      severity,
      retryCount,
      ...enrichedContext
    });

    // Record metrics
    workerMetrics.recordError(error.name);
    workerMetrics.recordEvent(`error_severity_${severity}`);

    // Handle based on severity
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        await this.handleCriticalError(error, enrichedContext);
        break;
      case ErrorSeverity.HIGH:
        await this.handleHighSeverityError(error, enrichedContext);
        break;
      default:
        if (retryable && retryCount < this.maxRetries) {
          await this.retryWithBackoff(retryCount);
        }
    }
  }

  private determineSeverity(error: Error): ErrorSeverity {
    if (error instanceof TypeError || error instanceof SyntaxError) {
      return ErrorSeverity.HIGH;
    }
    if (error.message.includes('database') || error.message.includes('redis')) {
      return ErrorSeverity.CRITICAL;
    }
    return ErrorSeverity.MEDIUM;
  }

  private isRetryable(error: Error): boolean {
    const nonRetryableErrors = [
      TypeError,
      SyntaxError,
      ReferenceError
    ];
    return !nonRetryableErrors.some(errorType => error instanceof errorType);
  }

  private async handleCriticalError(error: WorkerError, context: Record<string, any>): Promise<void> {
    logger.error('Critical worker error:', {
      error: error.message,
      context
    });
    
    // Notify monitoring system
    workerMetrics.recordEvent('critical_error');
    
    // Could integrate with external notification systems here
    // await notificationService.sendAlert('Critical worker error', {...});
    
    // For critical errors, we might want to stop the worker
    process.exit(1);
  }

  private async handleHighSeverityError(error: WorkerError, context: Record<string, any>): Promise<void> {
    logger.error('High severity worker error:', {
      error: error.message,
      context
    });
    
    workerMetrics.recordEvent('high_severity_error');
    
    // Implement recovery logic for high severity errors
    // This could include cleaning up resources, rolling back transactions, etc.
  }

  private async retryWithBackoff(retryCount: number): Promise<void> {
    const delay = this.backoffMs * Math.pow(2, retryCount);
    logger.info(`Retrying after ${delay}ms (attempt ${retryCount + 1})`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
} 