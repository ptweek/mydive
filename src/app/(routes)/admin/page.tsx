import { HydrateClient } from "mydive/trpc/server";
import { redirect } from "next/navigation";
import { checkRole } from "src/utils/roles";
import { currentUser } from "@clerk/nextjs/server";
import AdminDashboardClient from "./admin-dashboard-client";

export default async function AdminDashboard() {
  const user = await currentUser();
  const isAdmin = await checkRole("admin");
  if (!isAdmin || !user) {
    redirect("/");
  }
  return (
    <HydrateClient>
      <AdminDashboardClient userFirstName={user?.firstName} />
    </HydrateClient>
  );
}
