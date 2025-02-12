/*
  Warnings:

  - Added the required column `google_refresh_token` to the `UserOAuth` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserOAuth" ADD COLUMN     "google_refresh_token" TEXT NOT NULL;
