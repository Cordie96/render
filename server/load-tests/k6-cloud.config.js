export const options = {
  ext: {
    loadimpact: {
      projectID: __ENV.K6_CLOUD_PROJECT_ID,
      name: 'YouTube Party Load Tests'
    }
  },
  scenarios: {
    rooms: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 50 },   // Ramp up to 50 users
        { duration: '5m', target: 50 },   // Stay at 50 users
        { duration: '2m', target: 100 },  // Ramp up to 100
        { duration: '5m', target: 100 },  // Stay at 100
        { duration: '2m', target: 0 },    // Ramp down to 0
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
    ws_connecting_duration: ['p(95)<1000'],
    ws_session_duration: ['p(95)>30000'],
  },
}; 