import { createLogger } from "mydive/lib/logger";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { handleCheckoutCompleted } from "mydive/server/businessLogic/stripeWebhooks";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  const log = createLogger("stripe-webhook", requestId);

  if (!webhookSecret) {
    log.error({ errorType: "configuration" }, "Webhook secret not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 },
    );
  }

  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");
  if (!signature) {
    log.error({ errorType: "configuration" }, "signature not accessed");
    return NextResponse.json(
      { error: "signature secret not access" },
      { status: 500 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    log.error(
      { errorType: "configuration" },
      "Webhook signature verification failed",
    );
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle the checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      await handleCheckoutCompleted(session, log);
    } catch (error) {
      console.error(
        "Failed to update booking with deposit information:",
        error,
      );
      log.error(
        { errorType: "failed_job" },
        "Failed to update booking window with deposit info",
      );
      return NextResponse.json(
        { error: "Invalid deposit update" },
        { status: 400 },
      );
    }
  }

  return NextResponse.json({ received: true });
}
