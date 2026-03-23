import { ConflictException } from '@nestjs/common';

export class SlotUnavailableException extends ConflictException {
  constructor(date: string, startTime: string) {
    super(`The time slot ${startTime} on ${date} is no longer available`);
  }
}
