"use client";

import { useState, useRef } from "react";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { Comfortaa } from "next/font/google";

// Load Google font
const comfortaa = Comfortaa({ subsets: ["latin"], weight: ["400", "700"] });

// Type guard to check if error is an AxiosError with a typed error message
function isAxiosErrorWithResponse(
  error: unknown
): error is AxiosError<{ error: string }> {
  return (
    typeof error === "object" &&
    error !== null &&
    "isAxiosError" in error &&
    (error as AxiosError).isAxiosError === true &&
    (error as AxiosError).response !== undefined
  );
}

export default function CreateAccountPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const usernameRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  // Check if password and confirmation match
  const passwordsMatch =
    password !== "" && confirmPassword !== "" && password === confirmPassword;

  // Determine if the form is valid before enabling submission
  const isFormValid =
    username.trim() !== "" &&
    email.trim() !== "" &&
    password !== "" &&
    confirmPassword !== "" &&
    passwordsMatch;

  // Attempt to create a new user account
  const createUser = async () => {
    if (!passwordsMatch) {
      setError("❌ Passwords do not match.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/register`,
        {
          username,
          email,
          password,
        }
      );

      // Redirect to login with a success query param
      router.push("/login?justRegistered=true");
    } catch (err: unknown) {
      let message = "Something went wrong. Please try again.";

      if (isAxiosErrorWithResponse(err)) {
        const backendMsg = err.response?.data.error ?? "";

        // Display friendly error if email already exists
        if (err.response?.status === 500) {
          message = "This email is already in use. Please try another one.";
        } else {
          message = backendMsg || message;
        }
      }

      setError(`❌ ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#9dc7d4] to-[#e6f4f9] py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-8">
        <h2
          className={`text-3xl font-bold text-center text-[#327b8c] mb-6 ${comfortaa.className}`}
        >
          Create Your Account
        </h2>

        <div className="space-y-4">
          {/* Username Field */}
          <input
            ref={usernameRef}
            className="text-black border border-gray-300 p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-[#5cb5c9]"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          {/* Email Field */}
          <input
            className="text-black border border-gray-300 p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-[#5cb5c9]"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Password Field */}
          <input
            className={`border p-3 rounded w-full focus:outline-none focus:ring-2 transition-all duration-300 focus:ring-[#5cb5c9] text-black ${
              confirmPassword && !passwordsMatch
                ? "border-red-500"
                : "border-gray-300"
            }`}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Confirm Password Field */}
          <input
            className={`border p-3 rounded w-full focus:outline-none focus:ring-2 transition-all duration-300 focus:ring-[#5cb5c9] text-black ${
              confirmPassword && !passwordsMatch
                ? "border-red-500"
                : "border-gray-300"
            }`}
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {/* Password Match Indicator */}
          {confirmPassword !== "" && (
            <p
              className={`text-sm ${
                passwordsMatch ? "text-green-600" : "text-red-600"
              }`}
            >
              {passwordsMatch
                ? "✅ Passwords match"
                : "❌ Passwords do not match"}
            </p>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            className={`w-full py-3 rounded text-white font-semibold transition duration-200 ${
              isFormValid && !loading
                ? "bg-[#327b8c] hover:bg-[#285d69]"
                : "bg-gray-400 cursor-not-allowed"
            }`}
            onClick={createUser}
            disabled={!isFormValid || loading}
          >
            {loading ? "Creating..." : "Create Account"}
          </button>

          {/* Login Redirect */}
          <p className="text-center text-sm mt-4 text-gray-600">
            Already have an account?{" "}
            <a href="/login" className="text-[#327b8c] hover:underline">
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
