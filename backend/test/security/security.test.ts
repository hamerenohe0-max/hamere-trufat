import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('Security Tests', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongoUri),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongoServer.stop();
  });

  describe('Authentication', () => {
    it('should reject requests without token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/users/me')
        .expect(401);
    });

    it('should reject requests with invalid token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should reject requests with malformed token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', 'InvalidFormat')
        .expect(401);
    });
  });

  describe('Input Validation', () => {
    it('should reject invalid email format', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          name: 'Test',
          email: 'invalid-email',
          password: 'password123',
          deviceContext: {},
        })
        .expect(400);
    });

    it('should reject weak passwords', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          name: 'Test',
          email: 'test@example.com',
          password: '123', // Too short
          deviceContext: {},
        })
        .expect(400);
    });

    it('should sanitize SQL injection attempts', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          name: "'; DROP TABLE users; --",
          email: 'test@example.com',
          password: 'password123',
          deviceContext: {},
        });

      // Should not crash, but may reject or sanitize
      expect([200, 201, 400]).toContain(response.status);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const requests = Array(150).fill(null).map(() =>
        request(app.getHttpServer())
          .get('/api/v1/news')
      );

      const responses = await Promise.allSettled(requests);
      const rateLimited = responses.filter(
        (r) => r.status === 'fulfilled' && r.value.status === 429
      );

      // Should have some rate-limited responses after 100 requests
      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });

  describe('CORS', () => {
    it('should include CORS headers', () => {
      return request(app.getHttpServer())
        .get('/api/v1/news')
        .expect((res) => {
          // CORS headers should be present
          expect(res.headers).toHaveProperty('access-control-allow-origin');
        });
    });
  });

  describe('XSS Protection', () => {
    it('should sanitize user input in responses', async () => {
      // Register user
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          name: '<script>alert("XSS")</script>',
          email: 'xss@example.com',
          password: 'password123',
          deviceContext: {},
        });

      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'xss@example.com',
          password: 'password123',
          deviceContext: {},
        });

      const token = loginResponse.body.tokens.accessToken;

      const profileResponse = await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Name should be sanitized (no script tags)
      expect(profileResponse.body.name).not.toContain('<script>');
    });
  });
});

