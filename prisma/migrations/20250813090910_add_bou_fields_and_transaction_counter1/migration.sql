/*
  Warnings:

  - A unique constraint covering the columns `[reference_number]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[system_unique_id]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `account_category_code` VARCHAR(5) NULL,
    ADD COLUMN `account_id` VARCHAR(20) NULL,
    ADD COLUMN `account_status` INTEGER NULL DEFAULT 0,
    ADD COLUMN `date_of_birth` BIGINT NULL,
    ADD COLUMN `nin_number` VARCHAR(20) NULL,
    ADD COLUMN `operation_type` INTEGER NULL DEFAULT 0,
    ADD COLUMN `reference_number` VARCHAR(30) NULL,
    ADD COLUMN `system_unique_id` VARCHAR(64) NULL,
    ADD COLUMN `transaction_timestamp` BIGINT NULL;

-- CreateTable
CREATE TABLE `daily_transaction_counter` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `counter` INTEGER NOT NULL DEFAULT 1,

    UNIQUE INDEX `daily_transaction_counter_date_key`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `user_reference_number_key` ON `user`(`reference_number`);

-- CreateIndex
CREATE UNIQUE INDEX `user_system_unique_id_key` ON `user`(`system_unique_id`);
