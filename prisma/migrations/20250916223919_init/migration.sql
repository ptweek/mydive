-- CreateTable
CREATE TABLE "BookingWindow" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "bookingZone" TEXT NOT NULL,
    "numJumpers" INTEGER NOT NULL,
    "windowStartDate" DATETIME NOT NULL,
    "windowEndDate" DATETIME NOT NULL,
    "idealizedJumpDate" DATETIME NOT NULL,
    "bookedBy" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ScheduledJump" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "jumpDate" DATETIME NOT NULL,
    "bookingZone" TEXT NOT NULL,
    "numJumpers" INTEGER NOT NULL,
    "associatedBookingId" INTEGER NOT NULL,
    "associatedWaitlistId" INTEGER,
    "bookedBy" TEXT NOT NULL,
    "confirmedBy" TEXT NOT NULL,
    CONSTRAINT "ScheduledJump_associatedBookingId_fkey" FOREIGN KEY ("associatedBookingId") REFERENCES "BookingWindow" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ScheduledJump_associatedWaitlistId_fkey" FOREIGN KEY ("associatedWaitlistId") REFERENCES "Waitlist" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Waitlist" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "status" TEXT NOT NULL DEFAULT 'OPENED',
    "day" DATETIME NOT NULL,
    "associatedBookingId" INTEGER NOT NULL,
    CONSTRAINT "Waitlist_associatedBookingId_fkey" FOREIGN KEY ("associatedBookingId") REFERENCES "BookingWindow" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WaitlistEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "waitlistId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WaitlistEntry_waitlistId_fkey" FOREIGN KEY ("waitlistId") REFERENCES "Waitlist" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "BookingWindow_bookedBy_idx" ON "BookingWindow"("bookedBy");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduledJump_associatedWaitlistId_key" ON "ScheduledJump"("associatedWaitlistId");

-- CreateIndex
CREATE INDEX "ScheduledJump_jumpDate_idx" ON "ScheduledJump"("jumpDate");

-- CreateIndex
CREATE UNIQUE INDEX "Waitlist_day_key" ON "Waitlist"("day");

-- CreateIndex
CREATE UNIQUE INDEX "WaitlistEntry_waitlistId_position_key" ON "WaitlistEntry"("waitlistId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "WaitlistEntry_waitlistId_userId_key" ON "WaitlistEntry"("waitlistId", "userId");
