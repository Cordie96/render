import request from 'supertest';
import { Express } from 'express';
import { Server } from 'socket.io';
import { createTestUser, createTestRoom } from '../setup';
import { setupApp } from '../../app';
import { createTestServer, createTestClient, waitFor } from '../wsUtils';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
let app: Express;
let io: Server;
let httpServer: any;

beforeAll(() => {
  app = setupApp();
  const server = createTestServer();
  io = server.io;
  httpServer = server.httpServer;
});

afterAll(async () => {
  await prisma.$disconnect();
  httpServer.close();
});

describe('Queue Flow Integration', () => {
  let user: any;
  let token: string;
  let room: any;
  let clientSocket: any;

  beforeEach(async () => {
    const testData = await createTestUser();
    user = testData.user;
    token = testData.token;
    room = await createTestRoom(user.id);

    const port = await new Promise<number>((resolve) => {
      httpServer.listen(() => {
        resolve((httpServer.address() as AddressInfo).port);
      });
    });

    clientSocket = createTestClient(port, { token });
    clientSocket.connect();
    await waitFor(clientSocket, 'connect');
  });

  afterEach(() => {
    clientSocket.close();
  });

  it('handles queue operations with real-time updates', async () => {
    // Add multiple songs to queue
    const songs = [
      { youtubeVideoId: 'song1', title: 'First Song' },
      { youtubeVideoId: 'song2', title: 'Second Song' },
      { youtubeVideoId: 'song3', title: 'Third Song' },
    ];

    const queueUpdates: any[] = [];
    clientSocket.on('queue-updated', (update: any) => {
      queueUpdates.push(update);
    });

    // Add songs sequentially
    for (const song of songs) {
      await request(app)
        .post(`/api/rooms/${room.id}/queue`)
        .set('Authorization', `Bearer ${token}`)
        .send(song);
    }

    // Wait for queue updates
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(queueUpdates).toHaveLength(3);

    // Verify queue order
    const queue = await prisma.queueItem.findMany({
      where: { roomId: room.id },
      orderBy: { position: 'asc' },
    });

    expect(queue).toHaveLength(3);
    expect(queue.map(item => item.youtubeVideoId)).toEqual(['song1', 'song2', 'song3']);

    // Test queue reordering
    await request(app)
      .post(`/api/rooms/${room.id}/queue/reorder`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        startIndex: 0,
        endIndex: 2,
      });

    const reorderedQueue = await prisma.queueItem.findMany({
      where: { roomId: room.id },
      orderBy: { position: 'asc' },
    });

    expect(reorderedQueue.map(item => item.youtubeVideoId)).toEqual(['song2', 'song3', 'song1']);
  });

  it('handles concurrent queue operations', async () => {
    const secondUser = await createTestUser();
    const secondClient = createTestClient(
      (httpServer.address() as AddressInfo).port,
      { token: secondUser.token }
    );

    secondClient.connect();
    await waitFor(secondClient, 'connect');

    // Both users add songs simultaneously
    const promises = [
      request(app)
        .post(`/api/rooms/${room.id}/queue`)
        .set('Authorization', `Bearer ${token}`)
        .send({ youtubeVideoId: 'user1song', title: 'User 1 Song' }),
      request(app)
        .post(`/api/rooms/${room.id}/queue`)
        .set('Authorization', `Bearer ${secondUser.token}`)
        .send({ youtubeVideoId: 'user2song', title: 'User 2 Song' }),
    ];

    await Promise.all(promises);

    const queue = await prisma.queueItem.findMany({
      where: { roomId: room.id },
      orderBy: { position: 'asc' },
      include: { addedBy: true },
    });

    expect(queue).toHaveLength(2);
    expect(queue.map(item => item.addedBy.id)).toContain(user.id);
    expect(queue.map(item => item.addedBy.id)).toContain(secondUser.id);

    secondClient.close();
  });

  it('handles queue item status updates', async () => {
    // Add a song
    const { body: queueItem } = await request(app)
      .post(`/api/rooms/${room.id}/queue`)
      .set('Authorization', `Bearer ${token}`)
      .send({ youtubeVideoId: 'test123', title: 'Test Song' });

    // Update status to playing
    clientSocket.emit('update-queue-item', {
      roomId: room.id,
      itemId: queueItem.id,
      status: 'playing',
    });

    // Wait for update
    await new Promise((resolve) => setTimeout(resolve, 100));

    const updatedItem = await prisma.queueItem.findUnique({
      where: { id: queueItem.id },
    });

    expect(updatedItem?.status).toBe('playing');
  });
}); 