
import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    ParseIntPipe,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { KendaraanService } from './kendaraan.service.js';
import { CreateKendaraanDto } from './dto/create-kendaraan.dto.js';
import { UpdateKendaraanDto } from './dto/update-kendaraan.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Role } from '@prisma/client';

@ApiTags('Master Kendaraan')
@ApiBearerAuth('JWT-auth')
@Controller('kendaraan')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.admin)
export class KendaraanController {
    constructor(
        private readonly kendaraanService: KendaraanService,
    ) { }

    @ApiOperation({ summary: 'Mendapatkan daftar seluruh kendaraan (Khusus Admin)' })
    @Get()
    findAll() {
        return this.kendaraanService.findAll();
    }

    @ApiOperation({ summary: 'Mendapatkan detail kendaraan berdasarkan ID (Khusus Admin)' })
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.kendaraanService.findOne(id);
    }

    @ApiOperation({ summary: 'Mendaftarkan data kendaraan baru (Khusus Admin)' })
    @Post()
    create(@Body() dto: CreateKendaraanDto) {
        return this.kendaraanService.create(dto);
    }

    @ApiOperation({ summary: 'Memperbarui data kendaraan (Khusus Admin)' })
    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateKendaraanDto,
    ) {
        return this.kendaraanService.update(id, dto);
    }

    @ApiOperation({ summary: 'Menghapus data kendaraan jika belum memiliki riwayat transaksi (Khusus Admin)' })
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.kendaraanService.remove(id);
    }
}
