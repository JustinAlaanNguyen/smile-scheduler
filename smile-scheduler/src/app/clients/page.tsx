"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface Client {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  notes: string;
  created_at: string;
  user_id: number;
}

export default function ClientsPage() {
  const { data: session, status } = useSession();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchClients = async () => {
      if (status !== "authenticated" || !session?.user?.email) return;

      try {
        const encodedEmail = encodeURIComponent(session.user.email);
        // Step 1: Get user ID by email
        const userRes = await fetch(
          `http://localhost:3001/api/users/id/${encodedEmail}`
        );
        if (!userRes.ok) throw new Error("Failed to fetch user ID");
        const { id: userId } = await userRes.json();

        // Step 2: Get all clients by user ID
        const clientsRes = await fetch(
          `http://localhost:3001/api/clients/user/${userId}`
        );
        if (!clientsRes.ok) throw new Error("Failed to fetch clients");

        const clientsData = await clientsRes.json();
        setClients(clientsData);
      } catch (err: unknown) {
        let message = "Unexpected error";

        if (err instanceof Error) {
          message = err.message;
        }

        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [session, status]);

  if (loading) return <div>Loading clients...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Your Clients</h1>
      {clients.length === 0 ? (
        <p>No clients found.</p>
      ) : (
        <ul className="space-y-2">
          {clients.map((client) => (
            <li key={client.id} className="border p-4 rounded shadow-sm">
              <p>
                <strong>Name:</strong> {client.first_name} {client.last_name}
              </p>
              <p>
                <strong>Email:</strong> {client.email}
              </p>
              <p>
                <strong>Phone:</strong> {client.phone}
              </p>
              {client.notes && (
                <p>
                  <strong>Notes:</strong> {client.notes}
                </p>
              )}
              <p>
                <strong>Created:</strong>{" "}
                {new Date(client.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
