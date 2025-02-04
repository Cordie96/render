import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createTestUser, createTestRoom } from '../setup';
import { createTestSocket, waitForSocketEvent } from '../utils/socket';
import { getServerPort } from '../setup.e2e';
import { app } from '../../app';

describe('Queue Management E2E', () => {
  let authToken: string;
  let userId: string;
  let roomId: string;
  let port: number;

  beforeEach(async () => {
    const user = await createTestUser();
    userId = user.id;
    authToken = user.token;
    const room = await createTestRoom(userId);
    roomId = room.id;
    port = getServerPort();
  });

  it('synchronizes queue operations across multiple clients', async () => {
    // Connect two clients
    const socket1 = await createTestSocket(port, authToken);
    const socket2 = await createTestSocket(port, authToken);

    // Join room with both clients
    socket1.emit('join:room', { roomId });
    socket2.emit('join:room', { roomId });
    await Promise.all([
      waitForSocketEvent(socket1, 'room:joined'),
      waitForSocketEvent(socket2, 'room:joined')
    ]);

    // Add songs to queue
    const addResponse = await request(app)
      .post(`/api/rooms/${roomId}/queue`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        youtubeVideoId: 'song1',
        title: 'First Song'
      });

    expect(addResponse.status).toBe(200);

    // Verify both clients receive queue update
    const [update1, update2] = await Promise.all([
      waitForSocketEvent(socket1, 'queue:update'),
      waitForSocketEvent(socket2, 'queue:update')
    ]);

    expect(update1).toMatchObject(update2);
    expect(update1).toMatchObject({
      type: 'add',
      item: {
        youtubeVideoId: 'song1',
        title: 'First Song'
      }
    });

    // Reorder queue
    const reorderResponse = await request(app)
      .put(`/api/rooms/${roomId}/queue/reorder`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        itemId: addResponse.body.id,
        newPosition: 1
      });

    expect(reorderResponse.status).toBe(200);

    // Verify reorder sync
    const [reorder1, reorder2] = await Promise.all([
      waitForSocketEvent(socket1, 'queue:update'),
      waitForSocketEvent(socket2, 'queue:update')
    ]);

    expect(reorder1).toMatchObject(reorder2);
    expect(reorder1).toMatchObject({
      type: 'reorder',
      itemId: addResponse.body.id,
      newPosition: 1
    });

    socket1.close();
    socket2.close();
  });

  it('handles concurrent queue operations correctly', async () => {
    const socket = await createTestSocket(port, authToken);
    socket.emit('join:room', { roomId });
    await waitForSocketEvent(socket, 'room:joined');

    // Add multiple songs concurrently
    const songs = ['song1', 'song2', 'song3'].map(id => ({
      youtubeVideoId: id,
      title: `Song ${id}`
    }));

    const addResponses = await Promise.all(
      songs.map(song =>
        request(app)
          .post(`/api/rooms/${roomId}/queue`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(song)
      )
    );

    expect(addResponses.every(res => res.status === 200)).toBe(true);

    // Verify queue order
    const queueResponse = await request(app)
      .get(`/api/rooms/${roomId}/queue`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(queueResponse.status).toBe(200);
    expect(queueResponse.body).toHaveLength(songs.length);
    expect(queueResponse.body.map((item: any) => item.youtubeVideoId))
      .toEqual(songs.map(s => s.youtubeVideoId));

    socket.close();
  });

  it('maintains queue state after reconnection', async () => {
    // Initial connection
    let socket = await createTestSocket(port, authToken);
    socket.emit('join:room', { roomId });
    await waitForSocketEvent(socket, 'room:joined');

    // Add a song
    await request(app)
      .post(`/api/rooms/${roomId}/queue`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        youtubeVideoId: 'test123',
        title: 'Test Song'
      });

    // Disconnect and reconnect
    socket.close();
    socket = await createTestSocket(port, authToken);
    socket.emit('join:room', { roomId });
    
    // Wait for room state
    const roomState = await waitForSocketEvent(socket, 'room:state');
    
    expect(roomState).toMatchObject({
      queue: expect.arrayContaining([
        expect.objectContaining({
          youtubeVideoId: 'test123',
          title: 'Test Song'
        })
      ])
    });

    socket.close();
  });
}); 