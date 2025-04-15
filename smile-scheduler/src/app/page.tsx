'use client';

// import { useEffect, useState } from 'react';
// import axios from 'axios';
import UserForm from '../components/UserForm'; 
import Image from "next/image";

export default function Home() {
  // const [message, setMessage] = useState('');

  // useEffect(() => {
  //   axios.get('http://localhost:3001/')
  //     .then(response => {
  //       setMessage(response.data);
  //     })
  //     .catch(error => {
  //       console.error('Error fetching data:', error);
  //     });
  // }, []);

  return (
    <div className="min-h-screen p-8 sm:p-20 bg-[#ADBCBE] grid grid-rows-[auto_1fr_auto] gap-8 justify-items-center font-sans">
      <header>
        <Image src="/smilSchedHomePage.jpg" alt="Smile Scheduler Logo" width={500} height={500} priority />
        {/* <h1 className="text-3xl font-bold mt-4">Smile Scheduler</h1> */}
        {/* <p className="mt-2 text-green-600 text-sm">Backend says: {message}</p> */}
        <h1 className="text-4xl font-semibold text-center mt-4">
          An online scheduling tool.
        </h1>
      </header>

      <main className="w-full max-w-xl">


        {/* user form for create*/}
        <UserForm />


      </main>

      <footer className="flex gap-4 flex-wrap justify-center text-sm text-gray-600">
        <a href="https://nextjs.org/learn" target="_blank" rel="noopener noreferrer" className="hover:underline">
          Learn Next.js
        </a>
        <a href="https://vercel.com/templates" target="_blank" rel="noopener noreferrer" className="hover:underline">
          Explore Templates
        </a>
        <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer" className="hover:underline">
          Visit nextjs.org →
        </a>
      </footer>
    </div>
  );
}
