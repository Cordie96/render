type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: Record<string, any>;
}

export const loggingService = {
  log: (level: LogLevel, message: string, data?: Record<string, any>) => {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
    };

    if (import.meta.env.PROD) {
      // Send to logging service in production
      if (level === 'error') {
        Sentry.captureMessage(message, {
          level: 'error',
          extra: data,
        });
      }
    } else {
      // Log to console in development
      console[level](entry);
    }
  },

  info: (message: string, data?: Record<string, any>) => {
    loggingService.log('info', message, data);
  },

  warn: (message: string, data?: Record<string, any>) => {
    loggingService.log('warn', message, data);
  },

  error: (message: string, data?: Record<string, any>) => {
    loggingService.log('error', message, data);
  },

  debug: (message: string, data?: Record<string, any>) => {
    if (!import.meta.env.PROD) {
      loggingService.log('debug', message, data);
    }
  },
};

export default loggingService; 