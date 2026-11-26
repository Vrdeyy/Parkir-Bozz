
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
import { JenisKendaraanService } from './jenis-kendaraan.service.js';
import { CreateJenisKendaraanDto } from './dto/create-jenis-kendaraan.dto.js';
import { UpdateJenisKendaraanDto } from './dto/update-jenis-kendaraan.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Role } from '@prisma/client';

@ApiTags('Jenis Kendaraan')
@ApiBearerAuth('JWT-auth')
@Controller('jenis-kendaraan')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.admin)
export class JenisKendaraanController {
    constructor(
        private readonly jenisKendaraanService: JenisKendaraanService,
    ) { }

    @ApiOperation({ summary: 'Mendapatkan semua jenis kendaraan (Admin, Petugas)' })
    @Get()
    @Roles(Role.admin, Role.petugas)
    findAll() {
        return this.jenisKendaraanService.findAll();
    }

    @ApiOperation({ summary: 'Mendapatkan detail jenis kendaraan berdasarkan ID (Admin, Petugas)' })
    @Get(':id')
    @Roles(Role.admin, Role.petugas)
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.jenisKendaraanService.findOne(id);
    }

    @ApiOperation({ summary: 'Menambahkan jenis kendaraan baru (Khusus Admin)' })
    @Post()
    create(@Body() dto: CreateJenisKendaraanDto) {
        return this.jenisKendaraanService.create(dto);
    }

    @ApiOperation({ summary: 'Memperbarui nama jenis kendaraan (Khusus Admin)' })
    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateJenisKendaraanDto,
    ) {
        return this.jenisKendaraanService.update(id, dto);
    }

    @ApiOperation({ summary: 'Menghapus jenis kendaraan jika belum direferensikan (Khusus Admin)' })
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.jenisKendaraanService.remove(id);
    }
}
