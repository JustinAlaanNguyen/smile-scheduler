"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react"; // Icon set

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-[#327b8c] text-white px-6 py-4 shadow-lg">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center">
          <Image
            src="/logo3.png"
            alt="Smile Scheduler Logo"
            width={100}
            height={40}
          />
        </Link>

        {/* Hamburger Icon (Mobile) */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="sm:hidden focus:outline-none"
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Desktop Nav */}
        <ul className="hidden sm:flex gap-10 text-lg font-semibold">
          <li>
            <Link
              href="/dashboard"
              className="hover:text-[#4e6c71] transition-all"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/clients"
              className="hover:text-[#4e6c71] transition-all"
            >
              Clients
            </Link>
          </li>
          <li>
            <Link
              href="/appointments"
              className="hover:text-[#4e6c71] transition-all"
            >
              Appointments
            </Link>
          </li>
          <li>
            <Link
              href="/profile"
              className="hover:text-[#4e6c71] transition-all"
            >
              My Profile
            </Link>
          </li>
        </ul>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <ul className="sm:hidden mt-4 flex flex-col gap-4 text-lg font-medium">
          <li>
            <Link
              href="/dashboard"
              onClick={() => setMenuOpen(false)}
              className="block hover:text-[#4e6c71]"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/clients"
              onClick={() => setMenuOpen(false)}
              className="block hover:text-[#4e6c71]"
            >
              Clients
            </Link>
          </li>
          <li>
            <Link
              href="/appointments"
              onClick={() => setMenuOpen(false)}
              className="block hover:text-[#4e6c71]"
            >
              Appointments
            </Link>
          </li>
          <li>
            <Link
              href="/profile"
              onClick={() => setMenuOpen(false)}
              className="block hover:text-[#4e6c71]"
            >
              My Profile
            </Link>
          </li>
        </ul>
      )}
    </nav>
  );
}
