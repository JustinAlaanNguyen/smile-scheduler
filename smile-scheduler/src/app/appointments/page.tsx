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

const localizer: DateLocalizer = momentLocalizer(moment);

type Appointment = {
  appointment_date: string;
};

type AppointmentEvent = {
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

  const handleSelectSlot = (slotInfo: { start: Date }) => {
    const date = moment(slotInfo.start).format("YYYY-MM-DD");
    router.push(`/appointments/${date}`);
  };

  useEffect(() => {
    const fetchUserId = async () => {
      if (!session?.user?.email) return;

      try {
        const res = await fetch(
          `http://localhost:3001/api/users/id/${encodeURIComponent(
            session.user.email
          )}`
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

  const fetchAppointmentsForRange = useCallback(
    async (start: Date, end: Date) => {
      if (!userId) return;

      setLoading(true);
      try {
        const startStr = moment(start).format("YYYY-MM-DD");
        const endStr = moment(end).format("YYYY-MM-DD");

        const res = await fetch(
          `http://localhost:3001/api/appointments/user/${userId}/range?start=${startStr}&end=${endStr}`
        );
        if (!res.ok) throw new Error("Failed to fetch appointments");

        const data: Appointment[] = await res.json();

        const counts: Record<string, number> = data.reduce((acc, curr) => {
          const dateStr = moment(curr.appointment_date).format("YYYY-MM-DD");
          acc[dateStr] = (acc[dateStr] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const events = Object.entries(counts).map(([date, count]) => ({
          title: `${count} appointment${count > 1 ? "s" : ""}`,
          start: moment(date).startOf("day").toDate(),
          end: moment(date).endOf("day").toDate(),
          allDay: true,
        }));

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

  useEffect(() => {
    if (!userId) return;

    const startOfMonth = moment(currentDate).startOf("month").toDate();
    const endOfMonth = moment(currentDate).endOf("month").toDate();

    fetchAppointmentsForRange(startOfMonth, endOfMonth);
  }, [userId, currentDate, fetchAppointmentsForRange]);

  const handleNavigate = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  if (status === "loading" || loading) {
    return (
      <div className="text-center mt-20 text-lg text-[#4e6472]">Loading...</div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="text-center mt-20 text-red-500 text-xl">
        Access Denied. You must be logged in to view this page.
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-20 text-red-500 text-xl">{error}</div>
    );
  }

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
        className="max-w-6xl mx-auto bg-white shadow-lg rounded-xl p-6"
      >
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          views={["month"]}
          defaultView="month"
          date={currentDate}
          onNavigate={handleNavigate}
          style={{ height: 600 }}
          className="rounded-lg"
          selectable
          onSelectSlot={handleSelectSlot}
        />
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
