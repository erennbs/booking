export interface TimeSlot {
  startTime: string;
  endTime: string;
  duration: number;
  label: string;
}

/**
 * Hourly slots from 09:00 to 16:00 (last session starts at 16:00, ends 17:00).
 * Each session is 60 minutes long.
 */
export const TIME_SLOTS: TimeSlot[] = [
  { startTime: "09:00", endTime: "10:00", duration: 60, label: "09:00 AM" },
  { startTime: "10:00", endTime: "11:00", duration: 60, label: "10:00 AM" },
  { startTime: "11:00", endTime: "12:00", duration: 60, label: "11:00 AM" },
  { startTime: "12:00", endTime: "13:00", duration: 60, label: "12:00 PM" },
  { startTime: "13:00", endTime: "14:00", duration: 60, label: "01:00 PM" },
  { startTime: "14:00", endTime: "15:00", duration: 60, label: "02:00 PM" },
  { startTime: "15:00", endTime: "16:00", duration: 60, label: "03:00 PM" },
  { startTime: "16:00", endTime: "17:00", duration: 60, label: "04:00 PM" },
];

export const SESSION_DURATION_MINUTES = 60;
