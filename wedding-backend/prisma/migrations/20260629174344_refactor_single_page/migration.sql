/*
  Warnings:

  - You are about to drop the column `page_id` on the `card_blocks` table. All the data in the column will be lost.
  - You are about to drop the column `event_id` on the `rsvp_responses` table. All the data in the column will be lost.
  - You are about to drop the column `page_id` on the `template_blocks` table. All the data in the column will be lost.
  - You are about to drop the column `canvas_height` on the `templates` table. All the data in the column will be lost.
  - You are about to drop the `card_pages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `template_pages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `wedding_events` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `card_id` to the `card_blocks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `template_id` to the `template_blocks` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "card_blocks" DROP CONSTRAINT "card_blocks_page_id_fkey";

-- DropForeignKey
ALTER TABLE "card_pages" DROP CONSTRAINT "card_pages_card_id_fkey";

-- DropForeignKey
ALTER TABLE "rsvp_responses" DROP CONSTRAINT "rsvp_responses_event_id_fkey";

-- DropForeignKey
ALTER TABLE "template_blocks" DROP CONSTRAINT "template_blocks_page_id_fkey";

-- DropForeignKey
ALTER TABLE "template_pages" DROP CONSTRAINT "template_pages_template_id_fkey";

-- DropForeignKey
ALTER TABLE "wedding_events" DROP CONSTRAINT "wedding_events_card_id_fkey";

-- DropIndex
DROP INDEX "card_blocks_page_id_z_index_idx";

-- DropIndex
DROP INDEX "template_blocks_page_id_z_index_idx";

-- AlterTable
ALTER TABLE "card_blocks" DROP COLUMN "page_id",
ADD COLUMN     "card_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "cards" ADD COLUMN     "background" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "rsvp_responses" DROP COLUMN "event_id";

-- AlterTable
ALTER TABLE "template_blocks" DROP COLUMN "page_id",
ADD COLUMN     "template_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "templates" DROP COLUMN "canvas_height",
ADD COLUMN     "background" JSONB NOT NULL DEFAULT '{}';

-- DropTable
DROP TABLE "card_pages";

-- DropTable
DROP TABLE "template_pages";

-- DropTable
DROP TABLE "wedding_events";

-- DropEnum
DROP TYPE "PageType";

-- CreateIndex
CREATE INDEX "card_blocks_card_id_z_index_idx" ON "card_blocks"("card_id", "z_index");

-- CreateIndex
CREATE INDEX "template_blocks_template_id_z_index_idx" ON "template_blocks"("template_id", "z_index");

-- AddForeignKey
ALTER TABLE "template_blocks" ADD CONSTRAINT "template_blocks_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_blocks" ADD CONSTRAINT "card_blocks_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
