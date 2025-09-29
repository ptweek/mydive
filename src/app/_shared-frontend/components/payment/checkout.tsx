"use client";

import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useRouter } from "next/navigation";

import { fetchClientSecret } from "src/server/businessLogic/stripe";

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY not found!");
}
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
);

export default function Checkout() {
  const router = useRouter();
  return (
    <EmbeddedCheckoutProvider
      stripe={stripePromise}
      options={{
        fetchClientSecret: () => fetchClientSecret(),
        onComplete: () => {
          router.push("/");
        },
      }}
    >
      <div
        style={{
          overflow: "auto",
          position: "relative",
        }}
      >
        <EmbeddedCheckout />
      </div>
    </EmbeddedCheckoutProvider>
  );
}
