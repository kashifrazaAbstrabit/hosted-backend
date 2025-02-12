/*
  Warnings:

  - You are about to drop the `UserIntegration` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserIntegration" DROP CONSTRAINT "UserIntegration_user_id_fkey";

-- DropTable
DROP TABLE "UserIntegration";

-- CreateTable
CREATE TABLE "user_integrations" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "google_refresh_token" TEXT,
    "drive_folder_id" TEXT,
    "github_access_token" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_integration_user_id" ON "user_integrations"("user_id");

-- CreateIndex
CREATE INDEX "user_integrations_user_id_idx" ON "user_integrations"("user_id");

-- AddForeignKey
ALTER TABLE "user_integrations" ADD CONSTRAINT "user_integrations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
