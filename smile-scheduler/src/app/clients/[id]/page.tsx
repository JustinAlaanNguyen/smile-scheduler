//clients/[id]/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Navbar from "@/components/Navbar";
import Link from "next/link";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function ClientDetailsPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="text-center mt-20 text-red-500 text-xl">
        Access Denied. You must be logged in to view this page.
      </div>
    );
  }

  const clientId = params.id;

  let client = null;

  try {
    const res = await fetch(
      `http://localhost:3001/api/clients/client/${clientId}?email=${session.user?.email}`,
      { cache: "no-store" }
    );

    if (res.ok) {
      client = await res.json();
    } else {
      console.error("Failed to fetch client details. Status:", res.status);
    }
  } catch (error) {
    console.error("Error fetching client details:", error);
  }

  if (!client) {
    return (
      <div className="text-center mt-20 text-red-500 text-xl">
        Client not found or you do not have access to this client.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#9dc7d4] via-white to-[#9dc7d4]">
      <Navbar />
      <div className="max-w-2xl mx-auto mt-20 bg-white p-10 rounded-xl shadow text-[#4e6472]">
        <h1 className="text-4xl font-bold mb-6">
          {client.first_name} {client.last_name}
        </h1>
        <p className="text-xl mb-2">Email: {client.email}</p>
        <p className="text-xl mb-2">Phone: {client.phone}</p>
        <p className="text-xl mb-2">Date created: {client.created_at}</p>
        <hr />
        <h1 className="text-2xl font-bold mb-5">Notes:</h1>
        <p className="text-xl">{client.notes}</p>
      </div>
      <div className="max-w-2xl mx-auto flex justify-end mt-8">
        <Link href={`/appointments/create/${clientId}/step1`}>
          <button className="bg-[#327b8c] hover:bg-[#285d69] text-white px-6 py-3 rounded-xl shadow transition">
            Book Appointment
          </button>
        </Link>
      </div>
    </div>
  );
}
