import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { FilterLogDto } from './dto/filter-log.dto.js';

@Injectable()
export class LogAktivitasService {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Catat aktivitas pengguna ke tb_log_aktivitas.
     * Dipanggil oleh interceptor atau secara manual dari service lain.
     */
    async create(idUser: number, aktivitas: string) {
        return this.prisma.logAktivitas.create({
            data: {
                id_user: idUser,
                aktivitas: aktivitas.substring(0, 100), // max 100 karakter
            },
        });
    }

    /**
     * Ambil seluruh log aktivitas dengan filter & pagination.
     * Khusus Admin.
     */
    async findAll(filter: FilterLogDto) {
        const {
            id_user,
            aktivitas,
            tanggal_mulai,
            tanggal_selesai,
            page = 1,
            limit = 20,
        } = filter;

        const where: Prisma.LogAktivitasWhereInput = {
            ...(id_user && { id_user }),

            ...(aktivitas && {
                aktivitas: {
                    contains: aktivitas,
                },
            }),

            ...(tanggal_mulai || tanggal_selesai
                ? {
                      waktu_aktivitas: {
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

        const [total, logs] = await this.prisma.$transaction([
            this.prisma.logAktivitas.count({ where }),

            this.prisma.logAktivitas.findMany({
                where,
                skip,
                take: limit,
                orderBy: { waktu_aktivitas: 'desc' },
                select: {
                    id_log: true,
                    aktivitas: true,
                    waktu_aktivitas: true,
                    user: {
                        select: {
                            id_user: true,
                            nama_lengkap: true,
                            username: true,
                            role: true,
                        },
                    },
                },
            }),
        ]);

        return {
            message: 'Log aktivitas berhasil ditemukan',
            data: logs,
            pagination: {
                total,
                page,
                limit,
                total_pages: Math.ceil(total / limit),
            },
        };
    }
}
