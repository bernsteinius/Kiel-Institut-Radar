-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "participants" TEXT[] DEFAULT ARRAY[]::TEXT[];
