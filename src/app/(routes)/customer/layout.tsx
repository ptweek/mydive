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
    <main>
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 z-0 h-full w-full object-cover"
      >
        <source src="/videos/skydiving-background.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 z-10 bg-black/40"></div>

      <div className="relative z-20 pt-16">{children}</div>
    </main>
  );
}
