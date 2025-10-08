import { HydrateClient } from "mydive/trpc/server";
import ContactUsClient from "./client-page";

export default async function ContactUsPage() {
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
        <div
          className="z-20 flex flex-col space-y-5 overflow-auto"
          style={{ height: "calc(100vh - 80px)" }} // I don't love this but it works
        >
          <ContactUsClient />
        </div>
      </main>
    </HydrateClient>
  );
}
