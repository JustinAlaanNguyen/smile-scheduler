// app/dashboard/page.tsx
export const metadata = {
  title: "Dashboard | Smile Scheduler",
};

import DashboardClient from "./DashboardClient";

export default function DashboardPage() {
  return <DashboardClient />;
}
