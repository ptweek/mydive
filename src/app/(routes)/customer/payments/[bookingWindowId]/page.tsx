import { api, HydrateClient } from "mydive/trpc/server";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import PageHeader from "mydive/app/_shared-frontend/components/headers/PageHeader";
import PaymentClient from "./client-page";

function parseIntSafe(value: string): number | null {
  const parsed = parseInt(value, 10);

  // Check if it's a valid integer
  if (isNaN(parsed)) {
    return null;
  }

  // Optional: Check if the original string matches the parsed value
  // This catches cases like "123abc" which parseInt would parse as 123
  if (parsed.toString() !== value.trim()) {
    return null;
  }

  return parsed;
}

export default async function PaymentsPage({
  params,
}: {
  params: { bookingWindowId: string };
}) {
  const { bookingWindowId } = params;
  const bookingWindowInput = parseIntSafe(bookingWindowId);
  const user = await currentUser();
  console.log("user", user);
  console.log("bookingWindowInput", bookingWindowInput);
  if (!user || !bookingWindowInput) {
    redirect("/");
  }
  const { bookingWindow } =
    await api.customerPayments.getUnpaidBookingWindowByIdAndUser({
      bookedBy: user.id,
      bookingWindowId: bookingWindowInput,
    });
  return (
    <HydrateClient>
      <div
        id="page-elements"
        className="mx-auto w-[90%] space-y-5 pt-2 sm:w-3/4"
        style={{ height: "calc(100vh - 80px)" }}
      >
        <PageHeader
          title={"Review Pending Payment"}
          description={"Put down deposit to confirm booking window"}
        />
        {!bookingWindow ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
              <svg
                className="h-6 w-6 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-amber-900">
              Payment Not Found
            </h3>
            <p className="text-amber-800">
              No unpaid booking window found for ID:{" "}
              <span className="font-mono font-semibold">{bookingWindowId}</span>
            </p>
            <p className="mt-2 text-sm text-amber-700">
              {`This payment may have already been completed, this booking window is not under your user acccount, or the booking window does not exist.`}
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <PaymentClient bookingWindow={bookingWindow} />
          </div>
        )}
      </div>
    </HydrateClient>
  );
}
