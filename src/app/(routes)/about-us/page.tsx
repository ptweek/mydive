import { HydrateClient } from "mydive/trpc/server";
import InfoPageClient from "./info-page-client";

export default async function AboutUsPage() {
  return (
    <HydrateClient>
      <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden text-white">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 z-0 h-full w-full object-cover"
        >
          <source src="/videos/skydiving-background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 z-10 bg-black/40" />

        {/* Content */}
        <div className="relative z-20 flex h-full w-full flex-col overflow-auto px-4 py-20">
          <InfoPageClient />
        </div>
      </main>
    </HydrateClient>
  );
}
