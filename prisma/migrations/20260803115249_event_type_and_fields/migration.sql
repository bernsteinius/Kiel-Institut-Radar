-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('MEETING', 'SUMMIT', 'DECISION', 'EVENT', 'PUBLICATION', 'DEADLINE');

-- CreateEnum
CREATE TYPE "EventPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "ConfirmationStatus" AS ENUM ('CONFIRMED', 'TENTATIVE');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "confirmationStatus" "ConfirmationStatus" NOT NULL DEFAULT 'CONFIRMED',
ADD COLUMN     "institutions" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "priority" "EventPriority" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "type" "EventType" NOT NULL DEFAULT 'EVENT';
