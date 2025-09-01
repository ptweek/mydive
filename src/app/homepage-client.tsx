"use client";

import { SignUpButton } from "@clerk/nextjs";
import { Button } from "@nextui-org/react";
import { useUser } from "@clerk/nextjs";

export default function HomePageClient() {
  const isSignedInUser = useUser().isSignedIn;
  return (
    <div className="relative z-20 container flex flex-col items-center justify-center gap-12 px-4 py-16">
      <div className="flex flex-col text-center">
        <h1 className="flex flex-col text-center text-5xl font-extrabold tracking-tight drop-shadow-lg sm:text-[5rem]">
          MyDive Skydiving
        </h1>
        <span>Private Skydiving. Anywhere.</span>
      </div>
      {/* ADDED: Book Now button with prominent styling */}
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        {isSignedInUser ? (
          <Button
            size="lg"
            variant="shadow"
            className="w-full cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-700 py-6 text-lg font-semibold tracking-wider text-white uppercase hover:from-blue-500 hover:to-indigo-600 hover:shadow-xl hover:shadow-blue-500/30 sm:w-48"
            onPress={() => {
              window.location.href = "/booking-calendar"; // for some reason need to force a full refresh on this
            }}
          >
            Book Now
          </Button>
        ) : (
          <SignUpButton mode="redirect" forceRedirectUrl={"/booking-calendar"}>
            <Button
              size="lg"
              variant="shadow"
              className="w-full cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-700 py-6 text-lg font-semibold tracking-wider text-white uppercase hover:from-blue-500 hover:to-indigo-600 hover:shadow-xl hover:shadow-blue-500/30 sm:w-48"
            >
              Book Now
            </Button>
          </SignUpButton>
        )}
        {/* TO DO: Goes to the info section for Ryan and his website */}
        {/* UPDATED: Changed to white transparent background with white border */}
        <Button
          size="lg"
          variant="shadow"
          className="w-full border-2 border-white bg-white/10 py-6 text-lg font-semibold tracking-wider text-white uppercase backdrop-blur-sm hover:bg-white/20 hover:shadow-xl hover:shadow-white/20 sm:w-48"
        >
          Learn More
        </Button>
      </div>
    </div>
  );
}
