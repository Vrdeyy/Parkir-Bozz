
import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    private readonly safeSelect = {
        id_user: true,
        nama_lengkap: true,
        username: true,
        role: true,
        status_aktif: true,
    } satisfies Prisma.UserSelect;

    private async ensureUsernameAvailable(
        username: string,
        excludeId?: number,
    ) {
        const existing = await this.prisma.user.findUnique({
            where: { username },
            select: { id_user: true },
        });

        if (existing && existing.id_user !== excludeId) {
            throw new ConflictException('Username sudah digunakan');
        }
    }

    async create(dto: CreateUserDto) {
        await this.ensureUsernameAvailable(dto.username);

        const password = await bcrypt.hash(dto.password, 12);

        try {
            return await this.prisma.user.create({
                data: {
                    nama_lengkap: dto.nama_lengkap,
                    username: dto.username,
                    password,
                    role: dto.role,
                    status_aktif: dto.status_aktif ?? true,
                },
                select: this.safeSelect,
            });
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                throw new ConflictException('Username sudah digunakan');
            }

            throw error;
        }
    }

    async findAll() {
        return this.prisma.user.findMany({
            select: this.safeSelect,
            orderBy: { id_user: 'desc' },
        });
    }

    async findOne(id: number) {
        const user = await this.prisma.user.findUnique({
            where: { id_user: id },
            select: this.safeSelect,
        });

        if (!user) {
            throw new NotFoundException('User tidak ditemukan');
        }

        return user;
    }

    async update(id: number, dto: UpdateUserDto) {
        await this.findOne(id);

        if (dto.username) {
            await this.ensureUsernameAvailable(dto.username, id);
        }

        const { password, ...data } = dto;

        try {
            return await this.prisma.user.update({
                where: { id_user: id },
                data: {
                    ...data,
                    ...(password
                        ? { password: await bcrypt.hash(password, 12) }
                        : {}),
                },
                select: this.safeSelect,
            });
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                throw new ConflictException('Username sudah digunakan');
            }

            throw error;
        }
    }

    async updateStatus(id: number, status_aktif: boolean) {
        await this.findOne(id);

        return this.prisma.user.update({
            where: { id_user: id },
            data: { status_aktif },
            select: this.safeSelect,
        });
    }

    async remove(id: number) {
        const user = await this.findOne(id);

        await this.prisma.user.delete({
            where: { id_user: id },
        });

        return {
            message: 'User berhasil dihapus.',
            data: user,
        };
    }
}
