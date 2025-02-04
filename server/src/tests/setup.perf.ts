import { beforeAll, afterAll } from 'vitest';
import { createServer } from 'http';
import { app } from '../app';
import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';
import { setupWebSocketHandlers } from '../websocket/handlers';
import { Server } from 'socket.io';
import { createTestUser } from './setup';

const prisma = new PrismaClient();
const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

let server: ReturnType<typeof createServer>;
let io: Server;
export let testUser: { id: string; token: string };

beforeAll(async () => {
  // Connect to Redis
  await redis.connect();
  
  // Clean up database
  await prisma.queueItem.deleteMany();
  await prisma.roomParticipant.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();
  
  // Clean up Redis
  await redis.flushAll();

  // Create test user
  testUser = await createTestUser();

  // Start server
  server = createServer(app);
  io = new Server(server);
  setupWebSocketHandlers(io);

  await new Promise<void>((resolve) => {
    server.listen(0, () => resolve());
  });
});

afterAll(async () => {
  await prisma.$disconnect();
  await redis.quit();
  server.close();
  io.close();
});

export function getServerPort() {
  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Server not started');
  }
  return address.port;
} 