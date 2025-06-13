"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { differenceInMinutes, parse } from "date-fns";

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

  const calculateLength = () => {
    if (startTime && endTime) {
      const start = parse(startTime, "HH:mm", new Date());
      const end = parse(endTime, "HH:mm", new Date());
      return differenceInMinutes(end, start);
    }
    return null;
  };

  const updateAppointment = async () => {
    const length = calculateLength();

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
        `http://localhost:3001/api/appointments/${appointmentId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        }
      );

      if (!res.ok) throw new Error("Failed to update appointment");

      alert("Appointment updated successfully!");
      router.push("/appointments");
    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update appointment.");
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this appointment?"
    );
    if (!confirmDelete) return;

    setDeleting(true);

    try {
      const res = await fetch(
        `http://localhost:3001/api/appointments/${appointmentId}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) throw new Error("Failed to delete appointment");

      alert("Appointment deleted successfully");
      router.push("/appointments");
    } catch (error) {
      console.error("Delete error:", error);
      setMessage("Failed to delete appointment.");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const res = await fetch(
          `http://localhost:3001/api/appointments/${appointmentId}`
        );
        const data = await res.json();

        setAppointment(data);
        setStartTime(data.appointment_start.slice(0, 5));
        setEndTime(data.appointment_end.slice(0, 5));
        setType(data.type);
        setNotes(data.notes || "");
        setDate(data.appointment_date.slice(0, 10)); // ensures YYYY-MM-DD
      } catch (error) {
        console.error("Error fetching appointment:", error);
      }
    };
    fetchAppointment();
  }, [appointmentId]);

  if (!appointment) {
    return <p className="p-6">Loading appointment...</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#9dc7d4] via-white to-[#9dc7d4]">
      <Navbar />
      <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-xl shadow text-[#4e6472]">
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
            <strong>
              {calculateLength() !== null
                ? `${calculateLength()} minutes`
                : "N/A"}
            </strong>
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
                message.includes("success") ? "text-green-600" : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
