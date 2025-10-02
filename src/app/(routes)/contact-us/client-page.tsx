"use client";
import { useState, useEffect } from "react";
import { EnvelopeIcon, PhoneIcon } from "@heroicons/react/24/outline";

export default function ContactPage() {
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
          <h1 className="mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-5xl leading-tight font-bold text-transparent md:text-7xl lg:text-8xl">
            Contact Us
          </h1>

          <p className="mx-auto mb-16 max-w-4xl text-xl leading-relaxed text-gray-300 md:text-2xl">
            Ready to book your adventure? Get in touch.
          </p>

          {/* Contact Info */}
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
            {/* Email */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm md:p-8">
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-3">
                  <EnvelopeIcon className="h-6 w-6 sm:h-8 sm:w-8" />
                </div>
                <div className="text-center">
                  <h3 className="mb-1 text-base font-semibold text-gray-400 sm:text-lg">
                    Email
                  </h3>
                  <a
                    href="mailto:ryan@mydiveskydive.com"
                    className="text-lg whitespace-nowrap text-blue-400 transition-colors hover:text-blue-300 sm:text-2xl"
                  >
                    ryan@mydiveskydive.com
                  </a>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm md:p-8">
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-3">
                  <PhoneIcon className="h-6 w-6 sm:h-8 sm:w-8" />
                </div>
                <div className="text-center">
                  <h3 className="mb-1 text-base font-semibold text-gray-400 sm:text-lg">
                    Phone
                  </h3>
                  <a
                    href="tel:424-247-4156"
                    className="text-lg text-purple-400 transition-colors hover:text-purple-300 sm:text-2xl"
                  >
                    424-247-4156
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
