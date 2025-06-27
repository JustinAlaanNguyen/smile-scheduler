// app/page.tsx
export const metadata = {
  title: "Home | Smile Scheduler",
  description:
    "Welcome to Smile Scheduler – Manage clients and appointments with ease.",
};

import HomeClient from "./HomeClient";

export default function Page() {
  return <HomeClient />;
}
