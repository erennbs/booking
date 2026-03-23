import { Injectable, Logger } from '@nestjs/common';
import { SESSION_DURATION_MINUTES } from '@booking/shared';

export interface BookingConfirmationEmail {
  to: string;
  userName: string;
  bookingId: string;
  date: string;
  startTime: string;
}

@Injectable()
export class MockEmailService {
  private readonly logger = new Logger(MockEmailService.name);

  sendBookingConfirmation(payload: BookingConfirmationEmail): void {
    const subject = 'Booking confirmed';
    const body = [
      `Hi ${payload.userName},`,
      '',
      `Your session is confirmed for ${payload.date} at ${payload.startTime} (${SESSION_DURATION_MINUTES} min).`,
      `Booking reference: ${payload.bookingId}`,
      '',
      'Thank you for booking with us.',
    ].join('\n');

    this.logger.log(
      `[mock email] To: ${payload.to} | Subject: ${subject}\n${body}`,
    );
  }
}
