import type {
  AuthResponse as SharedAuthResponse,
  AvailableSlot as SharedAvailableSlot,
  AvailableSlotsResponse as SharedAvailableSlotsResponse,
  BookingResponse as SharedBookingResponse,
  CreateBookingInput as SharedCreateBookingInput,
  LoginInput as SharedLoginInput,
  RegisterInput as SharedRegisterInput,
} from "@booking/shared";

export type ApiErrorBody = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
};

export class ApiError extends Error {
  public readonly status: number;
  public readonly body: ApiErrorBody | null;

  constructor(message: string, status: number, body: ApiErrorBody | null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export type RegisterPayload = SharedRegisterInput;
export type LoginPayload = SharedLoginInput;
export type CreateBookingPayload = SharedCreateBookingInput;
export type AvailableSlot = SharedAvailableSlot;
export type AvailableSlotsResponse = SharedAvailableSlotsResponse;
export type BookingResponse = SharedBookingResponse;
export type AuthResponse = SharedAuthResponse;
