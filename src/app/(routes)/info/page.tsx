import { HydrateClient } from "mydive/trpc/server";
import InfoPageClient from "./info-page-client";

export default async function InfoPage() {
  return (
    <HydrateClient>
      <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden text-white">
        {/* Background Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 z-0 h-full w-full object-cover"
        >
          <source src="/videos/skydiving-background.mp4" type="video/mp4" />

          {/* Fallback gradient background */}
        </video>
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40"></div>

        {/* Content */}
        <div className="z-20">
          <InfoPageClient />
        </div>
      </main>
    </HydrateClient>
  );
}
