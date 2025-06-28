"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Calendar, momentLocalizer, DateLocalizer } from "react-big-calendar";
import moment from "moment";
import { motion } from "framer-motion";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "@/styles/calendar-custom.css";
import Navbar from "@/components/Navbar";
import CustomToolbar from "@/components/CustomToolbar";

// Configure localizer for react-big-calendar using Moment.js
const localizer: DateLocalizer = momentLocalizer(moment);

type Appointment = {
  appointment_date: string;
};

export type AppointmentEvent = {
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
};

const MyAppointments = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [events, setEvents] = useState<AppointmentEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarHeight, setCalendarHeight] = useState(600);

  // Adjust calendar height for smaller screens
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      setCalendarHeight(800);
    }
  }, []);

  // Redirect to specific date page when clicking an event
  const handleSelectEvent = (event: AppointmentEvent) => {
    const date = moment(event.start).format("YYYY-MM-DD");
    router.push(`/appointments/${date}`);
  };

  // Redirect to new appointment view when clicking an empty slot
  const handleSelectSlot = (slotInfo: { start: Date }) => {
    const date = moment(slotInfo.start).format("YYYY-MM-DD");
    router.push(`/appointments/${date}`);
  };

  // Fetch the authenticated user's ID using their email
  useEffect(() => {
    const fetchUserId = async () => {
      if (!session?.user?.email) return;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/id/${encodeURIComponent(session.user.email)}`
        );
        if (!res.ok) throw new Error("Failed to fetch user ID");

        const { id } = await res.json();
        setUserId(id);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
      }
    };

    if (status === "authenticated") {
      fetchUserId();
    }
  }, [session, status]);

  // Fetch all appointments for the given date range (typically one month)
  const fetchAppointmentsForRange = useCallback(
    async (start: Date, end: Date) => {
      if (!userId) return;

      setLoading(true);
      try {
        const startStr = moment(start).format("YYYY-MM-DD");
        const endStr = moment(end).format("YYYY-MM-DD");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/appointments/user/${encodeURIComponent(
            userId
          )}/range?start=${encodeURIComponent(startStr)}&end=${encodeURIComponent(endStr)}`
        );
        if (!res.ok) throw new Error("Failed to fetch appointments");

        const data: Appointment[] = await res.json();

        // Group appointments by date and count how many occur per day
        const counts: Record<string, number> = data.reduce(
          (acc, curr) => {
            const dateStr = moment(curr.appointment_date).format("YYYY-MM-DD");
            acc[dateStr] = (acc[dateStr] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        );

        // Create calendar events with a count-based label for each day
        const events = Object.entries(counts).map(([date, count]) => {
          const [year, month, day] = date.split("-").map(Number);

          // Temporarily shift forward 1 day to fix timezone issue
          const shifted = moment({ year, month: month - 1, day }).add(1, "day");

          return {
            title: `${count} appt${count > 1 ? "s" : ""}`,
            start: shifted.startOf("day").toDate(),
            end: shifted.endOf("day").toDate(),
            allDay: true,
          };
        });

        setEvents(events);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  // Fetch appointments when userId or month view changes
  useEffect(() => {
    if (!userId) return;

    const startOfMonth = moment(currentDate).startOf("month").toDate();
    const endOfMonth = moment(currentDate).endOf("month").toDate();

    fetchAppointmentsForRange(startOfMonth, endOfMonth);
  }, [userId, currentDate, fetchAppointmentsForRange]);

  // Handle calendar navigation (e.g., when user changes month)
  const handleNavigate = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  // Loading UI
  if (status === "loading" || loading) {
    return (
      <div className="text-center mt-20 text-lg text-[#4e6472]">Loading...</div>
    );
  }

  // Access control for unauthenticated users
  if (status === "unauthenticated") {
    return (
      <div className="text-center mt-20 text-red-500 text-xl">
        Access Denied. You must be logged in to view this page.
      </div>
    );
  }

  // Error display
  if (error) {
    return (
      <div className="text-center mt-20 text-red-500 text-xl">{error}</div>
    );
  }

  // Main UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#9dc7d4] via-white to-[#9dc7d4]">
      <Navbar />
      <h1 className="text-4xl font-bold text-center text-[#4e6472] mt-6 mb-6">
        📅 My Appointments
      </h1>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full px-2 sm:px-6"
      >
        <div className="bg-white shadow-lg rounded-xl p-2 sm:p-6">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            views={["month"]}
            defaultView="month"
            date={currentDate}
            onNavigate={handleNavigate}
            style={{ height: calendarHeight }}
            className="rounded-lg"
            selectable
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            components={{
              toolbar: CustomToolbar,
            }}
          />
        </div>
      </motion.div>

      <div className="text-center mt-10">
        <a href="/dashboard" className="text-[#327b8c] hover:underline">
          ← Back to Dashboard
        </a>
      </div>
    </div>
  );
};

export default MyAppointments;
