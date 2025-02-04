import http from 'k6/http';
import { check, sleep, Trend, Counter } from 'k6';
import { options } from './config.js';

const BASE_URL = __ENV.API_URL || 'http://localhost:3000';

// Custom metrics
const queueAddDuration = new Trend('queue_add_duration');
const queueReorderDuration = new Trend('queue_reorder_duration');
const successfulAdds = new Counter('successful_queue_adds');
const successfulReorders = new Counter('successful_queue_reorders');

export default function () {
  // Login
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, {
    email: `user${__VU}@test.com`,
    password: 'testpass123',
  });

  const token = loginRes.json('token');
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // Create room
  const roomRes = http.post(
    `${BASE_URL}/api/rooms`,
    JSON.stringify({ name: `Room ${__VU}` }),
    { headers }
  );

  const roomId = roomRes.json('id');

  // Add multiple songs in rapid succession
  const queueItems = [];
  for (let i = 0; i < 10; i++) {
    const startTime = Date.now();
    const queueRes = http.post(
      `${BASE_URL}/api/rooms/${roomId}/queue`,
      JSON.stringify({
        youtubeVideoId: `song-${__VU}-${i}`,
        title: `Test Song ${i}`,
      }),
      { headers }
    );

    if (check(queueRes, {
      'song added to queue': (r) => r.status === 200,
    })) {
      successfulAdds.add(1);
      queueAddDuration.add(Date.now() - startTime);
    }

    queueItems.push(queueRes.json('id'));
    sleep(0.1);
  }

  // Perform reordering operations
  for (let i = 0; i < queueItems.length; i++) {
    const startTime = Date.now();
    const reorderRes = http.put(
      `${BASE_URL}/api/rooms/${roomId}/queue/reorder`,
      JSON.stringify({
        itemId: queueItems[i],
        newPosition: Math.floor(Math.random() * queueItems.length),
      }),
      { headers }
    );

    if (check(reorderRes, {
      'queue reordered': (r) => r.status === 200,
    })) {
      successfulReorders.add(1);
      queueReorderDuration.add(Date.now() - startTime);
    }

    sleep(0.1);
  }
} 