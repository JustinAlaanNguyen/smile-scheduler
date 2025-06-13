"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";

export default function AddClientPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchUserId = async () => {
      const res = await fetch("/api/auth/session");
      const session = await res.json();
      if (session?.user?.email) {
        const userRes = await fetch(
          `http://localhost:3001/api/users/id/${session.user.email}`
        );
        const userData = await userRes.json();
        setUserId(userData.id);
      }
    };
    fetchUserId();
  }, []);

  const allFieldsFilled = firstName && lastName && email && phone && notes;

  const submitClientToDatabase = async () => {
    if (!userId) {
      alert("User ID not loaded yet.");
      return;
    }

    const res = await fetch("http://localhost:3001/api/clients/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        notes,
        user_id: userId,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const clientId = data.clientId;
      router.push(`/clients/${clientId}`);
    } else {
      alert("Failed to add client");
    }
  };

  const handleCancel = () => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel creating this client?"
    );
    if (confirmCancel) {
      router.push("/clients");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#9dc7d4] via-white to-[#9dc7d4]">
      <Navbar />

      {/* Animate form container */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto mt-20 bg-white p-8 rounded-xl shadow space-y-6"
      >
        <h1 className="text-3xl font-bold text-center text-[#4e6472]">
          Add a New Client
        </h1>

        <input
          className="w-full p-3 border rounded-md text-gray-800"
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          className="w-full p-3 border rounded-md text-gray-800"
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <input
          className="w-full p-3 border rounded-md text-gray-800"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full p-3 border rounded-md text-gray-800"
          type="tel"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <textarea
          className="w-full p-3 border rounded-md text-gray-800"
          placeholder="Notes about the client"
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="flex justify-between">
          <button
            onClick={() => setShowModal(true)}
            disabled={!allFieldsFilled}
            className={`px-6 py-3 rounded-md text-white ${
              allFieldsFilled
                ? "bg-[#327b8c] hover:bg-[#285d69]"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Finish
          </button>
          <button
            onClick={handleCancel}
            className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-md"
          >
            Cancel
          </button>
        </div>
      </motion.div>

      {/* Animate modal with AnimatePresence */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-8 rounded-lg max-w-md w-full shadow-lg space-y-4"
            >
              <h2 className="text-xl font-semibold text-gray-700">
                Confirm Client Details
              </h2>
              <p className="text-gray-700">
                <strong>First Name:</strong> {firstName}
              </p>
              <p className="text-gray-700">
                <strong>Last Name:</strong> {lastName}
              </p>
              <p className="text-gray-700">
                <strong>Email:</strong> {email}
              </p>
              <p className="text-gray-700">
                <strong>Phone:</strong> {phone}
              </p>
              <p className="text-gray-700">
                <strong>Notes:</strong> {notes}
              </p>
              <div className="mt-4">
                <p className="text-center mb-4 font-medium text-gray-700">
                  Are the client details correct?
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={submitClientToDatabase}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                  >
                    Yes, add this client
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                  >
                    No, continue to edit
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
