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
  const [errorMessage, setErrorMessage] = useState("");

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

  // Clear error after 5 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const allFieldsFilled = firstName && lastName && email && phone && notes;

  const submitClientToDatabase = async () => {
    if (!userId) {
      setErrorMessage("User ID not loaded.");
      return;
    }

    try {
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
        router.push(`/clients/${data.clientId}`);
      } else {
        const errorData = await res.json();
        setErrorMessage(errorData.error || "Failed to add client.");
        setShowModal(false); // Close modal on error
      }
    } catch (err) {
      console.error("Client creation error:", err);
      setErrorMessage("An unexpected error occurred.");
      setShowModal(false);
    }
  };

  const handleCancel = () => {
    if (confirm("Cancel adding this client?")) {
      router.push("/clients");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#9dc7d4] via-white to-[#9dc7d4]">
      <Navbar />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-xl mx-auto mt-20 bg-white p-8 rounded-2xl shadow-xl space-y-6"
      >
        <h1 className="text-4xl font-bold text-center text-[#4e6472]">
          Add New Client
        </h1>

        <div className="space-y-4">
          <input
            className="w-full p-3 border rounded-md text-gray-800 focus:ring-2 focus:ring-[#327b8c]"
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <input
            className="w-full p-3 border rounded-md text-gray-800 focus:ring-2 focus:ring-[#327b8c]"
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <input
            className={`w-full p-3 border rounded-md text-gray-800 focus:ring-2 ${
              errorMessage.toLowerCase().includes("email")
                ? "border-red-500 ring-red-300"
                : "focus:ring-[#327b8c]"
            }`}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrorMessage("");
            }}
          />
          <input
            className="w-full p-3 border rounded-md text-gray-800 focus:ring-2 focus:ring-[#327b8c]"
            type="tel"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <textarea
            className="w-full p-3 border rounded-md text-gray-800 focus:ring-2 focus:ring-[#327b8c]"
            rows={4}
            placeholder="Notes about the client"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          >
            <strong className="font-semibold">Error:</strong> {errorMessage}
          </motion.div>
        )}

        <div className="flex justify-between pt-4">
          <button
            onClick={() => setShowModal(true)}
            disabled={!allFieldsFilled}
            className={`px-6 py-3 rounded-md text-white transition-all duration-200 ${
              allFieldsFilled
                ? "bg-[#327b8c] hover:bg-[#285d69]"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Finish
          </button>
          <button
            onClick={handleCancel}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-md"
          >
            Cancel
          </button>
        </div>
      </motion.div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white max-w-md w-full p-6 rounded-lg shadow-lg space-y-4"
            >
              <h2 className="text-xl font-semibold text-gray-700">
                Confirm Client Details
              </h2>
              <ul className="text-gray-700 space-y-1">
                <li>
                  <strong>First Name:</strong> {firstName}
                </li>
                <li>
                  <strong>Last Name:</strong> {lastName}
                </li>
                <li>
                  <strong>Email:</strong> {email}
                </li>
                <li>
                  <strong>Phone:</strong> {phone}
                </li>
                <li>
                  <strong>Notes:</strong> {notes}
                </li>
              </ul>
              <div className="flex justify-center gap-4 pt-4">
                <button
                  onClick={submitClientToDatabase}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                >
                  Yes, add client
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                >
                  No, go back
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
