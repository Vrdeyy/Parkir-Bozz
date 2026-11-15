import { Injectable, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { FilterGrafikDto, FilterLaporanDto } from './dto/filter-laporan.dto.js';

@Injectable()
export class DashboardService {
    constructor(private readonly prisma: PrismaService) {}

    // ==========================================
    // SUMMARY DASHBOARD (Ringkasan real-time)
    // ==========================================

    async getSummary() {
        const now = new Date();

        // Awal hari ini (00:00)
        const startOfToday = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
        );

        // Awal minggu ini (Senin)
        const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon ...
        const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const startOfWeek = new Date(startOfToday);
        startOfWeek.setDate(startOfToday.getDate() - diffToMonday);

        // Awal bulan ini
        const startOfMonth = new Date(
            now.getFullYear(),
            now.getMonth(),
            1,
        );

        // 1. Omzet hari ini / minggu ini / bulan ini
        const [omzetHariIni, omzetMingguIni, omzetBulanIni] =
            await Promise.all([
                this.sumOmzet(startOfToday),
                this.sumOmzet(startOfWeek),
                this.sumOmzet(startOfMonth),
            ]);

        // 2. Jumlah kendaraan aktif di dalam parkir saat ini
        const kendaraanAktif = await this.prisma.transaksi.count({
            where: { status: 'masuk' },
        });

        // 3. Okupansi per area parkir
        const areaParkir = await this.prisma.areaParkir.findMany({
            where: { status_aktif: true },
            select: {
                id_area: true,
                nama_area: true,
                kapasitas: true,
                terisi: true,
            },
            orderBy: { nama_area: 'asc' },
        });

        const okupasi = areaParkir.map((area) => ({
            ...area,
            persentase_terisi:
                area.kapasitas > 0
                    ? Math.round(
                          (area.terisi / area.kapasitas) * 100,
                      )
                    : 0,
        }));

        // 4. Jumlah transaksi masuk / keluar hari ini
        const [transaksiMasukHariIni, transaksiKeluarHariIni] =
            await Promise.all([
                this.prisma.transaksi.count({
                    where: {
                        waktu_masuk: { gte: startOfToday },
                    },
                }),
                this.prisma.transaksi.count({
                    where: {
                        status: 'keluar',
                        waktu_keluar: { gte: startOfToday },
                    },
                }),
            ]);

        return {
            message: 'Dashboard summary berhasil dimuat',
            data: {
                omzet: {
                    hari_ini: omzetHariIni,
                    minggu_ini: omzetMingguIni,
                    bulan_ini: omzetBulanIni,
                    catatan: 'Omzet dihitung dari biaya_total transaksi berstatus lunas.',
                },
                laba_kotor: omzetBulanIni,
                biaya_operasional: null,
                laba_bersih: null,
                kendaraan_aktif: kendaraanAktif,
                okupasi_area: okupasi,
                transaksi_hari_ini: {
                    masuk: transaksiMasukHariIni,
                    keluar: transaksiKeluarHariIni,
                },
            },
        };
    }

    /**
     * Helper: Hitung total omzet dari tanggal tertentu sampai sekarang.
     */
    private async sumOmzet(since: Date): Promise<number> {
        const result = await this.prisma.transaksi.aggregate({
            where: {
                status_pembayaran: 'lunas',
                waktu_bayar: { gte: since },
            },
            _sum: { biaya_total: true },
        });

        return Number(result._sum.biaya_total ?? 0);
    }

    // ==========================================
    // LAPORAN REKAP (dengan filter & pagination)
    // ==========================================

    async getLaporanRekap(filter: FilterLaporanDto) {
        const {
            tanggal_mulai,
            tanggal_selesai,
            metode_pembayaran,
            id_area,
            page = 1,
            limit = 20,
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

        // Base filter: hanya transaksi lunas
        const where: Prisma.TransaksiWhereInput = {
            status_pembayaran: 'lunas',

            ...(metode_pembayaran && { metode_pembayaran }),
            ...(id_area && { id_area }),

            ...(tanggal_mulai || tanggal_selesai
                ? {
                      waktu_bayar: {
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

        // Jalankan query data + count + aggregasi dalam satu transaction
        const [total, transaksi, aggregasi] =
            await this.prisma.$transaction([
                this.prisma.transaksi.count({ where }),

                this.prisma.transaksi.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { waktu_bayar: 'desc' },
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

                        metode_pembayaran: true,
                        status_pembayaran: true,

                        kendaraan: {
                            select: {
                                plat_nomor: true,
                                warna: true,
                                jenis: {
                                    select: { nama_jenis: true },
                                },
                            },
                        },

                        area: {
                            select: { nama_area: true },
                        },

                        user_masuk: {
                            select: { nama_lengkap: true },
                        },

                        user_keluar: {
                            select: { nama_lengkap: true },
                        },
                    },
                }),

                this.prisma.transaksi.aggregate({
                    where,
                    _sum: { biaya_total: true },
                    _count: { id_transaksi: true },
                }),
            ]);

        // Hitung pecahan tunai vs non_tunai
        const [sumTunai, sumNonTunai] = await Promise.all([
            this.prisma.transaksi.aggregate({
                where: { ...where, metode_pembayaran: 'tunai' },
                _sum: { biaya_total: true },
            }),
            this.prisma.transaksi.aggregate({
                where: { ...where, metode_pembayaran: 'non_tunai' },
                _sum: { biaya_total: true },
            }),
        ]);

        return {
            message: 'Laporan rekap berhasil dimuat',
            ringkasan: {
                total_transaksi: aggregasi._count.id_transaksi,
                grand_total: Number(aggregasi._sum.biaya_total ?? 0),
                pemasukan: Number(aggregasi._sum.biaya_total ?? 0),
                total_tunai: Number(sumTunai._sum.biaya_total ?? 0),
                total_non_tunai: Number(
                    sumNonTunai._sum.biaya_total ?? 0,
                ),
                rata_rata_transaksi:
                    aggregasi._count.id_transaksi > 0
                        ? Number(aggregasi._sum.biaya_total ?? 0) /
                          aggregasi._count.id_transaksi
                        : 0,
                laba_kotor: Number(aggregasi._sum.biaya_total ?? 0),
                biaya_operasional: null,
                laba_bersih: null,
            },
            data: transaksi,
            pagination: {
                total,
                page,
                limit,
                total_pages: Math.ceil(total / limit),
            },
        };
    }

    async getGrafikPendapatan(filter: FilterGrafikDto) {
        const now = new Date();
        const end = filter.tanggal_selesai
            ? this.startOfDay(new Date(filter.tanggal_selesai))
            : this.startOfDay(now);
        const start = filter.tanggal_mulai
            ? this.startOfDay(new Date(filter.tanggal_mulai))
            : new Date(end);

        if (!filter.tanggal_mulai) {
            if (filter.interval === 'bulanan') start.setMonth(start.getMonth() - 11);
            else start.setDate(start.getDate() - 6);
        }
        if (start > end) {
            throw new BadRequestException('Tanggal mulai tidak boleh melebihi tanggal selesai');
        }

        const endExclusive = new Date(end);
        endExclusive.setDate(endExclusive.getDate() + 1);

        const dateFormat = filter.interval === 'bulanan' ? '%Y-%m' : '%Y-%m-%d';
        const grouped = await this.prisma.$queryRaw<
            Array<{ periode: string; pemasukan: Prisma.Decimal | number | null; jumlah_transaksi: bigint | number }>
        >(Prisma.sql`
            SELECT DATE_FORMAT(waktu_bayar, ${dateFormat}) AS periode,
                   SUM(biaya_total) AS pemasukan,
                   COUNT(*) AS jumlah_transaksi
            FROM tb_transaksi
            WHERE status_pembayaran = 'lunas'
              AND waktu_bayar >= ${start}
              AND waktu_bayar < ${endExclusive}
              ${filter.id_area ? Prisma.sql`AND id_area = ${filter.id_area}` : Prisma.empty}
            GROUP BY periode
            ORDER BY periode ASC
        `);

        // Fill empty calendar buckets with zero for chart rendering.
        const buckets = new Map<string, { pemasukan: number; jumlah_transaksi: number }>();
        for (const row of grouped) {
            buckets.set(row.periode, {
                pemasukan: Number(row.pemasukan ?? 0),
                jumlah_transaksi: Number(row.jumlah_transaksi),
            });
        }

        const points: Array<{ periode: string; pemasukan: number; jumlah_transaksi: number }> = [];
        const cursor = new Date(start);
        if (filter.interval === 'bulanan') cursor.setDate(1);
        while (cursor <= end) {
            const key = filter.interval === 'bulanan'
                ? `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`
                : `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
            points.push({ periode: key, ...(buckets.get(key) ?? { pemasukan: 0, jumlah_transaksi: 0 }) });
            if (filter.interval === 'bulanan') cursor.setMonth(cursor.getMonth() + 1);
            else cursor.setDate(cursor.getDate() + 1);
        }

        return {
            message: 'Grafik pendapatan berhasil dimuat',
            ringkasan: {
                total_pemasukan: points.reduce((sum, point) => sum + point.pemasukan, 0),
                total_transaksi: points.reduce((sum, point) => sum + point.jumlah_transaksi, 0),
                interval: filter.interval,
                laba_bersih: null,
                catatan_laba: 'Biaya operasional belum dicatat dalam sistem; laba bersih belum dapat dihitung.',
            },
            data: points,
        };
    }

    private startOfDay(date: Date): Date {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }
}
