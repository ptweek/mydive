/*
  Warnings:

  - The values [MAMMOTH_LAKES] on the enum `BookingZone` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BookingZone_new" AS ENUM ('DEFAULT', 'MAMMOTH', 'LAKE_ISABELLA', 'MOUNT_SHASTA', 'GOLD_BEACH', 'CRATER_LAKE', 'LEAVENWORTH', 'MOUNT_RAINIER_FOOTHILLS', 'SUN_VALLEY', 'JACKSON_HOLE', 'BIG_SKY', 'MOAB', 'ZION', 'PAGE', 'FLORIDA_KEYS', 'OUTER_BANKS');
ALTER TABLE "BookingWindow" ALTER COLUMN "bookingZone" TYPE "BookingZone_new" USING ("bookingZone"::text::"BookingZone_new");
ALTER TABLE "ScheduledJump" ALTER COLUMN "bookingZone" TYPE "BookingZone_new" USING ("bookingZone"::text::"BookingZone_new");
ALTER TYPE "BookingZone" RENAME TO "BookingZone_old";
ALTER TYPE "BookingZone_new" RENAME TO "BookingZone";
DROP TYPE "public"."BookingZone_old";
COMMIT;
