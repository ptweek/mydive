import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Protect all dashboard routes
  const user = await currentUser();
  if (!user) {
    redirect("/");
  }

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden text-white">
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 z-0 h-full w-full object-cover"
      >
        <source src="/videos/skydiving-background.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 z-0 bg-black/40"></div>

      {/* Content with proper spacing for fixed header */}
      <div className="relative z-10 pt-20">{children}</div>
    </main>
  );
}
