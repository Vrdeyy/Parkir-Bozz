-- CreateTable
CREATE TABLE `tb_user` (
    `id_user` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_lengkap` VARCHAR(50) NOT NULL,
    `username` VARCHAR(50) NOT NULL,
    `password` VARCHAR(100) NOT NULL,
    `role` ENUM('admin', 'petugas', 'owner') NOT NULL,
    `status_aktif` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `tb_user_username_key`(`username`),
    PRIMARY KEY (`id_user`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_jenis_kendaraan` (
    `id_jenis` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_jenis` VARCHAR(30) NOT NULL,

    UNIQUE INDEX `tb_jenis_kendaraan_nama_jenis_key`(`nama_jenis`),
    PRIMARY KEY (`id_jenis`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_tarif` (
    `id_tarif` INTEGER NOT NULL AUTO_INCREMENT,
    `id_jenis` INTEGER NOT NULL,
    `tarif_per_jam` DECIMAL(10, 0) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tb_tarif_id_jenis_key`(`id_jenis`),
    PRIMARY KEY (`id_tarif`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_area_parkir` (
    `id_area` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_area` VARCHAR(50) NOT NULL,
    `kapasitas` INTEGER NOT NULL,
    `terisi` INTEGER NOT NULL DEFAULT 0,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id_area`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_kendaraan` (
    `id_kendaraan` INTEGER NOT NULL AUTO_INCREMENT,
    `plat_nomor` VARCHAR(15) NOT NULL,
    `id_jenis` INTEGER NOT NULL,
    `warna` VARCHAR(20) NULL,
    `pemilik` VARCHAR(100) NULL,
    `id_user` INTEGER NULL,

    UNIQUE INDEX `tb_kendaraan_plat_nomor_key`(`plat_nomor`),
    INDEX `tb_kendaraan_id_jenis_idx`(`id_jenis`),
    PRIMARY KEY (`id_kendaraan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_transaksi` (
    `id_transaksi` INTEGER NOT NULL AUTO_INCREMENT,
    `kode_transaksi` VARCHAR(50) NOT NULL,
    `id_kendaraan` INTEGER NOT NULL,
    `waktu_masuk` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `waktu_keluar` DATETIME(3) NULL,
    `id_tarif` INTEGER NOT NULL,
    `id_user` INTEGER NOT NULL,
    `id_area` INTEGER NOT NULL,
    `tarif_per_jam_snapshot` DECIMAL(10, 0) NOT NULL,
    `durasi_jam` INTEGER NOT NULL DEFAULT 0,
    `biaya_total` DECIMAL(10, 0) NOT NULL DEFAULT 0,
    `status` ENUM('masuk', 'keluar') NOT NULL DEFAULT 'masuk',
    `metode_pembayaran` ENUM('tunai', 'non_tunai') NULL,
    `status_pembayaran` ENUM('belum_bayar', 'lunas') NOT NULL DEFAULT 'belum_bayar',
    `jumlah_bayar` DECIMAL(10, 0) NULL,
    `kembalian` DECIMAL(10, 0) NULL,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tb_transaksi_kode_transaksi_key`(`kode_transaksi`),
    INDEX `tb_transaksi_status_id_area_idx`(`status`, `id_area`),
    INDEX `tb_transaksi_id_kendaraan_status_idx`(`id_kendaraan`, `status`),
    INDEX `tb_transaksi_waktu_masuk_idx`(`waktu_masuk`),
    PRIMARY KEY (`id_transaksi`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_log_aktivitas` (
    `id_log` INTEGER NOT NULL AUTO_INCREMENT,
    `id_user` INTEGER NOT NULL,
    `aktivitas` VARCHAR(100) NOT NULL,
    `waktu_aktivitas` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_log`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tb_tarif` ADD CONSTRAINT `tb_tarif_id_jenis_fkey` FOREIGN KEY (`id_jenis`) REFERENCES `tb_jenis_kendaraan`(`id_jenis`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_kendaraan` ADD CONSTRAINT `tb_kendaraan_id_jenis_fkey` FOREIGN KEY (`id_jenis`) REFERENCES `tb_jenis_kendaraan`(`id_jenis`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_kendaraan` ADD CONSTRAINT `tb_kendaraan_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `tb_user`(`id_user`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_transaksi` ADD CONSTRAINT `tb_transaksi_id_kendaraan_fkey` FOREIGN KEY (`id_kendaraan`) REFERENCES `tb_kendaraan`(`id_kendaraan`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_transaksi` ADD CONSTRAINT `tb_transaksi_id_tarif_fkey` FOREIGN KEY (`id_tarif`) REFERENCES `tb_tarif`(`id_tarif`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_transaksi` ADD CONSTRAINT `tb_transaksi_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `tb_user`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_transaksi` ADD CONSTRAINT `tb_transaksi_id_area_fkey` FOREIGN KEY (`id_area`) REFERENCES `tb_area_parkir`(`id_area`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_log_aktivitas` ADD CONSTRAINT `tb_log_aktivitas_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `tb_user`(`id_user`) ON DELETE CASCADE ON UPDATE CASCADE;

