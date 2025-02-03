import ws from 'k6/ws';
import { check } from 'k6';

export const options = {
  vus: 50,
  duration: '30s',
  thresholds: {
    'ws_connecting_duration': ['p(95)<1000'],
    'ws_session_duration': ['p(95)<30000'],
  },
};

export default function() {
  const url = 'ws://localhost:3000';
  const params = {
    headers: {
      'Authorization': `Bearer ${__ENV.TOKEN}`,
    },
  };

  const res = ws.connect(url, params, function(socket) {
    socket.on('open', () => {
      console.log('connected');
      socket.send(JSON.stringify({
        type: 'join-room',
        roomId: __ENV.ROOM_ID,
      }));
    });

    socket.on('joined-room', () => {
      console.log('joined room');
    });

    socket.on('error', (e) => {
      console.error('error:', e);
    });

    socket.setTimeout(function() {
      socket.close();
    }, 10000);
  });

  check(res, {
    'status is 101': (r) => r && r.status === 101,
  });
} 