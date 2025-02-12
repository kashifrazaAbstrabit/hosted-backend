/*
  Warnings:

  - You are about to drop the column `drive_folder_id` on the `UserOAuth` table. All the data in the column will be lost.
  - You are about to drop the column `google_refresh_token` on the `UserOAuth` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserOAuth" DROP COLUMN "drive_folder_id",
DROP COLUMN "google_refresh_token";

-- CreateTable
CREATE TABLE "UserIntegration" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "google_refresh_token" TEXT,
    "drive_folder_id" TEXT,
    "github_access_token" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserIntegration_user_id_idx" ON "UserIntegration"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserIntegration_user_id_key" ON "UserIntegration"("user_id");

-- AddForeignKey
ALTER TABLE "UserIntegration" ADD CONSTRAINT "UserIntegration_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
