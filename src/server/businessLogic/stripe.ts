"use server";

import { headers } from "next/headers";
import { stripe } from "../../lib/stripe";

export async function fetchClientSecret({
  bookingWindowId,
}: {
  bookingWindowId: number;
}) {
  const origin = (await headers()).get("origin");

  // Create Checkout Sessions from body params.
  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    line_items: [
      {
        price: "price_1SIffpHSdgsUuMyQSycQwB0f",
        quantity: 1,
      },
    ],
    metadata: { bookingWindowId },
    mode: "payment",
    return_url: `${origin}/customer/manage-booking-requests`,
  });
  if (!session.client_secret) {
    throw new Error("Client secret fetch has failed");
  }
  return session.client_secret;
}
