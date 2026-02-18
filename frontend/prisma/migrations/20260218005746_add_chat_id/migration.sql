/*
  Warnings:

  - A unique constraint covering the columns `[chatId]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "chatId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_chatId_key" ON "user"("chatId");
