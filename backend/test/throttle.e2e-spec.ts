import { Server } from 'http';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { setTestEnv } from './helpers/env';
import { createTestApp, closeTestApp } from './helpers/app';
import type { ApiResponse } from './helpers/types';

// Jest isolates module registries per file, so require() inside createTestApp()
// is independent from auth.e2e-spec.ts — each file gets a fresh ConfigModule.

describe('Rate limiting (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let server: Server;

  const AUTH_LIMIT = 3;

  beforeAll(async () => {
    setTestEnv({
      MONGODB_DB: 'test-throttle',
      PORT: '3003',
      THROTTLE_AUTH_LIMIT: String(AUTH_LIMIT),
    });
    ({ app, server, mongod } = await createTestApp());
  });

  afterAll(async () => {
    await closeTestApp({ app, server, mongod });
  });

  // ─── Endpoints exempt from throttling ────────────────────────────────────────
  // @SkipThrottle({ global: true, auth: true }) must name every throttler
  // explicitly in @nestjs/throttler v6; bare @SkipThrottle() skips nothing.

  it('GET /auth/me — exempt from throttling, always returns 401 (no cookie)', async () => {
    for (let i = 0; i < AUTH_LIMIT + 2; i++) {
      await request(server).get('/auth/me').expect(401);
    }
  });

  it('POST /auth/logout — exempt from throttling, always returns 200 (public endpoint)', async () => {
    for (let i = 0; i < AUTH_LIMIT + 2; i++) {
      await request(server).post('/auth/logout').expect(200);
    }
  });

  // ─── Auth throttler: signin ───────────────────────────────────────────────

  it('429 — signin is throttled after exceeding auth limit', async () => {
    const payload = { email: 'nobody@example.com', password: 'Wrong1!' };

    for (let i = 0; i < AUTH_LIMIT; i++) {
      await request(server).post('/auth/signin').send(payload);
    }

    const res = await request(server)
      .post('/auth/signin')
      .send(payload)
      .expect(429);

    expect((res.body as ApiResponse).message).toBeDefined();
  });

  it('GET /auth/me still returns 401 (not 429) while signin bucket is exhausted', async () => {
    await request(server).get('/auth/me').expect(401);
  });

  it('POST /auth/logout still returns 200 (not 429) while signin bucket is exhausted', async () => {
    await request(server).post('/auth/logout').expect(200);
  });

  // ─── Auth throttler: signup (separate per-endpoint bucket) ───────────────────

  it('429 — signup is throttled after exceeding auth limit (independent of signin bucket)', async () => {
    const base = { name: 'Test User', password: 'Secret1!' };

    for (let i = 0; i < AUTH_LIMIT; i++) {
      await request(server)
        .post('/auth/signup')
        .send({ ...base, email: `user${i}@example.com` });
    }

    const res = await request(server)
      .post('/auth/signup')
      .send({ ...base, email: 'final@example.com' })
      .expect(429);

    expect((res.body as ApiResponse).message).toBeDefined();
  });
});
