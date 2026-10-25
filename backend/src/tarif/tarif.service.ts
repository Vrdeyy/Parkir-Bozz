import {
    ConflictException,
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTarifDto } from './dto/create-tarif.dto.js';
import { UpdateTarifDto } from './dto/update-tarif.dto.js';

@Injectable()
export class TarifService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateTarifDto) {
        try {
            return await this.prisma.tarif.create({
                data: {
                    id_jenis: dto.id_jenis,
                    tarif_per_jam: dto.tarif_per_jam,
                },
                include: {
                    jenis: true,
                },
            });
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                throw new ConflictException(
                    'Tarif untuk jenis kendaraan tersebut sudah tersedia.',
                );
            }
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2003'
            ) {
                throw new NotFoundException('Jenis kendaraan tidak ditemukan.');
            }
            throw error;
        }
    }

    async findAll() {
        return this.prisma.tarif.findMany({
            include: {
                jenis: true,
            },
            orderBy: { id_tarif: 'desc' },
        });
    }

    async findOne(id: number) {
        const tarif = await this.prisma.tarif.findUnique({
            where: { id_tarif: id },
            include: {
                jenis: true,
            },
        });

        if (!tarif) {
            throw new NotFoundException('Tarif tidak ditemukan.');
        }

        return tarif;
    }

    async update(id: number, dto: UpdateTarifDto) {
        await this.findOne(id);

        try {
            return await this.prisma.tarif.update({
                where: { id_tarif: id },
                data: {
                    ...(dto.id_jenis !== undefined
                        ? { id_jenis: dto.id_jenis }
                        : {}),
                    ...(dto.tarif_per_jam !== undefined
                        ? { tarif_per_jam: dto.tarif_per_jam }
                        : {}),
                },
                include: {
                    jenis: true,
                },
            });
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                throw new ConflictException(
                    'Tarif untuk jenis kendaraan tersebut sudah tersedia.',
                );
            }
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2003'
            ) {
                throw new NotFoundException('Jenis kendaraan tidak ditemukan.');
            }
            throw error;
        }
    }

    async remove(id: number) {
        await this.findOne(id);

        try {
            await this.prisma.tarif.delete({
                where: { id_tarif: id },
            });

            return {
                message: 'Tarif berhasil dihapus.',
            };
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2003'
            ) {
                throw new BadRequestException(
                    'Tarif tidak dapat dihapus karena sudah digunakan transaksi.',
                );
            }
            throw error;
        }
    }
}
