export const options = {
  scenarios: {
    rooms: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 50 },  // Ramp up to 50 users
        { duration: '1m', target: 50 },   // Stay at 50 users
        { duration: '30s', target: 100 }, // Ramp up to 100
        { duration: '1m', target: 100 },  // Stay at 100
        { duration: '30s', target: 0 },   // Ramp down to 0
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% of requests should fail
  },
}; 