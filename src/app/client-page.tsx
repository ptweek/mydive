"use client";

import { SignUpButton } from "@clerk/nextjs";
import { Button } from "@nextui-org/react";
import { useUser } from "@clerk/nextjs";

export default function HomePageClient() {
  const isSignedInUser = useUser().isSignedIn;

  return (
    <div className="relative z-20 flex w-full max-w-3xl flex-col items-center justify-center gap-6 px-4 py-8 sm:gap-8 sm:px-6 lg:px-8">
      <div className="flex flex-col text-center">
        <h1 className="flex flex-col text-center text-4xl font-extrabold tracking-tight drop-shadow-lg sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5.5rem]">
          <span className="leading-tight">MyDive</span>
          <span className="leading-tight">Skydiving</span>
        </h1>
        <p className="mt-3 text-base text-gray-200 sm:mt-4 sm:text-lg md:text-xl lg:text-2xl">
          Private Skydiving. Anywhere.
        </p>
      </div>

      <div className="flex w-full max-w-sm flex-col items-center gap-3 sm:max-w-lg sm:flex-row sm:justify-center sm:gap-4">
        {isSignedInUser ? (
          <Button
            size="lg"
            variant="shadow"
            className="min-h-[48px] w-full cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-700 text-sm font-semibold tracking-wider text-white uppercase hover:from-blue-500 hover:to-indigo-600 hover:shadow-xl hover:shadow-blue-500/30 sm:min-h-[52px] sm:w-44 sm:text-base lg:w-48 lg:text-lg"
            onPress={() => {
              window.location.href = "/customer/booking-calendar";
            }}
          >
            Book Now
          </Button>
        ) : (
          <SignUpButton
            mode="redirect"
            forceRedirectUrl={"/customer/booking-calendar"}
          >
            <button className="min-h-[48px] w-full transform cursor-pointer touch-manipulation bg-gradient-to-r from-blue-600 to-indigo-700 text-sm font-semibold tracking-wider text-white uppercase shadow-xl transition-all duration-300 hover:scale-[1.02] hover:from-blue-500 hover:to-indigo-600 hover:shadow-2xl hover:shadow-blue-500/30 active:scale-[0.98] sm:min-h-[52px] sm:w-44 sm:text-base lg:w-48 lg:text-lg">
              Book Now
            </button>
          </SignUpButton>
        )}

        <Button
          size="lg"
          variant="shadow"
          className="min-h-[48px] w-full border-2 border-white bg-white/10 text-sm font-semibold tracking-wider text-white uppercase backdrop-blur-sm hover:bg-white/20 hover:shadow-xl hover:shadow-white/20 sm:min-h-[52px] sm:w-44 sm:text-base lg:w-48 lg:text-lg"
          onPress={() => {
            window.location.href = "/about-us";
          }}
        >
          Learn More
        </Button>
      </div>
    </div>
  );
}
