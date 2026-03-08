/*
  Warnings:

  - The primary key for the `session` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `verification` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Made the column `terms` on table `user` required. This step will fail if there are existing NULL values in that column.
  - Made the column `emailVerified` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "session" DROP CONSTRAINT "session_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "session_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "session_id_seq";

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "terms" SET NOT NULL,
ALTER COLUMN "emailVerified" SET NOT NULL;

-- AlterTable
ALTER TABLE "verification" DROP CONSTRAINT "verification_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "verification_pkey" PRIMARY KEY ("id");
