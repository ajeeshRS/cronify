/*
  Warnings:

  - You are about to drop the column `nextEvents` on the `CronJob` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CronJob" DROP COLUMN "nextEvents",
ADD COLUMN     "isFailed" BOOLEAN NOT NULL DEFAULT false;
