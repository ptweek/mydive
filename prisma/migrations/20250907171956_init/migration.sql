-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Booking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "numJumpers" INTEGER NOT NULL,
    "windowStartDay" DATETIME NOT NULL,
    "windowEndDate" DATETIME NOT NULL,
    "idealizedJumpDay" DATETIME NOT NULL,
    "confirmedJumpDay" DATETIME,
    "createdById" TEXT NOT NULL
);
INSERT INTO "new_Booking" ("confirmedJumpDay", "createdAt", "createdById", "id", "idealizedJumpDay", "numJumpers", "updatedAt", "windowEndDate", "windowStartDay") SELECT "confirmedJumpDay", "createdAt", "createdById", "id", "idealizedJumpDay", "numJumpers", "updatedAt", "windowEndDate", "windowStartDay" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
CREATE INDEX "Booking_createdById_idx" ON "Booking"("createdById");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
