/*
  Warnings:

  - You are about to drop the column `user_id` on the `CredentialStore` table. All the data in the column will be lost.
  - You are about to drop the column `is_shared` on the `FileStore` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `FileStore` table. All the data in the column will be lost.
  - Added the required column `owner_id` to the `CredentialStore` table without a default value. This is not possible if the table is not empty.
  - Added the required column `owner_id` to the `FileStore` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CredentialStore" DROP CONSTRAINT "CredentialStore_user_id_fkey";

-- DropForeignKey
ALTER TABLE "FileStore" DROP CONSTRAINT "FileStore_user_id_fkey";

-- AlterTable
ALTER TABLE "CredentialStore" DROP COLUMN "user_id",
ADD COLUMN     "owner_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "FileStore" DROP COLUMN "is_shared",
DROP COLUMN "user_id",
ADD COLUMN     "owner_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "CredentialStoreSharing" (
    "id" SERIAL NOT NULL,
    "credential_id" INTEGER NOT NULL,
    "shared_with_id" INTEGER NOT NULL,

    CONSTRAINT "CredentialStoreSharing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileStoreSharing" (
    "id" SERIAL NOT NULL,
    "file_id" INTEGER NOT NULL,
    "shared_with_id" INTEGER NOT NULL,

    CONSTRAINT "FileStoreSharing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CredentialStoreSharing_shared_with_id_idx" ON "CredentialStoreSharing"("shared_with_id");

-- CreateIndex
CREATE UNIQUE INDEX "CredentialStoreSharing_credential_id_shared_with_id_key" ON "CredentialStoreSharing"("credential_id", "shared_with_id");

-- CreateIndex
CREATE INDEX "FileStoreSharing_shared_with_id_idx" ON "FileStoreSharing"("shared_with_id");

-- CreateIndex
CREATE UNIQUE INDEX "FileStoreSharing_file_id_shared_with_id_key" ON "FileStoreSharing"("file_id", "shared_with_id");

-- AddForeignKey
ALTER TABLE "CredentialStore" ADD CONSTRAINT "CredentialStore_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CredentialStoreSharing" ADD CONSTRAINT "CredentialStoreSharing_credential_id_fkey" FOREIGN KEY ("credential_id") REFERENCES "CredentialStore"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CredentialStoreSharing" ADD CONSTRAINT "CredentialStoreSharing_shared_with_id_fkey" FOREIGN KEY ("shared_with_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileStore" ADD CONSTRAINT "FileStore_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileStoreSharing" ADD CONSTRAINT "FileStoreSharing_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "FileStore"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileStoreSharing" ADD CONSTRAINT "FileStoreSharing_shared_with_id_fkey" FOREIGN KEY ("shared_with_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
