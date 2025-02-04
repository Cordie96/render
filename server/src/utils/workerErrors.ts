import { ErrorSeverity, WorkerError } from '../services/workerErrorHandler';

export class QueueProcessingError extends Error implements WorkerError {
  constructor(
    message: string,
    public severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    public retryable: boolean = true,
    public context: Record<string, any> = {}
  ) {
    super(message);
    this.name = 'QueueProcessingError';
  }
}

export class WorkerResourceError extends Error implements WorkerError {
  constructor(
    message: string,
    public severity: ErrorSeverity = ErrorSeverity.HIGH,
    public retryable: boolean = true,
    public context: Record<string, any> = {}
  ) {
    super(message);
    this.name = 'WorkerResourceError';
  }
}

export class WorkerStateError extends Error implements WorkerError {
  constructor(
    message: string,
    public severity: ErrorSeverity = ErrorSeverity.CRITICAL,
    public retryable: boolean = false,
    public context: Record<string, any> = {}
  ) {
    super(message);
    this.name = 'WorkerStateError';
  }
} 