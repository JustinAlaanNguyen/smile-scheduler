"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getSession } from "next-auth/react";
import moment from "moment";
import Navbar from "@/components/Navbar";

type Appointment = {
  appointment_start: string;
  appointment_end: string;
};

const DayAppointments = () => {
  const params = useParams();
  const dateParam = params?.date;
  const date = Array.isArray(dateParam) ? dateParam[0] : dateParam;

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      const session = await getSession();
      const email = session?.user?.email;
      if (!email || !date) return;

      const resId = await fetch(`http://localhost:3001/api/users/id/${email}`);
      const dataId = await resId.json();

      const resAppointments = await fetch(
        `http://localhost:3001/api/appointments/user/${dataId.id}/date/${date}`
      );
      const dataAppointments = await resAppointments.json();
      setAppointments(dataAppointments);
      console.log("Appointments fetched:", dataAppointments);
      setLoading(false);
    };

    fetchAppointments();
  }, [date]);

  const hours = Array.from({ length: 15 }, (_, i) => 6 + i); // 6AM–8PM
  const formatHour = (h: number) => moment().hour(h).minute(0).format("h:00 A");

  const isHourBooked = (hour: number) => {
    return appointments.some((app) => {
      const start = moment(
        `${date} ${app.appointment_start}`,
        "YYYY-MM-DD HH:mm:ss"
      );
      const end = moment(
        `${date} ${app.appointment_end}`,
        "YYYY-MM-DD HH:mm:ss"
      );
      const block = moment(`${date} ${hour}:00`, "YYYY-MM-DD H:mm");

      const isBooked = block.isSameOrAfter(start) && block.isBefore(end);

      console.log(
        `Checking ${block.format("HH:mm")} against start=${start.format(
          "HH:mm"
        )} and end=${end.format("HH:mm")} → BOOKED=${isBooked}`
      );

      return isBooked;
    });
  };

  if (!date) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-red-600">Invalid date parameter.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#9dc7d4] via-white to-[#9dc7d4]">
      <Navbar />

      <h1 className="text-3xl text-center text-[#4e6472] font-bold my-6">
        Appointments for {moment(date).format("MMMM D, YYYY")}
      </h1>

      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow">
        {loading ? (
          <p className="text-center text-lg">Loading...</p>
        ) : (
          <div className="flex flex-col divide-y">
            {hours.map((hour) => {
              const isBooked = isHourBooked(hour);
              return (
                <div
                  key={hour}
                  className="flex items-center justify-between py-3 px-4"
                >
                  {/* Left: Time label */}
                  <div className="text-sm font-semibold text-gray-800 w-24">
                    {formatHour(hour)}
                  </div>

                  {/* Right: Booked or Free bar */}
                  <div
                    className={`flex-1 ml-4 h-8 rounded-lg shadow-inner ${
                      isBooked ? "bg-[#327b8c]" : "bg-gray-200"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="text-center mt-8">
        <a href="/appointments" className="text-[#327b8c] hover:underline">
          ← Back to Calendar
        </a>
      </div>
    </div>
  );
};

export default DayAppointments;
