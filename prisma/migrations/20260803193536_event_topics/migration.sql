-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "topics" TEXT[] DEFAULT ARRAY[]::TEXT[];
