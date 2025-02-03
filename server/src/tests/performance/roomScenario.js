import http from 'k6/http';
import { check, sleep } from 'k6';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up to 20 users
    { duration: '1m', target: 20 },  // Stay at 20 users
    { duration: '30s', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% of requests should fail
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3000';

export function setup() {
  // Create a test user and get token
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, {
    email: 'test@example.com',
    password: 'password123',
  });

  check(loginRes, {
    'login successful': (r) => r.status === 200,
  });

  return { token: loginRes.json('token') };
}

export default function(data) {
  const headers = {
    'Authorization': `Bearer ${data.token}`,
    'Content-Type': 'application/json',
  };

  // Create room
  const createRoomRes = http.post(
    `${BASE_URL}/api/rooms`,
    JSON.stringify({ name: `Room ${randomString(6)}` }),
    { headers }
  );

  check(createRoomRes, {
    'room created': (r) => r.status === 201,
  });

  const roomId = createRoomRes.json('id');

  // Add to queue
  const addToQueueRes = http.post(
    `${BASE_URL}/api/rooms/${roomId}/queue`,
    JSON.stringify({
      youtubeVideoId: 'test123',
      title: 'Performance Test Song',
    }),
    { headers }
  );

  check(addToQueueRes, {
    'song added to queue': (r) => r.status === 200,
  });

  // Get room status
  const getRoomRes = http.get(
    `${BASE_URL}/api/rooms/${roomId}`,
    { headers }
  );

  check(getRoomRes, {
    'room retrieved': (r) => r.status === 200,
  });

  sleep(1);
} 