import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

beforeAll(async () => {
  // Clean up database before tests
  await prisma.queueItem.deleteMany();
  await prisma.roomParticipant.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

export const createTestUser = async () => {
  const user = await prisma.user.create({
    data: {
      username: 'testuser',
      email: 'test@example.com',
      passwordHash: 'hashedpassword',
    },
  });

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET!
  );

  return { user, token };
};

export const createTestRoom = async (hostId: string) => {
  return prisma.room.create({
    data: {
      name: 'Test Room',
      hostId,
      isActive: true,
      participants: {
        create: {
          userId: hostId,
          role: 'HOST',
        },
      },
    },
    include: {
      participants: true,
      host: true,
    },
  });
}; 