/*
  Warnings:

  - You are about to drop the `user_integrations` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_integrations" DROP CONSTRAINT "user_integrations_user_id_fkey";

-- DropTable
DROP TABLE "user_integrations";

-- CreateTable
CREATE TABLE "UserIntegration" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "google_refresh_token" TEXT,
    "drive_folder_id" TEXT,
    "github_access_token" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_id" ON "UserIntegration"("userId");

-- CreateIndex
CREATE INDEX "UserIntegration_userId_idx" ON "UserIntegration"("userId");

-- AddForeignKey
ALTER TABLE "UserIntegration" ADD CONSTRAINT "UserIntegration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
