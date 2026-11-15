
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

import { TarifService } from './tarif.service.js';
import { CreateTarifDto } from './dto/create-tarif.dto.js';
import { UpdateTarifDto } from './dto/update-tarif.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@ApiTags('Tarif Parkir')
@ApiBearerAuth('JWT-auth')
@Controller('tarif')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.admin)
export class TarifController {
    constructor(private readonly tarifService: TarifService) { }

    @ApiOperation({ summary: 'Menambahkan tarif untuk jenis kendaraan (Khusus Admin)' })
    @Post()
    create(@Body() dto: CreateTarifDto) {
        return this.tarifService.create(dto);
    }

    @ApiOperation({ summary: 'Mendapatkan seluruh daftar tarif parkir (Khusus Admin)' })
    @Get()
    findAll() {
        return this.tarifService.findAll();
    }

    @ApiOperation({ summary: 'Mendapatkan detail tarif berdasarkan ID (Khusus Admin)' })
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.tarifService.findOne(id);
    }

    @ApiOperation({ summary: 'Memperbarui tarif parkir (Khusus Admin)' })
    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateTarifDto,
    ) {
        return this.tarifService.update(id, dto);
    }

    @ApiOperation({ summary: 'Menghapus tarif parkir jika belum ada transaksi (Khusus Admin)' })
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.tarifService.remove(id);
    }
}
