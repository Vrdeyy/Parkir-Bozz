
import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateJenisKendaraanDto } from './dto/create-jenis-kendaraan.dto.js';
import { UpdateJenisKendaraanDto } from './dto/update-jenis-kendaraan.dto.js';

@Injectable()
export class JenisKendaraanService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll() {
        return this.prisma.jenisKendaraan.findMany({
            orderBy: { id_jenis: 'asc' },
        });
    }

    async findOne(id: number) {
        const jenis = await this.prisma.jenisKendaraan.findUnique({
            where: { id_jenis: id },
        });

        if (!jenis) {
            throw new NotFoundException('Jenis kendaraan tidak ditemukan');
        }

        return jenis;
    }

    async create(dto: CreateJenisKendaraanDto) {
        try {
            return await this.prisma.jenisKendaraan.create({
                data: {
                    nama_jenis: dto.nama_jenis.trim(),
                },
            });
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                throw new ConflictException('Nama jenis kendaraan sudah ada');
            }

            throw error;
        }
    }

    async update(id: number, dto: UpdateJenisKendaraanDto) {
        await this.findOne(id);

        try {
            return await this.prisma.jenisKendaraan.update({
                where: { id_jenis: id },
                data: {
                    ...(dto.nama_jenis !== undefined && {
                        nama_jenis: dto.nama_jenis.trim(),
                    }),
                },
            });
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                throw new ConflictException('Nama jenis kendaraan sudah ada');
            }

            throw error;
        }
    }

    async remove(id: number) {
        await this.findOne(id);

        try {
            await this.prisma.jenisKendaraan.delete({
                where: { id_jenis: id },
            });

            return {
                message: 'Jenis kendaraan berhasil dihapus',
            };
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2003'
            ) {
                throw new BadRequestException(
                    'Jenis kendaraan masih digunakan oleh kendaraan atau tarif',
                );
            }

            throw error;
        }
    }
}
