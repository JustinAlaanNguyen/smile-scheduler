"use client";

import { useState } from "react";
import UserForm from "../components/UserForm";
import Image from "next/image";

export default function Home() {
  const [clientIndex, setClientIndex] = useState(0);
  const [apptIndex, setApptIndex] = useState(0);

  const clientImages = [
    {
      src: "/smilSchedHomePage.jpg",
      title: "Create your own clientele!",
      desc: "Quickly add new clients with essential details like name, and preferences to build your personal client base.",
    },
    {
      src: "/logo.jpg",
      title: "View, edit, and delete unlimited client profiles!",
      desc: "Manage client information—make updates, remove profiles, and keep everything organized in one place.",
    },
  ];

  const apptImages = [
    {
      src: "/smilSchedHomePage.jpg",
      title: "Manage your own appointment schedule!",
      desc: "Schedule appointments by selecting a client and choosing a date and time that works best.",
    },
    {
      src: "/logo.jpg",
      title: "Stay up to date with any changes to your schedule!",
      desc: "Quickly update, reschedule, or cancel appointments and view your updated agenda in real time.",
    },
  ];

  const nextClient = () =>
    setClientIndex((prev) => (prev + 1) % clientImages.length);
  const prevClient = () =>
    setClientIndex((prev) => (prev === 0 ? clientImages.length - 1 : prev - 1));

  const nextAppt = () => setApptIndex((prev) => (prev + 1) % apptImages.length);
  const prevAppt = () =>
    setApptIndex((prev) => (prev === 0 ? apptImages.length - 1 : prev - 1));

  return (
    <div className="min-h-screen p-8 sm:p-20 bg-[#9BC5D4] grid grid-rows-[auto_1fr_auto] gap-8 justify-items-center font-sans">
      <header>
        <Image
          src="/homePage.png"
          alt="Smile Scheduler Logo"
          width={500}
          height={38}
          priority
        />
      </header>
      <main className="w-full max-w-6xl">
        <UserForm />

        <div className="flex flex-col md:flex-row justify-center gap-8 mt-12 w-full">
          {/* Client Section */}
          <div className="w-full md:w-1/2 bg-white p-4 md:p-6 rounded-lg shadow-md min-h-[250px] relative">
            <h2 className="text-2xl font-bold mb-1 text-center text-blue-700">
              {clientImages[clientIndex].title}
            </h2>
            <p className="text-xl mb-3 text-center text-blue-300">
              {clientImages[clientIndex].desc}
            </p>
            <div className="overflow-hidden relative">
              <div
                className="flex transition-transform duration-500"
                style={{
                  width: `${clientImages.length * 100}%`,
                  transform: `translateX(-${
                    clientIndex * (200 / clientImages.length)
                  }%)`,
                }}
              >
                {clientImages.map((img, i) => (
                  <div key={i} className="w-full flex-shrink-0">
                    <Image
                      src={img.src}
                      alt={`Client step ${i + 1}`}
                      width={510}
                      height={180}
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={prevClient}
                className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-gray-300 rounded-full p-2 text-blue-700"
              >
                ←
              </button>
              <button
                onClick={nextClient}
                className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-gray-300 rounded-full p-2 text-blue-700"
              >
                →
              </button>
            </div>
          </div>

          {/* Appointment Section */}
          <div className="w-full md:w-1/2 bg-white p-4 md:p-6 rounded-lg shadow-md min-h-[250px] relative">
            <h2 className="text-2xl font-bold mb-1 text-center text-blue-700">
              {apptImages[apptIndex].title}
            </h2>
            <p className="text-xl mb-3 text-center text-blue-300">
              {apptImages[apptIndex].desc}
            </p>
            <div className="overflow-hidden relative">
              <div
                className="flex transition-transform duration-500"
                style={{
                  width: `${apptImages.length * 100}%`,
                  transform: `translateX(-${
                    apptIndex * (200 / apptImages.length)
                  }%)`,
                }}
              >
                {apptImages.map((img, i) => (
                  <div key={i} className="w-full flex-shrink-0">
                    <Image
                      src={img.src}
                      alt={`Appt step ${i + 1}`}
                      width={510}
                      height={180}
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={prevAppt}
                className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-gray-300 rounded-full p-2 text-blue-700"
              >
                ←
              </button>
              <button
                onClick={nextAppt}
                className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-gray-300 rounded-full p-2 text-blue-700"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
