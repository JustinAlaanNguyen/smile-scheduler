"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
//import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Plus, Search } from "lucide-react";
import debounce from "lodash.debounce";

type Client = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
};

export default function ClientsPage() {
  const { data: session, status } = useSession();
  const [clients, setClients] = useState<Client[]>([]);
  const [query, setQuery] = useState("");
  const [userId, setUserId] = useState("");
  //const router = useRouter();

  // Fetch user ID on load
  useEffect(() => {
    if (session?.user?.email) {
      fetch(`http://localhost:3001/api/users/id/${session.user.email}`)
        .then((res) => res.json())
        .then((data) => setUserId(data.id))
        .catch(console.error);
    }
  }, [session]);

  // Debounced fetch
  const fetchClients = useCallback(
    debounce((searchTerm: string) => {
      if (!userId) return;

      const endpoint = searchTerm
        ? `http://localhost:3001/api/clients/search?userId=${userId}&q=${searchTerm}`
        : `http://localhost:3001/api/clients/user/${userId}`;

      fetch(endpoint)
        .then((res) => res.json())
        .then((data) => setClients(data))
        .catch(console.error);
    }, 500),
    [userId]
  );

  // Trigger search when query changes
  useEffect(() => {
    fetchClients(query);
  }, [query, fetchClients]);

  if (status === "loading") {
    return <div className="text-center mt-20 text-xl">Loading...</div>;
  }

  if (!session) {
    return (
      <div className="text-center mt-20 text-red-500 text-xl">
        Access Denied. You must be logged in to view this page.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#9dc7d4] via-white to-[#9dc7d4]">
      <Navbar />

      <div className="flex flex-col items-center justify-center mt-16 mb-12 px-6 text-center">
        <h1 className="text-6xl font-bold text-[#4e6472] mb-10">My Clients</h1>

        <div className="flex flex-col sm:flex-row items-center gap-6 w-full max-w-2xl">
          <div className="flex items-center bg-white rounded-full shadow-lg px-6 py-4 w-full">
            <input
              type="text"
              placeholder="Search clients..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-grow outline-none text-[#4e6472] text-xl bg-transparent placeholder:text-[#9aaab2]"
            />
            <button className="ml-3 text-[#4e6472] hover:text-[#327b8c] transition-all">
              <Search className="w-7 h-7" />
            </button>
          </div>

          <Link href="/clients/add">
            <button className="bg-[#327b8c] hover:bg-[#285d69] text-white p-4 rounded-full shadow-lg transition-all">
              <Plus className="w-7 h-7" />
            </button>
          </Link>
        </div>
      </div>

      <div className="px-6 pb-20 text-center">
        {clients.length > 0 ? (
          <ul className="space-y-6 max-w-2xl mx-auto">
            {clients.map((client) => (
              <Link key={client.id} href={`/clients/${client.id}`}>
                <li className="bg-white p-6 rounded-xl shadow text-left text-[#4e6472] text-xl cursor-pointer hover:bg-gray-100 transition">
                  <div className="font-bold text-2xl">
                    {client.first_name} {client.last_name}
                  </div>
                  <div>Email: {client.email}</div>
                  <div>Phone: {client.phone}</div>
                </li>
              </Link>
            ))}
          </ul>
        ) : (
          <p className="text-xl text-gray-700 max-w-xl mx-auto">
            No matching clients found.
          </p>
        )}
      </div>
    </div>
  );
}
