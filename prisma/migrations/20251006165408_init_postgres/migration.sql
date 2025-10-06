-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING_DEPOSIT', 'UNSCHEDULED', 'SCHEDULED', 'COMPLETED', 'CANCELED');

-- CreateEnum
CREATE TYPE "WaitlistStatus" AS ENUM ('OPENED', 'CLOSED', 'CONFIRMED');

-- CreateEnum
CREATE TYPE "WaitlistEntryStatus" AS ENUM ('WAITING', 'SCHEDULED', 'CANCELED');

-- CreateEnum
CREATE TYPE "SchedulingMethod" AS ENUM ('BOOKING_WINDOW', 'WAITLIST');

-- CreateEnum
CREATE TYPE "ScheduledJumpStatus" AS ENUM ('SCHEDULED', 'CANCELED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "BookingZone" AS ENUM ('DEFAULT', 'MAMMOTH_LAKES');

-- CreateTable
CREATE TABLE "BookingWindow" (
    "id" SERIAL NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING_DEPOSIT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bookingZone" "BookingZone" NOT NULL,
    "numJumpers" INTEGER NOT NULL,
    "windowStartDate" TIMESTAMP(3) NOT NULL,
    "windowEndDate" TIMESTAMP(3) NOT NULL,
    "idealizedJumpDate" TIMESTAMP(3) NOT NULL,
    "depositPaid" BOOLEAN,
    "depositPaidAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "bookedBy" TEXT NOT NULL,

    CONSTRAINT "BookingWindow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledJump" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "ScheduledJumpStatus" NOT NULL DEFAULT 'SCHEDULED',
    "jumpDate" TIMESTAMP(3) NOT NULL,
    "bookingZone" "BookingZone" NOT NULL,
    "numJumpers" INTEGER NOT NULL,
    "schedulingMethod" "SchedulingMethod" NOT NULL,
    "associatedBookingId" INTEGER NOT NULL,
    "associatedWaitlistId" INTEGER,
    "bookedBy" TEXT NOT NULL,
    "confirmedBy" TEXT NOT NULL,

    CONSTRAINT "ScheduledJump_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Waitlist" (
    "id" SERIAL NOT NULL,
    "status" "WaitlistStatus" NOT NULL DEFAULT 'OPENED',
    "day" TIMESTAMP(3) NOT NULL,
    "associatedBookingId" INTEGER NOT NULL,

    CONSTRAINT "Waitlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaitlistEntry" (
    "id" SERIAL NOT NULL,
    "status" "WaitlistEntryStatus" NOT NULL DEFAULT 'WAITING',
    "waitlistId" INTEGER NOT NULL,
    "waitlistedUserId" TEXT NOT NULL,
    "latestPosition" INTEGER NOT NULL,
    "activePosition" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WaitlistEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BookingWindow_bookedBy_idx" ON "BookingWindow"("bookedBy");

-- CreateIndex
CREATE INDEX "ScheduledJump_jumpDate_idx" ON "ScheduledJump"("jumpDate");

-- CreateIndex
CREATE UNIQUE INDEX "Waitlist_day_key" ON "Waitlist"("day");

-- CreateIndex
CREATE UNIQUE INDEX "WaitlistEntry_waitlistId_activePosition_key" ON "WaitlistEntry"("waitlistId", "activePosition");

-- AddForeignKey
ALTER TABLE "ScheduledJump" ADD CONSTRAINT "ScheduledJump_associatedWaitlistId_fkey" FOREIGN KEY ("associatedWaitlistId") REFERENCES "Waitlist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledJump" ADD CONSTRAINT "ScheduledJump_associatedBookingId_fkey" FOREIGN KEY ("associatedBookingId") REFERENCES "BookingWindow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Waitlist" ADD CONSTRAINT "Waitlist_associatedBookingId_fkey" FOREIGN KEY ("associatedBookingId") REFERENCES "BookingWindow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaitlistEntry" ADD CONSTRAINT "WaitlistEntry_waitlistId_fkey" FOREIGN KEY ("waitlistId") REFERENCES "Waitlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
