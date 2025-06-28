"use client";

import { useState, useTransition, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

/**
 * ──────────────────────────────────────────────────────────────
 *  Inner component – actually uses useSearchParams()
 * ──────────────────────────────────────────────────────────────
 */
function ResetPasswordInner() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const searchParams = useSearchParams();
  const token = searchParams?.get("token");

  // (optional) show a spinner while we send the request
  const [isPending, startTransition] = useTransition();

  const handleReset = async () => {
    if (!token) {
      setMessage("Invalid or missing reset token.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/reset-password`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, password }),
          }
        );

        const data = await res.json();

        if (res.ok) {
          router.push("/login?justReset=true");
        } else {
          setMessage(data.error || "Failed to reset password.");
        }
      } catch (err) {
        console.error(err);
        setMessage("Something went wrong. Please try again.");
      }
    });
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
          className="text-black border p-2 rounded w-full mb-4"
        />

        <button
          onClick={handleReset}
          disabled={isPending}
          className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full ${
            isPending && "opacity-70 cursor-not-allowed"
          }`}
        >
          {isPending ? "Resetting..." : "Reset Password"}
        </button>

        {message && (
          <p className="text-black mt-4 text-sm text-red-600">{message}</p>
        )}
      </div>
    </div>
  );
}

/**
 * ──────────────────────────────────────────────────────────────
 *  Page component – wraps inner component in <Suspense>
 * ──────────────────────────────────────────────────────────────
 */
export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#9BC5D4] px-4">
          <div className="text-white text-lg">Loading reset form...</div>
        </div>
      }
    >
      <ResetPasswordInner />
    </Suspense>
  );
}
