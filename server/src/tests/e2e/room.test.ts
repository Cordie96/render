import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { io as Client } from 'socket.io-client';
import { createTestUser, createTestRoom } from '../setup';
import { getServerPort } from '../setup.e2e';
import { app } from '../../app';

describe('Room E2E', () => {
  let authToken: string;
  let userId: string;
  let port: number;

  beforeEach(async () => {
    const user = await createTestUser();
    userId = user.id;
    authToken = user.token;
    port = getServerPort();
  });

  it('creates and joins a room with WebSocket connection', async () => {
    // Create room via HTTP
    const createResponse = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Test Room' });

    expect(createResponse.status).toBe(200);
    const roomId = createResponse.body.id;

    // Connect to WebSocket
    const socket = Client(`http://localhost:${port}`, {
      auth: { token: authToken }
    });

    // Join room
    await new Promise<void>((resolve) => {
      socket.emit('join:room', { roomId });
      socket.on('room:joined', () => resolve());
    });

    // Add song to queue
    const queueResponse = await request(app)
      .post(`/api/rooms/${roomId}/queue`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        youtubeVideoId: 'test123',
        title: 'Test Song'
      });

    expect(queueResponse.status).toBe(200);

    // Verify queue update via WebSocket
    const queueUpdate = await new Promise((resolve) => {
      socket.on('queue:update', resolve);
    });

    expect(queueUpdate).toMatchObject({
      type: 'add',
      item: {
        youtubeVideoId: 'test123',
        title: 'Test Song'
      }
    });

    socket.close();
  });

  it('handles room closure correctly', async () => {
    const room = await createTestRoom(userId);

    const socket = Client(`http://localhost:${port}`, {
      auth: { token: authToken }
    });

    await new Promise<void>((resolve) => {
      socket.emit('join:room', { roomId: room.id });
      socket.on('room:joined', () => resolve());
    });

    // Close room
    const closeResponse = await request(app)
      .post(`/api/rooms/${room.id}/close`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(closeResponse.status).toBe(200);

    // Verify room closure notification
    const closureNotification = await new Promise((resolve) => {
      socket.on('room:closed', resolve);
    });

    expect(closureNotification).toMatchObject({
      roomId: room.id
    });

    socket.close();
  });
}); 