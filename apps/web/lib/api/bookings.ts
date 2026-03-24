import { apiRequest } from "@/lib/api/client";
import {
  AvailableSlotsResponse,
  BookingResponse,
  CreateBookingPayload,
} from "@/lib/api/types";

export function getAvailableSlots(date: string): Promise<AvailableSlotsResponse> {
  const params = new URLSearchParams({ date });
  return apiRequest<AvailableSlotsResponse>(`/bookings/available?${params.toString()}`);
}

export function createBooking(
  payload: CreateBookingPayload,
  token: string,
): Promise<BookingResponse> {
  return apiRequest<BookingResponse>("/bookings", {
    method: "POST",
    body: payload,
    token,
  });
}
