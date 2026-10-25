
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
import { JenisKendaraanService } from './jenis-kendaraan.service.js';
import { CreateJenisKendaraanDto } from './dto/create-jenis-kendaraan.dto.js';
import { UpdateJenisKendaraanDto } from './dto/update-jenis-kendaraan.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Role } from '@prisma/client';

@Controller('jenis-kendaraan')
@UseGuards(JwtAuthGuard, RolesGuard)
export class JenisKendaraanController {
    constructor(
        private readonly jenisKendaraanService: JenisKendaraanService,
    ) { }

    @Get()
    @Roles(Role.admin, Role.petugas)
    findAll() {
        return this.jenisKendaraanService.findAll();
    }

    @Get(':id')
    @Roles(Role.admin, Role.petugas)
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.jenisKendaraanService.findOne(id);
    }

    @Post()
    @Roles(Role.admin)
    create(@Body() dto: CreateJenisKendaraanDto) {
        return this.jenisKendaraanService.create(dto);
    }

    @Patch(':id')
    @Roles(Role.admin)
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateJenisKendaraanDto,
    ) {
        return this.jenisKendaraanService.update(id, dto);
    }

    @Delete(':id')
    @Roles(Role.admin)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.jenisKendaraanService.remove(id);
    }
}
