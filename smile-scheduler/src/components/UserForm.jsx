"use client";

import { useState } from "react";
import axios from "axios";

export default function UserForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const passwordsMatch =
    password !== "" && confirmPassword !== "" && password === confirmPassword;

  const createUser = async () => {
    if (!passwordsMatch) {
      setError("Passwords do not match");
      return;
    }

    try {
      await axios.post("http://localhost:3001/api/users/register", {
        username,
        email,
        password,
      });
      alert("User created!");
      // Reset form
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setError("");
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Failed to create user");
    }
  };

  const isFormValid =
    username.trim() !== "" &&
    email.trim() !== "" &&
    password !== "" &&
    confirmPassword !== "" &&
    passwordsMatch;

  return (
    <div className="flex flex-col gap-4 max-w-md mx-auto mt-8">
      <input
        className="border p-2 rounded"
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        className="border p-2 rounded"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className={`border p-2 rounded transition-all duration-300 ${
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
        className={`border p-2 rounded transition-all duration-300 ${
          confirmPassword && !passwordsMatch
            ? "animate-shake border-red-500"
            : ""
        }`}
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      {/* Realtime match indicator */}
      {confirmPassword !== "" && (
        <p
          className={`text-sm ${
            passwordsMatch ? "text-green-600" : "text-red-600"
          }`}
        >
          {passwordsMatch ? "✅ Passwords match" : "❌ Passwords do not match"}
        </p>
      )}

      {error && <p className="text-red-500">{error}</p>}

      <button
        className={`p-2 rounded text-white ${
          isFormValid
            ? "bg-blue-500 hover:bg-blue-600"
            : "bg-gray-400 cursor-not-allowed"
        }`}
        onClick={createUser}
        disabled={!isFormValid}
      >
        Create Account
      </button>
    </div>
  );
}
