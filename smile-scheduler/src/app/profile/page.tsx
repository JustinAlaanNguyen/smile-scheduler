"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
  email_notifications_enabled: boolean;
}

export default function MyProfilePage() {
  const { data: session } = useSession();

  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");

  useEffect(() => {
    if (!session?.user?.email) return;

    fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/by-email/${encodeURIComponent(
        session.user.email
      )}`
    )
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        setUsername(data.username);
        setEmail(data.email);
        setNotificationsEnabled(data.email_notifications_enabled);
      });
  }, [session]);

  const handleToggleNotifications = async () => {
    if (!user) return;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/toggle-notifications/${user.id}`,
      { method: "PUT" }
    );

    if (res.ok) {
      const data = await res.json();
      setNotificationsEnabled(data.email_notifications_enabled);
    }
  };

  const handleUpdate = async () => {
    if (!user) return;

    setLoading(true);
    console.log("Starting profile update");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/update/${user.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }),
        }
      );

      let responseBody = {} as { error?: string; message?: string };
      try {
        responseBody = await res.json(); // may hang if backend returns no body
      } catch (e) {
        console.warn("Failed to parse JSON from update response", e);
      }

      console.log("Update response status:", res.status, responseBody);

      if (!res.ok) throw new Error(responseBody?.error || "Update failed");

      console.log("Fetching updated user data");

      const refreshed = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${user.id}`
      );

      const updatedUser = await refreshed.json();

      setUser(updatedUser);
      setUsername(updatedUser.username);
      setEmail(updatedUser.email);
      setNotificationsEnabled(updatedUser.email_notifications_enabled);

      setPassword("");
      setEditMode(false);
      setConfirmationMessage("✅ Profile updated successfully.");

      setTimeout(() => setConfirmationMessage(""), 3000);
    } catch (err) {
      console.error("Update error caught in frontend:", err);
      alert("Failed to update profile: " + err);
    } finally {
      setLoading(false);
      console.log("Update process ended");
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    if (!window.confirm("Delete your account permanently?")) return;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/delete/${user.id}`,
      { method: "DELETE" }
    );

    if (res.ok) {
      alert("Account deleted. Logging out...");
      signOut({ callbackUrl: "/" });
    } else {
      alert("Failed to delete account.");
    }
  };

  const resetForm = () => {
    if (!user) return;
    setUsername(user.username);
    setEmail(user.email);
    setPassword("");
    setEditMode(false);
    setConfirmationMessage("");
  };

  if (!user) return <div className="p-8">Loading profile...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-white to-indigo-100">
      <Navbar />
      <main className="max-w-3xl mx-auto mt-12 p-8 bg-white rounded-3xl shadow-2xl">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">
          My Profile
        </h1>

        <AnimatePresence>
          {confirmationMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 rounded bg-green-100 border border-green-400 text-green-800"
            >
              {confirmationMessage}
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-sm text-center text-gray-500 mb-6">
          Created: {new Date(user.created_at).toLocaleDateString()}
        </p>

        <div className="space-y-5 text-black">
          <InputField
            label="Username"
            value={username}
            readOnly={!editMode}
            onChange={setUsername}
          />
          <InputField
            label="Email"
            value={email}
            readOnly={!editMode}
            onChange={setEmail}
          />
          {editMode && (
            <InputField
              label="New Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={setPassword}
              placeholder="Leave blank to keep current password"
              rightAction={() => setShowPassword(!showPassword)}
              rightText={showPassword ? "Hide" : "Show"}
            />
          )}
          <p className="text-sm text-gray-600">
            Role: <strong>{user.role}</strong>
          </p>

          <div className="text-center">
            <p className="mb-2 text-black">
              Notifications:{" "}
              <strong>
                {notificationsEnabled ? "Enabled ✅" : "Disabled ❌"}
              </strong>
            </p>
            <button
              onClick={handleToggleNotifications}
              className="transition bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded shadow"
            >
              {notificationsEnabled ? "Disable" : "Enable"} Notifications
            </button>
          </div>

          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
              Edit Profile
            </button>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={handleUpdate}
                disabled={loading}
                className={`${
                  loading ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"
                } text-white py-2 rounded`}
              >
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                onClick={resetForm}
                disabled={loading}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="bg-red-500 hover:bg-red-600 text-white py-2 rounded"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded shadow"
          >
            Sign Out
          </button>
        </div>
      </main>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  readOnly = false,
  type = "text",
  placeholder,
  rightAction,
  rightText,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  readOnly?: boolean;
  type?: string;
  placeholder?: string;
  rightAction?: () => void;
  rightText?: string;
}) {
  return (
    <label className="block">
      <span className="text-gray-700 font-medium">{label}</span>
      <div className="relative mt-1">
        <input
          type={type}
          className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
            readOnly ? "bg-gray-100 text-gray-500" : ""
          }`}
          value={value}
          readOnly={readOnly}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
        {rightAction && (
          <button
            type="button"
            onClick={rightAction}
            className="absolute top-1/2 right-3 transform -translate-y-1/2 text-sm text-gray-500"
          >
            {rightText}
          </button>
        )}
      </div>
    </label>
  );
}
