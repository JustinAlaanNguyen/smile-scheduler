"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { differenceInMinutes, parse, format } from "date-fns";

type Appointment = {
  id: number;
  appointment_start: string;
  appointment_end: string;
  appointment_date: string;
  type: string;
  notes?: string;
  user_id: number;
  client_id: number;
  created_at?: string;
};

export default function EditAppointmentPage() {
  const { appointmentId } = useParams() as { appointmentId: string };
  const router = useRouter();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [type, setType] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [existingAppointments, setExistingAppointments] = useState<
    Appointment[]
  >([]);

  // Calculate duration in minutes based on start and end times
  const calculateLength = () => {
    if (startTime && endTime) {
      const start = parse(startTime, "HH:mm", new Date());
      const end = parse(endTime, "HH:mm", new Date());
      return differenceInMinutes(end, start);
    }
    return null;
  };

  // Fetch data for the current appointment being edited
  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/appointments/${encodeURIComponent(appointmentId)}`
        );
        const data = await res.json();

        setAppointment(data);
        setStartTime(data.appointment_start.slice(0, 5));
        setEndTime(data.appointment_end.slice(0, 5));
        setType(data.type);
        setNotes(data.notes || "");
        setDate(data.appointment_date.slice(0, 10)); // format: YYYY-MM-DD
      } catch {
        alert("Failed to load appointment.");
      }
    };
    fetchAppointment();
  }, [appointmentId]);

  // Load all other appointments for the same day to display in the timeline
  useEffect(() => {
    if (!date || !appointment?.user_id) return;

    const fetchAppointmentsForDate = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/appointments/user/${appointment.user_id}/date/${encodeURIComponent(date)}`
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        const filtered = data.filter(
          (appt: Appointment) => appt.id !== appointment.id
        );
        setExistingAppointments(filtered);
      } catch {
        setMessage("Unable to load existing appointments.");
      }
    };

    fetchAppointmentsForDate();
  }, [date, appointment?.user_id, appointment?.id]);

  // Handle updating appointment details
  const updateAppointment = async () => {
    const length = calculateLength();
    if (!date || !startTime || !endTime || !type) {
      alert("Please fill in all required fields.");
      return;
    }

    const updated = {
      start_time: startTime,
      end_time: endTime,
      date,
      type,
      notes,
      length,
      user_id: appointment?.user_id,
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/appointments/${encodeURIComponent(appointmentId)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        }
      );

      if (!res.ok) throw new Error();
      alert("Appointment updated successfully!");
      router.push("/appointments");
    } catch {
      alert("Failed to update appointment.");
    }
  };

  // Handle appointment deletion
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this appointment?"
    );
    if (!confirmDelete) return;

    setDeleting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/appointments/${encodeURIComponent(appointmentId)}`,
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error();
      alert("Appointment deleted successfully");
      router.push("/appointments");
    } catch {
      setMessage("Failed to delete appointment.");
    } finally {
      setDeleting(false);
    }
  };

  // Generate available time slots between 8:00 AM and 8:00 PM in 15-minute intervals
  const generateTimeSlots = () => {
    const slots = [];
    for (let h = 8; h <= 20; h++) {
      for (let m = 0; m < 60; m += 15) {
        const hour = h.toString().padStart(2, "0");
        const minute = m.toString().padStart(2, "0");
        const value = `${hour}:${minute}`;
        const label = format(parse(value, "HH:mm", new Date()), "h:mm a");
        slots.push({ value, label });
      }
    }
    return slots;
  };

  if (!appointment) {
    return <p className="p-6">Loading appointment...</p>;
  }

  const timeSlots = generateTimeSlots();
  const length = calculateLength();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#9dc7d4] via-white to-[#9dc7d4]">
      <Navbar />
      <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-xl shadow text-[#4e6472] grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Appointment Form Section */}
        <div>
          <h1 className="text-2xl font-bold mb-4">Edit Appointment</h1>

          <div className="space-y-4">
            <label className="block">
              <span className="font-medium">Date</span>
              <input
                type="date"
                className="w-full p-2 border border-gray-300 rounded mt-1"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>

            <div className="flex gap-4">
              <label className="flex-1">
                <span className="font-medium">Start Time</span>
                <input
                  type="time"
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </label>
              <label className="flex-1">
                <span className="font-medium">End Time</span>
                <input
                  type="time"
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </label>
            </div>

            <label className="block">
              <span className="font-medium">Appointment Type</span>
              <select
                className="w-full p-2 border border-gray-300 rounded mt-1"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="">-- Select Type --</option>
                <option value="new patient">New Patient</option>
                <option value="scale">Scale</option>
                <option value="recall">Recall</option>
              </select>
            </label>

            <label className="block">
              <span className="font-medium">Notes</span>
              <textarea
                className="w-full p-2 border border-gray-300 rounded mt-1"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </label>

            <p className="text-sm mt-2">
              Duration:{" "}
              <strong>{length !== null ? `${length} minutes` : "N/A"}</strong>
            </p>

            <button
              onClick={updateAppointment}
              className="mt-4 bg-[#327b8c] text-white px-6 py-2 rounded hover:bg-[#285f6e]"
            >
              Save Changes
            </button>

            <button
              onClick={handleDelete}
              disabled={deleting}
              className="mt-2 bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete Appointment"}
            </button>

            {message && (
              <p
                className={`text-center mt-4 font-semibold ${
                  message.includes("success")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {message}
              </p>
            )}
          </div>
        </div>

        {/* Appointment Timeline Section */}
        <div>
          <h2 className="text-xl font-bold mb-4">Appointments Timeline</h2>
          <div className="border rounded-lg p-4 max-h-[600px] overflow-y-auto bg-[#f9f9f9]">
            <div className="grid grid-cols-4 gap-2 text-sm font-medium mb-2 text-[#4e6472] sticky top-0 bg-[#f9f9f9] z-10">
              <span>Time</span>
              <span className="col-span-3">Status</span>
            </div>
            {timeSlots.map((slot) => {
              const isSelected =
                startTime &&
                endTime &&
                slot.value >= startTime &&
                slot.value < endTime;

              const isBooked = existingAppointments.some((appt) => {
                const slotTime = parse(slot.value, "HH:mm", new Date());
                const apptStart = parse(
                  appt.appointment_start,
                  "HH:mm:ss",
                  new Date()
                );
                const apptEnd = parse(
                  appt.appointment_end,
                  "HH:mm:ss",
                  new Date()
                );
                return slotTime >= apptStart && slotTime < apptEnd;
              });

              return (
                <div
                  key={slot.value}
                  className={`grid grid-cols-4 gap-2 py-1 px-2 rounded ${
                    isSelected
                      ? "bg-[#327b8c] text-white"
                      : isBooked
                        ? "bg-red-300 text-white"
                        : "hover:bg-gray-100 text-[#4e6472]"
                  }`}
                >
                  <span>{slot.label}</span>
                  <span className="col-span-3 border-b border-gray-200"></span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
