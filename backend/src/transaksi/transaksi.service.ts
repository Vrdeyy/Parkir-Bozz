
import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTransaksiDto } from './dto/create-transaksi.dto.js';
import { ProsesKeluarDto } from './dto/proses-keluar.dto.js';
import { PembayaranTunaiDto } from './dto/pembayaran-tunai.dto.js';

@Injectable()
export class TransaksiService {
    constructor(private readonly prisma: PrismaService) { }

    // ==========================================
    // 1. KENDARAAN MASUK
    // ==========================================

    async create(dto: CreateTransaksiDto, idUserMasuk: number) {
        try {
            return await this.prisma.$transaction(async (tx) => {
                // 1. Validasi petugas
                const petugas = await tx.user.findUnique({
                    where: { id_user: idUserMasuk },
                });

                if (!petugas || !petugas.status_aktif) {
                    throw new ForbiddenException(
                        'Petugas tidak aktif atau tidak ditemukan',
                    );
                }

                if (!['admin', 'petugas'].includes(petugas.role)) {
                    throw new ForbiddenException(
                        'Akses hanya untuk admin dan petugas',
                    );
                }

                // 2. Validasi jenis kendaraan
                const jenis = await tx.jenisKendaraan.findUnique({
                    where: { id_jenis: dto.id_jenis },
                });

                if (!jenis) {
                    throw new NotFoundException(
                        'Jenis kendaraan tidak ditemukan',
                    );
                }

                // 3. Ambil tarif berdasarkan jenis kendaraan
                const tarif = await tx.tarif.findUnique({
                    where: { id_jenis: dto.id_jenis },
                });

                if (!tarif) {
                    throw new BadRequestException(
                        'Tarif untuk jenis kendaraan ini belum tersedia',
                    );
                }

                // 4. Cari kendaraan berdasarkan plat nomor
                let kendaraan = await tx.kendaraan.findUnique({
                    where: { plat_nomor: dto.plat_nomor },
                });

                if (kendaraan) {
                    // Kunci baris kendaraan
                    await tx.$queryRaw`
                        SELECT id_kendaraan
                        FROM tb_kendaraan
                        WHERE id_kendaraan = ${kendaraan.id_kendaraan}
                        FOR UPDATE
                    `;

                    // Cek transaksi aktif menggunakan current read
                    const transaksiAktif = await tx.$queryRaw<
                        Array<{ id_transaksi: number }>
                    >`
                        SELECT id_transaksi
                        FROM tb_transaksi
                        WHERE id_kendaraan = ${kendaraan.id_kendaraan}
                          AND status = 'masuk'
                        LIMIT 1
                        FOR UPDATE
                    `;

                    if (transaksiAktif.length > 0) {
                        throw new ConflictException(
                            'Kendaraan masih memiliki transaksi parkir aktif',
                        );
                    }

                    // Perbarui data kendaraan lama
                    kendaraan = await tx.kendaraan.update({
                        where: {
                            id_kendaraan: kendaraan.id_kendaraan,
                        },
                        data: {
                            id_jenis: dto.id_jenis,
                            warna: dto.warna ?? kendaraan.warna,
                            pemilik: dto.pemilik ?? kendaraan.pemilik,
                        },
                    });
                } else {
                    // 5. Daftarkan kendaraan baru
                    kendaraan = await tx.kendaraan.create({
                        data: {
                            plat_nomor: dto.plat_nomor,
                            id_jenis: dto.id_jenis,
                            warna: dto.warna,
                            pemilik: dto.pemilik,
                        },
                    });
                }

                // 6. Tambah kapasitas secara atomik
                const areaUpdated = await tx.$executeRaw`
                    UPDATE tb_area_parkir
                    SET terisi = terisi + 1
                    WHERE id_area = ${dto.id_area}
                      AND status_aktif = 1
                      AND terisi < kapasitas
                `;

                if (areaUpdated !== 1) {
                    const area = await tx.areaParkir.findUnique({
                        where: { id_area: dto.id_area },
                    });

                    if (!area) {
                        throw new NotFoundException(
                            'Area parkir tidak ditemukan',
                        );
                    }

                    if (!area.status_aktif) {
                        throw new BadRequestException(
                            'Area parkir sedang tidak aktif',
                        );
                    }

                    throw new ConflictException(
                        'Kapasitas area parkir sudah penuh',
                    );
                }

                // 7. Generate identitas transaksi
                const kodeTransaksi =
                    `PKR-${Date.now()}-${randomBytes(4).toString('hex').toUpperCase()}`;

                const qrToken = randomBytes(32).toString('hex');

                // 8. Simpan transaksi
                const transaksi = await tx.transaksi.create({
                    data: {
                        kode_transaksi: kodeTransaksi,
                        qr_token: qrToken,

                        id_kendaraan: kendaraan.id_kendaraan,
                        id_tarif: tarif.id_tarif,
                        id_user_masuk: idUserMasuk,
                        id_area: dto.id_area,

                        tarif_per_jam_snapshot: tarif.tarif_per_jam,
                    },
                    include: {
                        kendaraan: {
                            include: {
                                jenis: true,
                            },
                        },
                        area: true,
                        tarif: true,
                        user_masuk: {
                            select: {
                                id_user: true,
                                nama_lengkap: true,
                            },
                        },
                    },
                });

                return {
                    message: 'Kendaraan berhasil masuk',
                    data: transaksi,
                };
            });
        } catch (error) {
            if (
                typeof error === 'object' &&
                error !== null &&
                'code' in error &&
                error.code === 'P2002'
            ) {
                throw new ConflictException(
                    'Plat nomor atau identitas transaksi mengalami duplikasi',
                );
            }

            throw error;
        }
    }

    // ==========================================
    // 2. SCAN QR DAN HITUNG TAGIHAN
    // ==========================================

    async prosesKeluar(dto: ProsesKeluarDto, idUser: number) {
        // 1. Validasi petugas
        const petugas = await this.prisma.user.findUnique({
            where: { id_user: idUser },
        });

        if (!petugas || !petugas.status_aktif) {
            throw new ForbiddenException(
                'Petugas tidak aktif atau tidak ditemukan',
            );
        }

        if (!['admin', 'petugas'].includes(petugas.role)) {
            throw new ForbiddenException(
                'Akses hanya untuk admin dan petugas',
            );
        }

        // 2. Cari transaksi berdasarkan QR token
        const transaksi = await this.prisma.transaksi.findUnique({
            where: { qr_token: dto.qr_token },
            include: {
                kendaraan: {
                    include: {
                        jenis: true,
                    },
                },
                area: true,
                tarif: true,
                user_masuk: {
                    select: {
                        id_user: true,
                        nama_lengkap: true,
                    },
                },
            },
        });

        if (!transaksi) {
            throw new NotFoundException(
                'Tiket parkir tidak ditemukan',
            );
        }

        if (transaksi.status !== 'masuk') {
            throw new ConflictException(
                'Transaksi sudah selesai',
            );
        }

        if (transaksi.status_pembayaran !== 'belum_bayar') {
            throw new ConflictException(
                'Status pembayaran transaksi tidak valid',
            );
        }

        // 3. Hitung durasi parkir
        const sekarang = new Date();

        const selisihMs =
            sekarang.getTime() - transaksi.waktu_masuk.getTime();

        if (selisihMs < 0) {
            throw new BadRequestException(
                'Waktu transaksi tidak valid',
            );
        }

        // Tarif dihitung setiap 30 menit
        // Minimal pembayaran adalah setengah tarif per jam
        const durasiMenit = selisihMs / (1000 * 60);

        const durasiJam = Math.max(
            0.5,
            Math.ceil(durasiMenit / 30) * 0.5,
        );

        // 4. Hitung tagihan menggunakan snapshot tarif
        const tarifPerJam = Number(
            transaksi.tarif_per_jam_snapshot,
        );

        const biayaTotal = durasiJam * tarifPerJam;

        return {
            message: 'Tagihan parkir berhasil dihitung',
            data: {
                id_transaksi: transaksi.id_transaksi,
                kode_transaksi: transaksi.kode_transaksi,
                kendaraan: transaksi.kendaraan,
                area: transaksi.area.nama_area,
                waktu_masuk: transaksi.waktu_masuk,
                estimasi_waktu_keluar: sekarang,
                durasi_jam: durasiJam,
                tarif_per_jam: tarifPerJam,
                biaya_total: biayaTotal,
                status: transaksi.status,
                status_pembayaran: transaksi.status_pembayaran,
            },
        };
    }

    // ==========================================
    // 3. PEMBAYARAN TUNAI
    // ==========================================

    async pembayaranTunai(
        dto: PembayaranTunaiDto,
        idUserKeluar: number,
    ) {
        return await this.prisma.$transaction(async (tx) => {
            // 1. Validasi petugas
            const petugas = await tx.user.findUnique({
                where: { id_user: idUserKeluar },
            });

            if (!petugas || !petugas.status_aktif) {
                throw new ForbiddenException(
                    'Petugas tidak aktif atau tidak ditemukan',
                );
            }

            if (!['admin', 'petugas'].includes(petugas.role)) {
                throw new ForbiddenException(
                    'Akses hanya untuk admin dan petugas',
                );
            }

            // 2. Kunci transaksi berdasarkan QR token
            const transaksiRows = await tx.$queryRaw<
                Array<{
                    id_transaksi: number;
                    id_area: number;
                    waktu_masuk: Date;
                    tarif_per_jam_snapshot: number | string;
                    status: string;
                    status_pembayaran: string;
                }>
            >`
                SELECT
                    id_transaksi,
                    id_area,
                    waktu_masuk,
                    tarif_per_jam_snapshot,
                    status,
                    status_pembayaran
                FROM tb_transaksi
                WHERE qr_token = ${dto.qr_token}
                LIMIT 1
                FOR UPDATE
            `;

            if (transaksiRows.length === 0) {
                throw new NotFoundException(
                    'Tiket parkir tidak ditemukan',
                );
            }

            const transaksi = transaksiRows[0];

            // 3. Pastikan transaksi masih aktif
            if (transaksi.status !== 'masuk') {
                throw new ConflictException(
                    'Transaksi sudah selesai',
                );
            }

            if (transaksi.status_pembayaran !== 'belum_bayar') {
                throw new ConflictException(
                    'Transaksi tidak tersedia untuk pembayaran tunai',
                );
            }

            // 4. Hitung ulang tagihan di backend
            const sekarang = new Date();

            const selisihMs =
                sekarang.getTime() - transaksi.waktu_masuk.getTime();

            if (selisihMs < 0) {
                throw new BadRequestException(
                    'Waktu transaksi tidak valid',
                );
            }

            const durasiMenit = selisihMs / (1000 * 60);

            const durasiJam = Math.max(
                0.5,
                Math.ceil(durasiMenit / 30) * 0.5,
            );

            const tarifPerJam = Number(
                transaksi.tarif_per_jam_snapshot,
            );

            const biayaTotal = durasiJam * tarifPerJam;

            // 5. Validasi nominal pembayaran
            if (dto.jumlah_bayar < biayaTotal) {
                throw new BadRequestException(
                    `Pembayaran kurang. Total tagihan: ${biayaTotal}`,
                );
            }

            const kembalian = dto.jumlah_bayar - biayaTotal;

            // 6. Kurangi kapasitas area secara atomik
            const areaUpdated = await tx.$executeRaw`
                UPDATE tb_area_parkir
                SET terisi = terisi - 1
                WHERE id_area = ${transaksi.id_area}
                  AND terisi > 0
            `;

            if (areaUpdated !== 1) {
                throw new ConflictException(
                    'Kapasitas area tidak konsisten. Hubungi administrator',
                );
            }

            // 7. Simpan pembayaran dan tutup transaksi
            const transaksiSelesai = await tx.transaksi.update({
                where: {
                    id_transaksi: transaksi.id_transaksi,
                },
                data: {
                    status: 'keluar',
                    status_pembayaran: 'lunas',
                    metode_pembayaran: 'tunai',

                    waktu_keluar: sekarang,
                    waktu_bayar: sekarang,

                    durasi_jam: durasiJam,
                    biaya_total: biayaTotal,
                    jumlah_bayar: dto.jumlah_bayar,
                    kembalian: kembalian,

                    id_user_keluar: idUserKeluar,
                },
                include: {
                    kendaraan: {
                        include: {
                            jenis: true,
                        },
                    },
                    area: true,
                    user_masuk: {
                        select: {
                            id_user: true,
                            nama_lengkap: true,
                        },
                    },
                    user_keluar: {
                        select: {
                            id_user: true,
                            nama_lengkap: true,
                        },
                    },
                },
            });

            return {
                message: 'Pembayaran berhasil dan transaksi selesai',
                data: transaksiSelesai,
            };
        });
    }
}
