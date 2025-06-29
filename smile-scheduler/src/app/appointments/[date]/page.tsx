"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSession } from "next-auth/react";
import moment from "moment";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";

// Appointment type structure
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

// HourBlock for visual time slots
type HourBlock = {
  startHour: number;
  endHour: number;
  appointment: Appointment;
  color: string;
};

// Color palette used for appointment blocks
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

// Hook to detect mobile screen width
function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);

  return isMobile;
}

const DayAppointments = () => {
  const { date: dateParam } = useParams() as { date: string | string[] };
  const date = Array.isArray(dateParam) ? dateParam[0] : dateParam;
  const router = useRouter();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [notesOpen, setNotesOpen] = useState(false);
  const isMobile = useIsMobile();

  // Fetch appointments for the selected date and user
  useEffect(() => {
    const fetchAppointments = async () => {
      const session = await getSession();
      const email = session?.user?.email;
      if (!email || !date) return;

      const resId = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/id/${encodeURIComponent(email)}`
      );
      const { id: userId } = await resId.json();

      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/appointments/user/${encodeURIComponent(userId)}/date/${encodeURIComponent(date)}`;
      const resDay = await fetch(url);
      const data: Appointment[] = await resDay.json();

      setAppointments(data);
      setLoading(false);
    };

    fetchAppointments();
  }, [date]);

  // Timeline from 6 AM to 8 PM (15 hours)
  const hours = Array.from({ length: 15 }, (_, i) => 6 + i);

  // Map appointments to visual time blocks
  const bookedBlocks: HourBlock[] = appointments.map((app, index) => {
    const start = moment(
      `${date} ${app.appointment_start}`,
      "YYYY-MM-DD HH:mm:ss"
    );
    const end = moment(`${date} ${app.appointment_end}`, "YYYY-MM-DD HH:mm:ss");
    const startHour = start.hour();
    let endHour = end.hour();
    if (endHour === startHour) endHour += 1;

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
      <h1 className="text-3xl text-center text-[#4e6472] font-bold my-6 px-4">
        Appointments for {moment(date).format("MMMM D, YYYY")}
      </h1>

      <div className="flex flex-col md:flex-row max-w-7xl mx-auto px-4 gap-6">
        {/* Main calendar with timeline and appointments */}
        <div className="flex-1 bg-white p-6 rounded-lg shadow overflow-auto">
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
                    className="flex items-center px-4 mb-1 min-h-[56px]"
                    style={{ marginTop: "-1px" }}
                  >
                    <div className="text-sm font-semibold text-gray-800 w-24 py-3 select-none">
                      {moment().hour(hour).minute(0).format("h:00 A")}
                    </div>
                    <div
                      className={`flex-1 ml-4 h-full p-3 shadow-inner ${roundedClass} flex items-center`}
                      style={bgStyle}
                      onClick={() =>
                        block && setSelectedAppointment(block.appointment)
                      }
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if ((e.key === "Enter" || e.key === " ") && block) {
                          setSelectedAppointment(block.appointment);
                        }
                      }}
                      aria-label={`Appointment with ${block?.appointment.first_name} ${block?.appointment.last_name} at ${moment().hour(hour).minute(0).format("h A")}`}
                    >
                      {block && isStart && (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between flex-wrap gap-2 w-full">
                          <span className="font-bold text-sm sm:text-base truncate max-w-full sm:max-w-[40%]">
                            {block.appointment.first_name}{" "}
                            {block.appointment.last_name}
                          </span>
                          <span className="text-sm truncate max-w-full sm:max-w-[30%]">
                            {block.appointment.type}
                          </span>
                          <span className="text-sm whitespace-nowrap">
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

        {/* Appointment detail panel for desktop */}
        <AnimatePresence>
          {!isMobile && selectedAppointment && (
            <motion.div
              key="sidepanel"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
              className="w-80 ml-6 bg-white rounded-lg shadow-lg p-5 flex flex-col"
              aria-label="Appointment Details"
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
                {moment(
                  `${date} ${selectedAppointment.appointment_end}`
                ).format("h:mm A")}
              </p>
              <div className="mt-2 text-[#327b8c]">
                <strong>Notes:</strong>
                <br />
                <span className="whitespace-pre-wrap">
                  {selectedAppointment.notes || "N/A"}
                </span>
              </div>
              <div className="mt-6 flex flex-col gap-2">
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
                  className="text-sm text-red-500 hover:underline mt-2"
                >
                  Close Panel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile modal version of appointment details */}
        <AnimatePresence>
          {isMobile && selectedAppointment && (
            <>
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black z-40"
                onClick={() => setSelectedAppointment(null)}
                aria-hidden="true"
              />
              <motion.div
                key="modal"
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "100%" }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-white z-50 p-6 overflow-auto flex flex-col"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
              >
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="mb-4 text-red-500 underline self-start"
                  aria-label="Close appointment details"
                >
                  Close
                </button>
                <h2
                  id="modal-title"
                  className="text-xl font-bold mb-4 text-[#327b8c]"
                >
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
                  {moment(
                    `${date} ${selectedAppointment.appointment_end}`
                  ).format("h:mm A")}
                </p>

                {/* Notes accordion */}
                <div className="mt-4">
                  <button
                    onClick={() => setNotesOpen(!notesOpen)}
                    className="w-full text-left text-[#327b8c] font-semibold border-b border-gray-300 pb-1"
                    aria-expanded={notesOpen}
                    aria-controls="notes-content"
                  >
                    Notes {notesOpen ? "▲" : "▼"}
                  </button>
                  <AnimatePresence>
                    {notesOpen && (
                      <motion.div
                        id="notes-content"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden mt-2 whitespace-pre-wrap text-[#327b8c]"
                      >
                        {selectedAppointment.notes || "No notes available."}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="mt-auto pt-6 flex flex-col gap-3">
                  <button
                    onClick={() => {
                      router.push(
                        `/appointments/edit/${selectedAppointment.id}`
                      );
                      setSelectedAppointment(null);
                    }}
                    className="bg-blue-600 text-white px-4 py-3 rounded hover:bg-blue-700"
                  >
                    Edit Appointment
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Back button */}
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
