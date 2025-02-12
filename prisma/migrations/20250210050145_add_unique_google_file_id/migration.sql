/*
  Warnings:

  - A unique constraint covering the columns `[google_file_id]` on the table `ProjectFile` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ProjectFile_google_file_id_key" ON "ProjectFile"("google_file_id");
