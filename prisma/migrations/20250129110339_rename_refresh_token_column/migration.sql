/*
  Warnings:

  - You are about to drop the column `refreshtoken` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "refreshtoken",
ADD COLUMN     "refresh_token" TEXT;
