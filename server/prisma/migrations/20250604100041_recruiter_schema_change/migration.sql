/*
  Warnings:

  - Added the required column `position` to the `Recruiter` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Recruiter" ADD COLUMN     "position" TEXT NOT NULL;
