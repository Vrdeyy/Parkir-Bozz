import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { DashboardService } from './dashboard.service.js';
import { DashboardController } from './dashboard.controller.js';

@Module({
    imports: [PrismaModule, AuthModule],
    controllers: [DashboardController],
    providers: [DashboardService],
})
export class DashboardModule {}
