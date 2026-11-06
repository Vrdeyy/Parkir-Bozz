
import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateKendaraanDto } from './dto/create-kendaraan.dto.js';
import { UpdateKendaraanDto } from './dto/update-kendaraan.dto.js';

@Injectable()
export class KendaraanService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll() {
        return this.prisma.kendaraan.findMany({
            include: {
                jenis: true,
                user: {
                    select: {
                        id_user: true,
                        nama_lengkap: true,
                        username: true,
                    },
                },
            },
            orderBy: { id_kendaraan: 'desc' },
        });
    }

    async findOne(id: number) {
        const kendaraan = await this.prisma.kendaraan.findUnique({
            where: { id_kendaraan: id },
            include: {
                jenis: true,
                user: {
                    select: {
                        id_user: true,
                        nama_lengkap: true,
                        username: true,
                    },
                },
            },
        });

        if (!kendaraan) {
            throw new NotFoundException('Kendaraan tidak ditemukan');
        }

        return kendaraan;
    }

    async create(dto: CreateKendaraanDto) {
        const platNomor = dto.plat_nomor.trim().toUpperCase();

        try {
            return await this.prisma.kendaraan.create({
                data: {
                    plat_nomor: platNomor,
                    id_jenis: dto.id_jenis,
                    warna: dto.warna?.trim(),
                    pemilik: dto.pemilik?.trim(),
                    id_user: dto.id_user,
                },
                include: {
                    jenis: true,
                },
            });
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError
            ) {
                if (error.code === 'P2002') {
                    throw new ConflictException('Plat nomor sudah terdaftar');
                }

                if (error.code === 'P2003') {
                    throw new BadRequestException(
                        'Jenis kendaraan atau user tidak ditemukan',
                    );
                }
            }

            throw error;
        }
    }

    async update(id: number, dto: UpdateKendaraanDto) {
        await this.findOne(id);

        try {
            return await this.prisma.kendaraan.update({
                where: { id_kendaraan: id },
                data: {
                    ...(dto.plat_nomor !== undefined && {
                        plat_nomor: dto.plat_nomor.trim().toUpperCase(),
                    }),
                    ...(dto.id_jenis !== undefined && {
                        id_jenis: dto.id_jenis,
                    }),
                    ...(dto.warna !== undefined && {
                        warna: dto.warna.trim(),
                    }),
                    ...(dto.pemilik !== undefined && {
                        pemilik: dto.pemilik.trim(),
                    }),
                    ...(dto.id_user !== undefined && {
                        id_user: dto.id_user,
                    }),
                },
                include: {
                    jenis: true,
                },
            });
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError
            ) {
                if (error.code === 'P2002') {
                    throw new ConflictException('Plat nomor sudah terdaftar');
                }

                if (error.code === 'P2003') {
                    throw new BadRequestException(
                        'Jenis kendaraan atau user tidak ditemukan',
                    );
                }
            }

            throw error;
        }
    }

    async remove(id: number) {
        await this.findOne(id);

        try {
            await this.prisma.kendaraan.delete({
                where: { id_kendaraan: id },
            });

            return {
                message: 'Kendaraan berhasil dihapus',
            };
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2003'
            ) {
                throw new BadRequestException(
                    'Kendaraan tidak dapat dihapus karena masih memiliki riwayat transaksi',
                );
            }

            throw error;
        }
    }
}
