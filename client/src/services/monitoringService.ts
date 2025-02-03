import * as Sentry from '@sentry/react';

interface MonitoringOptions {
  userId?: string;
  extra?: Record<string, any>;
}

export const monitoringService = {
  trackError: (error: Error, options?: MonitoringOptions) => {
    if (import.meta.env.PROD) {
      if (options?.userId) {
        Sentry.setUser({ id: options.userId });
      }
      
      if (options?.extra) {
        Sentry.setExtras(options.extra);
      }
      
      Sentry.captureException(error);
    } else {
      console.error('Error:', error, 'Options:', options);
    }
  },

  trackEvent: (name: string, data?: Record<string, any>) => {
    if (import.meta.env.PROD) {
      Sentry.captureMessage(name, {
        level: 'info',
        extra: data,
      });
    } else {
      console.log('Event:', name, 'Data:', data);
    }
  },

  setUser: (userId: string | null) => {
    if (import.meta.env.PROD) {
      if (userId) {
        Sentry.setUser({ id: userId });
      } else {
        Sentry.setUser(null);
      }
    }
  },
};

export default monitoringService; 