import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { LogAktivitasService } from './log-aktivitas.service.js';
import { LogAktivitasController } from './log-aktivitas.controller.js';

@Module({
    imports: [PrismaModule, AuthModule],
    controllers: [LogAktivitasController],
    providers: [LogAktivitasService],
    exports: [LogAktivitasService],
})
export class LogAktivitasModule {}
