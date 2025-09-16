import { PrismaClient } from "@prisma/client";

// Test if Prisma knows about the relations
const testQuery = async () => {
  const prisma = new PrismaClient();
  const result = await prisma.bookingWindow.findFirst({
    include: {
      scheduledJumpDates: true,
      waitlists: true,
    },
  });

  // This should show scheduledJumpDates and waitlists in autocomplete
  console.log(result?.scheduledJumpDates);
  console.log(result?.waitlists);
};

await testQuery();
