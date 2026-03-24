"use client";

import { AvailableSlot } from "@/lib/api/types";

type TimeSlotPickerProps = {
  selectedSlot: string | null;
  slots: AvailableSlot[];
  isLoading: boolean;
  errorMessage: string | null;
  onSelectSlot: (slot: string) => void;
};

function formatTime(time24: string): string {
  const [hoursRaw, minutesRaw] = time24.split(":");
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);
  const period = hours >= 12 ? "PM" : "AM";
  const normalizedHour = hours % 12 || 12;
  return `${String(normalizedHour).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
}

export function TimeSlotPicker({
  selectedSlot,
  slots,
  isLoading,
  errorMessage,
  onSelectSlot,
}: TimeSlotPickerProps) {
  return (
    <section>
      <h3 className="text-lg font-semibold text-gray-800">Available Times</h3>
      <p className="mt-1 text-sm text-gray-500">Booking in your timezone</p>

      {isLoading ? (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-11 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : null}

      {!isLoading && errorMessage ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}

      {!isLoading && !errorMessage && slots.length === 0 ? (
        <p className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
          No slots available for the selected day.
        </p>
      ) : null}

      {!isLoading && !errorMessage && slots.length > 0 ? (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {slots.map((slot) => {
            const isSelected = selectedSlot === slot.startTime;
            return (
              <button
                key={slot.startTime}
                type="button"
                onClick={() => onSelectSlot(slot.startTime)}
                className={[
                  "rounded-lg border px-3 py-2 text-sm font-medium transition",
                  isSelected
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-300 bg-white text-gray-700 hover:border-blue-600 hover:bg-blue-50",
                ].join(" ")}
              >
                {formatTime(slot.startTime)}
              </button>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
