"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSession } from "next-auth/react";
import moment from "moment";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";

type Appointment = {
  id: number;
  appointment_start: string;
  appointment_end: string;
  type: string;
  duration: number;
  first_name: string;
  last_name: string;
  notes: string;
};

type HourBlock = {
  startHour: number;
  endHour: number;
  appointment: Appointment;
  color: string;
};

const colorPalette = [
  "#327b8c",
  "#00897b",
  "#5e35b1",
  "#c62828",
  "#ef6c00",
  "#2e7d32",
  "#3949ab",
  "#d81b60",
  "#6d4c41",
  "#00acc1",
];

const DayAppointments = () => {
  const { date: dateParam } = useParams() as { date: string | string[] };
  const date = Array.isArray(dateParam) ? dateParam[0] : dateParam;
  const router = useRouter();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      const session = await getSession();
      const email = session?.user?.email;
      if (!email || !date) return;

      const resId = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/id/${encodeURIComponent(email)}`
      );
      const { id: userId } = await resId.json();

      const resDay = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/appointments/user/${encodeURIComponent(userId)}/date/${encodeURIComponent(date)}`
      );
      const data: Appointment[] = await resDay.json();
      console.log("appointments:", data);
      setAppointments(data);
      setLoading(false);
    };
    fetchAppointments();
  }, [date]);

  const hours = Array.from({ length: 15 }, (_, i) => 6 + i);

  const bookedBlocks: HourBlock[] = appointments.map((app, index) => {
    const start = moment(
      `${date} ${app.appointment_start}`,
      "YYYY-MM-DD HH:mm:ss"
    );
    const end = moment(`${date} ${app.appointment_end}`, "YYYY-MM-DD HH:mm:ss");

    const startHour = start.hour();
    let endHour = end.hour();
    if (endHour === startHour) endHour += 1; // ⬅️ add this line

    return {
      startHour,
      endHour,
      appointment: app,
      color: colorPalette[index % colorPalette.length],
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#9dc7d4] via-white to-[#9dc7d4]">
      <Navbar />
      <h1 className="text-3xl text-center text-[#4e6472] font-bold my-6">
        Appointments for {moment(date).format("MMMM D, YYYY")}
      </h1>

      <div className="flex max-w-7xl mx-auto px-4">
        {/* Main Calendar View */}
        <div className="flex-1 bg-white p-6 rounded-lg shadow">
          {loading ? (
            <p className="text-center text-lg">Loading...</p>
          ) : (
            <div className="flex flex-col">
              {hours.map((hour, i) => {
                const block = bookedBlocks.find(
                  (b) => hour >= b.startHour && hour < b.endHour
                );
                const isStart = block?.startHour === hour;
                const isEnd = block ? block.endHour - 1 === hour : false;

                const bgStyle = block
                  ? {
                      backgroundColor: block.color,
                      color: "#fff",
                      cursor: "pointer",
                    }
                  : { backgroundColor: "#e5e7eb" };

                const roundedClass = block
                  ? isStart && isEnd
                    ? "rounded-lg"
                    : isStart
                      ? "rounded-t-lg"
                      : isEnd
                        ? "rounded-b-lg"
                        : ""
                  : "rounded-lg";

                return (
                  <motion.div
                    key={hour}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center px-4 mb-1"
                    style={{ marginTop: "-1px" }}
                  >
                    <div className="text-sm font-semibold text-gray-800 w-24 py-3">
                      {moment().hour(hour).minute(0).format("h:00 A")}
                    </div>
                    <div
                      className={`flex-1 ml-4 h-12 p-2 shadow-inner ${roundedClass}`}
                      style={bgStyle}
                      onClick={() =>
                        block && setSelectedAppointment(block.appointment)
                      }
                    >
                      {block && isStart && (
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="font-bold text-sm sm:text-base">
                            {block.appointment.first_name}{" "}
                            {block.appointment.last_name}
                          </span>
                          <span className="text-sm">
                            {block.appointment.type}
                          </span>
                          <span className="text-sm">
                            {Math.floor(block.appointment.duration / 60)}h{" "}
                            {block.appointment.duration % 60}m
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Side Panel */}
        {selectedAppointment && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="w-80 ml-6 bg-white rounded-lg shadow-lg p-5"
          >
            <h2 className="text-xl font-bold mb-4 text-[#327b8c]">
              Appointment Details
            </h2>
            <p className="text-[#327b8c]">
              <strong>Name:</strong> {selectedAppointment.first_name}{" "}
              {selectedAppointment.last_name}
            </p>
            <p className="text-[#327b8c]">
              <strong>Type:</strong> {selectedAppointment.type}
            </p>
            <p className="text-[#327b8c]">
              <strong>Duration:</strong>{" "}
              {Math.floor(selectedAppointment.duration / 60)}h{" "}
              {selectedAppointment.duration % 60}m
            </p>
            <p className="text-[#327b8c]">
              <strong>Start:</strong>{" "}
              {moment(
                `${date} ${selectedAppointment.appointment_start}`
              ).format("h:mm A")}
            </p>
            <p className="text-[#327b8c]">
              <strong>End:</strong>{" "}
              {moment(`${date} ${selectedAppointment.appointment_end}`).format(
                "h:mm A"
              )}
            </p>
            <p className="mt-2 text-[#327b8c]">
              <strong>Notes:</strong> {selectedAppointment.notes || "N/A"}
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={() =>
                  router.push(`/appointments/edit/${selectedAppointment.id}`)
                }
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Edit Appointment
              </button>

              <button
                onClick={() => setSelectedAppointment(null)}
                className="text-sm text-red-500 hover:underline"
              >
                Close Panel
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <div className="text-center mt-8">
        <button
          className="text-[#327b8c] hover:underline"
          onClick={() => window.history.back()}
        >
          ← Back to Calendar
        </button>
      </div>
    </div>
  );
};

export default DayAppointments;
