"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FAQPage() {
  const router = useRouter();
  const [openQuestion, setOpenQuestion] = useState(0);

  const faqs = [
    {
      question: "Who can jump with MyDive?",
      answer:
        "At this stage, licensed skydivers only. You must hold a valid USPA B license (or higher) and bring your own gear. This keeps the experience small, safe, and exclusive. Tandems may come in the future, but not yet.",
    },
    {
      question: "How is this different from a dropzone?",
      answer:
        "We are not a dropzone. No suburban hangars. No pressure to repack and make the next load. MyDive is about quality over quantity: private groups, wild terrain, and skydiving reimagined as an expedition.",
    },
    {
      question: "Where do the jumps happen?",
      answer:
        "Our landing zones are in scenic terrain — not airports. There are a variety of locations tailored to your desires. Think alpine meadows, desert dunes, and coastal oases.",
    },
    {
      question: "How safe is this?",
      answer: [
        "Safety is everything. We operate according to USPA standards. Adventure doesn't mean reckless — it means prepared.",
        "• Diligent mapping and scouting research with safety as the backbone",
        "• Extensive pre-jump briefings",
        "• Walking the landing zones and alternate landing zones prior to jumping",
        "• Equipping each jumper with a GPS beacon and first aid supplies",
        "• Ground crew staged at the landing zone measuring the wind, monitoring GPS, communicating with the pilot, and having first aid ready",
        "• Licensed jumpers only.",
      ],
    },
    {
      question: "How do bookings work?",
      answer: [
        "• Private groups (up to 5 jumpers per load)",
        "• Full-day or multi-day packages",
        "• Advance notice required (minimum 48 hours)",
        "• A non-refundable deposit secures your slot",
        "",
        "Each booking gives you private access to 3 days—even if you only want to jump 1 day. You only pay for the days you jump. This way we can ensure you do not get weathered out. For example, if you want to jump on a Friday, your reservation will include Friday, Saturday, and Sunday. If Friday's weather doesn't cooperate, you will be able to jump Saturday or Sunday without needing to rebook or being worried about someone else taking your slot.",
        "",
        "As your reservation approaches, the pilot will work with you to assess the weather and forecast which day(s) within your booking will work best.",
      ],
    },
    {
      question: "What does it cost?",
      answer:
        "Premium adventures carry premium value. Pricing depends on group size, location, and length of experience, starting at $5,000 per private group per day and discounted rates for each additional day.",
    },
    {
      question: "What's included?",
      answer: [
        "• Aircraft and pilot",
        "• Survival waist pack to carry with you on jumps including a GPS beacon and first aid supplies",
        "• As many jumps as you want to do per day",
        "• Ground logistics and retrieval after each jump",
        "• Site-specific briefings + coordination in advance with the pilot",
        "• Free pack jobs from our ground crew",
      ],
    },
    {
      question: "Can landowners partner with MyDive?",
      answer: [
        "Yes. If you own property with large, open fields and want to host a landing zone, let's talk. We provide:",
        "• Liability coverage",
        "• Compensation",
        "• Fully managed logistics",
      ],
    },
    {
      question: "What's the long term vision?",
      answer:
        "Creating the heli-skiing experience for skydiving–landing on private luxury lodges in remote areas and having an exclusive retreat style skydiving experience.",
    },
  ];

  const renderAnswer = (answer: string | string[]) => {
    if (Array.isArray(answer)) {
      return answer.map((line, index) => (
        <p
          key={index}
          className={
            line === "" ? "mb-4" : "mb-2 leading-relaxed text-gray-100"
          }
        >
          {line}
        </p>
      ));
    }
    return <p className="leading-relaxed text-gray-100">{answer}</p>;
  };

  return (
    <div className="relative z-10 min-h-screen text-white">
      {/* Hero Section */}
      <section className="relative z-20 flex min-h-[60vh] items-center justify-center">
        <div className="absolute inset-0 z-10" />

        <div className="relative z-30 mx-auto max-w-4xl px-6 text-center">
          <h1 className="mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-5xl leading-tight font-bold text-transparent md:text-7xl">
            FAQ
          </h1>

          <p className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-100 md:text-2xl">
            Everything you need to know about the MyDive experience
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-20 px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:bg-white/10"
              >
                <button
                  onClick={() =>
                    setOpenQuestion(openQuestion === index ? -1 : index)
                  }
                  className="group flex w-full items-center justify-between p-6 text-left"
                >
                  <h3 className="text-xl font-semibold text-white transition-colors duration-300 group-hover:text-blue-400">
                    {faq.question}
                  </h3>
                  <div
                    className={`transform transition-transform duration-300 ${openQuestion === index ? "rotate-180" : ""}`}
                  >
                    <svg
                      className="h-6 w-6 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openQuestion === index
                      ? "max-h-96 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-6 pt-0 pb-6">
                    <div className="border-t border-white/10 pt-4">
                      {renderAnswer(faq.answer)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-20 px-6 py-16 text-center backdrop-blur-sm">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-6 text-3xl font-bold text-white md:text-5xl">
            Ready to Experience{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Skydiving 2.0
            </span>
            ?
          </h2>
          <p className="mb-10 text-xl leading-relaxed text-gray-100">
            {`Have more questions? Get in touch and let's plan your adventure.`}
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
                router.push("about-us");
              }}
              className="group relative overflow-hidden rounded-full border-2 border-white/30 px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:border-white/50 hover:bg-white/10"
            >
              <span className="relative z-10">About Us</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
