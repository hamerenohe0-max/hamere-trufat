import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('Performance Tests', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let authToken: string;

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

    // Setup auth
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        deviceContext: {},
      });

    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
        deviceContext: {},
      });

    authToken = loginResponse.body.tokens.accessToken;
  });

  afterAll(async () => {
    await app.close();
    await mongoServer.stop();
  });

  describe('Load Testing', () => {
    it('should handle 100 concurrent requests to news list', async () => {
      const requests = Array(100).fill(null).map(() =>
        request(app.getHttpServer())
          .get('/api/v1/news')
          .expect(200)
      );

      const startTime = Date.now();
      await Promise.all(requests);
      const endTime = Date.now();

      const duration = endTime - startTime;
      console.log(`100 concurrent requests completed in ${duration}ms`);
      expect(duration).toBeLessThan(5000); // Should complete in under 5 seconds
    });

    it('should handle rapid sequential requests', async () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 50; i++) {
        await request(app.getHttpServer())
          .get('/api/v1/news')
          .expect(200);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;
      console.log(`50 sequential requests completed in ${duration}ms`);
      expect(duration).toBeLessThan(10000); // Should complete in under 10 seconds
    });
  });

  describe('Response Time Tests', () => {
    it('news list should respond in under 500ms', async () => {
      const startTime = Date.now();
      await request(app.getHttpServer())
        .get('/api/v1/news')
        .expect(200);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(500);
    });

    it('authenticated endpoint should respond in under 300ms', async () => {
      const startTime = Date.now();
      await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(300);
    });
  });
});

