-- DropForeignKey
ALTER TABLE "FileStoreSharing" DROP CONSTRAINT "FileStoreSharing_file_id_fkey";

-- AddForeignKey
ALTER TABLE "FileStoreSharing" ADD CONSTRAINT "FileStoreSharing_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "FileStore"("id") ON DELETE CASCADE ON UPDATE CASCADE;
