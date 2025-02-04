import { describe, it, expect } from 'vitest';
import { io as Client } from 'socket.io-client';
import { testUser, getServerPort } from '../setup.perf';
import { performance } from 'perf_hooks';

describe('Room Performance', () => {
  const NUM_CLIENTS = 100;
  const OPERATIONS_PER_CLIENT = 10;

  it('handles multiple concurrent connections', async () => {
    const port = getServerPort();
    const startTime = performance.now();

    // Create multiple clients
    const clients = await Promise.all(
      Array(NUM_CLIENTS).fill(0).map(() => 
        new Promise<any>((resolve) => {
          const socket = Client(`http://localhost:${port}`, {
            auth: { token: testUser.token }
          });
          socket.on('connect', () => resolve(socket));
        })
      )
    );

    const endTime = performance.now();
    const connectionTime = endTime - startTime;

    // Verify connection time
    expect(connectionTime).toBeLessThan(5000); // 5 seconds max for 100 connections
    expect(clients).toHaveLength(NUM_CLIENTS);

    // Cleanup
    clients.forEach(socket => socket.close());
  });

  it('maintains performance with active room operations', async () => {
    const port = getServerPort();
    const sockets = await Promise.all(
      Array(NUM_CLIENTS).fill(0).map(() => 
        new Promise<any>((resolve) => {
          const socket = Client(`http://localhost:${port}`, {
            auth: { token: testUser.token }
          });
          socket.on('connect', () => resolve(socket));
        })
      )
    );

    const startTime = performance.now();

    // Perform multiple operations
    await Promise.all(
      sockets.map(async (socket) => {
        for (let i = 0; i < OPERATIONS_PER_CLIENT; i++) {
          await new Promise<void>((resolve) => {
            socket.emit('player:command', {
              command: 'seek',
              time: Math.random() * 100
            });
            socket.once('player:state', () => resolve());
          });
        }
      })
    );

    const endTime = performance.now();
    const operationTime = endTime - startTime;

    // Verify operation time
    const operationsPerSecond = (NUM_CLIENTS * OPERATIONS_PER_CLIENT) / (operationTime / 1000);
    expect(operationsPerSecond).toBeGreaterThan(100); // At least 100 ops/sec

    // Cleanup
    sockets.forEach(socket => socket.close());
  });
}); 