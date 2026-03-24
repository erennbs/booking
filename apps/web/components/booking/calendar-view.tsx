"use client";

import { useEffect, useMemo, useState } from "react";

type CalendarViewProps = {
  selectedDate: string;
  availableDateSet: Set<string>;
  isLoading: boolean;
  onSelectDate: (isoDate: string) => void;
};

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfWeekMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const shift = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - shift);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function CalendarView({
  selectedDate,
  availableDateSet,
  isLoading,
  onSelectDate,
}: CalendarViewProps) {
  const selected = useMemo(() => new Date(`${selectedDate}T00:00:00`), [selectedDate]);
  const [visibleMonth, setVisibleMonth] = useState<Date>(startOfMonth(selected));

  useEffect(() => {
    setVisibleMonth(startOfMonth(selected));
  }, [selected]);

  const monthStart = startOfMonth(visibleMonth);
  const gridStart = startOfWeekMonday(monthStart);

  const monthLabel = monthStart.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Available Days</h2>
          <p className="text-sm text-gray-500">60 min session set by the consultant</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setVisibleMonth(
                new Date(monthStart.getFullYear(), monthStart.getMonth() - 1, 1),
              )
            }
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition hover:border-blue-600 hover:text-blue-600"
            aria-label="Previous month"
          >
            {"<"}
          </button>
          <span className="text-sm font-medium text-gray-600">{monthLabel}</span>
          <button
            type="button"
            onClick={() =>
              setVisibleMonth(
                new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1),
              )
            }
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition hover:border-blue-600 hover:text-blue-600"
            aria-label="Next month"
          >
            {">"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500">
        {WEEK_DAYS.map((day) => (
          <span key={day} className="py-2">
            {day}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 42 }).map((_, index) => {
          const dayDate = addDays(gridStart, index);
          const iso = toIsoDate(dayDate);
          const isCurrentMonth = dayDate.getMonth() === monthStart.getMonth();
          const isSelected = iso === selectedDate;
          const isAvailable = availableDateSet.has(iso);
          const disabled = isLoading || !isCurrentMonth || !isAvailable;

          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelectDate(iso)}
              disabled={disabled}
              className={[
                "h-10 rounded-full text-sm transition",
                isSelected ? "bg-blue-600 font-semibold text-white" : "",
                !isSelected && isCurrentMonth && isAvailable
                  ? "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                  : "",
                !isCurrentMonth ? "text-gray-300" : "",
                isCurrentMonth && !isAvailable ? "text-gray-300" : "",
                disabled ? "cursor-not-allowed" : "",
              ].join(" ")}
            >
              {dayDate.getDate()}
            </button>
          );
        })}
      </div>
    </section>
  );
}
