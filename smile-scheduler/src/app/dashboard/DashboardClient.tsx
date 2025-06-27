"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Smile, CalendarCheck, Bell } from "lucide-react";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardClient() {
  const { data: session, status } = useSession();
  const loading = status === "loading";

  if (loading) {
    return (
      <div className="text-center mt-20 text-xl text-[#4e6472]">Loading...</div>
    );
  }

  if (!session) {
    return (
      <div className="text-center mt-20 text-red-500 text-xl">
        Access Denied. You must be logged in to view this page.
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#9dc7d4] via-white to-[#9dc7d4]">
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.div
          key="dashboard"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="px-4 sm:px-10 pt-10 pb-20"
        >
          <div className="text-center mb-8 text-[#4e6472]">
            <h1 className="text-5xl font-bold">
              Welcome, {session.user?.name}!
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-[#4e6472] text-lg">
            {/* Left Section */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="bg-white p-8 rounded-2xl shadow-xl backdrop-blur-sm"
            >
              <h2 className="text-4xl font-bold mb-6">
                Welcome to your Smile Scheduler!
              </h2>
              <p className="mb-6 text-2xl">
                🦷 Get started with managing your clientele!
              </p>
              <ol className="list-decimal list-inside space-y-5 text-xl">
                <li>
                  <strong>Step 1:</strong> Start by creating a client profile.
                </li>
                <li>
                  <strong>Step 2:</strong> Create appointment dates.
                </li>
                <li>
                  <strong>Step 3:</strong> Enable email notifications.
                </li>
              </ol>
            </motion.div>

            {/* Right Section */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="bg-white p-8 rounded-2xl shadow-xl flex flex-col gap-8"
            >
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
                  href="/appointments"
                  className="text-2xl font-semibold text-[#327b8c] hover:underline flex items-center gap-2 hover:ring-2 hover:ring-[#9dc7d4] rounded px-2 py-1 transition-all"
                >
                  <CalendarCheck className="w-6 h-6 text-[#4e6c71]" />{" "}
                  Appointments
                </Link>
                <p className="text-lg mt-2 text-[#4e6c71]">
                  📅 Manage your appointments.
                </p>
              </div>
              <div>
                <Link
                  href="/profile"
                  className="text-2xl font-semibold text-[#327b8c] hover:underline flex items-center gap-2 hover:ring-2 hover:ring-[#9dc7d4] rounded px-2 py-1 transition-all"
                >
                  <Bell className="w-6 h-6 text-[#4e6c71]" /> Enable Email
                  Notifications
                </Link>
                <p className="text-lg mt-2 text-[#4e6c71]">
                  📧 Get email reminders.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
