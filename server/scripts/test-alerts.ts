import { metrics } from '../src/services/metricsService';

async function simulateHighErrorRate() {
  // Simulate errors
  for (let i = 0; i < 100; i++) {
    metrics.recordError('test_error');
    metrics.logEvent('error', 'Test error occurred', {
      errorType: 'test_error',
      testRun: 'true'
    });
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

async function simulateHighLatency() {
  // Simulate high WebSocket latency
  for (let i = 0; i < 50; i++) {
    metrics.recordWSLatency(2000); // 2 seconds latency
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

async function main() {
  console.log('Starting alert test...');
  
  await Promise.all([
    simulateHighErrorRate(),
    simulateHighLatency()
  ]);

  console.log('Alert test completed');
  process.exit(0);
}

main().catch(console.error); 