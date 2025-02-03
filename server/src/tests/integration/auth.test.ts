import request from 'supertest';
import { Express } from 'express';
import { setupApp } from '../../app';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
let app: Express;

beforeAll(() => {
  app = setupApp();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Authentication Flow', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  describe('Registration', () => {
    it('allows user registration with valid data', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'Password123!',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toMatchObject({
        username: 'testuser',
        email: 'test@example.com',
      });

      const user = await prisma.user.findUnique({
        where: { email: 'test@example.com' },
      });
      expect(user).toBeTruthy();
    });

    it('prevents duplicate email registration', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser1',
          email: 'test@example.com',
          password: 'Password123!',
        });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser2',
          email: 'test@example.com',
          password: 'Password123!',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Login', () => {
    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      await prisma.user.create({
        data: {
          username: 'testuser',
          email: 'test@example.com',
          passwordHash: hashedPassword,
        },
      });
    });

    it('allows login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      
      const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET!) as any;
      expect(decoded.email).toBe('test@example.com');
    });

    it('prevents login with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword123!',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Protected Routes', () => {
    let token: string;

    beforeEach(async () => {
      const user = await prisma.user.create({
        data: {
          username: 'testuser',
          email: 'test@example.com',
          passwordHash: await bcrypt.hash('Password123!', 10),
        },
      });

      token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET!
      );
    });

    it('allows access to protected routes with valid token', async () => {
      const response = await request(app)
        .get('/api/rooms')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
    });

    it('prevents access to protected routes without token', async () => {
      const response = await request(app)
        .get('/api/rooms');

      expect(response.status).toBe(401);
    });

    it('prevents access with invalid token', async () => {
      const response = await request(app)
        .get('/api/rooms')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });
}); 