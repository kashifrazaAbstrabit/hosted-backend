/*
  Warnings:

  - Made the column `start_date` on table `Project` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "start_date" SET NOT NULL,
ALTER COLUMN "start_date" DROP DEFAULT;
