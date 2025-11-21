import { HydrateClient } from "mydive/trpc/server";
import HomePageClient from "./client-page";
import { checkRole } from "mydive/utils/roles";
import { redirect } from "next/navigation";

export default async function Home() {
  const isAdmin = await checkRole("admin");

  if (isAdmin) {
    redirect("/admin");
  }

  return (
    <HydrateClient>
      <main className="relative min-h-screen">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 z-0 object-cover"
          style={{
            width: "100%",
            height: "110vh",
            minHeight: "-webkit-fill-available",
          }}
        >
          <source src="/videos/new-background.mp4" type="video/mp4" />
        </video>
        <div
          className="absolute inset-0 z-10 bg-black/40"
          style={{
            height: "110vh",
            minHeight: "-webkit-fill-available",
          }}
        />

        <div className="relative z-20 flex min-h-screen items-center justify-center text-white">
          <HomePageClient />
        </div>
      </main>
    </HydrateClient>
  );
}
