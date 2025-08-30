import Link from "next/link";

import { LatestPost } from "mydive/app/_components/post";
import { auth } from "mydive/server/auth";
import { api, HydrateClient } from "mydive/trpc/server";

export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });
  const session = await auth();

  if (session?.user) {
    void api.post.getLatest.prefetch();
  }

return (
    <HydrateClient>
      <main className="relative flex min-h-screen flex-col items-center justify-center text-white overflow-hidden">
        {/* Background Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/videos/skydiving-background.mp4" type="video/mp4" />

          {/* Fallback gradient background */}
        </video>
        
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        
        {/* Content */}
        <div className="relative z-20 container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem] text-center drop-shadow-lg">
            MyDive Skydiving
          </h1>
          <span className="text-4xl font-extrabold tracking-tighttext-center drop-shadow-lg underline">Book now</span>
          {session?.user && <LatestPost />}
        </div>
      </main>
    </HydrateClient>
  );
}
