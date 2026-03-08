/*
  Warnings:

  - Made the column `priceTarget` on table `produtos_historico` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "produtos_historico" ALTER COLUMN "priceTarget" SET NOT NULL;
