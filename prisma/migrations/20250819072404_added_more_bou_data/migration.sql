/*
  Warnings:

  - You are about to drop the column `payment_date` on the `payment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[reference_number]` on the table `payment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `payment` DROP COLUMN `payment_date`,
    ADD COLUMN `emoney_issuer_code` VARCHAR(191) NULL,
    ADD COLUMN `entry_type` VARCHAR(191) NULL,
    ADD COLUMN `initiator_access_type` VARCHAR(191) NULL,
    ADD COLUMN `initiator_account_id` VARCHAR(191) NULL,
    ADD COLUMN `initiator_country_code` VARCHAR(191) NULL,
    ADD COLUMN `message_category` VARCHAR(191) NULL,
    ADD COLUMN `off_network` INTEGER NULL,
    ADD COLUMN `purpose_code` INTEGER NULL,
    ADD COLUMN `reference_number` VARCHAR(191) NULL,
    ADD COLUMN `second_party_account_id` VARCHAR(191) NULL,
    ADD COLUMN `second_party_country_code` VARCHAR(191) NULL,
    ADD COLUMN `status` VARCHAR(191) NULL DEFAULT 'pending',
    ADD COLUMN `transaction_datetime` DATETIME(3) NULL,
    ADD COLUMN `transfer_description` VARCHAR(191) NULL,
    ADD COLUMN `transfer_value` INTEGER NULL,
    MODIFY `amount` DOUBLE NULL,
    MODIFY `payment_method` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `liquidation_request` (
    `id` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `paymentMethod` VARCHAR(191) NOT NULL,
    `bankName` VARCHAR(191) NULL,
    `accountNumber` VARCHAR(191) NULL,
    `accountName` VARCHAR(191) NOT NULL,
    `mobileNumber` VARCHAR(191) NULL,
    `network` VARCHAR(191) NULL,
    `reason` VARCHAR(191) NOT NULL,
    `disbursementDate` DATETIME(3) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `requesterId` VARCHAR(191) NOT NULL,
    `requesterName` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `liquidation_request_requesterId_idx`(`requesterId`),
    INDEX `liquidation_request_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `payment_reference_number_key` ON `payment`(`reference_number`);

-- CreateIndex
CREATE INDEX `payment_reference_number_idx` ON `payment`(`reference_number`);
