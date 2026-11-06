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

import { Role } from '@prisma/client';

import { AreaParkirService } from './area-parkir.service.js';

import { CreateAreaParkirDto } from './dto/create-area-parkir.dto.js';
import { UpdateAreaParkirDto } from './dto/update-area-parkir.dto.js';
import { UpdateStatusAreaParkirDto } from './dto/update-status-area-parkir.dto.js';
import { HardDeleteAreaParkirDto } from './dto/hard-delete-area-parkir.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@Controller('area-parkir')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AreaParkirController {
    constructor(
        private readonly areaParkirService: AreaParkirService,
    ) { }

    @Get()
    @Roles(Role.admin, Role.petugas)
    findAll() {
        return this.areaParkirService.findAll();
    }

    @Get(':id')
    @Roles(Role.admin, Role.petugas)
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.areaParkirService.findOne(id);
    }

    @Post()
    @Roles(Role.admin)
    create(@Body() dto: CreateAreaParkirDto) {
        return this.areaParkirService.create(dto);
    }

    @Patch(':id')
    @Roles(Role.admin)
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateAreaParkirDto,
    ) {
        return this.areaParkirService.update(id, dto);
    }

    @Patch(':id/status')
    @Roles(Role.admin)
    updateStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateStatusAreaParkirDto,
    ) {
        return this.areaParkirService.updateStatus(id, dto);
    }

    @Delete(':id')
    @Roles(Role.admin)
    hardDelete(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: HardDeleteAreaParkirDto,
    ) {
        return this.areaParkirService.hardDelete(id, dto);
    }
}