/*
  Warnings:

  - You are about to drop the column `id_user` on the `tb_transaksi` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[qr_token]` on the table `tb_transaksi` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[referensi_pembayaran]` on the table `tb_transaksi` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id_user_masuk` to the `tb_transaksi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `qr_token` to the `tb_transaksi` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `tb_transaksi` DROP FOREIGN KEY `tb_transaksi_id_user_fkey`;

-- DropIndex
DROP INDEX `tb_transaksi_id_user_fkey` ON `tb_transaksi`;

-- AlterTable
ALTER TABLE `tb_transaksi` DROP COLUMN `id_user`,
    ADD COLUMN `id_user_keluar` INTEGER NULL,
    ADD COLUMN `id_user_masuk` INTEGER NOT NULL,
    ADD COLUMN `qr_token` VARCHAR(64) NOT NULL,
    ADD COLUMN `referensi_pembayaran` VARCHAR(100) NULL,
    ADD COLUMN `waktu_bayar` DATETIME(3) NULL,
    MODIFY `status_pembayaran` ENUM('belum_bayar', 'menunggu', 'lunas', 'gagal', 'kedaluwarsa') NOT NULL DEFAULT 'belum_bayar';

-- CreateIndex
CREATE UNIQUE INDEX `tb_transaksi_qr_token_key` ON `tb_transaksi`(`qr_token`);

-- CreateIndex
CREATE UNIQUE INDEX `tb_transaksi_referensi_pembayaran_key` ON `tb_transaksi`(`referensi_pembayaran`);

-- AddForeignKey
ALTER TABLE `tb_transaksi` ADD CONSTRAINT `tb_transaksi_id_user_masuk_fkey` FOREIGN KEY (`id_user_masuk`) REFERENCES `tb_user`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_transaksi` ADD CONSTRAINT `tb_transaksi_id_user_keluar_fkey` FOREIGN KEY (`id_user_keluar`) REFERENCES `tb_user`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;
