import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/authOptions";
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

export default async function ClientDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const clientId = (await params).id;

  // Fetch authenticated session
  const session = await getServerSession(authOptions);

  // Restrict access if user is not authenticated
  if (!session) {
    return (
      <div className="text-center mt-20 text-red-500 text-xl">
        Access Denied. You must be logged in to view this page.
      </div>
    );
  }

  let client: Client | null = null;

  try {
    // Ensure user email is available before making API request
    if (!session.user?.email) {
      throw new Error("User email is not available.");
    }

    // Fetch the specific client by ID, scoped to the logged-in user
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/clients/client/${encodeURIComponent(clientId)}?email=${encodeURIComponent(session.user.email)}`,
      { cache: "no-store" }
    );

    if (res.ok) {
      client = await res.json();
    }
  } catch {
    // Errors are silently handled by showing fallback UI
  }

  // Show error if client is not found or not accessible
  if (!client) {
    return (
      <div className="text-center mt-20 text-red-500 text-xl">
        Client not found or you do not have access to this client.
      </div>
    );
  }

  // Render client details page
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#9dc7d4] via-white to-[#9dc7d4]">
      <Navbar />
      <ClientDetails client={client} />
    </div>
  );
}
