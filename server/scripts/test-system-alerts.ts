import { metrics } from '../src/services/metricsService';

async function simulateSystemLoad() {
  // Simulate high memory usage
  const arr: number[] = [];
  for (let i = 0; i < 1000000; i++) {
    arr.push(i);
  }

  // Simulate high CPU usage
  let x = 0;
  for (let i = 0; i < 1000000; i++) {
    x += Math.sqrt(i);
  }
}

async function simulateRedisLatency() {
  for (let i = 0; i < 50; i++) {
    metrics.recordWSLatency(150); // 150ms latency
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

async function simulateQueueDelay() {
  for (let i = 0; i < 10; i++) {
    metrics.incrementQueueOperation('delayed');
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
}

async function main() {
  console.log('Starting system alert test...');
  
  await Promise.all([
    simulateSystemLoad(),
    simulateRedisLatency(),
    simulateQueueDelay()
  ]);

  console.log('System alert test completed');
  process.exit(0);
}

main().catch(console.error); 