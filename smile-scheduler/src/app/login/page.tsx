"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.ok) {
      router.push("/dashboard");
    } else {
      alert("❌ Login failed. Check your credentials.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#9BC5D4] px-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md flex flex-col items-center gap-4">
        <h1 className="text-2xl font-semibold text-blue-700">Login</h1>
        <input
          type="email"
          placeholder="Email"
          className="border border-black p-2 rounded w-full text-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="border border-black p-2 rounded w-full text-black"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleLogin}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
        >
          Login
        </button>
        <button
          onClick={() => (window.location.href = "/")}
          className="mt-2 text-sm text-gray-600 hover:underline"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}
