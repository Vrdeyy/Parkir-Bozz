
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

import { KendaraanService } from './kendaraan.service.js';
import { CreateKendaraanDto } from './dto/create-kendaraan.dto.js';
import { UpdateKendaraanDto } from './dto/update-kendaraan.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Role } from '@prisma/client';

@Controller('kendaraan')
@UseGuards(JwtAuthGuard, RolesGuard)
export class KendaraanController {
    constructor(
        private readonly kendaraanService: KendaraanService,
    ) { }

    @Get()
    @Roles(Role.admin, Role.petugas)
    findAll() {
        return this.kendaraanService.findAll();
    }

    @Get(':id')
    @Roles(Role.admin, Role.petugas)
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.kendaraanService.findOne(id);
    }

    @Post()
    @Roles(Role.admin, Role.petugas)
    create(@Body() dto: CreateKendaraanDto) {
        return this.kendaraanService.create(dto);
    }

    @Patch(':id')
    @Roles(Role.admin)
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateKendaraanDto,
    ) {
        return this.kendaraanService.update(id, dto);
    }

    @Delete(':id')
    @Roles(Role.admin)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.kendaraanService.remove(id);
    }
}
