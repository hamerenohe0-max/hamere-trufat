import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('News Integration (e2e)', () => {
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

    // Register and login to get auth token
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

  describe('/news (GET)', () => {
    it('should return list of news', () => {
      return request(app.getHttpServer())
        .get('/api/v1/news')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('items');
          expect(res.body).toHaveProperty('total');
        });
    });
  });

  describe('/news (POST)', () => {
    it('should create news article', () => {
      return request(app.getHttpServer())
        .post('/api/v1/news')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test News',
          summary: 'Test Summary',
          body: 'Test Body',
          tags: ['test'],
          status: 'draft',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toBe('Test News');
        });
    });

    it('should require authentication', () => {
      return request(app.getHttpServer())
        .post('/api/v1/news')
        .send({
          title: 'Test News',
          summary: 'Test Summary',
          body: 'Test Body',
        })
        .expect(401);
    });
  });

  describe('/news/:id (GET)', () => {
    it('should return news detail', async () => {
      // Create news first
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/news')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test News Detail',
          summary: 'Test Summary',
          body: 'Test Body',
          tags: ['test'],
          status: 'draft',
        });

      const newsId = createResponse.body.id;

      return request(app.getHttpServer())
        .get(`/api/v1/news/${newsId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(newsId);
          expect(res.body.title).toBe('Test News Detail');
        });
    });
  });
});

