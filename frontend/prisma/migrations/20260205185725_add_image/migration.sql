/*
  Warnings:

  - The primary key for the `produtos_historico` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "produtos_historico" DROP CONSTRAINT "produtos_historico_pkey",
ADD COLUMN     "image" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "produtos_historico_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "produtos_historico_id_seq";
