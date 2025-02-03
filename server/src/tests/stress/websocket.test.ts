import { Server } from 'socket.io';
import { createTestServer, createTestClient } from '../wsUtils';
import { createTestUser, createTestRoom } from '../setup';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
let io: Server;
let httpServer: any;

beforeAll(() => {
  const server = createTestServer();
  io = server.io;
  httpServer = server.httpServer;
});

afterAll(async () => {
  await prisma.$disconnect();
  httpServer.close();
});

describe('WebSocket Stress Tests', () => {
  let roomId: string;
  let token: string;

  beforeEach(async () => {
    const { user, token: userToken } = await createTestUser();
    token = userToken;
    const room = await createTestRoom(user.id);
    roomId = room.id;
  });

  it('handles multiple concurrent connections', async () => {
    const NUM_CLIENTS = 100;
    const clients = [];
    const port = await new Promise<number>((resolve) => {
      httpServer.listen(() => {
        resolve((httpServer.address() as AddressInfo).port);
      });
    });

    // Create multiple clients
    for (let i = 0; i < NUM_CLIENTS; i++) {
      const client = createTestClient(port, { token });
      clients.push(client);
    }

    // Connect all clients simultaneously
    await Promise.all(
      clients.map((client) => {
        return new Promise<void>((resolve) => {
          client.connect();
          client.on('connect', () => {
            client.emit('join-room', roomId);
            resolve();
          });
        });
      })
    );

    // Verify room participants
    const participants = await prisma.roomParticipant.count({
      where: { roomId },
    });
    expect(participants).toBe(NUM_CLIENTS);

    // Cleanup
    clients.forEach((client) => client.close());
  }, 30000);

  it('handles rapid queue updates', async () => {
    const NUM_UPDATES = 50;
    const client = createTestClient(
      (httpServer.address() as AddressInfo).port,
      { token }
    );

    client.connect();
    await new Promise<void>((resolve) => {
      client.on('connect', () => {
        client.emit('join-room', roomId);
        resolve();
      });
    });

    // Send rapid queue updates
    const updates = Array(NUM_UPDATES)
      .fill(null)
      .map((_, i) => ({
        youtubeVideoId: `video${i}`,
        title: `Test Song ${i}`,
      }));

    const start = Date.now();
    await Promise.all(
      updates.map((update) =>
        prisma.queueItem.create({
          data: {
            ...update,
            roomId,
            position: 0,
            status: 'pending',
            addedById: 'test-user-id',
          },
        })
      )
    );
    const end = Date.now();

    // Verify performance
    expect(end - start).toBeLessThan(5000); // Should complete within 5 seconds

    client.close();
  });

  it('handles concurrent queue operations', async () => {
    const NUM_CLIENTS = 10;
    const OPERATIONS_PER_CLIENT = 10;
    const clients = [];
    const port = (httpServer.address() as AddressInfo).port;

    // Create and connect clients
    for (let i = 0; i < NUM_CLIENTS; i++) {
      const client = createTestClient(port, { token });
      clients.push(client);
      client.connect();
      await new Promise<void>((resolve) => {
        client.on('connect', () => {
          client.emit('join-room', roomId);
          resolve();
        });
      });
    }

    // Perform concurrent operations
    const operations = clients.flatMap((client) =>
      Array(OPERATIONS_PER_CLIENT)
        .fill(null)
        .map((_, i) => {
          return new Promise<void>((resolve) => {
            client.emit('add-to-queue', {
              roomId,
              youtubeVideoId: `video-${client.id}-${i}`,
              title: `Test Song ${client.id}-${i}`,
            });
            resolve();
          });
        })
    );

    await Promise.all(operations);

    // Verify queue integrity
    const queueItems = await prisma.queueItem.findMany({
      where: { roomId },
      orderBy: { position: 'asc' },
    });

    expect(queueItems.length).toBe(NUM_CLIENTS * OPERATIONS_PER_CLIENT);
    expect(new Set(queueItems.map((item) => item.position)).size).toBe(
      queueItems.length
    );

    // Cleanup
    clients.forEach((client) => client.close());
  });
}); 