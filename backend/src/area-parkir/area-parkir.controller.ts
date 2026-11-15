import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Role } from '@prisma/client';

import { AreaParkirService } from './area-parkir.service.js';

import { CreateAreaParkirDto } from './dto/create-area-parkir.dto.js';
import { UpdateAreaParkirDto } from './dto/update-area-parkir.dto.js';
import { UpdateStatusAreaParkirDto } from './dto/update-status-area-parkir.dto.js';
import { HardDeleteAreaParkirDto } from './dto/hard-delete-area-parkir.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@ApiTags('Area Parkir')
@ApiBearerAuth('JWT-auth')
@Controller('area-parkir')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.admin)
export class AreaParkirController {
    constructor(
        private readonly areaParkirService: AreaParkirService,
    ) { }

    @ApiOperation({ summary: 'Mendapatkan seluruh daftar area parkir (Khusus Admin)' })
    @Get()
    findAll() {
        return this.areaParkirService.findAll();
    }

    @ApiOperation({ summary: 'Mendapatkan detail area parkir berdasarkan ID (Khusus Admin)' })
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.areaParkirService.findOne(id);
    }

    @ApiOperation({ summary: 'Membuat area parkir baru (Khusus Admin)' })
    @Post()
    create(@Body() dto: CreateAreaParkirDto) {
        return this.areaParkirService.create(dto);
    }

    @ApiOperation({ summary: 'Memperbarui nama dan kapasitas area parkir (Khusus Admin)' })
    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateAreaParkirDto,
    ) {
        return this.areaParkirService.update(id, dto);
    }

    @ApiOperation({ summary: 'Mengubah status aktif/nonaktif area parkir (Soft Delete) (Khusus Admin)' })
    @Patch(':id/status')
    updateStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateStatusAreaParkirDto,
    ) {
        return this.areaParkirService.updateStatus(id, dto);
    }

    @ApiOperation({ summary: 'Menghapus permanen area parkir (Wajib konfirmasi HAPUS_PERMANEN) (Khusus Admin)' })
    @Delete(':id')
    hardDelete(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: HardDeleteAreaParkirDto,
    ) {
        return this.areaParkirService.hardDelete(id, dto);
    }
}