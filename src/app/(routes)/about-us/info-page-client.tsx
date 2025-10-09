"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GradualSpacing } from "mydive/app/_shared-frontend/components/animated-text/gradual-spacing";
import { CardWithGridEllipsis } from "mydive/app/_shared-frontend/components/cards/ellipse-card";

export default function InfoPage() {
  const router = useRouter();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen text-white">
      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center">
        <div
          className="absolute inset-0"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        />

        <div className="relative z-10 mx-auto max-w-6xl px-6 text-center">
          <GradualSpacing text="We Are Not Another Dropzone" />
          <p className="mx-auto mb-12 max-w-4xl text-xl leading-relaxed text-gray-300 md:text-2xl">
            This is skydiving as it was meant to be:{" "}
            <span className="font-semibold text-blue-400">raw</span>,
            <span className="font-semibold text-purple-400"> rare</span>,
            <span className="font-semibold text-pink-400"> unforgettable</span>
          </p>
        </div>
      </section>

      {/* About Us Section */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <h2 className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
                About Us
              </h2>

              <div className="space-y-4 text-lg leading-relaxed text-gray-300">
                <p>
                  Skydiving today is stuck in a routine. Cattlecall manifesting,
                  pressure to make the next load or else having to wait for the
                  next one, repetitive jumps onto a suburban airport.
                </p>
                <p className="font-bold">
                  Somewhere along the way, the soul of the sport got lost and
                  skydiving grew soft.
                </p>
                <p className="text-xl font-semibold text-blue-400">
                  {`We're here to bring it back.`}
                </p>
                <p>
                  MyDive Skydiving was founded by a pilot and skydiver who
                  wanted more than numbers on a logbook. We wanted the sky to
                  feel untamed again. We wanted adventure.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <h3 className="mb-4 text-center text-2xl font-bold">
                  Our Mission
                </h3>
                <p className="mb-6 text-center leading-relaxed text-gray-300">
                  Take skydiving out of strip-mall airports and put it back
                  where it belongs — in nature.
                </p>
                <div className="text-center">
                  <span className="inline-block rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 font-semibold text-white">
                    Skydiving 2.0
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Experience Section */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold text-transparent md:text-5xl">
              The Experience
            </h2>
            <p className="text-2xl text-gray-300">
              {`It's not just a jump. It's a custom journey.`}
            </p>
          </div>

          <div className="mx-auto max-w-4xl space-y-6 text-lg leading-relaxed text-gray-300">
            <p>
              {`When you jump with MyDive, you're not shuttled through a crowded
              hangar. There are no turnstiles. No pressure to squeeze in "just
              one more load."`}
            </p>
            <p>
              Instead, you and your closest crew board a private aircraft, bound
              for wild terrain. Mountains, valleys, dunes, rivers — nature is
              our dropzone.
            </p>
            <p>
              {` The flight up is as breathtaking as the jump itself. Silence
              broken only by the hum of our Cessna 206's turbocharged engine.
              You step out into clean air, with nothing but raw landscape below.`}
            </p>
            <p>
              {`When your canopy deploys, the skydive isn't over. You can proxy
              fly down mountains and you can soar over the most beautiful places
              in the country. And when you've landed, you're in a place that
              feels untouched, far from suburbs and concrete.`}
            </p>
            <p>
              {`There's time to breathe it in and share it with friends…to feel
              what flight really means. Our groundcrew will meet you where you
              land and shuttle you back to the departure airport where you can
              get ready for another jump at your own pace.`}
            </p>
            <div className="py-6 text-center">
              <p className="text-xl font-semibold text-white md:text-2xl">
                {`This is an experience you'll never forget.`}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="px-6 py-16 text-center">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-6 text-4xl font-bold text-white md:text-6xl">
            This is{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Your Dive
            </span>
          </h2>
          <p className="mb-10 text-xl leading-relaxed text-gray-300">
            {`An experience you'll never forget. Are you ready to feel what flight
            really means?`}
          </p>
          <div className="flex flex-col justify-center gap-6 sm:flex-row">
            <button
              onClick={() => {
                router.push("customer/booking-calendar");
              }}
              className="group relative overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:from-blue-500 hover:to-purple-500 hover:shadow-xl hover:shadow-blue-500/25"
            >
              <span className="relative z-10">Book Your Adventure</span>
              <div className="absolute inset-0 translate-x-full bg-gradient-to-r from-white/0 to-white/20 transition-transform duration-500 group-hover:translate-x-0"></div>
            </button>
            <button
              onClick={() => {
                router.push("faq");
              }}
              className="group relative overflow-hidden rounded-full border-2 border-white/30 px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:border-white/50 hover:bg-white/10"
            >
              <span className="relative z-10">Frequently Asked Questions</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
