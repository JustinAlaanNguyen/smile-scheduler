"use client";

import { useSearchParams, useParams } from "next/navigation";
import { getSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import { format, differenceInMinutes, parse } from "date-fns";
import { useEffect, useState } from "react";

export default function AppointmentStep2() {
  const { clientId } = useParams() as { clientId: string };
  const searchParams = useSearchParams();
  const date = searchParams?.get("date");

  const [userId, setUserId] = useState<number | null>(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [client, setClient] = useState<{
    first_name: string;
    last_name: string;
  } | null>(null);
  const [appointmentType, setAppointmentType] = useState<
    "new patient" | "scale" | "recall" | ""
  >("");
  const [notes, setNotes] = useState("");

  const fetchUserId = async (email: string): Promise<number | null> => {
    try {
      const res = await fetch(`http://localhost:3001/api/users/id/${email}`);
      if (!res.ok) throw new Error("Failed to fetch user id");
      const data = await res.json();
      return data.id; // <-- Change here from user_id to id
    } catch (error) {
      console.error("Error fetching user ID:", error);
      return null;
    }
  };

  const fetchClientAndUser = async () => {
    const session = await getSession();
    const email = session?.user?.email;

    if (!email) {
      console.error("No session email found.");
      return;
    }

    const id = await fetchUserId(email);
    if (id === null) {
      console.error("User ID not fetched.");
      return;
    }
    setUserId(id);

    try {
      const res = await fetch(
        `http://localhost:3001/api/clients/client/${clientId}?email=${email}`
      );
      if (!res.ok) {
        console.error("Failed to fetch client details", res.status);
        return;
      }
      const data = await res.json();
      setClient({ first_name: data.first_name, last_name: data.last_name });
    } catch (err) {
      console.error("Error fetching client:", err);
    }
  };

  useEffect(() => {
    if (clientId) fetchClientAndUser();
  }, [clientId]);

  const handleBookAppointment = async () => {
    console.log(clientId, userId, date, startTime, endTime, appointmentType);
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

    const appointmentData = {
      client_id: clientId,
      user_id: userId,
      date,
      start_time: startTime,
      end_time: endTime,
      length: length ?? 0,
      type: appointmentType,
      notes,
    };

    try {
      const res = await fetch("http://localhost:3001/api/appointments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointmentData),
      });

      const result = await res.json();

      if (!res.ok)
        throw new Error(result.error || "Failed to create appointment");

      alert("Appointment booked successfully!");
    } catch (err) {
      console.error("Booking error:", err);
      alert("There was an error booking the appointment.");
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let h = 8; h <= 20; h++) {
      for (let m = 0; m < 60; m += 15) {
        const hour = h.toString().padStart(2, "0");
        const minute = m.toString().padStart(2, "0");
        slots.push(`${hour}:${minute}`);
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

  if (!date) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        <p>Error: No date selected. Please go back and choose a date.</p>
      </div>
    );
  }

  const selectedDate = format(new Date(date), "MMMM dd, yyyy");

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#9dc7d4] via-white to-[#9dc7d4]">
      <Navbar />
      <div className="max-w-6xl mx-auto mt-10 p-6 bg-white rounded-xl shadow text-[#4e6472] grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* LEFT COLUMN */}
        <div>
          <h1 className="text-3xl font-bold text-center mb-4">
            Enter Appointment Time
          </h1>
          <p className="text-center mb-6 text-lg">
            Selected Date: <span className="font-semibold">{selectedDate}</span>
          </p>

          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex-1">
              <label className="block font-medium mb-2">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="flex-1">
              <label className="block font-medium mb-2">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>

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

          <div className="border rounded-lg p-4 max-h-[400px] overflow-y-auto bg-[#f9f9f9]">
            <div className="grid grid-cols-4 gap-2 text-sm font-medium mb-2 text-[#4e6472]">
              <span>Time</span>
              <span className="col-span-3">Slot</span>
            </div>
            {timeSlots.map((slot) => {
              const isInRange =
                startTime && endTime && slot >= startTime && slot < endTime;

              return (
                <div
                  key={slot}
                  className={`grid grid-cols-4 gap-2 py-1 px-2 rounded ${
                    isInRange
                      ? "bg-[#327b8c] text-white"
                      : "hover:bg-gray-100 text-[#4e6472]"
                  }`}
                >
                  <span>{slot}</span>
                  <span className="col-span-3 border-b border-gray-200"></span>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* Client Info */}
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

          {/* Appointment Type */}
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
