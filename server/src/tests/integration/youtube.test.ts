import request from 'supertest';
import { Express } from 'express';
import { setupApp } from '../../app';
import { createTestUser } from '../setup';
import { mockYouTubeResponse } from '../mocks/youtube';
import nock from 'nock';

let app: Express;
let token: string;

beforeAll(async () => {
  app = setupApp();
  const testData = await createTestUser();
  token = testData.token;
});

describe('YouTube API Integration', () => {
  beforeEach(() => {
    nock.cleanAll();
  });

  it('searches for karaoke videos', async () => {
    const query = 'test song karaoke';
    
    nock('https://www.googleapis.com')
      .get('/youtube/v3/search')
      .query(true)
      .reply(200, mockYouTubeResponse);

    const response = await request(app)
      .get('/api/youtube/search')
      .query({ q: query })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('items');
    expect(response.body.items).toBeInstanceOf(Array);
    expect(response.body.items[0]).toHaveProperty('id');
    expect(response.body.items[0]).toHaveProperty('title');
  });

  it('handles YouTube API errors gracefully', async () => {
    nock('https://www.googleapis.com')
      .get('/youtube/v3/search')
      .query(true)
      .reply(500);

    const response = await request(app)
      .get('/api/youtube/search')
      .query({ q: 'test' })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error');
  });

  it('validates search query', async () => {
    const response = await request(app)
      .get('/api/youtube/search')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('enforces rate limiting', async () => {
    const promises = Array(11).fill(null).map(() => 
      request(app)
        .get('/api/youtube/search')
        .query({ q: 'test' })
        .set('Authorization', `Bearer ${token}`)
    );

    const responses = await Promise.all(promises);
    const tooManyRequests = responses.some(r => r.status === 429);
    expect(tooManyRequests).toBe(true);
  });
}); 