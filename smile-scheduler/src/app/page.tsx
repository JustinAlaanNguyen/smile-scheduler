"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Comfortaa } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";

const comfortaa = Comfortaa({ subsets: ["latin"], weight: ["400", "700"] });

export default function Home() {
  const [clientIndex, setClientIndex] = useState(0);
  const [apptIndex, setApptIndex] = useState(0);
  const [isClientHovered, setIsClientHovered] = useState(false);
  const [isApptHovered, setIsApptHovered] = useState(false);

  const clientMedia = [
    {
      type: "video",
      src: "/videos/Createclient.mp4",
      title: "Client Management Made Easy",
      desc: "Add, view, update, and delete client profiles to build a powerful database.",
    },
    {
      type: "video",
      src: "/videos/Viewclient.mp4",
      title: "Effortless Client Viewing",
      desc: "Quickly view detailed client information and history with just a click.",
    },
  ];

  const apptImages = [
    {
      type: "video",
      src: "/videos/Createappoint.mp4",
      title: "Create Appointments Easily",
      desc: "Select a client, date, and time to book appointments quickly and clearly.",
    },
    {
      type: "video",
      src: "/videos/Viewappoint.mp4",
      title: "Manage Appointments Effortlessly",
      desc: "Update, reschedule, or cancel with real-time updates.",
    },
  ];

  useEffect(() => {
    if (!isClientHovered) {
      const interval = setInterval(() => {
        setClientIndex((prev) => (prev + 1) % clientMedia.length);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [isClientHovered, clientMedia.length]);

  useEffect(() => {
    if (!isApptHovered) {
      const interval = setInterval(() => {
        setApptIndex((prev) => (prev + 1) % apptImages.length);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [isApptHovered, apptImages.length]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#9dc7d4] via-white to-[#9dc7d4] text-gray-800 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 bg-[#9dc7d4] shadow-md">
        <Image
          src="/homePage.png"
          alt="Smile Scheduler Logo"
          width={200}
          height={40}
          priority
        />
        <div className="flex gap-4">
          <Link href="/login">
            <button className="px-5 py-2 rounded-lg bg-[#327b8c] text-white hover:bg-[#285d69] transition duration-200">
              Login
            </button>
          </Link>
          <Link href="/register">
            <button className="px-5 py-2 rounded-lg bg-[#5cb5c9] text-white hover:bg-[#3c95a8] transition duration-200">
              Create Account
            </button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 space-y-20">
        {/* Welcome */}
        <section className="text-center">
          <h1
            className={`text-5xl font-bold mb-4 text-[#327b8c] ${comfortaa.className}`}
          >
            Welcome to Smile Scheduler
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Your all-in-one tool to manage clients and schedule appointments
            with ease.
          </p>
        </section>

        {/* Client Section */}
        <section
          onMouseEnter={() => setIsClientHovered(true)}
          onMouseLeave={() => setIsClientHovered(false)}
          className="grid md:grid-cols-2 gap-10 items-center bg-white p-8 rounded-2xl shadow-xl"
        >
          <div>
            <h2 className="text-3xl font-bold text-[#327b8c] mb-2">
              {clientMedia[clientIndex].title}
            </h2>
            <p className="text-lg text-gray-700">
              {clientMedia[clientIndex].desc}
            </p>
          </div>

          <div className="relative w-full h-[300px] rounded-lg overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={clientIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full h-full"
              >
                {clientMedia[clientIndex].type === "video" ? (
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  >
                    <source
                      src={clientMedia[clientIndex].src}
                      type="video/mp4"
                    />
                  </video>
                ) : (
                  <Image
                    src={clientMedia[clientIndex].src}
                    alt="Client preview"
                    fill
                    className="object-cover"
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {isClientHovered && (
              <>
                <button
                  onClick={() =>
                    setClientIndex((prev) =>
                      prev === 0 ? clientMedia.length - 1 : prev - 1
                    )
                  }
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 text-black p-2 rounded-full hover:bg-opacity-100 transition"
                >
                  ◀
                </button>
                <button
                  onClick={() =>
                    setClientIndex((prev) => (prev + 1) % clientMedia.length)
                  }
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 text-black p-2 rounded-full hover:bg-opacity-100 transition"
                >
                  ▶
                </button>
              </>
            )}
          </div>
        </section>

        {/* Appointment Section */}
        <section
          onMouseEnter={() => setIsApptHovered(true)}
          onMouseLeave={() => setIsApptHovered(false)}
          className="grid md:grid-cols-2 gap-10 items-center bg-white p-8 rounded-2xl shadow-xl"
        >
          <div>
            <h2 className="text-3xl font-bold text-[#327b8c] mb-2">
              {apptImages[apptIndex].title}
            </h2>
            <p className="text-lg text-gray-700">
              {apptImages[apptIndex].desc}
            </p>
          </div>

          <div className="relative w-full h-[300px] rounded-lg overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={apptIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full h-full"
              >
                {apptImages[apptIndex].type === "video" ? (
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  >
                    <source src={apptImages[apptIndex].src} type="video/mp4" />
                  </video>
                ) : (
                  <Image
                    src={apptImages[apptIndex].src}
                    alt="Appointment preview"
                    fill
                    className="object-cover"
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {isApptHovered && (
              <>
                <button
                  onClick={() =>
                    setApptIndex((prev) =>
                      prev === 0 ? apptImages.length - 1 : prev - 1
                    )
                  }
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 text-black p-2 rounded-full hover:bg-opacity-100 transition"
                >
                  ◀
                </button>
                <button
                  onClick={() =>
                    setApptIndex((prev) => (prev + 1) % apptImages.length)
                  }
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 text-black p-2 rounded-full hover:bg-opacity-100 transition"
                >
                  ▶
                </button>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
