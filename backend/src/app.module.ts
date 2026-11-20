
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { createObserveModule } from '@nestjs/observe';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { UsersModule } from './users/users.module.js';
import { TarifModule } from './tarif/tarif.module.js';
import { JenisKendaraanModule } from './jenis-kendaraan/jenis-kendaraan.module.js';
import { KendaraanModule } from './kendaraan/kendaraan.module.js';
import { AreaParkirModule } from './area-parkir/area-parkir.module.js';
import { TransaksiModule } from './transaksi/transaksi.module.js';
import { LogAktivitasModule } from './log-aktivitas/log-aktivitas.module.js';
import { LogAktivitasInterceptor } from './log-aktivitas/log-aktivitas.interceptor.js';
import { DashboardModule } from './dashboard/dashboard.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ObserveModule.forRoot({
      appKey: process.env.OBSERVE_APP_KEY ?? 'YOUR_APP_KEY',
      appSecret: process.env.OBSERVE_APP_SECRET ?? 'YOUR_APP_SECRET',
      serviceId: 'backend',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    JenisKendaraanModule,
    TarifModule,
    AreaParkirModule,
    KendaraanModule,
    TransaksiModule,
    DashboardModule,
    LogAktivitasModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LogAktivitasInterceptor,
    },
  ],
})
export class AppModule { }