
import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';

import { PrismaService } from '../prisma/prisma.service.js';
import { MidtransService } from './midtrans.service.js';
import { CreateTransaksiDto } from './dto/create-transaksi.dto.js';
import { ProsesKeluarDto } from './dto/proses-keluar.dto.js';
import { PembayaranTunaiDto } from './dto/pembayaran-tunai.dto.js';
import { FilterTransaksiDto } from './dto/filter-transaksi.dto.js';
import { BayarQrisDto } from './dto/bayar-qris.dto.js';
import { MidtransWebhookDto } from './dto/midtrans-webhook.dto.js';
import { Prisma } from '@prisma/client';

@Injectable()
export class TransaksiService {
    private readonly logger = new Logger(TransaksiService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly midtransService: MidtransService,
    ) { }

    private extractTicketIdentifier(dto: ProsesKeluarDto): string {
        const tokenOrCode =
            dto.qr_token || dto.kode_transaksi || dto.identitas_tiket;

        if (!tokenOrCode) {
            throw new BadRequestException(
                'Wajib menyertakan qr_token, kode_transaksi, atau identitas_tiket',
            );
        }

        return tokenOrCode.trim();
    }

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

        const identifier = this.extractTicketIdentifier(dto);

        // 2. Cari transaksi berdasarkan QR token atau Kode Transaksi
        const transaksi = await this.prisma.transaksi.findFirst({
            where: {
                OR: [
                    { qr_token: identifier },
                    { kode_transaksi: identifier },
                ],
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

        if (!['belum_bayar', 'menunggu'].includes(transaksi.status_pembayaran)) {
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

        const biayaTotal = Math.ceil(
            durasiJam * tarifPerJam,
        );

        return {
            message: 'Tagihan parkir berhasil dihitung',
            data: {
                id_transaksi: transaksi.id_transaksi,
                kode_transaksi: transaksi.kode_transaksi,
                qr_token: transaksi.qr_token,
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

            const identifier = this.extractTicketIdentifier(dto);

            // 2. Kunci transaksi berdasarkan QR token atau Kode Transaksi
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
                WHERE qr_token = ${identifier} OR kode_transaksi = ${identifier}
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

            if (!['belum_bayar', 'menunggu'].includes(transaksi.status_pembayaran)) {
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

            const biayaTotal = Math.ceil(
                durasiJam * tarifPerJam,
            );

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
                select: {
                    id_transaksi: true,
                    kode_transaksi: true,

                    waktu_masuk: true,
                    waktu_keluar: true,
                    waktu_bayar: true,

                    durasi_jam: true,
                    tarif_per_jam_snapshot: true,
                    biaya_total: true,
                    jumlah_bayar: true,
                    kembalian: true,

                    status: true,
                    status_pembayaran: true,
                    metode_pembayaran: true,

                    kendaraan: {
                        select: {
                            plat_nomor: true,
                            warna: true,
                            pemilik: true,
                            jenis: {
                                select: {
                                    nama_jenis: true,
                                },
                            },
                        },
                    },

                    area: {
                        select: {
                            nama_area: true,
                        },
                    },

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
                message: 'Pembayaran tunai berhasil dan transaksi selesai',
                data: transaksiSelesai,
            };
        });
    }

    // ==========================================
    // 3.1 PEMBAYARAN NON-TUNAI (DYNAMIC QRIS MIDTRANS)
    // ==========================================

    async bayarQris(dto: BayarQrisDto, idUserKeluar: number) {
        // 1. Validasi petugas
        const petugas = await this.prisma.user.findUnique({
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

        const identifier = this.extractTicketIdentifier(dto);

        // 2. Cari transaksi aktif
        const transaksi = await this.prisma.transaksi.findFirst({
            where: {
                OR: [
                    { qr_token: identifier },
                    { kode_transaksi: identifier },
                ],
            },
            include: {
                kendaraan: {
                    include: {
                        jenis: true,
                    },
                },
                area: true,
            },
        });

        if (!transaksi) {
            throw new NotFoundException('Tiket parkir tidak ditemukan');
        }

        if (transaksi.status !== 'masuk') {
            throw new ConflictException('Transaksi sudah selesai');
        }

        if (!['belum_bayar', 'menunggu'].includes(transaksi.status_pembayaran)) {
            throw new ConflictException('Status pembayaran tidak valid untuk pembayaran QRIS');
        }

        // 3. Hitung durasi dan tarif parkir
        const sekarang = new Date();
        const selisihMs = sekarang.getTime() - transaksi.waktu_masuk.getTime();
        if (selisihMs < 0) {
            throw new BadRequestException('Waktu transaksi tidak valid');
        }

        const durasiMenit = selisihMs / (1000 * 60);
        const durasiJam = Math.max(0.5, Math.ceil(durasiMenit / 30) * 0.5);
        const tarifPerJam = Number(transaksi.tarif_per_jam_snapshot);
        const biayaTotal = Math.ceil(durasiJam * tarifPerJam);

        // 4. Generate order ID unik untuk Midtrans
        const orderId = `${transaksi.kode_transaksi}-${Date.now()}`;

        // 5. Panggil Midtrans Core API untuk generate QRIS
        const qrisResult = await this.midtransService.createQrisCharge(
            orderId,
            biayaTotal,
            dto.acquirer ?? 'gopay',
        );

        // 6. Catat referensi pembayaran dan update status ke 'menunggu'
        await this.prisma.transaksi.update({
            where: { id_transaksi: transaksi.id_transaksi },
            data: {
                referensi_pembayaran: orderId,
                status_pembayaran: 'menunggu',
                metode_pembayaran: 'non_tunai',
                durasi_jam: durasiJam,
                biaya_total: biayaTotal,
                id_user_keluar: idUserKeluar,
                waktu_keluar: sekarang,
            },
        });

        return {
            message: 'Tagihan QRIS dinamis berhasil dibuat',
            data: {
                id_transaksi: transaksi.id_transaksi,
                kode_transaksi: transaksi.kode_transaksi,
                order_id: orderId,
                plat_nomor: transaksi.kendaraan.plat_nomor,
                area: transaksi.area.nama_area,
                durasi_jam: durasiJam,
                tarif_per_jam: tarifPerJam,
                biaya_total: biayaTotal,
                qr_string: qrisResult.qr_string,
                qr_url: qrisResult.qr_url,
                expiry_time: qrisResult.expiry_time,
                status_pembayaran: 'menunggu',
            },
        };
    }

    // ==========================================
    // 3.2 WEBHOOK CALLBACK MIDTRANS
    // ==========================================

    async handleMidtransWebhook(dto: MidtransWebhookDto) {
        const {
            order_id,
            status_code,
            transaction_status,
            gross_amount,
            signature_key,
        } = dto;

        if (
            !this.midtransService.verifySignature(
                order_id,
                status_code,
                gross_amount,
                signature_key,
            )
        ) {
            if (this.midtransService.isProductionMode()) {
                throw new ForbiddenException('Signature webhook Midtrans tidak valid');
            } else {
                this.logger.warn(
                    `[Sandbox Mode] Webhook signature mismatch for order ${order_id}. Melanjutkan proses settlement untuk kemudahan demo/sandbox.`,
                );
            }
        }

        return await this.prisma.$transaction(async (tx) => {
            const transaksiRows = await tx.$queryRaw<
                Array<{
                    id_transaksi: number;
                    id_area: number;
                    status: string;
                    status_pembayaran: string;
                    waktu_keluar: Date | null;
                    biaya_total: number | string;
                }>
            >`
                SELECT id_transaksi, id_area, status, status_pembayaran,
                       waktu_keluar, biaya_total
                FROM tb_transaksi
                WHERE referensi_pembayaran = ${order_id}
                LIMIT 1
                FOR UPDATE
            `;
            const transaksi = transaksiRows[0];

            if (!transaksi) {
                return {
                    message: 'Transaksi tidak ditemukan untuk order ID tersebut',
                };
            }

            if (Number(transaksi.biaya_total) !== Number(gross_amount)) {
                throw new ForbiddenException(
                    'Nominal webhook Midtrans tidak sesuai dengan tagihan',
                );
            }

            // Idempotent: jika transaksi sudah lunas, langsung return
            if (transaksi.status_pembayaran === 'lunas' && transaksi.status === 'keluar') {
                return {
                    message: 'Transaksi sudah berstatus lunas sebelumnya',
                };
            }

            const sekarang = new Date();

            if (transaction_status === 'settlement' || transaction_status === 'capture') {
                if (
                    transaksi.status !== 'masuk' ||
                    transaksi.status_pembayaran !== 'menunggu'
                ) {
                    return {
                        message: 'Status transaksi tidak mengizinkan pembayaran lunas',
                    };
                }
                // Kurangi kuota area parkir secara atomik
                const areaUpdated = await tx.$executeRaw`
                    UPDATE tb_area_parkir
                    SET terisi = terisi - 1
                    WHERE id_area = ${transaksi.id_area}
                      AND terisi > 0
                `;

                if (areaUpdated !== 1) {
                    throw new ConflictException(
                        'Kapasitas area tidak konsisten saat memproses webhook',
                    );
                }

                const transaksiLunas = await tx.transaksi.update({
                    where: { id_transaksi: transaksi.id_transaksi },
                    data: {
                        status: 'keluar',
                        status_pembayaran: 'lunas',
                        metode_pembayaran: 'non_tunai',
                        jumlah_bayar: Number(gross_amount),
                        kembalian: 0,
                        waktu_keluar: transaksi.waktu_keluar ?? sekarang,
                        waktu_bayar: sekarang,
                    },
                });

                return {
                    message: 'Pembayaran QRIS lunas berhasil dicatat',
                    data: transaksiLunas,
                };
            } else if (['cancel', 'expire', 'deny'].includes(transaction_status)) {
                if (
                    transaksi.status !== 'masuk' ||
                    transaksi.status_pembayaran !== 'menunggu'
                ) {
                    return {
                        message: 'Status transaksi tidak mengizinkan perubahan pembayaran',
                    };
                }
                await tx.transaksi.update({
                    where: { id_transaksi: transaksi.id_transaksi },
                    data: {
                        status_pembayaran:
                            transaction_status === 'expire' ? 'kedaluwarsa' : 'gagal',
                    },
                });

                return {
                    message: `Pembayaran QRIS ${transaction_status}`,
                };
            }

            return {
                message: `Status pembayaran tercatat: ${transaction_status}`,
            };
        });
    }

    // ==========================================
    // 3.3 CEK STATUS PEMBAYARAN (POLLING FRONTEND)
    // ==========================================

    async checkStatusPembayaran(identifier: string) {
        const transaksi = await this.prisma.transaksi.findFirst({
            where: {
                OR: [
                    { referensi_pembayaran: identifier },
                    { kode_transaksi: identifier },
                    { qr_token: identifier },
                ],
            },
            select: {
                id_transaksi: true,
                kode_transaksi: true,
                referensi_pembayaran: true,
                status: true,
                status_pembayaran: true,
                metode_pembayaran: true,
                biaya_total: true,
                jumlah_bayar: true,
                kembalian: true,
                waktu_masuk: true,
                waktu_keluar: true,
                waktu_bayar: true,
                kendaraan: {
                    select: {
                        plat_nomor: true,
                        jenis: { select: { nama_jenis: true } },
                    },
                },
                area: {
                    select: { nama_area: true },
                },
            },
        });

        if (!transaksi) {
            throw new NotFoundException('Data transaksi tidak ditemukan');
        }

        return {
            message: 'Status pembayaran berhasil ditemukan',
            data: transaksi,
        };
    }

    // ==========================================
    // 3.4 SIMULASI BAYAR QRIS LUNAS (UNTUK UPRAK / TESTING)
    // ==========================================

    async simulasiBayarQrisLunas(identifier: string) {
        const transaksi = await this.prisma.transaksi.findFirst({
            where: {
                OR: [
                    { referensi_pembayaran: identifier },
                    { kode_transaksi: identifier },
                    { qr_token: identifier },
                ],
            },
        });

        if (!transaksi) {
            throw new NotFoundException('Transaksi tidak ditemukan');
        }

        if (transaksi.status === 'keluar' && transaksi.status_pembayaran === 'lunas') {
            return {
                message: 'Transaksi sudah lunas sebelumnya',
                data: transaksi,
            };
        }

        const dummyOrderId =
            transaksi.referensi_pembayaran ??
            `${transaksi.kode_transaksi}-${Date.now()}`;

        const nominalBayar = Number(transaksi.biaya_total) > 0 ? Number(transaksi.biaya_total) : 5000;

        await this.prisma.transaksi.update({
            where: { id_transaksi: transaksi.id_transaksi },
            data: {
                referensi_pembayaran: dummyOrderId,
                metode_pembayaran: 'non_tunai',
                status_pembayaran: 'menunggu',
                biaya_total: nominalBayar,
                waktu_keluar: transaksi.waktu_keluar ?? new Date(),
            },
        });

        const dummyWebhook: MidtransWebhookDto = {
            order_id: dummyOrderId,
            status_code: '200',
            gross_amount: String(nominalBayar),
            transaction_status: 'settlement',
            payment_type: 'qris',
            signature_key: this.midtransService.createSignature(
                dummyOrderId,
                '200',
                String(nominalBayar),
            ),
        };

        return this.handleMidtransWebhook(dummyWebhook);
    }


    // ==========================================
    // 4. RIWAYAT SELURUH TRANSAKSI
    // ==========================================

    async findAll(filter: FilterTransaksiDto) {
        const {
            status,
            plat_nomor,
            tanggal_mulai,
            tanggal_selesai,
            page = 1,
            limit = 10,
        } = filter;

        // Validasi rentang tanggal
        if (
            tanggal_mulai &&
            tanggal_selesai &&
            new Date(tanggal_mulai) > new Date(tanggal_selesai)
        ) {
            throw new BadRequestException(
                'Tanggal mulai tidak boleh melebihi tanggal selesai',
            );
        }

        const where: Prisma.TransaksiWhereInput = {
            ...(status && { status }),

            ...(plat_nomor && {
                kendaraan: {
                    plat_nomor: {
                        contains: plat_nomor,
                    },
                },
            }),

            ...(tanggal_mulai || tanggal_selesai
                ? {
                    waktu_masuk: {
                        ...(tanggal_mulai && {
                            gte: new Date(tanggal_mulai),
                        }),

                        ...(tanggal_selesai && {
                            lt: new Date(
                                new Date(tanggal_selesai).getTime() +
                                24 * 60 * 60 * 1000,
                            ),
                        }),
                    },
                }
                : {}),
        };

        const skip = (page - 1) * limit;

        const [total, transaksi] = await this.prisma.$transaction([
            this.prisma.transaksi.count({ where }),

            this.prisma.transaksi.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    waktu_masuk: 'desc',
                },
                select: {
                    id_transaksi: true,
                    kode_transaksi: true,
                    status: true,
                    status_pembayaran: true,
                    metode_pembayaran: true,

                    waktu_masuk: true,
                    waktu_keluar: true,
                    waktu_bayar: true,

                    durasi_jam: true,
                    tarif_per_jam_snapshot: true,
                    biaya_total: true,
                    jumlah_bayar: true,
                    kembalian: true,

                    kendaraan: {
                        select: {
                            plat_nomor: true,
                            warna: true,
                            jenis: {
                                select: {
                                    nama_jenis: true,
                                },
                            },
                        },
                    },

                    area: {
                        select: {
                            nama_area: true,
                        },
                    },

                    user_masuk: {
                        select: {
                            nama_lengkap: true,
                        },
                    },

                    user_keluar: {
                        select: {
                            nama_lengkap: true,
                        },
                    },
                },
            }),
        ]);

        return {
            message: 'Riwayat transaksi berhasil ditemukan',
            data: transaksi,
            pagination: {
                total,
                page,
                limit,
                total_pages: Math.ceil(total / limit),
            },
        };
    }

    // ==========================================
    // 5. DETAIL TRANSAKSI
    // ==========================================

    async findOne(id: number) {
        const transaksi = await this.prisma.transaksi.findUnique({
            where: {
                id_transaksi: id,
            },
            select: {
                id_transaksi: true,
                kode_transaksi: true,

                id_kendaraan: true,
                id_tarif: true,
                id_user_masuk: true,
                id_user_keluar: true,
                id_area: true,

                waktu_masuk: true,
                waktu_keluar: true,
                waktu_bayar: true,

                tarif_per_jam_snapshot: true,
                durasi_jam: true,
                biaya_total: true,

                status: true,
                status_pembayaran: true,
                metode_pembayaran: true,

                jumlah_bayar: true,
                kembalian: true,
                referensi_pembayaran: true,

                kendaraan: {
                    include: {
                        jenis: true,
                    },
                },

                tarif: true,
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

        if (!transaksi) {
            throw new NotFoundException(
                'Transaksi tidak ditemukan',
            );
        }

        return {
            message: 'Detail transaksi berhasil ditemukan',
            data: transaksi,
        };
    }

}
