import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="text-center mt-20 text-red-500">
        Access Denied. You must be logged in to view this page.
      </div>
    );
  }

  return (
    <div className="text-center mt-20">
      <h1 className="text-2xl">Welcome, {session.user?.name}!</h1>
    </div>
  );
}
