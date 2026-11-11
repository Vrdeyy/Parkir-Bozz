/*
  Warnings:

  - You are about to alter the column `durasi_jam` on the `tb_transaksi` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(5,1)`.

*/
-- AlterTable
ALTER TABLE `tb_transaksi` MODIFY `durasi_jam` DECIMAL(5, 1) NOT NULL DEFAULT 0;
