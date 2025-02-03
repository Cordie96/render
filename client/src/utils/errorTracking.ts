import * as Sentry from '@sentry/react';

export const initErrorTracking = () => {
  if (import.meta.env.PROD) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [
        new Sentry.BrowserTracing({
          tracePropagationTargets: ['localhost', /^https:\/\/yourdomain\.com/],
        }),
      ],
      tracesSampleRate: 1.0,
    });
  }
};

export const captureError = (error: Error) => {
  if (import.meta.env.PROD) {
    Sentry.captureException(error);
  } else {
    console.error(error);
  }
}; 