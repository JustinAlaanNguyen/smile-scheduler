"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyPage() {
  const [status, setStatus] = useState("Verifying...");
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (!searchParams) return;

    const token = searchParams.get("token");
    if (!token) {
      setStatus("Invalid verification link.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/verify?token=${encodeURIComponent(token)}`
        );
        const data = await response.json();

        if (response.ok && data.success) {
          setStatus("Email verified! Redirecting to login...");
          setTimeout(() => router.push("/login?verified=true"), 3000);
        } else {
          setStatus(`Verification failed: ${data.error || "Unknown error"}`);
        }
      } catch (err) {
        console.error(err);
        setStatus("An error occurred during verification.");
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">Email Verification</h1>
      <p>{status}</p>
    </div>
  );
}
