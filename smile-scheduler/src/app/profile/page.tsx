"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

type User = {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
};

export default function MyProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      if (!session?.user?.email) return;
      const res = await fetch(
        `http://localhost:3001/api/users/${encodeURIComponent(
          session.user.email
        )}`
      );
      const data = await res.json();
      setUser(data);
      setUsername(data.username);
      setEmail(data.email);
    };

    fetchUser();
  }, [session]);

  const handleUpdate = async () => {
    if (!user) return;

    const confirmed = window.confirm(
      "Are you sure you want to update your profile?"
    );
    if (!confirmed) return;

    const res = await fetch(
      `http://localhost:3001/api/users/update/${user.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      }
    );

    if (res.ok) {
      setConfirmationMessage("✅ Profile updated successfully.");
      setEditMode(false);
      setPassword("");
    } else {
      alert("❌ Failed to update profile");
    }
  };

  const handleDelete = async () => {
    if (!user) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete your profile? This will delete all related appointments and clients!"
    );
    if (!confirmed) return;

    const res = await fetch(
      `http://localhost:3001/api/users/delete/${user.id}`,
      {
        method: "DELETE",
      }
    );

    if (res.ok) {
      alert("✅ Account deleted. Logging you out...");
      router.push("/api/auth/signout");
    } else {
      alert("❌ Failed to delete account");
    }
  };

  if (!user) return <p className="p-6">Loading profile...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#9dc7d4] via-white to-[#9dc7d4]">
      <Navbar />
      <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow text-[#4e6472]">
        <h1 className="text-2xl font-bold mb-4">My Profile</h1>

        {confirmationMessage && (
          <div className="mb-4 p-2 bg-green-100 border border-green-400 text-green-700 rounded">
            {confirmationMessage}
          </div>
        )}

        <p className="mb-4 text-sm text-gray-600">
          Account created on: {new Date(user.created_at).toLocaleDateString()}
        </p>

        <div className="space-y-4">
          <label className="block">
            <span className="font-medium">Username</span>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded mt-1"
              value={username}
              readOnly={!editMode}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="font-medium">Email</span>
            <input
              type="email"
              className="w-full p-2 border border-gray-300 rounded mt-1"
              value={email}
              readOnly={!editMode}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          {editMode && (
            <label className="block">
              <span className="font-medium">New Password</span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to keep current password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-2 transform -translate-y-1/2 text-sm text-gray-500"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>
          )}

          <p className="text-sm text-gray-600">
            Role: <strong>{user.role}</strong>
          </p>

          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="mt-4 bg-[#327b8c] text-white px-6 py-2 rounded hover:bg-[#285f6e]"
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex flex-col gap-3 mt-4">
              <button
                onClick={handleUpdate}
                className="bg-[#327b8c] text-white px-6 py-2 rounded hover:bg-[#285f6e]"
              >
                Save Changes
              </button>

              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
              >
                Delete Profile
              </button>

              <button
                onClick={() => {
                  setEditMode(false);
                  setPassword("");
                  setConfirmationMessage("");
                }}
                className="text-sm text-gray-500 underline"
              >
                Cancel Editing
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="max-w-xl mx-auto mt-6 text-center">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="mt-4 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
