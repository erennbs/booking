import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { MockEmailService } from '../email/mock-email.service';

@Module({
  controllers: [BookingsController],
  providers: [BookingsService, MockEmailService],
})
export class BookingsModule {}
