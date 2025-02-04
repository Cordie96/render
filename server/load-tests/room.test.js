import http from 'k6/http';
import { check, sleep, Trend, Counter } from 'k6';
import { options } from './config.js';
import { WebSocket } from 'k6/ws';

const BASE_URL = __ENV.API_URL || 'http://localhost:3000';
const WS_URL = __ENV.WS_URL || 'ws://localhost:3000';

// Custom metrics
const wsConnectingDuration = new Trend('ws_connecting_duration');
const wsSessionDuration = new Trend('ws_session_duration');
const playerCommands = new Counter('player_commands');
const queueOperations = new Counter('queue_operations');

export default function () {
  // Create user and get token
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, {
    email: `user${__VU}@test.com`,
    password: 'testpass123',
  });

  check(loginRes, {
    'login successful': (r) => r.status === 200,
  });

  const token = loginRes.json('token');

  // Create room
  const roomRes = http.post(
    `${BASE_URL}/api/rooms`,
    JSON.stringify({ name: `Room ${__VU}` }),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  check(roomRes, {
    'room created': (r) => r.status === 200,
  });

  const roomId = roomRes.json('id');

  // Connect to WebSocket
  const wsStart = Date.now();
  const ws = new WebSocket(`${WS_URL}`, null, {
    headers: { Authorization: `Bearer ${token}` },
  });

  ws.on('open', () => {
    wsConnectingDuration.add(Date.now() - wsStart);
    ws.send(JSON.stringify({
      type: 'join:room',
      roomId,
    }));
  });

  // Simulate room activity
  for (let i = 0; i < 5; i++) {
    // Add song to queue
    const queueRes = http.post(
      `${BASE_URL}/api/rooms/${roomId}/queue`,
      JSON.stringify({
        youtubeVideoId: `song-${__VU}-${i}`,
        title: `Test Song ${i}`,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    check(queueRes, {
      'song added to queue': (r) => r.status === 200,
    });
    queueOperations.add(1);

    // Send player commands
    ws.send(JSON.stringify({
      type: 'player:command',
      command: 'seek',
      time: Math.random() * 100,
    }));
    playerCommands.add(1);

    sleep(1);
  }

  const sessionDuration = Date.now() - wsStart;
  wsSessionDuration.add(sessionDuration);
  ws.close();
} 