import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function findManyBookings() {
  try {
    // Check all available models
    console.log("Available models:", Object.keys(db));
    await db.booking.findMany();
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await db.$disconnect();
  }
}

await findManyBookings();
