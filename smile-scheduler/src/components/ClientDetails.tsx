"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface Client {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  created_at: string;
  notes?: string;
}

export default function ClientDetails({ client }: { client: Client }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Client>(client);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/clients/client/${encodeURIComponent(client.id)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      }
    );

    if (res.ok) {
      setIsEditing(false);
    } else {
      alert("Failed to update client.");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this client?")) return;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/clients/client/${encodeURIComponent(client.id)}`,
      {
        method: "DELETE",
      }
    );

    if (res.ok) {
      window.location.href = "/clients";
    } else {
      alert("Failed to delete client.");
    }
  };

  const handleCancel = () => {
    setFormData(client);
    setIsEditing(false);
  };

  return (
    <div className="max-w-3xl mx-auto mt-16 bg-white p-10 rounded-2xl shadow-lg text-[#4e6472] space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#327b8c]">
          {isEditing
            ? "Editing Client"
            : `${formData.first_name} ${formData.last_name}`}
        </h1>

        <div className="space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow transition"
              >
                💾 Save
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg shadow transition"
              >
                ❌ Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow transition"
              >
                🗑️ Delete
              </button>
            </>
          ) : (
            <button
              className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg shadow transition"
              onClick={() => setIsEditing(true)}
            >
              ✏️ Edit
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="edit"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-lg font-medium text-[#327b8c]">
                  First Name
                </label>
                <input
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-[#327b8c]"
                />
              </div>
              <div>
                <label className="block text-lg font-medium text-[#327b8c]">
                  Last Name
                </label>
                <input
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-[#327b8c]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-lg font-medium">📧 Email</label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="text-xl w-full bg-gray-100 p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-lg font-medium">📞 Phone</label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="text-xl w-full bg-gray-100 p-2 rounded"
                />
              </div>
            </div>

            <div>
              <label className="block text-lg font-medium">📝 Notes</label>
              <textarea
                name="notes"
                value={formData.notes || ""}
                onChange={handleChange}
                className="w-full bg-gray-100 p-4 rounded-xl min-h-[80px] text-lg"
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-lg font-medium">📧 Email</p>
                <p className="text-xl">{formData.email}</p>
              </div>
              <div>
                <p className="text-lg font-medium">📞 Phone</p>
                <p className="text-xl">{formData.phone}</p>
              </div>
              <div>
                <p className="text-lg font-medium">🗓️ Created At</p>
                <p className="text-xl">
                  {new Intl.DateTimeFormat("en-CA").format(
                    new Date(formData.created_at)
                  )}
                </p>
              </div>
            </div>

            <div>
              <p className="text-2xl font-semibold mb-2">📝 Notes</p>
              <div className="bg-gray-100 p-4 rounded-xl min-h-[80px] text-lg">
                {formData.notes || (
                  <span className="italic text-gray-500">
                    No notes available.
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-end gap-4 pt-4">
        <Link href="/clients">
          <button className="bg-gray-300 hover:bg-gray-400 text-[#4e6472] px-6 py-3 rounded-xl shadow transition">
            ← Back
          </button>
        </Link>
        {!isEditing && (
          <Link href={`/appointments/create/${client.id}/step1`}>
            <button className="bg-[#327b8c] hover:bg-[#285d69] text-white px-6 py-3 rounded-xl shadow transition">
              📅 Book Appointment
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}
