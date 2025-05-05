"use client";

import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="bg-[#327b8c] text-white px-6 py-4 shadow-lg flex items-center justify-between">
      {/* Left: Logo */}
      <Link href="/dashboard" className="flex items-center">
        <Image
          src="/logo3.png"
          alt="Smile Scheduler Logo"
          width={100}
          height={150}
        />
      </Link>

      {/* Center: Nav Links */}
      <ul className="flex gap-10 text-xl font-semibold">
        <li>
          <Link
            href="/dashboard"
            className="hover:text-[#4e6c71] hover:brightness-110 transition-all"
          >
            Home
          </Link>
        </li>
        <li>
          <Link
            href="/clients"
            className="hover:text-[#4e6c71] hover:brightness-110 transition-all"
          >
            Clients
          </Link>
        </li>
        <li>
          <Link
            href="/appointments"
            className="hover:text-[#4e6c71] hover:brightness-110 transition-all"
          >
            Appointments
          </Link>
        </li>
      </ul>

      {/* Right: My Profile */}
      <Link
        href="/profile"
        className="text-lg font-medium hover:text-[#4e6c71] transition-all"
      >
        My Profile
      </Link>
    </nav>
  );
}
