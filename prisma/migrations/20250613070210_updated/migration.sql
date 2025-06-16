/*
  Warnings:

  - You are about to alter the column `district` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(20)`.
  - You are about to alter the column `t_shirt_size` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(5)`.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `accommodation` VARCHAR(20) NULL,
    ADD COLUMN `country` VARCHAR(50) NULL,
    ADD COLUMN `designation` VARCHAR(30) NULL,
    ADD COLUMN `dietary_needs` VARCHAR(20) NULL,
    MODIFY `district` VARCHAR(20) NULL,
    MODIFY `t_shirt_size` VARCHAR(5) NULL;
