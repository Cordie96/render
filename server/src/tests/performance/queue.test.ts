import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { performance } from 'perf_hooks';
import { testUser } from '../setup.perf';
import { app } from '../../app';
import { createTestRoom } from '../setup';

describe('Queue Performance', () => {
  const BATCH_SIZE = 50;
  const NUM_BATCHES = 10;

  it('handles concurrent queue operations efficiently', async () => {
    const room = await createTestRoom(testUser.id);
    const startTime = performance.now();

    // Add songs in batches
    for (let batch = 0; batch < NUM_BATCHES; batch++) {
      await Promise.all(
        Array(BATCH_SIZE).fill(0).map((_, index) =>
          request(app)
            .post(`/api/rooms/${room.id}/queue`)
            .set('Authorization', `Bearer ${testUser.token}`)
            .send({
              youtubeVideoId: `song-${batch}-${index}`,
              title: `Test Song ${batch}-${index}`
            })
        )
      );
    }

    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const operationsPerSecond = (BATCH_SIZE * NUM_BATCHES) / (totalTime / 1000);

    // Verify performance
    expect(operationsPerSecond).toBeGreaterThan(50); // At least 50 queue adds per second

    // Verify queue integrity
    const queueResponse = await request(app)
      .get(`/api/rooms/${room.id}/queue`)
      .set('Authorization', `Bearer ${testUser.token}`);

    expect(queueResponse.status).toBe(200);
    expect(queueResponse.body).toHaveLength(BATCH_SIZE * NUM_BATCHES);
  });

  it('maintains order under concurrent reordering', async () => {
    const room = await createTestRoom(testUser.id);

    // Add initial items
    const items = await Promise.all(
      Array(20).fill(0).map((_, index) =>
        request(app)
          .post(`/api/rooms/${room.id}/queue`)
          .set('Authorization', `Bearer ${testUser.token}`)
          .send({
            youtubeVideoId: `song-${index}`,
            title: `Test Song ${index}`
          })
          .then(res => res.body)
      )
    );

    const startTime = performance.now();

    // Perform concurrent reordering
    await Promise.all(
      items.map((item, index) =>
        request(app)
          .put(`/api/rooms/${room.id}/queue/reorder`)
          .set('Authorization', `Bearer ${testUser.token}`)
          .send({
            itemId: item.id,
            newPosition: (index + 10) % items.length
          })
      )
    );

    const endTime = performance.now();
    const reorderTime = endTime - startTime;

    // Verify performance
    expect(reorderTime).toBeLessThan(2000); // Reordering should take less than 2 seconds

    // Verify queue integrity
    const queueResponse = await request(app)
      .get(`/api/rooms/${room.id}/queue`)
      .set('Authorization', `Bearer ${testUser.token}`);

    expect(queueResponse.status).toBe(200);
    expect(queueResponse.body).toHaveLength(items.length);
    expect(new Set(queueResponse.body.map((i: any) => i.position))).toHaveLength(items.length);
  });
}); 