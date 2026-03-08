/*
  Warnings:

  - The `price` column on the `produtos_historico` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `priceTarget` column on the `produtos_historico` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "produtos_historico" DROP COLUMN "price",
ADD COLUMN     "price" INTEGER,
DROP COLUMN "priceTarget",
ADD COLUMN     "priceTarget" INTEGER;
