import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  createBookingSchema,
  availableSessionsQuerySchema,
} from '@booking/shared';
import type {
  CreateBookingInput,
  AvailableSessionsQuery,
  AvailableSlotsResponse,
  BookingResponse,
} from '@booking/shared';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get('available')
  getAvailable(
    @Query(new ZodValidationPipe(availableSessionsQuerySchema)) query: AvailableSessionsQuery,
  ): Promise<AvailableSlotsResponse> {
    return this.bookingsService.getAvailableSlots(query.date);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Request() req: { user: { id: string } },
    @Body(new ZodValidationPipe(createBookingSchema)) body: CreateBookingInput,
  ): Promise<BookingResponse> {
    return this.bookingsService.createBooking(req.user.id, body);
  }
}
