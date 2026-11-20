
import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Query,
    Req,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { TransaksiService } from './transaksi.service.js';

import { CreateTransaksiDto } from './dto/create-transaksi.dto.js';
import { ProsesKeluarDto } from './dto/proses-keluar.dto.js';
import { PembayaranTunaiDto } from './dto/pembayaran-tunai.dto.js';
import { FilterTransaksiDto } from './dto/filter-transaksi.dto.js';
import { BayarQrisDto } from './dto/bayar-qris.dto.js';
import { MidtransWebhookDto } from './dto/midtrans-webhook.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Public } from '../auth/decorators/public.decorator.js';

interface AuthenticatedRequest {
    user: {
        id_user: number;
    };
}

@ApiTags('Transaksi Parkir')
@ApiBearerAuth('JWT-auth')
@Controller('transaksi')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TransaksiController {
    constructor(
        private readonly transaksiService: TransaksiService,
    ) { }

    // ==========================================
    // KENDARAAN MASUK
    // ==========================================

    @ApiOperation({ summary: '1. Pendaftaran kendaraan masuk & cetak tiket (Admin, Petugas)' })
    @Post('masuk')
    @Roles('admin', 'petugas')
    async kendaraanMasuk(
        @Body() dto: CreateTransaksiDto,
        @Req() req: AuthenticatedRequest,
    ) {
        return this.transaksiService.create(
            dto,
            req.user.id_user,
        );
    }

    // ==========================================
    // SCAN QR DAN HITUNG TAGIHAN
    // ==========================================

    @ApiOperation({ summary: '2. Scan tiket QR / Kode Transaksi keluar & kalkulasi biaya (Admin, Petugas)' })
    @Post('keluar/scan')
    @Roles('admin', 'petugas')
    async prosesKeluar(
        @Body() dto: ProsesKeluarDto,
        @Req() req: AuthenticatedRequest,
    ) {
        return this.transaksiService.prosesKeluar(
            dto,
            req.user.id_user,
        );
    }

    // ==========================================
    // PEMBAYARAN TUNAI
    // ==========================================

    @ApiOperation({ summary: '3.A Pembayaran Tunai & Tutup Transaksi (Admin, Petugas)' })
    @Post('keluar/bayar-tunai')
    @Roles('admin', 'petugas')
    async pembayaranTunai(
        @Body() dto: PembayaranTunaiDto,
        @Req() req: AuthenticatedRequest,
    ) {
        return this.transaksiService.pembayaranTunai(
            dto,
            req.user.id_user,
        );
    }

    // ==========================================
    // PEMBAYARAN NON-TUNAI (DYNAMIC QRIS MIDTRANS)
    // ==========================================

    @ApiOperation({ summary: '3.B Request Dynamic QRIS Midtrans (Admin, Petugas)' })
    @Post('keluar/bayar-qris')
    @Roles('admin', 'petugas')
    async bayarQris(
        @Body() dto: BayarQrisDto,
        @Req() req: AuthenticatedRequest,
    ) {
        return this.transaksiService.bayarQris(
            dto,
            req.user.id_user,
        );
    }

    // ==========================================
    // WEBHOOK CALLBACK MIDTRANS (PUBLIK)
    // ==========================================

    @ApiOperation({ summary: 'Webhook Callback dari Midtrans (Public/No Auth)' })
    @Public()
    @UsePipes(new ValidationPipe({ whitelist: false, forbidNonWhitelisted: false, transform: true }))
    @Post('webhook/midtrans')
    async midtransWebhook(@Body() dto: MidtransWebhookDto) {
        return this.transaksiService.handleMidtransWebhook(dto);
    }

    // ==========================================
    // CEK STATUS PEMBAYARAN (POLLING FRONTEND)
    // ==========================================

    @ApiOperation({ summary: 'Cek Status Pembayaran Real-time (Polling QRIS)' })
    @Public()
    @Get('status-pembayaran/:identifier')
    async checkStatusPembayaran(@Param('identifier') identifier: string) {
        return this.transaksiService.checkStatusPembayaran(identifier);
    }

    // ==========================================
    // SIMULASI BAYAR QRIS LUNAS (UNTUK UPRAK / DEMO)
    // ==========================================

    @ApiOperation({ summary: 'Simulasi Bayar QRIS Sukses (Khusus Demo Uprak Tanpa Koneksi)' })
    @Post('keluar/simulasi-qris-lunas/:identifier')
    @Roles('admin', 'petugas')
    async simulasiQrisLunas(@Param('identifier') identifier: string) {
        return this.transaksiService.simulasiBayarQrisLunas(identifier);
    }

    // ==========================================
    // RIWAYAT SELURUH TRANSAKSI
    // ==========================================

    @ApiOperation({ summary: 'Riwayat Seluruh Transaksi Parkir dengan Filter & Pagination (Admin, Owner)' })
    @Get()
    @Roles('admin', 'owner')
    async findAll(
        @Query() filter: FilterTransaksiDto,
    ) {
        return this.transaksiService.findAll(filter);
    }

    // ==========================================
    // DETAIL TRANSAKSI
    // ==========================================

    @ApiOperation({ summary: 'Detail Transaksi berdasarkan ID (Admin, Owner)' })
    @Get(':id')
    @Roles('admin', 'owner')
    async findOne(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.transaksiService.findOne(id);
    }
}
