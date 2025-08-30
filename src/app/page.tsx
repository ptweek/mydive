import { useAuth, SignInButton, useUser } from "@clerk/nextjs";
import { LatestPost } from "mydive/app/_components/post";
import { auth } from "mydive/server/auth";
import { api, HydrateClient } from "mydive/trpc/server";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });
  const session = await auth();
  const clerkUser = await currentUser();

  if (clerkUser) {
    redirect("dashboard");
  }

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
        <div className="absolute inset-0 z-10 bg-black/40"></div>

        {/* Content */}
        <div className="relative z-20 container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <div className="flex flex-col text-center">
            <h1 className="flex flex-col text-center text-5xl font-extrabold tracking-tight drop-shadow-lg sm:text-[5rem]">
              MyDive Skydiving
            </h1>
            <span>Private Skydiving. Anywhere.</span>
          </div>
          {session?.user && <LatestPost />}
        </div>
      </main>
    </HydrateClient>
  );
}
