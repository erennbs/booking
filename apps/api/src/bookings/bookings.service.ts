import {
  BadRequestException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import {
  TIME_SLOTS,
  type Booking,
  type CreateBookingInput,
  type AvailableSlotsResponse,
  type BookingResponse,
} from '@booking/shared';
import { bookings, users } from '../db/schema';
import { DRIZZLE } from '../db/drizzle.module';
import * as schema from '../db/schema';
import { SlotUnavailableException } from '../common/exceptions/slot-unavailable.exception';
import { DoubleBookingException } from '../common/exceptions/double-booking.exception';
import { MockEmailService } from '../email/mock-email.service';

function normalizeTime(t: string): string {
  return t.length >= 5 ? t.slice(0, 5) : t;
}

function findMatchingSlot(startTime: string) {
  return TIME_SLOTS.find((s) => s.startTime === startTime);
}

function isUniqueViolation(err: unknown): boolean {
  // Postgres unique constraint violation error code is 23505.
  return typeof err === 'object' && err !== null && (err as any).code === '23505';
}

function mapRowToBooking(row: typeof bookings.$inferSelect): Booking {
  return {
    id: row.id,
    userId: row.userId,
    date: String(row.date).slice(0, 10),
    startTime: normalizeTime(row.startTime),
    status: row.status as Booking['status'],
    createdAt:
      row.createdAt instanceof Date
        ? row.createdAt.toISOString()
        : String(row.createdAt),
    updatedAt:
      row.updatedAt instanceof Date
        ? row.updatedAt.toISOString()
        : String(row.updatedAt),
  };
}

@Injectable()
export class BookingsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: PostgresJsDatabase<typeof schema>,
    private readonly mockEmail: MockEmailService,
  ) {}

  async getAvailableSlots(date: string): Promise<AvailableSlotsResponse> {
    const rows = await this.db
      .select({ startTime: bookings.startTime })
      .from(bookings)
      .where(
        and(eq(bookings.date, date), eq(bookings.status, 'confirmed')),
      );

    const booked = new Set(rows.map((r) => normalizeTime(r.startTime)));

    const availableSlots = TIME_SLOTS.filter(
      (slot) => !booked.has(slot.startTime),
    ).map(({ startTime, endTime, duration }) => ({
      startTime,
      endTime,
      duration,
    }));

    return { date, availableSlots };
  }

  async createBooking(
    userId: string,
    input: CreateBookingInput,
  ): Promise<BookingResponse> {
    const slot = findMatchingSlot(input.startTime);
    if (!slot) {
      throw new BadRequestException(
        'Invalid time slot: must match a predefined hourly session',
      );
    }

    const { date, startTime } = input;

    const booking = await this.db.transaction(async (tx) => {
      const existing = await tx
        .select()
        .from(bookings)
        .where(
          and(eq(bookings.date, date), eq(bookings.startTime, startTime)),
        );

      const row0 = existing[0];
      if (row0) {
        if (row0.userId === userId) {
          throw new DoubleBookingException();
        }
        throw new SlotUnavailableException(date, startTime);
      }

      const [inserted] = await tx
        .insert(bookings)
        .values({
          userId,
          date,
          startTime,
          status: 'confirmed',
        })
        .returning();

      return inserted;
    }).catch(async (err) => {
      if (!isUniqueViolation(err)) throw err;

      const [row] = await this.db
        .select()
        .from(bookings)
        .where(
          and(eq(bookings.date, date), eq(bookings.startTime, startTime)),
        )
        .limit(1);

      if (row) {
        if (row.userId === userId) {
          throw new DoubleBookingException();
        }
        throw new SlotUnavailableException(date, startTime);
      }

      throw err;
    });

    const [userRow] = await this.db
      .select({ email: users.email, name: users.name })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userRow) {
      this.mockEmail.sendBookingConfirmation({
        to: userRow.email,
        userName: userRow.name,
        bookingId: booking.id,
        date,
        startTime,
      });
    }

    return { booking: mapRowToBooking(booking) };
  }
}
