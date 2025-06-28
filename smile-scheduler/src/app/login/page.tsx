"use client";

import React, { Suspense, useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  // Show success message if user just registered or verified their email
  useEffect(() => {
    const justRegistered = searchParams?.get("justRegistered") === "true";
    const verified = searchParams?.get("verified") === "true";

    if (justRegistered || verified) {
      setShowMessage(true);
    }
  }, [searchParams]);

  // Handles login using NextAuth credentials provider
  const handleLogin = async () => {
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error === "Please verify your email before logging in.") {
      setError(
        "⚠️ Please verify your email before logging in. Check your inbox for a verification email."
      );
    } else if (res?.ok) {
      router.push("/dashboard");
    } else {
      setError("❌ Login failed. Please check your email and password.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#9BC5D4] px-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md flex flex-col items-center gap-4">
        <h1 className="text-2xl font-semibold text-blue-700">Login</h1>

        {/* Display success message after registration or verification */}
        {showMessage && (
          <div className="w-full bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded text-sm">
            ✅ Account created successfully. Please log in.
          </div>
        )}

        {/* Display error message on failed login */}
        {error && (
          <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">
            {error}
          </div>
        )}

        {/* Email input */}
        <input
          type="email"
          placeholder="Email"
          className="border border-black p-2 rounded w-full text-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password input */}
        <input
          type="password"
          placeholder="Password"
          className="border border-black p-2 rounded w-full text-black"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Login button */}
        <button
          onClick={handleLogin}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
        >
          Login
        </button>

        {/* Forgot password link */}
        <p
          onClick={() => router.push("/forgot-password")}
          className="text-sm text-blue-600 hover:underline cursor-pointer"
        >
          Forgot your password?
        </p>

        {/* Back to home button */}
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
