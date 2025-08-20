/*
  Warnings:

  - You are about to drop the column `user_id` on the `payment` table. All the data in the column will be lost.
  - Made the column `registration_id` on table `payment` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `payment` DROP FOREIGN KEY `payment_registration_id_fkey`;

-- DropForeignKey
ALTER TABLE `payment` DROP FOREIGN KEY `payment_user_id_fkey`;

-- DropIndex
DROP INDEX `payment_user_id_idx` ON `payment`;

-- AlterTable
ALTER TABLE `payment` DROP COLUMN `user_id`,
    MODIFY `registration_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `payment` ADD CONSTRAINT `payment_registration_id_fkey` FOREIGN KEY (`registration_id`) REFERENCES `registration`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `payment` RENAME INDEX `payment_registration_id_fkey` TO `payment_registration_id_idx`;
