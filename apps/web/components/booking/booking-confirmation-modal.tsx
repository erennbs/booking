"use client";

type BookingConfirmationModalProps = {
  isOpen: boolean;
  consultantName: string;
  selectedDate: string;
  selectedTime: string;
  durationMinutes: number;
  isSubmitting: boolean;
  submitError: string | null;
  onCancel: () => void;
  onConfirm: () => void;
};

function formatDisplayDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatDisplayTime(time24: string): string {
  const [hoursRaw, minutesRaw] = time24.split(":");
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);
  const period = hours >= 12 ? "PM" : "AM";
  const normalizedHour = hours % 12 || 12;
  return `${String(normalizedHour).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
}

export function BookingConfirmationModal({
  isOpen,
  consultantName,
  selectedDate,
  selectedTime,
  durationMinutes,
  isSubmitting,
  submitError,
  onCancel,
  onConfirm,
}: BookingConfirmationModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <h4 className="text-xl font-semibold text-gray-900">Confirm Booking</h4>
        <p className="mt-2 text-sm text-gray-600">
          Review the details before confirming your booking.
        </p>

        <dl className="mt-5 space-y-3 rounded-lg border border-gray-200 p-4">
          <div>
            <dt className="text-xs uppercase text-gray-500">Consultant</dt>
            <dd className="font-medium text-gray-800">{consultantName}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-gray-500">Date</dt>
            <dd className="font-medium text-gray-800">{formatDisplayDate(selectedDate)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-gray-500">Time</dt>
            <dd className="font-medium text-gray-800">{formatDisplayTime(selectedTime)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-gray-500">Duration</dt>
            <dd className="font-medium text-gray-800">{durationMinutes} minutes</dd>
          </div>
        </dl>

        {submitError ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {submitError}
          </p>
        ) : null}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Confirming..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
