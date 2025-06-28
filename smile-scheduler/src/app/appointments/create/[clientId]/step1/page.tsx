"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  subMonths,
  addMonths,
  isBefore,
  isSameMonth,
} from "date-fns";
import Navbar from "@/components/Navbar";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AppointmentStep1() {
  const { clientId } = useParams() as { clientId: string };
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const today = new Date();

  // Generate all days in the current month
  const start = startOfMonth(currentMonth);
  const end = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start, end });

  // Calculate offset for grid alignment (e.g., if month starts on a Thursday)
  const startOffset = getDay(start);
  const paddedDays = Array(startOffset).fill(null).concat(daysInMonth);

  // Handle user selecting a date (future or today only)
  const handleDateClick = (date: Date) => {
    if (!isBefore(date, today)) {
      setSelectedDate(date);
    }
  };

  // Move to Step 2 with selected date
  const handleSelect = () => {
    if (selectedDate) {
      router.push(
        `/appointments/create/${clientId}/step2?date=${selectedDate.toISOString()}`
      );
    }
  };

  // Navigate to previous month (disabled if current is this month)
  const handlePrevMonth = () => {
    if (!isSameMonth(currentMonth, today)) {
      setCurrentMonth(subMonths(currentMonth, 1));
    }
  };

  // Navigate to next month
  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#9dc7d4] via-white to-[#9dc7d4]">
      <Navbar />
      <div className="max-w-3xl mx-auto mt-12 px-6 text-center">
        <h1 className="text-4xl font-bold text-[#4e6472] mb-4">
          Select a Date
        </h1>

        {/* Month navigation */}
        <div className="flex items-center justify-center gap-6 mb-4">
          <button
            onClick={handlePrevMonth}
            disabled={isSameMonth(currentMonth, today)}
            className="text-[#4e6472] text-2xl disabled:opacity-30"
          >
            ◀
          </button>
          <span className="text-xl font-semibold text-[#4e6472]">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <button onClick={handleNextMonth} className="text-[#4e6472] text-2xl">
            ▶
          </button>
        </div>

        {/* Calendar grid */}
        <div className="bg-white p-4 rounded-xl shadow-md">
          {/* Weekday headings */}
          <div className="grid grid-cols-7 gap-2 mb-2 text-sm font-semibold text-[#4e6472]">
            {weekDays.map((day) => (
              <div key={day} className="text-center">
                {day}
              </div>
            ))}
          </div>

          {/* Day buttons */}
          <div className="grid grid-cols-7 gap-2">
            {paddedDays.map((day, index) => {
              if (!day) return <div key={index} />;

              const isSelected =
                selectedDate &&
                format(selectedDate, "yyyy-MM-dd") ===
                  format(day, "yyyy-MM-dd");

              const isPast = isBefore(day, today);
              const isDisabled = isPast;

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => handleDateClick(day)}
                  disabled={isDisabled}
                  className={`p-3 rounded-md text-sm font-medium transition text-[#4e6472] shadow text-center
                    ${
                      isSelected
                        ? "bg-[#327b8c] text-white"
                        : isDisabled
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-[#f0f7fa] hover:bg-[#d3eaf1]"
                    }`}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-10">
          <button
            onClick={() => router.push(`/clients/${clientId}`)}
            className="text-[#4e6472] hover:underline"
          >
            Cancel
          </button>
          <button
            disabled={!selectedDate}
            onClick={handleSelect}
            className="bg-[#327b8c] hover:bg-[#285d69] text-white px-6 py-2 rounded-lg disabled:opacity-50"
          >
            Select Date
          </button>
        </div>
      </div>
    </div>
  );
}
