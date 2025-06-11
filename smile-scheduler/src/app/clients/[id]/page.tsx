import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Navbar from "@/components/Navbar";
import ClientDetails from "@/components/ClientDetails";

interface Client {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  created_at: string;
  notes?: string;
}

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
  let client: Client | null = null;

  try {
    const res = await fetch(
      `http://localhost:3001/api/clients/client/${clientId}?email=${session.user?.email}`,
      { cache: "no-store" }
    );

    if (res.ok) {
      client = await res.json();
    }
  } catch (error) {
    console.error("Error fetching client:", error);
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
      <ClientDetails client={client} />
    </div>
  );
}
