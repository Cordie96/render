import { server } from '../mocks/server';
import { rest } from 'msw';

export const createTestRoom = async () => {
  const roomId = 'test-room-id';
  
  server.use(
    rest.post('/api/rooms', (req, res, ctx) => {
      return res(
        ctx.json({
          id: roomId,
          name: 'Test Room',
          hostId: 'test-user-id',
          isActive: true,
        })
      );
    }),
    
    rest.get(`/api/rooms/${roomId}`, (req, res, ctx) => {
      return res(
        ctx.json({
          id: roomId,
          name: 'Test Room',
          hostId: 'test-user-id',
          isActive: true,
          queue: [],
          participants: [
            {
              userId: 'test-user-id',
              role: 'HOST',
            },
          ],
        })
      );
    })
  );

  return { roomId };
}; 