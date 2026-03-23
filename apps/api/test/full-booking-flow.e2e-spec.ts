import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import postgres from 'postgres';

import { AppModule } from '../src/app.module';

describe('Full booking flow', () => {
  let app: INestApplication;
  let sql: ReturnType<typeof postgres>;

  const date = '2026-03-23';
  const startTime = '09:00';

  beforeAll(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret';
    process.env.JWT_EXPIRY = process.env.JWT_EXPIRY ?? '1d';
    process.env.DATABASE_URL = process.env.DATABASE_URL!;

    sql = postgres(process.env.DATABASE_URL, { max: 1 });

    await sql`DELETE FROM bookings;`;
    await sql`DELETE FROM users;`;

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await sql.end();
  });

  beforeEach(async () => {
    await sql`DELETE FROM bookings;`;
    await sql`DELETE FROM users;`;
  });

  it('register -> login -> available -> book', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Test',
        email: 'test@example.com',
        password: 'password123',
      })
      .expect(201)
      .expect((res) => {
        expect(typeof res.body.accessToken).toBe('string');
      });

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      })
      .expect(201);

    const token = loginRes.body.accessToken as string;
    expect(typeof token).not.toBeNull();

    const available1 = await request(app.getHttpServer())
      .get('/bookings/available')
      .query({ date })
      .expect(200);

    expect(
      available1.body.availableSlots.some((s: any) => s.startTime === startTime),
    ).toBe(true);

    const bookingRes = await request(app.getHttpServer())
      .post('/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({ date, startTime })
      .expect(201);

    expect(bookingRes.body.booking.startTime).toBe(startTime);
    expect(bookingRes.body.booking.status).toBe('confirmed');

    const available2 = await request(app.getHttpServer())
      .get('/bookings/available')
      .query({ date })
      .expect(200);

    expect(
      available2.body.availableSlots.some((s: any) => s.startTime === startTime),
    ).toBe(false);
  });

  it('should reject double booking (same user) and conflicting booking (other user)', async () => {
    const user1Res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'User1',
        email: 'u1@example.com',
        password: 'password123',
      })
      .expect(201);

    const user2Res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'User2',
        email: 'u2@example.com',
        password: 'password123',
      })
      .expect(201);

    const user1Token = user1Res.body.accessToken as string;
    const user2Token = user2Res.body.accessToken as string;

    await request(app.getHttpServer())
      .post('/bookings')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ date, startTime })
      .expect(201);

    await request(app.getHttpServer())
      .post('/bookings')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ date, startTime })
      .expect(409);

    await request(app.getHttpServer())
      .post('/bookings')
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ date, startTime })
      .expect(409);
  });
});

