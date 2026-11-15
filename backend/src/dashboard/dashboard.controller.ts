import {
    Controller,
    Get,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { DashboardService } from './dashboard.service.js';
import { FilterGrafikDto, FilterLaporanDto } from './dto/filter-laporan.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Role } from '@prisma/client';

@ApiTags('Dashboard & Laporan')
@ApiBearerAuth('JWT-auth')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.admin, Role.owner)
export class DashboardController {
    constructor(
        private readonly dashboardService: DashboardService,
    ) {}

    @ApiOperation({
        summary: 'Dashboard Summary Real-time (Admin, Owner)',
        description:
            'Omzet harian/mingguan/bulanan, jumlah kendaraan aktif, okupansi area, dan statistik transaksi hari ini.',
    })
    @Get('summary')
    async getSummary() {
        return this.dashboardService.getSummary();
    }

    @ApiOperation({
        summary: 'Laporan Rekap Transaksi dengan Filter (Admin, Owner)',
        description:
            'Rekap pendapatan terfilter berdasarkan tanggal, metode pembayaran, dan area parkir. Menampilkan ringkasan tunai/non-tunai dan data transaksi paginated.',
    })
    @Get('laporan-rekap')
    async getLaporanRekap(@Query() filter: FilterLaporanDto) {
        return this.dashboardService.getLaporanRekap(filter);
    }

    @ApiOperation({
        summary: 'Data grafik pendapatan (Admin, Owner)',
        description: 'Total pembayaran lunas per hari atau bulan untuk ditampilkan sebagai grafik.',
    })
    @Get('grafik-pendapatan')
    async getGrafikPendapatan(@Query() filter: FilterGrafikDto) {
        return this.dashboardService.getGrafikPendapatan(filter);
    }
}
