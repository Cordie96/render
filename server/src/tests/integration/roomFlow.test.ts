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

describe('Room Flow Integration', () => {
  let user: any;
  let token: string;
  let clientSocket: any;

  beforeEach(async () => {
    const testData = await createTestUser();
    user = testData.user;
    token = testData.token;

    const port = await new Promise<number>((resolve) => {
      httpServer.listen(() => {
        resolve((httpServer.address() as AddressInfo).port);
      });
    });

    clientSocket = createTestClient(port, { token });
  });

  afterEach(() => {
    clientSocket.close();
  });

  it('completes full room creation and joining flow', async () => {
    // Create room
    const createResponse = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Integration Test Room' });

    expect(createResponse.status).toBe(201);
    const roomId = createResponse.body.id;

    // Connect socket
    clientSocket.connect();
    await waitFor(clientSocket, 'connect');

    // Join room
    clientSocket.emit('join-room', roomId);
    await waitFor(clientSocket, 'joined-room');

    // Add to queue
    const queueResponse = await request(app)
      .post(`/api/rooms/${roomId}/queue`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        youtubeVideoId: 'test123',
        title: 'Test Song',
      });

    expect(queueResponse.status).toBe(200);

    // Verify queue state
    const queueItems = await prisma.queueItem.findMany({
      where: { roomId },
    });

    expect(queueItems).toHaveLength(1);
    expect(queueItems[0]).toMatchObject({
      youtubeVideoId: 'test123',
      title: 'Test Song',
      status: 'pending',
    });
  });

  it('handles concurrent users in a room', async () => {
    const room = await createTestRoom(user.id);
    const secondUser = await createTestUser();
    
    const firstClient = clientSocket;
    const secondClient = createTestClient(
      (httpServer.address() as AddressInfo).port,
      { token: secondUser.token }
    );

    // Connect both clients
    firstClient.connect();
    secondClient.connect();
    await Promise.all([
      waitFor(firstClient, 'connect'),
      waitFor(secondClient, 'connect'),
    ]);

    // Join room
    firstClient.emit('join-room', room.id);
    secondClient.emit('join-room', room.id);
    await Promise.all([
      waitFor(firstClient, 'joined-room'),
      waitFor(secondClient, 'joined-room'),
    ]);

    // Verify player commands are received
    return new Promise<void>((resolve) => {
      secondClient.on('player-command', (command: string) => {
        expect(command).toBe('play');
        secondClient.close();
        resolve();
      });

      firstClient.emit('player-command', { roomId: room.id, command: 'play' });
    });
  });
}); 