import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
//for floating tooth:
// import Image from "next/image";
import { Smile, CalendarCheck, Bell } from "lucide-react";
import Navbar from "@/components/Navbar";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="text-center mt-20 text-red-500 text-xl">
        Access Denied. You must be logged in to view this page.
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#9dc7d4] via-white to-[#9dc7d4]">
      {/* Navigation Bar */}
      <Navbar />

      {/* Welcome Message */}
      <div className="text-center mt-10 mb-8 text-[#4e6472]">
        <h1 className="text-5xl font-bold">Welcome, {session.user?.name}!</h1>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 px-10 pb-20 text-[#4e6472] text-lg">
        {/* Left Section */}
        <div className="bg-white p-8 rounded-2xl shadow-xl backdrop-blur-sm">
          <h2 className="text-4xl font-bold mb-6">
            Welcome to your Smile Scheduler!
          </h2>
          <p className="mb-6 text-2xl">
            🦷 Get started with managing your clientele!
          </p>
          <ol className="list-decimal list-inside space-y-5 text-xl">
            <li>
              <strong>Step 1:</strong> Start by creating a client profile. You
              can create, edit, or delete any client any time you want!
            </li>
            <li>
              <strong>Step 2:</strong> Create an appointment date for a client.
              This will allow you to keep track of upcoming appointments for
              your busy schedule!
            </li>
            <li>
              <strong>Step 3:</strong> Enable email notifications so you never
              miss a scheduled appointment!
            </li>
          </ol>
        </div>

        {/* Right Section */}
        <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col gap-8">
          <div>
            <Link
              href="/clients"
              className="text-2xl font-semibold text-[#327b8c] hover:underline flex items-center gap-2 hover:ring-2 hover:ring-[#9dc7d4] rounded px-2 py-1 transition-all"
            >
              <Smile className="w-6 h-6 text-[#4e6c71]" /> Clients
            </Link>

            <p className="text-lg mt-2 text-[#4e6c71]">
              🪥 Create, edit, or delete client profiles.
            </p>
          </div>
          <div>
            <Link
              href="#"
              className="text-2xl font-semibold text-[#327b8c] hover:underline flex items-center gap-2 hover:ring-2 hover:ring-[#9dc7d4] rounded px-2 py-1 transition-all"
            >
              <CalendarCheck className="w-6 h-6 text-[#4e6c71]" /> Appointments
            </Link>
            <p className="text-lg mt-2 text-[#4e6c71]">
              📅 Create, edit, or delete appointments.
            </p>
          </div>
          <div>
            <Link
              href="#"
              className="text-2xl font-semibold text-[#327b8c] hover:underline flex items-center gap-2 hover:ring-2 hover:ring-[#9dc7d4] rounded px-2 py-1 transition-all"
            >
              <Bell className="w-6 h-6 text-[#4e6c71]" /> Enable Email
              Notifications
            </Link>
            <p className="text-lg mt-2 text-[#4e6c71]">
              📧 Get notified about upcoming appointments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
