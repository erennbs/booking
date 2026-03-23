import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';

describe('BookingsController', () => {
  const date = '2026-03-23';
  const startTime = '09:00';

  it('GET /bookings/available should return available slots', async () => {
    const bookingsService = {
      getAvailableSlots: jest.fn().mockResolvedValue({
        date,
        availableSlots: [
          { startTime, endTime: '10:00', duration: 60 },
        ],
      }),
    } as unknown as BookingsService;

    const moduleRef = await Test.createTestingModule({
      controllers: [BookingsController],
      providers: [{ provide: BookingsService, useValue: bookingsService }],
    })
      .compile();

    const app = moduleRef.createNestApplication();
    await app.init();

    await request(app.getHttpServer())
      .get('/bookings/available')
      .query({ date })
      .expect(200)
      .expect({
        date,
        availableSlots: [
          { startTime, endTime: '10:00', duration: 60 },
        ],
      });

    expect(bookingsService.getAvailableSlots).toHaveBeenCalledWith(date);
    await app.close();
  });

  it('GET /bookings/available should 400 on invalid date query', async () => {
    const bookingsService = {
      getAvailableSlots: jest.fn(),
    } as unknown as BookingsService;

    const moduleRef = await Test.createTestingModule({
      controllers: [BookingsController],
      providers: [{ provide: BookingsService, useValue: bookingsService }],
    }).compile();

    const app = moduleRef.createNestApplication();
    await app.init();

    await request(app.getHttpServer())
      .get('/bookings/available')
      .query({ date: 'nope' })
      .expect(400);

    expect(bookingsService.getAvailableSlots).not.toHaveBeenCalled();
    await app.close();
  });

  it('POST /bookings should create a booking for authenticated user', async () => {
    const bookingsService = {
      createBooking: jest.fn().mockResolvedValue({
        booking: {
          id: 'booking-1',
          userId: 'user-1',
          date,
          startTime,
          status: 'confirmed',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }),
    } as unknown as BookingsService;

    const moduleRef = await Test.createTestingModule({
      controllers: [BookingsController],
      providers: [{ provide: BookingsService, useValue: bookingsService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: any) => {
          const req = ctx.switchToHttp().getRequest();
          req.user = { id: 'user-1' };
          return true;
        },
      })
      .compile();

    const app = moduleRef.createNestApplication();
    await app.init();

    await request(app.getHttpServer())
      .post('/bookings')
      .send({ date, startTime })
      .expect(201)
      .expect((res) => {
        if (res.body.booking.status !== 'confirmed') {
          throw new BadRequestException('Expected confirmed booking');
        }
      });

    expect(bookingsService.createBooking).toHaveBeenCalledWith('user-1', {
      date,
      startTime,
    });
    await app.close();
  });

  it('POST /bookings should 400 on invalid body', async () => {
    const bookingsService = {
      createBooking: jest.fn(),
    } as unknown as BookingsService;

    const moduleRef = await Test.createTestingModule({
      controllers: [BookingsController],
      providers: [{ provide: BookingsService, useValue: bookingsService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: any) => {
          const req = ctx.switchToHttp().getRequest();
          req.user = { id: 'user-1' };
          return true;
        },
      })
      .compile();

    const app = moduleRef.createNestApplication();
    await app.init();

    await request(app.getHttpServer())
      .post('/bookings')
      .send({ date: '2026/03/23', startTime: '9:00' })
      .expect(400);

    expect(bookingsService.createBooking).not.toHaveBeenCalled();
    await app.close();
  });
});

