/*
  Warnings:

  - The `priceTarget` column on the `produtos_historico` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[url]` on the table `produtos_historico` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `price` to the `produtos_historico` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "produtos_historico" ALTER COLUMN "currency" SET DEFAULT 'BRL',
DROP COLUMN "price",
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL,
DROP COLUMN "priceTarget",
ADD COLUMN     "priceTarget" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "PriceHistory" (
    "id" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "productId" TEXT NOT NULL,

    CONSTRAINT "PriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PriceHistory_productId_createdAt_idx" ON "PriceHistory"("productId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "produtos_historico_url_key" ON "produtos_historico"("url");

-- AddForeignKey
ALTER TABLE "PriceHistory" ADD CONSTRAINT "PriceHistory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "produtos_historico"("id") ON DELETE CASCADE ON UPDATE CASCADE;
