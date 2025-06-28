"use client";

import { useSearchParams, useParams, useRouter } from "next/navigation";
import { getSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import { format, differenceInMinutes, parse } from "date-fns";
import { useEffect, useState } from "react";

/* ──────────────────────────────────────────────────────────────
 * Component: AppointmentStep2
 * ----------------------------------------------------------------
 * • Loads client & user details
 * • Lets the user pick start/end times, type, notes
 * • Shows availability grid (15‑min increments) with booked vs selected slots
 * • Sends POST /appointments/create on “Book Appointment”
 * ──────────────────────────────────────────────────────────── */
export default function AppointmentStep2() {
  const router = useRouter();
  const { clientId } = useParams() as { clientId: string };
  const searchParams = useSearchParams();
  const date = searchParams?.get("date"); // ISO string from Step 1

  /* ─── State ─────────────────────────────────────────────── */
  const [userId, setUserId] = useState<number | null>(null);
  const [client, setClient] = useState<{
    first_name: string;
    last_name: string;
  } | null>(null);

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [appointmentType, setAppointmentType] = useState<
    "new patient" | "scale" | "recall" | ""
  >("");
  const [notes, setNotes] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [existingAppointments, setExistingAppointments] = useState<
    { appointment_start: string; appointment_end: string }[]
  >([]);

  /* ─── Helpers ────────────────────────────────────────────── */
  const fetchUserId = async (email: string): Promise<number | null> => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/id/${encodeURIComponent(email)}`
      );
      if (!res.ok) throw new Error("Failed to fetch user id");
      const data = await res.json();
      return data.id;
    } catch (error) {
      console.error("Error fetching user ID:", error);
      return null;
    }
  };

  // Generate 15‑minute slots from 8 AM‑8 PM
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

  const calculateLength = () => {
    if (startTime && endTime) {
      const start = parse(startTime, "HH:mm", new Date());
      const end = parse(endTime, "HH:mm", new Date());
      return differenceInMinutes(end, start);
    }
    return null;
  };

  const timeSlots = generateTimeSlots();
  const length = calculateLength();

  /* ─── Fetch user & client on mount ───────────────────────── */
  useEffect(() => {
    const fetchClientAndUser = async () => {
      const session = await getSession();
      const email = session?.user?.email;
      if (!email) return;

      const id = await fetchUserId(email);
      if (id === null) return;
      setUserId(id);

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/clients/client/${encodeURIComponent(
            clientId
          )}?email=${encodeURIComponent(email)}`
        );
        if (!res.ok) return;
        const data = await res.json();
        setClient({ first_name: data.first_name, last_name: data.last_name });
      } catch (err) {
        console.error("Error fetching client:", err);
      }
    };

    if (clientId) fetchClientAndUser();
  }, [clientId]);

  /* ─── Fetch existing appointments for chosen date ────────── */
  useEffect(() => {
    const fetchAppointmentsForDate = async () => {
      if (!userId || !date) return;
      const formatted = format(new Date(date), "yyyy-MM-dd");

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/appointments/user/${encodeURIComponent(
            userId
          )}/date/${encodeURIComponent(formatted)}`
        );
        const data = await res.json();
        setExistingAppointments(data);
      } catch (err) {
        console.error("Error fetching appointments for date:", err);
      }
    };

    fetchAppointmentsForDate();
  }, [userId, date]);

  /* ─── Book appointment ───────────────────────────────────── */
  const handleBookAppointment = async () => {
    if (
      !clientId ||
      !userId ||
      !date ||
      !startTime ||
      !endTime ||
      !appointmentType
    ) {
      alert("Please fill out all required fields.");
      return;
    }

    const formattedDate = format(new Date(date), "yyyy-MM-dd");
    const appointmentData = {
      client_id: parseInt(clientId),
      user_id: userId,
      date: formattedDate,
      start_time: startTime,
      end_time: endTime,
      length: length ?? 0,
      type: appointmentType,
      notes,
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/appointments/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(appointmentData),
        }
      );
      const result = await res.json();

      if (!res.ok) {
        setErrorMessage(result.error || "Failed to create appointment");
        return;
      }

      router.push("/appointments"); // Success → My Appointments
    } catch (err) {
      console.error("Booking error:", err);
      setErrorMessage("There was an error booking the appointment.");
    }
  };

  /* ─── Early guard: no date from Step 1 ───────────────────── */
  if (!date) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        <p>Error: No date selected. Please go back and choose a date.</p>
      </div>
    );
  }

  const selectedDate = format(new Date(date), "MMMM dd, yyyy");

  /* ─── UI ─────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#9dc7d4] via-white to-[#9dc7d4]">
      <Navbar />

      {/* Container */}
      <div className="max-w-6xl mx-auto mt-10 p-6 bg-white rounded-xl shadow text-[#4e6472] grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* LEFT: time inputs / grid */}
        <div>
          <h1 className="text-3xl font-bold text-center mb-4">
            Enter Appointment Time
          </h1>
          <p className="text-center mb-6 text-lg">
            Selected Date: <span className="font-semibold">{selectedDate}</span>
          </p>

          {/* Time selects */}
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex-1">
              <label className="block font-medium mb-2">Start Time</label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="">-- Select Start Time --</option>
                {timeSlots.map((slot) => (
                  <option key={slot.value} value={slot.value}>
                    {slot.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block font-medium mb-2">End Time</label>
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="">-- Select End Time --</option>
                {timeSlots
                  .filter((slot) => !startTime || slot.value > startTime) // only later times
                  .map((slot) => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Length display */}
          <div className="mb-4 text-center">
            {length !== null && length >= 0 ? (
              <p className="text-lg">
                Appointment Length: <strong>{length} minutes</strong>
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                Please enter both start and end times to calculate duration.
              </p>
            )}
          </div>

          {/* Legend */}
          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#327b8c] rounded-sm"></div>
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-300 rounded-sm"></div>
              <span>Booked</span>
            </div>
          </div>

          {/* Timeline grid */}
          <div className="border rounded-lg p-4 max-h-[400px] overflow-y-auto bg-[#f9f9f9]">
            <div className="grid grid-cols-4 gap-2 text-sm font-medium mb-2 text-[#4e6472]">
              <span>Time</span>
              <span className="col-span-3">Slot</span>
            </div>

            {timeSlots.map((slot) => {
              /* Flag: slot falls within user‑selected range */
              const isInRange =
                startTime &&
                endTime &&
                slot.value >= startTime &&
                slot.value < endTime;

              /* Flag: slot overlaps with existing appointments */
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
                    isInRange
                      ? "bg-[#327b8c] text-white"
                      : isBooked
                        ? "bg-red-300 text-white"
                        : "hover:bg-gray-100 text-[#4e6472]"
                  }`}
                >
                  <span>{slot.value}</span>
                  <span className="col-span-3 border-b border-gray-200" />
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: client & summary */}
        <div className="space-y-6">
          {/* Client section */}
          <div className="bg-[#f1f7f9] p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Client</h2>
            {client ? (
              <p>
                {client.first_name} {client.last_name}
              </p>
            ) : (
              <p className="text-gray-500">Loading client...</p>
            )}
          </div>

          {/* Type selector */}
          <div className="bg-[#f1f7f9] p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">
              Select Appointment Type
            </h2>
            <select
              value={appointmentType}
              onChange={(e) =>
                setAppointmentType(e.target.value as typeof appointmentType)
              }
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">-- Select Type --</option>
              <option value="new patient">New Patient</option>
              <option value="scale">Scale</option>
              <option value="recall">Recall</option>
            </select>
          </div>

          {/* Summary */}
          <div className="bg-[#f1f7f9] p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Appointment Summary</h2>
            <ul className="text-sm space-y-1">
              <li>
                <strong>First Name:</strong> {client?.first_name || "N/A"}
              </li>
              <li>
                <strong>Last Name:</strong> {client?.last_name || "N/A"}
              </li>
              <li>
                <strong>Date:</strong> {selectedDate}
              </li>
              <li>
                <strong>Start:</strong> {startTime || "N/A"}
              </li>
              <li>
                <strong>End:</strong> {endTime || "N/A"}
              </li>
              <li>
                <strong>Length:</strong>{" "}
                {length !== null ? `${length} minutes` : "N/A"}
              </li>
              <li>
                <strong>Type:</strong> {appointmentType || "N/A"}
              </li>
            </ul>

            {/* Notes */}
            <div className="mt-3">
              <label className="block font-medium mb-1">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                rows={4}
                placeholder="Write notes about this appointment..."
              />
            </div>
          </div>
        </div>

        {/* Error banner */}
        {errorMessage && (
          <div className="col-span-2 text-center text-red-600 font-medium">
            {errorMessage}
          </div>
        )}

        {/* Book button */}
        <button
          onClick={handleBookAppointment}
          className="bg-[#327b8c] text-white px-6 py-3 rounded-lg hover:bg-[#285f6e]"
        >
          Book Appointment
        </button>
      </div>
    </div>
  );
}
