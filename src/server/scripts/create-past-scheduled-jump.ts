import {
  PrismaClient,
  SchedulingMethod,
  ScheduledJumpStatus,
  BookingZone,
} from "@prisma/client";

const prisma = new PrismaClient();

async function createScheduledJump() {
  try {
    // First, you'll need an existing BookingWindow
    // If you don't have one, create it first:
    const bookingWindow = await prisma.bookingWindow.create({
      data: {
        bookingZone: BookingZone.MAMMOTH, // adjust as needed
        numJumpers: 4,
        windowStartDate: new Date("2025-09-01"),
        windowEndDate: new Date("2025-09-04"),
        idealizedJumpDate: new Date("2025-09-15"),
        depositPaid: true,
        depositPaidAt: new Date(),
        bookedBy: "user_32hXIL7Bw8270idbyGXyBcajkSr",
        status: "SCHEDULED",
      },
    });

    // Create the scheduled jump
    const scheduledJump = await prisma.scheduledJump.create({
      data: {
        jumpDate: new Date("2025-09-15T10:00:00"), // Set your desired date/time in September
        bookingZone: BookingZone.MAMMOTH, // adjust as needed
        numJumpers: 4,
        schedulingMethod: SchedulingMethod.BOOKING_WINDOW,
        associatedBookingId: bookingWindow.id,
        bookedBy: "user_32hXIL7Bw8270idbyGXyBcajkSr",
        confirmedBy: "user_32eE5xdmek4Y8MQcvwa6pQDRLod",
        status: ScheduledJumpStatus.SCHEDULED,
      },
    });

    console.log("Scheduled jump created:", scheduledJump);
    return scheduledJump;
  } catch (error) {
    console.error("Error creating scheduled jump:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

await createScheduledJump();
