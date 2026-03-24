"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BookingConfirmationModal } from "@/components/booking/booking-confirmation-modal";
import { CalendarView } from "@/components/booking/calendar-view";
import { TimeSlotPicker } from "@/components/booking/time-slot-picker";
import { createBooking, getAvailableSlots } from "@/lib/api/bookings";
import { AvailableSlot, ApiError } from "@/lib/api/types";
import { getStoredAuthState } from "@/lib/auth-storage";

const DEFAULT_CONSULTANT = {
  id: "default-consultant",
  name: "Sara Ahmed",
  title: "Founder, investor, partner in the largest technology companies",
  introduction: "Specialized in developing and managing digital products. Interested in business and have several experiences in it. Investor. Producer and host of the #BusinessTalks podcast.",
  about:
    `Things I Can Offer:
  - E-com Subscriptions
  - Digital Media/Platform Adoption
  - Building and Scaling SaaS
  - Early Investment
  - Twitter Growth Strategies
  - Community Building\n
  I love helping others, especially hungry entrepreneurs.
  Currently expanding my own founder community.`,
  avatarUrl: "",
};

function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function nextNDays(base: Date, count: number, startOffset = 0): string[] {
  return Array.from({ length: count }).map((_, i) => {
    const next = new Date(base);
    next.setDate(base.getDate() + i + startOffset);
    return toIsoDate(next);
  });
}

export default function ConsultantPage() {
  const consultant = DEFAULT_CONSULTANT;
  const today = useMemo(() => new Date(), []);
  const availableDates = useMemo(() => nextNDays(today, 3650, 1), [today]);
  const availableDateSet = useMemo(() => new Set(availableDates), [availableDates]);

  const [selectedDate, setSelectedDate] = useState<string>(availableDates[0] ?? toIsoDate(today));
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    setIsAuthenticated(Boolean(getStoredAuthState().accessToken));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoadingSlots(true);
    setSlotsError(null);
    setSelectedSlot(null);

    getAvailableSlots(selectedDate)
      .then((data) => {
        if (!cancelled) {
          setAvailableSlots(data.availableSlots);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          const message = error instanceof ApiError ? error.message : "Failed to load slots.";
          setSlotsError(message);
          setAvailableSlots([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingSlots(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedDate]);

  const canOpenModal = Boolean(selectedSlot) && !isLoadingSlots;

  const handleConfirm = async () => {
    const auth = getStoredAuthState();
    if (!selectedSlot) return;
    if (!auth.accessToken) {
      setSubmitError("Please log in first to complete your booking.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      const result = await createBooking(
        { date: selectedDate, startTime: selectedSlot },
        auth.accessToken,
      );
      setSuccessMessage(
        `Booking confirmed for ${result.booking.date} at ${result.booking.startTime}.`,
      );
      setIsModalOpen(false);
      setSelectedSlot(null);
      const refreshed = await getAvailableSlots(selectedDate);
      setAvailableSlots(refreshed.availableSlots);
    } catch (error: unknown) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Could not complete booking. Please try again.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="flex items-center justify-between rounded-xl bg-white py-4">
          <h1 className="text-2xl font-semibold text-gray-800">Consultant</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Settings"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition hover:border-blue-600 hover:text-blue-600"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2">
                <path d="M12 8.5A3.5 3.5 0 1 0 12 15.5A3.5 3.5 0 1 0 12 8.5Z" />
                <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2a1 1 0 0 0-.6.9V20a2 2 0 1 1-4 0v-.2a1 1 0 0 0-.6-.9a1 1 0 0 0-1.1.2l-.1.1a2 2 0 0 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1a1 1 0 0 0-.9-.6H4a2 2 0 1 1 0-4h.2a1 1 0 0 0 .9-.6a1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2a1 1 0 0 0 .6-.9V4a2 2 0 1 1 4 0v.2a1 1 0 0 0 .6.9a1 1 0 0 0 1.1-.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1a1 1 0 0 0 .9.6H20a2 2 0 1 1 0 4h-.2a1 1 0 0 0-.9.6Z" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Messages"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition hover:border-blue-600 hover:text-blue-600"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2">
                <path d="M4 5h16v10H7l-3 3V5Z" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Notifications"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition hover:border-blue-600 hover:text-blue-600"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2">
                <path d="M6 16h12l-1-2v-3a5 5 0 1 0-10 0v3l-1 2Z" />
                <path d="M10 18a2 2 0 0 0 4 0" />
              </svg>
            </button>
            {!isAuthenticated ? (
              <Link
                href="/login"
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Login
              </Link>
            ) : null}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
          <section className="rounded-xl bg-gray-50 p-8 shadow-sm">
            <div className="flex items-center gap-5">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 text-3xl font-semibold text-blue-700">
                {consultant.name
                  .split(" ")
                  .map((name) => name[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">{consultant.name}</h2>
                <p className="text-gray-500">{consultant.title}</p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="LinkedIn"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition hover:border-blue-600 hover:text-blue-600"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                      <path d="M6.94 8.5H3.56V20h3.38V8.5ZM5.25 3A1.97 1.97 0 1 0 5.3 6.94A1.97 1.97 0 0 0 5.25 3ZM20.44 13.4c0-3.05-1.62-4.47-3.78-4.47c-1.74 0-2.52.96-2.96 1.64V8.5h-3.37V20h3.37v-6.2c0-1.64.31-3.23 2.34-3.23c2 0 2.03 1.88 2.03 3.33V20h3.37l.01-6.6Z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    aria-label="Instagram"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition hover:border-blue-600 hover:text-blue-600"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2">
                      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
                      <circle cx="12" cy="12" r="3.7" />
                      <circle cx="17.2" cy="6.8" r="0.8" fill="currentColor" stroke="none" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    aria-label="Twitter"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition hover:border-blue-600 hover:text-blue-600"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                      <path d="M18.9 3H22l-6.77 7.74L23 21h-6.08l-4.75-6.22L6.72 21H3.6l7.24-8.27L3.4 3h6.24l4.3 5.7L18.9 3Zm-1.07 16.2h1.69L8.76 4.7H6.95L17.83 19.2Z" />
                    </svg>
                  </button>
                </div>
                <p className="mt-3 inline-flex py-1 text-sm font-medium">
                  Available for sessions
                </p>
              </div>
            </div>

            <h3 className="mt-8 text-lg font-semibold text-gray-800">Introduction</h3>
            <p className="mt-2 text-gray-600">{consultant.introduction}</p>

            <h3 className="mt-8 text-lg font-semibold text-gray-800">About Me</h3>
            <p className="mt-2 whitespace-pre-line leading-relaxed text-gray-600">
              {consultant.about}
            </p>
          </section>

          <section className="rounded-xl bg-gray-50 p-6 shadow-sm sm:p-8">
            <CalendarView
              selectedDate={selectedDate}
              availableDateSet={availableDateSet}
              isLoading={isLoadingSlots}
              onSelectDate={(date) => {
                setSuccessMessage(null);
                setSelectedDate(date);
              }}
            />

            <div className="mt-6 border-t border-gray-100 pt-6">
              <TimeSlotPicker
                selectedSlot={selectedSlot}
                slots={availableSlots}
                isLoading={isLoadingSlots}
                errorMessage={slotsError}
                onSelectSlot={(slot) => {
                  setSuccessMessage(null);
                  setSelectedSlot(slot);
                }}
              />
            </div>

            {successMessage ? (
              <p className="mt-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                {successMessage}
              </p>
            ) : null}

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              disabled={!canOpenModal}
              className="w-full mt-4 rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              Book Session
            </button>
          </section>
        </div>
      </main>

      <BookingConfirmationModal
        isOpen={isModalOpen}
        consultantName={consultant.name}
        selectedDate={selectedDate}
        selectedTime={selectedSlot ?? ""}
        durationMinutes={60}
        isSubmitting={isSubmitting}
        submitError={submitError}
        onCancel={() => {
          if (!isSubmitting) {
            setSubmitError(null);
            setIsModalOpen(false);
          }
        }}
        onConfirm={handleConfirm}
      />
    </>
  );
}
