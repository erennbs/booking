export { loginSchema, registerSchema } from "./schemas/auth.js";
export {
  availableSessionsQuerySchema,
  createBookingSchema,
} from "./schemas/booking.js";

export { TIME_SLOTS, SESSION_DURATION_MINUTES } from "./constants/time-slots.js";
export type { TimeSlot } from "./constants/time-slots.js";

export type {
  LoginInput,
  RegisterInput,
  AvailableSessionsQuery,
  CreateBookingInput,
  BookingStatus,
  Booking,
  User,
  AvailableSlot,
  AvailableSlotsResponse,
  BookingResponse,
  AuthResponse,
} from "./types/index.js";
