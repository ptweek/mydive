// src/server/businessLogic/stripe-webhooks.ts
import type Stripe from "stripe";
import type { Logger } from "pino";
import { BookingWindowService } from "src/server/services/bookingWindow";
import { db } from "src/server/db";
import { parseIntSafe } from "mydive/app/(routes)/customer/payments/[bookingWindowId]/page";

export async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  log: Logger,
) {
  const { bookingWindowId } = session.metadata ?? {};

  if (!bookingWindowId) {
    log.error(
      {
        errorType: "missing_metadata",
        sessionId: session.id,
        metadata: session.metadata,
      },
      "Missing required metadata for booking",
    );
    throw new Error("Missing required metadata");
  }
  const id = parseIntSafe(bookingWindowId);
  if (!id) {
    log.error(
      {
        errorType: "id_incorrect_type",
        sessionId: session.id,
        metadata: session.metadata,
      },
      "Booking window incorrect type, should be safely parsed into an int",
    );
    throw new Error("Incorrect booking window type");
  }

  if (session.payment_status !== "paid") {
    log.info(
      { sessionId: session.id, paymentStatus: session.payment_status },
      "Checkout session not paid, skipping booking creation",
    );
    return;
  }

  log.info(
    {
      sessionId: session.id,
      bookingWindowId,
    },
    "Updating booking for deposit info from webhook",
  );

  try {
    const svc = new BookingWindowService(db);
    const booking = await svc.updateDepositInfoFromStripeCheckout(id, log);

    log.info(
      {
        sessionId: session.id,
        bookingId: booking.id,
      },
      "Deposit updated successfully",
    );

    return booking;
  } catch (err) {
    log.error(
      {
        errorType: "booking_deposit_update_failed",
        sessionId: session.id,
        bookingWindowId,

        error: err instanceof Error ? err.message : String(err),
      },
      "Failed to update booking deposit",
    );
    throw err;
  }
}
