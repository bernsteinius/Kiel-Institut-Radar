-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "attachmentData" BYTEA,
ADD COLUMN     "attachmentFileName" TEXT,
ADD COLUMN     "attachmentFileType" TEXT;

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "category" "EventCategory" NOT NULL DEFAULT 'OTHER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);
