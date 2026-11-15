import {
    Controller,
    Get,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { LogAktivitasService } from './log-aktivitas.service.js';
import { FilterLogDto } from './dto/filter-log.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Role } from '@prisma/client';

@ApiTags('Log Aktivitas')
@ApiBearerAuth('JWT-auth')
@Controller('log-aktivitas')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.admin)
export class LogAktivitasController {
    constructor(
        private readonly logAktivitasService: LogAktivitasService,
    ) {}

    @ApiOperation({
        summary: 'Rekap Log Aktivitas Pengguna (Khusus Admin)',
        description:
            'Menampilkan seluruh log aktivitas sistem dengan filter user, keyword, tanggal, dan pagination.',
    })
    @Get()
    async findAll(@Query() filter: FilterLogDto) {
        return this.logAktivitasService.findAll(filter);
    }
}
