-- CreateTable
CREATE TABLE "CredentialStore" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "notes" TEXT,
    "is_shared" BOOLEAN NOT NULL DEFAULT false,
    "user_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CredentialStore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileStore" (
    "id" SERIAL NOT NULL,
    "file_url" TEXT NOT NULL,
    "item_name" TEXT NOT NULL,
    "notes" TEXT,
    "is_shared" BOOLEAN NOT NULL DEFAULT false,
    "user_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FileStore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CredentialStore_username_key" ON "CredentialStore"("username");

-- AddForeignKey
ALTER TABLE "CredentialStore" ADD CONSTRAINT "CredentialStore_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CredentialStore" ADD CONSTRAINT "CredentialStore_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileStore" ADD CONSTRAINT "FileStore_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileStore" ADD CONSTRAINT "FileStore_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
