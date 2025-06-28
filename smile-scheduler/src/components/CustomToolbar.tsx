// components/CustomToolbar.tsx
"use client";

import { ToolbarProps } from "react-big-calendar";
import { AppointmentEvent } from "@/app/appointments/page";

export default function CustomToolbar({
  label,
  onNavigate,
}: ToolbarProps<AppointmentEvent, object>) {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="text-2xl font-semibold text-[#327b8c]">{label}</div>
      <div className="space-x-2">
        <button
          onClick={() => onNavigate("PREV")}
          className="px-3 py-1 bg-[#327b8c] text-white rounded-md hover:bg-[#285d69] transition"
        >
          Previous
        </button>
        <button
          onClick={() => onNavigate("NEXT")}
          className="px-3 py-1 bg-[#327b8c] text-white rounded-md hover:bg-[#285d69] transition"
        >
          Next
        </button>
      </div>
    </div>
  );
}
