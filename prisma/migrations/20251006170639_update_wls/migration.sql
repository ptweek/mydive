/*
  Warnings:

  - The values [OPENED] on the enum `WaitlistStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "WaitlistStatus_new" AS ENUM ('OPEN', 'CLOSED', 'CONFIRMED');
ALTER TABLE "public"."Waitlist" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Waitlist" ALTER COLUMN "status" TYPE "WaitlistStatus_new" USING ("status"::text::"WaitlistStatus_new");
ALTER TYPE "WaitlistStatus" RENAME TO "WaitlistStatus_old";
ALTER TYPE "WaitlistStatus_new" RENAME TO "WaitlistStatus";
DROP TYPE "public"."WaitlistStatus_old";
ALTER TABLE "Waitlist" ALTER COLUMN "status" SET DEFAULT 'OPEN';
COMMIT;

-- AlterTable
ALTER TABLE "Waitlist" ALTER COLUMN "status" SET DEFAULT 'OPEN';
