import { Module } from '@nestjs/common';

import { TransaksiController } from './transaksi.controller.js';
import { TransaksiService } from './transaksi.service.js';
import { MidtransService } from './midtrans.service.js';

import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
  ],
  controllers: [TransaksiController],
  providers: [TransaksiService, MidtransService],
  exports: [TransaksiService, MidtransService],
})
export class TransaksiModule { }