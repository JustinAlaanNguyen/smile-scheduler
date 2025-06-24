"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams?.get("token");

  const handleReset = async () => {
    const res = await fetch("http://localhost:3001/api/users/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();
    if (res.ok) {
      router.push("/login?justReset=true");
    } else {
      setMessage(data.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#9BC5D4] px-4">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-black text-xl font-semibold mb-4">
          Enter New Password
        </h2>
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className=" text-black border p-2 rounded w-full mb-4"
        />
        <button
          onClick={handleReset}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
        >
          Reset Password
        </button>
        {message && (
          <p className="text-black mt-4 text-sm text-red-600">{message}</p>
        )}
      </div>
    </div>
  );
}
