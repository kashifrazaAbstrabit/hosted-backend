/*
  Warnings:

  - You are about to drop the `ProjectFile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProjectFile" DROP CONSTRAINT "ProjectFile_project_id_fkey";

-- DropTable
DROP TABLE "ProjectFile";
