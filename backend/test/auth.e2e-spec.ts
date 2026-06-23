import { Server } from 'http';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { setTestEnv } from './helpers/env';
import { createTestApp, closeTestApp } from './helpers/app';
import type { ApiResponse } from './helpers/types';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let server: Server;

  const validUser = {
    email: 'test@example.com',
    name: 'Test User',
    password: 'Secret1!',
  };

  beforeAll(async () => {
    setTestEnv();
    ({ app, server, mongod } = await createTestApp());
  });

  afterAll(async () => {
    await closeTestApp({ app, server, mongod });
  });

  // ─── Sign Up ────────────────────────────────────────────────────────────────

  describe('POST /auth/signup', () => {
    it('201 — creates account and sets HttpOnly cookie', async () => {
      const res = await request(server)
        .post('/auth/signup')
        .send(validUser)
        .expect(201);

      expect(res.headers['set-cookie']).toBeDefined();
      const cookie: string = (res.headers['set-cookie'] as string[])[0];
      expect(cookie).toContain('access_token=');
      expect(cookie).toContain('HttpOnly');
    });

    it('409 — duplicate email', async () => {
      const res = await request(server)
        .post('/auth/signup')
        .send(validUser)
        .expect(409);

      expect((res.body as ApiResponse).message).toBe('EMAIL_ALREADY_IN_USE');
    });

    it('400 — missing email', async () => {
      const res = await request(server)
        .post('/auth/signup')
        .send({ name: 'Test', password: 'Secret1!' })
        .expect(400);

      expect((res.body as ApiResponse).errors).toEqual(
        expect.arrayContaining([expect.stringContaining('email')]),
      );
    });

    it('400 — invalid email format', async () => {
      const res = await request(server)
        .post('/auth/signup')
        .send({ ...validUser, email: 'not-an-email' })
        .expect(400);

      expect((res.body as ApiResponse).errors).toEqual(
        expect.arrayContaining([expect.stringContaining('email')]),
      );
    });

    it('400 — name too short', async () => {
      const res = await request(server)
        .post('/auth/signup')
        .send({ ...validUser, email: 'new@example.com', name: 'ab' })
        .expect(400);

      expect((res.body as ApiResponse).errors).toBeDefined();
    });

    it('400 — password too short', async () => {
      const res = await request(server)
        .post('/auth/signup')
        .send({ ...validUser, email: 'new@example.com', password: 'Sh0!' })
        .expect(400);

      expect((res.body as ApiResponse).errors).toBeDefined();
    });

    it('400 — password missing letter', async () => {
      const res = await request(server)
        .post('/auth/signup')
        .send({ ...validUser, email: 'new@example.com', password: '12345678!' })
        .expect(400);

      expect((res.body as ApiResponse).errors).toBeDefined();
    });

    it('400 — password missing number', async () => {
      const res = await request(server)
        .post('/auth/signup')
        .send({ ...validUser, email: 'new@example.com', password: 'Password!' })
        .expect(400);

      expect((res.body as ApiResponse).errors).toBeDefined();
    });

    it('400 — password missing special character', async () => {
      const res = await request(server)
        .post('/auth/signup')
        .send({ ...validUser, email: 'new@example.com', password: 'Password1' })
        .expect(400);

      expect((res.body as ApiResponse).errors).toBeDefined();
    });
  });

  // ─── Sign In ────────────────────────────────────────────────────────────────

  describe('POST /auth/signin', () => {
    it('200 — valid credentials sets HttpOnly cookie', async () => {
      const res = await request(server)
        .post('/auth/signin')
        .send({ email: validUser.email, password: validUser.password })
        .expect(200);

      expect(res.headers['set-cookie']).toBeDefined();
      const cookie: string = (res.headers['set-cookie'] as string[])[0];
      expect(cookie).toContain('access_token=');
      expect(cookie).toContain('HttpOnly');
    });

    it('401 — wrong password', async () => {
      const res = await request(server)
        .post('/auth/signin')
        .send({ email: validUser.email, password: 'WrongPass1!' })
        .expect(401);

      expect((res.body as ApiResponse).message).toBe('INVALID_CREDENTIALS');
    });

    it('401 — email not registered', async () => {
      const res = await request(server)
        .post('/auth/signin')
        .send({ email: 'nobody@example.com', password: 'Secret1!' })
        .expect(401);

      expect((res.body as ApiResponse).message).toBe('INVALID_CREDENTIALS');
    });

    it('400 — invalid email format', async () => {
      const res = await request(server)
        .post('/auth/signin')
        .send({ email: 'bad', password: 'Secret1!' })
        .expect(400);

      expect((res.body as ApiResponse).errors).toBeDefined();
    });

    it('400 — missing password', async () => {
      const res = await request(server)
        .post('/auth/signin')
        .send({ email: validUser.email })
        .expect(400);

      expect((res.body as ApiResponse).errors).toBeDefined();
    });
  });

  // ─── Me ─────────────────────────────────────────────────────────────────────

  describe('GET /auth/me', () => {
    it('200 — returns user data with valid cookie', async () => {
      const signinRes = await request(server)
        .post('/auth/signin')
        .send({ email: validUser.email, password: validUser.password });

      const cookie: string = (signinRes.headers['set-cookie'] as string[])[0];

      const res = await request(server)
        .get('/auth/me')
        .set('Cookie', cookie)
        .expect(200);

      const body = res.body as ApiResponse;
      expect(body.email).toBe(validUser.email);
      expect(body.name).toBe(validUser.name);
      expect(body.password).toBeUndefined();
    });

    it('401 — no cookie', async () => {
      await request(server).get('/auth/me').expect(401);
    });

    it('401 — invalid cookie value', async () => {
      await request(server)
        .get('/auth/me')
        .set('Cookie', 'access_token=invalid.jwt.token')
        .expect(401);
    });
  });

  // ─── Logout ─────────────────────────────────────────────────────────────────

  describe('POST /auth/logout', () => {
    it('200 — clears the cookie', async () => {
      const signinRes = await request(server)
        .post('/auth/signin')
        .send({ email: validUser.email, password: validUser.password });

      const cookie: string = (signinRes.headers['set-cookie'] as string[])[0];

      const res = await request(server)
        .post('/auth/logout')
        .set('Cookie', cookie)
        .expect(200);

      const setCookie: string = (res.headers['set-cookie'] as string[])[0];
      expect(setCookie).toContain('access_token=;');
    });

    it('401 — /auth/me is rejected after logout', async () => {
      const signinRes = await request(server)
        .post('/auth/signin')
        .send({ email: validUser.email, password: validUser.password });

      const cookie: string = (signinRes.headers['set-cookie'] as string[])[0];

      await request(server).post('/auth/logout').set('Cookie', cookie);

      await request(server).get('/auth/me').expect(401);
    });
  });
});
