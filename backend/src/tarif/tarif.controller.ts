
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

import { TarifService } from './tarif.service.js';
import { CreateTarifDto } from './dto/create-tarif.dto.js';
import { UpdateTarifDto } from './dto/update-tarif.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@Controller('tarif')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TarifController {
    constructor(private readonly tarifService: TarifService) { }

    @Post()
    @Roles(Role.admin)
    create(@Body() dto: CreateTarifDto) {
        return this.tarifService.create(dto);
    }

    @Get()
    @Roles(Role.admin, Role.petugas, Role.owner)
    findAll() {
        return this.tarifService.findAll();
    }

    @Get(':id')
    @Roles(Role.admin, Role.petugas, Role.owner)
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.tarifService.findOne(id);
    }

    @Patch(':id')
    @Roles(Role.admin)
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateTarifDto,
    ) {
        return this.tarifService.update(id, dto);
    }

    @Delete(':id')
    @Roles(Role.admin)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.tarifService.remove(id);
    }
}
