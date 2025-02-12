-- DropForeignKey
ALTER TABLE "CredentialStoreSharing" DROP CONSTRAINT "CredentialStoreSharing_credential_id_fkey";

-- AddForeignKey
ALTER TABLE "CredentialStoreSharing" ADD CONSTRAINT "CredentialStoreSharing_credential_id_fkey" FOREIGN KEY ("credential_id") REFERENCES "CredentialStore"("id") ON DELETE CASCADE ON UPDATE CASCADE;
