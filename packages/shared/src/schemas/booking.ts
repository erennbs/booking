import { z } from "zod";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^\d{2}:\d{2}$/;

export const availableSessionsQuerySchema = z.object({
  date: z
    .string()
    .regex(dateRegex, "Date must be in YYYY-MM-DD format"),
});

export const createBookingSchema = z.object({
  date: z
    .string()
    .regex(dateRegex, "Date must be in YYYY-MM-DD format"),
  startTime: z
    .string()
    .regex(timeRegex, "Start time must be in HH:mm format"),
});
