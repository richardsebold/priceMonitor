-- AlterTable
ALTER TABLE "user" ADD COLUMN     "planId" TEXT,
ADD COLUMN     "subscriptionEnd" TIMESTAMP(3),
ADD COLUMN     "subscriptionStatus" TEXT NOT NULL DEFAULT 'FREE';

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
