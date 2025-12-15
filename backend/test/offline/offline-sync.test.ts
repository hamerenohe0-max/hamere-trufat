import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('Offline Sync Tests', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let authToken: string;
  let userId: string;

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

    // Register and login
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
    userId = loginResponse.body.user.id;
  });

  afterAll(async () => {
    await app.close();
    await mongoServer.stop();
  });

  describe('Cache Management', () => {
    it('should save cache data', () => {
      return request(app.getHttpServer())
        .post('/api/v1/sync/cache')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          deviceId: 'device-1',
          entity: 'news',
          key: 'news-list',
          payload: { items: [] },
        })
        .expect(201);
    });

    it('should retrieve cached data', async () => {
      // Save cache first
      await request(app.getHttpServer())
        .post('/api/v1/sync/cache')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          deviceId: 'device-1',
          entity: 'news',
          key: 'news-list',
          payload: { items: [{ id: '1' }] },
        });

      // Retrieve cache
      return request(app.getHttpServer())
        .get('/api/v1/sync/cache')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          deviceId: 'device-1',
          entity: 'news',
          key: 'news-list',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.payload).toHaveProperty('items');
        });
    });
  });

  describe('Sync Data', () => {
    it('should sync offline data', () => {
      return request(app.getHttpServer())
        .post('/api/v1/sync/sync')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          deviceId: 'device-1',
          data: [
            {
              entity: 'news',
              key: 'news-1',
              payload: { id: '1', title: 'Test' },
              version: Date.now(),
            },
          ],
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('conflicts');
          expect(res.body).toHaveProperty('updated');
        });
    });
  });
});

