"use client";

import { useEffect, useState, useCallback } from "react";
import { getSession } from "next-auth/react";
import { Calendar, momentLocalizer, DateLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "@/styles/calendar-custom.css";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [events, setEvents] = useState<AppointmentEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const handleSelectSlot = (slotInfo: { start: Date }) => {
    const date = moment(slotInfo.start).format("YYYY-MM-DD");
    router.push(`/appointments/${date}`);
  };
  // Fetch the user ID from session
  useEffect(() => {
    const fetchUserId = async () => {
      const session = await getSession();
      const email = session?.user?.email;
      if (!email) return;

      const userIdRes = await fetch(
        `http://localhost:3001/api/users/id/${email}`
      );
      const userIdData = await userIdRes.json();
      setUserId(userIdData.id);
    };

    fetchUserId();
  }, []);

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
      } catch (err) {
        console.error("Error fetching appointments in range:", err);
      }
      setLoading(false);
    },
    [userId]
  );

  useEffect(() => {
    if (!userId) return;

    const startOfMonth = moment(currentDate).startOf("month").toDate();
    const endOfMonth = moment(currentDate).endOf("month").toDate();

    fetchAppointmentsForRange(startOfMonth, endOfMonth);
  }, [userId, currentDate, fetchAppointmentsForRange]);

  // Handle navigation (next/back) in calendar
  const handleNavigate = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#9dc7d4] via-white to-[#9dc7d4]">
      <Navbar />
      <h1 className="text-4xl font-bold text-center text-[#4e6472] mt-6 mb-6">
        📅 My Appointments
      </h1>

      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-xl p-6">
        {loading ? (
          <p className="text-center text-lg text-[#4e6472]">
            Loading appointments...
          </p>
        ) : (
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
        )}
      </div>

      <div className="text-center mt-10">
        <a href="/dashboard" className="text-[#327b8c] hover:underline">
          ← Back to Dashboard
        </a>
      </div>
    </div>
  );
};

export default MyAppointments;
