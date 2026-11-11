import {
    Body,
    Controller,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';

import { TransaksiService } from './transaksi.service.js';
import { CreateTransaksiDto } from './dto/create-transaksi.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

interface AuthenticatedRequest {
    user: {
        id_user: number;
    };
}

@Controller('transaksi')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TransaksiController {
    constructor(
        private readonly transaksiService: TransaksiService,
    ) { }

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
}