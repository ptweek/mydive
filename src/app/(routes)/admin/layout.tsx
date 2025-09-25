import { currentUser } from "@clerk/nextjs/server";
import { checkRole } from "mydive/utils/roles";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black text-white">
      {children}
    </main>
  );
}
