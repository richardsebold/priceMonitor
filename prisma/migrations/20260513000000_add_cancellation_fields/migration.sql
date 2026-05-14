-- AlterTable
ALTER TABLE "user" ADD COLUMN     "subscriptionStart" TIMESTAMP(3),
ADD COLUMN     "cancellationReason" TEXT,
ADD COLUMN     "cancellationComment" TEXT,
ADD COLUMN     "refundRequested" BOOLEAN NOT NULL DEFAULT false;
