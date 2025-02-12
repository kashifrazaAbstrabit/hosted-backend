/*
  Warnings:

  - You are about to drop the column `is_shared` on the `CredentialStore` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CredentialStore" DROP COLUMN "is_shared";
