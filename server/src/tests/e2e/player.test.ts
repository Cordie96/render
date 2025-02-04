import { describe, it, expect, beforeEach } from 'vitest';
import { createTestUser, createTestRoom, createTestQueueItem } from '../setup';
import { createTestSocket, waitForSocketEvent } from '../utils/socket';
import { getServerPort } from '../setup.e2e';

describe('Player Synchronization E2E', () => {
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

  it('synchronizes player state across clients', async () => {
    // Create queue item
    await createTestQueueItem(roomId, userId);

    // Connect host and viewer
    const hostSocket = await createTestSocket(port, authToken);
    const viewerSocket = await createTestSocket(port, authToken);

    // Join room
    hostSocket.emit('join:room', { roomId });
    viewerSocket.emit('join:room', { roomId });
    await Promise.all([
      waitForSocketEvent(hostSocket, 'room:joined'),
      waitForSocketEvent(viewerSocket, 'room:joined')
    ]);

    // Host sends play command
    hostSocket.emit('player:command', {
      roomId,
      command: 'play',
      time: 0
    });

    // Verify viewer receives state update
    const viewerUpdate = await waitForSocketEvent(viewerSocket, 'player:state');
    expect(viewerUpdate).toMatchObject({
      isPlaying: true,
      currentTime: 0
    });

    // Host seeks to specific time
    hostSocket.emit('player:command', {
      roomId,
      command: 'seek',
      time: 30
    });

    // Verify time sync
    const timeUpdate = await waitForSocketEvent(viewerSocket, 'player:state');
    expect(timeUpdate).toMatchObject({
      currentTime: 30
    });

    hostSocket.close();
    viewerSocket.close();
  });

  it('maintains player state for late joiners', async () => {
    await createTestQueueItem(roomId, userId);

    // Host starts playing
    const hostSocket = await createTestSocket(port, authToken);
    hostSocket.emit('join:room', { roomId });
    await waitForSocketEvent(hostSocket, 'room:joined');

    hostSocket.emit('player:command', {
      roomId,
      command: 'play',
      time: 15
    });

    // Late joiner connects
    const lateSocket = await createTestSocket(port, authToken);
    lateSocket.emit('join:room', { roomId });

    // Verify late joiner receives current state
    const initialState = await waitForSocketEvent(lateSocket, 'room:state');
    expect(initialState).toMatchObject({
      player: {
        isPlaying: true,
        currentTime: expect.any(Number)
      }
    });

    hostSocket.close();
    lateSocket.close();
  });
}); 