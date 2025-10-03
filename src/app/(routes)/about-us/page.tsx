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
          className="absolute inset-0 z-0 object-cover"
          style={{
            width: "100%",
            height: "110vh",
            minHeight: "-webkit-fill-available",
          }}
        >
          <source src="/videos/skydiving-background.mp4" type="video/mp4" />
        </video>
        <div
          className="absolute inset-0 z-10 bg-black/40"
          style={{
            height: "110vh",
            minHeight: "-webkit-fill-available",
          }}
        />

        {/* Content */}
        <div className="z-20 text-white">
          <InfoPageClient />
        </div>
      </main>
    </HydrateClient>
  );
}
