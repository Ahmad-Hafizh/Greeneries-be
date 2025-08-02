/*
  Warnings:

  - Added the required column `province` to the `address` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "address" ADD COLUMN     "province" TEXT NOT NULL;
