import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

export function initializeMonitoring() {
  if (import.meta.env.PROD) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [
        new BrowserTracing({
          tracePropagationTargets: [
            'localhost',
            /^https:\/\/api\.yourapp\.com/,
          ],
        }),
      ],
      tracesSampleRate: 1.0,
      environment: import.meta.env.MODE,
    });
  }
}

export function trackError(error: Error, context?: Record<string, any>) {
  if (import.meta.env.PROD) {
    Sentry.captureException(error, {
      extra: context,
    });
  } else {
    console.error('Error:', error, 'Context:', context);
  }
}

export function trackEvent(name: string, data?: Record<string, any>) {
  if (import.meta.env.PROD) {
    Sentry.captureMessage(name, {
      level: 'info',
      extra: data,
    });
  } else {
    console.log('Event:', name, 'Data:', data);
  }
} 