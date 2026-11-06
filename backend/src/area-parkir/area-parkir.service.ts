import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service.js';

import { CreateAreaParkirDto } from './dto/create-area-parkir.dto.js';
import { UpdateAreaParkirDto } from './dto/update-area-parkir.dto.js';
import { UpdateStatusAreaParkirDto } from './dto/update-status-area-parkir.dto.js';
import { HardDeleteAreaParkirDto } from './dto/hard-delete-area-parkir.dto.js';

@Injectable()
export class AreaParkirService {
    constructor(private readonly prisma: PrismaService) { }

    // GET semua area
    async findAll() {
        return this.prisma.areaParkir.findMany({
            orderBy: {
                id_area: 'asc',
            },
            include: {
                _count: {
                    select: {
                        transaksi: true,
                    },
                },
            },
        });
    }

    // GET detail area
    async findOne(id: number) {
        const area = await this.prisma.areaParkir.findUnique({
            where: {
                id_area: id,
            },
            include: {
                _count: {
                    select: {
                        transaksi: true,
                    },
                },
            },
        });

        if (!area) {
            throw new NotFoundException('Area parkir tidak ditemukan');
        }

        return area;
    }

    // CREATE area
    async create(dto: CreateAreaParkirDto) {
        return this.prisma.areaParkir.create({
            data: {
                nama_area: dto.nama_area.trim(),
                kapasitas: dto.kapasitas,
            },
        });
    }

    // UPDATE nama dan kapasitas
    async update(id: number, dto: UpdateAreaParkirDto) {
        const data = {
            ...(dto.nama_area !== undefined && {
                nama_area: dto.nama_area.trim(),
            }),
            ...(dto.kapasitas !== undefined && {
                kapasitas: dto.kapasitas,
            }),
        };

        if (Object.keys(data).length === 0) {
            throw new BadRequestException(
                'Tidak ada data yang diperbarui',
            );
        }

        if (dto.kapasitas !== undefined) {
            const result = await this.prisma.areaParkir.updateMany({
                where: {
                    id_area: id,
                    terisi: {
                        lte: dto.kapasitas,
                    },
                },
                data,
            });

            if (result.count === 0) {
                const area = await this.prisma.areaParkir.findUnique({
                    where: { id_area: id },
                });

                if (!area) {
                    throw new NotFoundException(
                        'Area parkir tidak ditemukan',
                    );
                }

                throw new ConflictException(
                    `Kapasitas tidak boleh lebih kecil dari jumlah kendaraan terisi (${area.terisi})`,
                );
            }

            return this.findOne(id);
        }

        try {
            await this.prisma.areaParkir.update({
                where: { id_area: id },
                data,
            });

            return this.findOne(id);
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2025'
            ) {
                throw new NotFoundException(
                    'Area parkir tidak ditemukan',
                );
            }

            throw error;
        }
    }

    // SOFT DELETE / AKTIVASI ULANG
    async updateStatus(
        id: number,
        dto: UpdateStatusAreaParkirDto,
    ) {
        try {
            return await this.prisma.areaParkir.update({
                where: {
                    id_area: id,
                },
                data: {
                    status_aktif: dto.status_aktif,
                },
            });
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2025'
            ) {
                throw new NotFoundException(
                    'Area parkir tidak ditemukan',
                );
            }

            throw error;
        }
    }

    // HARD DELETE
    async hardDelete(
        id: number,
        dto: HardDeleteAreaParkirDto,
    ) {
        if (dto.konfirmasi !== 'HAPUS_PERMANEN') {
            throw new BadRequestException(
                'Konfirmasi penghapusan tidak valid',
            );
        }

        try {
            return await this.prisma.$transaction(
                async (tx) => {
                    const area = await tx.areaParkir.findUnique({
                        where: {
                            id_area: id,
                        },
                    });

                    if (!area) {
                        throw new NotFoundException(
                            'Area parkir tidak ditemukan',
                        );
                    }

                    if (area.terisi > 0) {
                        throw new ConflictException(
                            'Area tidak dapat dihapus karena masih terisi',
                        );
                    }

                    // Hapus seluruh transaksi yang terhubung
                    const deletedTransactions =
                        await tx.transaksi.deleteMany({
                            where: {
                                id_area: id,
                            },
                        });

                    // Hapus area setelah transaksi dihapus
                    await tx.areaParkir.delete({
                        where: {
                            id_area: id,
                        },
                    });

                    return {
                        message:
                            'Area parkir dan seluruh riwayat transaksinya berhasil dihapus permanen',
                        transaksi_dihapus: deletedTransactions.count,
                    };
                },
                {
                    isolationLevel:
                        Prisma.TransactionIsolationLevel.Serializable,
                },
            );
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2025'
            ) {
                throw new NotFoundException(
                    'Area parkir tidak ditemukan',
                );
            }

            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2034'
            ) {
                throw new ConflictException(
                    'Terjadi perubahan data bersamaan. Silakan ulangi permintaan',
                );
            }

            throw error;
        }
    }
}