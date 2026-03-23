import { ConflictException } from '@nestjs/common';

export class DoubleBookingException extends ConflictException {
  constructor() {
    super('You already have a booking for this time slot');
  }
}
