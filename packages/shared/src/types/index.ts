import { z } from "zod";
import { loginSchema, registerSchema } from "../schemas/auth.js";
import {
  availableSessionsQuerySchema,
  createBookingSchema,
} from "../schemas/booking.js";

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export type AvailableSessionsQuery = z.infer<typeof availableSessionsQuerySchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export type BookingStatus = "confirmed" | "cancelled";

export interface Booking {
  id: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AvailableSlot {
  startTime: string;
  endTime: string;
  duration: number;
}

export interface AvailableSlotsResponse {
  date: string;
  availableSlots: AvailableSlot[];
}

export interface BookingResponse {
  booking: Booking;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
