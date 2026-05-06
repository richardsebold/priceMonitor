/*
  Warnings:

  - A unique constraint covering the columns `[abacatepayProductId]` on the table `Plan` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[abacatepaySubscriptionId]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "abacatepayProductId" TEXT,
ADD COLUMN     "cycle" TEXT NOT NULL DEFAULT 'MONTHLY';

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "abacatepaySubscriptionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Plan_abacatepayProductId_key" ON "Plan"("abacatepayProductId");

-- CreateIndex
CREATE UNIQUE INDEX "user_abacatepaySubscriptionId_key" ON "user"("abacatepaySubscriptionId");
