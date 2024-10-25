/*
  Warnings:

  - Added the required column `email` to the `ResetToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ResetToken" ADD COLUMN     "email" TEXT NOT NULL;
