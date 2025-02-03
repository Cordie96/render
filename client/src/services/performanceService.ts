import * as Sentry from '@sentry/react';

interface PerformanceMetrics {
  name: string;
  duration: number;
  startTime: number;
  data?: Record<string, any>;
}

export const performanceService = {
  startTransaction: (name: string) => {
    if (import.meta.env.PROD) {
      return Sentry.startTransaction({ name });
    }
    return {
      startTimestamp: performance.now(),
      finish: () => {},
    };
  },

  measurePerformance: (metrics: PerformanceMetrics) => {
    if (import.meta.env.PROD) {
      Sentry.addBreadcrumb({
        category: 'performance',
        message: `${metrics.name} took ${metrics.duration}ms`,
        data: metrics.data,
        level: 'info',
      });
    } else {
      console.log('Performance:', metrics);
    }
  },

  trackLoadTime: (componentName: string) => {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      performanceService.measurePerformance({
        name: `${componentName} Load Time`,
        duration,
        startTime: start,
      });
    };
  },
};

export default performanceService; 