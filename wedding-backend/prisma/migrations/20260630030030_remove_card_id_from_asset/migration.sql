/*
  Warnings:

  - You are about to drop the column `card_id` on the `assets` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "assets" DROP CONSTRAINT "assets_card_id_fkey";

-- DropIndex
DROP INDEX "assets_card_id_idx";

-- AlterTable
ALTER TABLE "assets" DROP COLUMN "card_id";
