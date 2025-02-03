import { rest } from 'msw';

const baseUrl = import.meta.env.VITE_API_URL;

export const handlers = [
  rest.post(`${baseUrl}/api/auth/login`, (req, res, ctx) => {
    return res(
      ctx.json({
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
        },
        token: 'mock-token',
      })
    );
  }),

  rest.get(`${baseUrl}/api/rooms`, (req, res, ctx) => {
    return res(
      ctx.json([
        {
          id: '1',
          name: 'Test Room',
          host: {
            id: '1',
            username: 'testuser',
          },
          _count: {
            participants: 2,
          },
          isActive: true,
        },
      ])
    );
  }),

  rest.post(`${baseUrl}/api/rooms`, (req, res, ctx) => {
    return res(
      ctx.json({
        id: 'new-room-id',
        name: 'New Room',
        hostId: '1',
        isActive: true,
        host: {
          id: '1',
          username: 'testuser',
        },
        participants: [
          {
            userId: '1',
            role: 'HOST',
          },
        ],
      })
    );
  }),

  rest.post(`${baseUrl}/api/rooms/:roomId/join`, (req, res, ctx) => {
    return res(
      ctx.json({
        roomId: req.params.roomId,
        userId: '1',
        role: 'VIEWER',
      })
    );
  }),

  rest.get(`${baseUrl}/api/youtube/search`, (req, res, ctx) => {
    return res(
      ctx.json({
        items: [
          {
            id: 'video1',
            title: 'Test Song 1',
            thumbnail: 'thumbnail1.jpg',
          },
          {
            id: 'video2',
            title: 'Test Song 2',
            thumbnail: 'thumbnail2.jpg',
          },
        ],
      })
    );
  }),

  // Add more handlers as needed
]; 