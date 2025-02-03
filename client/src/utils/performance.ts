import logger from './logger';

export function measurePerformance(name: string, callback: () => void) {
  const start = performance.now();
  callback();
  const duration = performance.now() - start;
  logger.debug(`Performance measurement: ${name}`, { duration });
}

export function trackPageLoad() {
  if (window.performance) {
    const timing = window.performance.timing;
    const pageLoad = timing.loadEventEnd - timing.navigationStart;
    const dns = timing.domainLookupEnd - timing.domainLookupStart;
    const tcp = timing.connectEnd - timing.connectStart;
    const ttfb = timing.responseStart - timing.navigationStart;

    logger.info('Page load performance', {
      totalLoadTime: pageLoad,
      dnsLookup: dns,
      tcpConnection: tcp,
      timeToFirstByte: ttfb,
    });
  }
}

export function initializePerformanceMonitoring() {
  // Track page loads
  window.addEventListener('load', trackPageLoad);

  // Track long tasks
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) { // Tasks longer than 50ms
          logger.warn('Long task detected', {
            duration: entry.duration,
            name: entry.name,
            startTime: entry.startTime,
          });
        }
      }
    });

    observer.observe({ entryTypes: ['longtask'] });
  }
} 