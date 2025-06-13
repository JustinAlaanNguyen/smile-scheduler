//UserForm.jsx
"use client";

import { useState } from "react";
import axios from "axios";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function UserForm() {
  const [showForm, setShowForm] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const passwordsMatch =
    password !== "" && confirmPassword !== "" && password === confirmPassword;
  const router = useRouter();

  const createUser = async () => {
    if (!passwordsMatch) {
      setError("❌ Passwords do not match.");
      return;
    }

    try {
      // Step 1: Create the user
      await axios.post("http://localhost:3001/api/users/register", {
        username,
        email,
        password,
      });

      // Step 2: Automatically log them in using NextAuth
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res.ok) {
        router.push("/dashboard"); // Step 3: Redirect
      } else {
        setError(
          "❌ Account created, but login failed. Please try logging in."
        );
      }
    } catch (error) {
      if (error.response) {
        const message =
          error.response.data?.error ||
          "Something went wrong. Please try again.";
        setError(`❌ ${message}`);
      } else {
        setError("❌ Server not responding. Please try again later.");
      }
    }
  };

  const isFormValid =
    username.trim() !== "" &&
    email.trim() !== "" &&
    password !== "" &&
    confirmPassword !== "" &&
    passwordsMatch;
  return (
    <div className="max-w-md mx-auto mt-8 flex flex-col items-center gap-4">
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={() => (window.location.href = "/login")}
      >
        Login
      </button>

      {/* Toggle Form Button */}
      {!showForm && (
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={() => setShowForm(true)}
        >
          Create an Account
        </button>
      )}

      {/* User Form */}
      {showForm && (
        <>
          <input
            className="border border-black p-2 rounded w-full text-black"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="border border-black p-2 rounded w-full text-black"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className={`border border-black p-2 rounded w-full transition-all duration-300 text-black ${
              confirmPassword && !passwordsMatch
                ? "animate-shake border-red-500"
                : ""
            }`}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            className={`border border-black p-2 rounded w-full transition-all duration-300 text-black ${
              confirmPassword && !passwordsMatch
                ? "animate-shake border-red-500"
                : ""
            }`}
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

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

          {/* Styled Error */}
          {error && (
            <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">
              {error}
            </div>
          )}

          <button
            className={`p-2 w-full rounded text-white ${
              isFormValid
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-gray-400 cursor-not-allowed"
            }`}
            onClick={createUser}
            disabled={!isFormValid}
          >
            Create Account
          </button>

          <button
            className="mt-2 text-sm text-gray-600 hover:underline"
            onClick={() => setShowForm(false)}
          >
            Cancel
          </button>
        </>
      )}
    </div>
  );
}
