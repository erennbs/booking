import { BadRequestException } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { TIME_SLOTS, type CreateBookingInput } from '@booking/shared';
import { DoubleBookingException } from '../common/exceptions/double-booking.exception';
import { SlotUnavailableException } from '../common/exceptions/slot-unavailable.exception';
import { MockEmailService } from '../email/mock-email.service';

describe('BookingsService', () => {
  const userId = 'user-1';
  const date = '2026-03-23';
  const startTime = '09:00';

  const createInput = (partial?: Partial<CreateBookingInput>): CreateBookingInput => ({
    date,
    startTime,
    ...partial,
  });

  it('getAvailableSlots should remove confirmed bookings from TIME_SLOTS', async () => {
    const db = {
      select: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ startTime: '09:00:00' }]),
        }),
      }),
    };

    const email = { sendBookingConfirmation: jest.fn() } as unknown as MockEmailService;
    const service = new BookingsService(db as any, email);

    const res = await service.getAvailableSlots(date);

    expect(res.date).toBe(date);
    expect(res.availableSlots).toHaveLength(TIME_SLOTS.length - 1);
    expect(res.availableSlots.some((s) => s.startTime === '09:00')).toBe(false);
  });

  it('createBooking should throw BadRequestException for invalid time slot', async () => {
    const db = {} as any;
    const email = { sendBookingConfirmation: jest.fn() } as unknown as MockEmailService;
    const service = new BookingsService(db, email);

    await expect(
      service.createBooking(userId, createInput({ startTime: '08:00' })),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('createBooking should throw DoubleBookingException when same user books the same slot', async () => {
    const tx = {
      select: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([
            { userId, startTime, date },
          ]),
        }),
      }),
      insert: jest.fn(),
    };

    const db = {
      transaction: jest.fn().mockImplementation((fn: any) => fn(tx)),
    };

    const email = { sendBookingConfirmation: jest.fn() } as unknown as MockEmailService;
    const service = new BookingsService(db as any, email);

    await expect(service.createBooking(userId, createInput())).rejects.toBeInstanceOf(
      DoubleBookingException,
    );
  });

  it('createBooking should throw SlotUnavailableException when other user books the same slot', async () => {
    const otherUserId = 'user-2';
    const tx = {
      select: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([
            { userId: otherUserId, startTime, date },
          ]),
        }),
      }),
      insert: jest.fn(),
    };

    const db = {
      transaction: jest.fn().mockImplementation((fn: any) => fn(tx)),
    };

    const email = { sendBookingConfirmation: jest.fn() } as unknown as MockEmailService;
    const service = new BookingsService(db as any, email);

    await expect(service.createBooking(userId, createInput())).rejects.toBeInstanceOf(
      SlotUnavailableException,
    );
  });

  it('createBooking should insert booking and send confirmation email', async () => {
    const inserted = {
      id: 'booking-1',
      userId,
      date,
      startTime: '09:00:00',
      status: 'confirmed',
      createdAt: new Date('2026-03-23T10:00:00.000Z'),
      updatedAt: new Date('2026-03-23T10:00:00.000Z'),
    };

    const tx = {
      select: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      }),
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([inserted]),
        }),
      }),
    };

    const db = {
      transaction: jest.fn().mockImplementation((fn: any) => fn(tx)),
      select: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([{ email: 'u@example.com', name: 'U' }]),
          }),
        }),
      }),
    };

    const email = { sendBookingConfirmation: jest.fn() } as unknown as MockEmailService;
    const service = new BookingsService(db as any, email);

    const res = await service.createBooking(userId, createInput());

    expect(res.booking.id).toBe('booking-1');
    expect(res.booking.startTime).toBe('09:00');
    expect(email.sendBookingConfirmation).toHaveBeenCalledWith({
      to: 'u@example.com',
      userName: 'U',
      bookingId: 'booking-1',
      date,
      startTime: '09:00',
    });
  });
});

