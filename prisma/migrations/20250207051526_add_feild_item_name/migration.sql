/*
  Warnings:

  - Added the required column `item_name` to the `CredentialStore` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CredentialStore" ADD COLUMN     "item_name" TEXT NOT NULL;
