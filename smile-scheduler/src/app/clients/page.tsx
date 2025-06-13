"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { AnimatePresence, motion } from "framer-motion";

interface Client {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  created_at: string;
  notes?: string;
}

export default function ClientsPage() {
  const { data: session, status } = useSession();
  const [clients, setClients] = useState<Client[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const delay = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  useEffect(() => {
    const fetchUserId = async () => {
      if (!session?.user?.email) return;

      try {
        const res = await fetch(
          `http://127.0.0.1:3001/api/users/id/${encodeURIComponent(
            session.user.email
          )}`
        );
        if (!res.ok) throw new Error("Failed to fetch user ID");
        const { id } = await res.json();
        setUserId(id);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
      }
    };

    fetchUserId();
  }, [session]);

  useEffect(() => {
    const fetchClients = async () => {
      if (!userId) return;
      setLoading(true);

      try {
        const url = debouncedQuery
          ? `http://127.0.0.1:3001/api/clients/user/${userId}/search?query=${encodeURIComponent(
              debouncedQuery
            )}`
          : `http://127.0.0.1:3001/api/clients/user/${userId}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch clients");
        const data = await res.json();
        setClients(data);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [userId, debouncedQuery]);

  if (status === "loading" || loading) {
    return (
      <div className="text-center mt-20 text-lg text-[#4e6472]">Loading...</div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="text-center mt-20 text-red-500 text-xl">
        Access Denied. You must be logged in to view this page.
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-20 text-red-500 text-xl">{error}</div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-[#9dc7d4] via-white to-[#9dc7d4]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Navbar />
      <h1 className="text-4xl font-bold text-center text-[#4e6472] mb-6 mt-4">
        🦷 My Clients
      </h1>

      <div className="max-w-3xl mx-auto mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-12 py-3 rounded-full border border-gray-300 shadow-md focus:outline-none focus:ring-4 focus:ring-[#327b8c]/40 text-lg text-[#4e6472] placeholder-[#7a9ca9] bg-white transition-all"
          />
          <div className="absolute left-5 top-1/2 transform -translate-y-1/2 text-[#327b8c]">
            🔍
          </div>
        </div>

        <Link href="/clients/add">
          <button className="bg-[#327b8c] hover:bg-[#285d69] text-white px-6 py-3 rounded-full shadow-md transition duration-200">
            ➕ Add New Client
          </button>
        </Link>
      </div>

      {clients && clients.length === 0 ? (
        <p className="text-center text-xl text-[#4e6472]">No clients found.</p>
      ) : (
        <motion.div
          className="grid gap-6 max-w-3xl mx-auto px-4"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          <AnimatePresence>
            {clients?.map((client) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Link
                  href={`/clients/${client.id}`}
                  className="block bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition duration-200"
                >
                  <h2 className="text-2xl font-semibold text-[#327b8c]">
                    {client.first_name} {client.last_name}
                  </h2>
                  <p className="text-[#4e6472]">📧 {client.email}</p>
                  <p className="text-[#4e6472]">📱 {client.phone}</p>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <div className="text-center mt-10">
        <Link href="/dashboard" className="text-[#327b8c] hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
    </motion.div>
  );
}
