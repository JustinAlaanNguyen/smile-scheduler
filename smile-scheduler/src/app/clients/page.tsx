//clients/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Navbar from "@/components/Navbar";
import { Plus, Search } from "lucide-react";

export default async function ClientsPage() {
  type Client = {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };

  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="text-center mt-20 text-red-500 text-xl">
        Access Denied. You must be logged in to view this page.
      </div>
    );
  }

  let userId = "";

  try {
    const res = await fetch(
      `http://localhost:3001/api/users/id/${session.user?.email}`,
      {
        cache: "no-store",
      }
    );

    if (res.ok) {
      const data = await res.json();
      userId = data.id;
    } else {
      console.error("Failed to fetch user ID by email");
    }
  } catch (error) {
    console.error("Error fetching user ID by email:", error);
  }

  let clients = [];

  try {
    const res = await fetch(`http://localhost:3001/api/clients/${userId}`, {
      cache: "no-store",
    });

    if (res.ok) {
      clients = await res.json();
    } else {
      console.error("Failed to fetch clients");
    }
  } catch (error) {
    console.error("Error fetching clients:", error);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#9dc7d4] via-white to-[#9dc7d4]">
      <Navbar />

      {/* Header Section */}
      <div className="flex flex-col items-center justify-center mt-16 mb-12 px-6 text-center">
        <h1 className="text-6xl font-bold text-[#4e6472] mb-10">My Clients</h1>

        {/* Search + Add Section */}
        <div className="flex flex-col sm:flex-row items-center gap-6 w-full max-w-2xl">
          {/* Search Bar */}
          <div className="flex items-center bg-white rounded-full shadow-lg px-6 py-4 w-full">
            <input
              type="text"
              placeholder="Search clients..."
              className="flex-grow outline-none text-[#4e6472] text-xl bg-transparent placeholder:text-[#9aaab2]"
            />
            <button className="ml-3 text-[#4e6472] hover:text-[#327b8c] transition-all">
              <Search className="w-7 h-7" />
            </button>
          </div>

          {/* Add Client Button */}
          <button className="bg-[#327b8c] hover:bg-[#285d69] text-white p-4 rounded-full shadow-lg transition-all">
            <Plus className="w-7 h-7" />
          </button>
        </div>
      </div>

      {/* Client List or Empty State */}
      <div className="px-6 pb-20 text-center">
        {clients.length > 0 ? (
          <ul className="space-y-4 max-w-3xl mx-auto">
            {clients.map((client: Client) => (
              <li
                key={client.id}
                className="bg-white p-6 rounded-xl shadow text-left text-[#4e6472] text-xl"
              >
                <div className="font-bold text-2xl">
                  {client.first_name} {client.last_name}
                </div>
                <div>Email: {client.email}</div>
                <div>Phone: {client.phone}</div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xl text-gray-700 max-w-xl mx-auto">
            You have not created any clients yet!
            <br />
            Get started by clicking the <strong>Add Client</strong> button.
          </p>
        )}
      </div>
    </div>
  );
}
