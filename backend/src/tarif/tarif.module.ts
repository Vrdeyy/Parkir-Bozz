import { Module } from '@nestjs/common';
import { TarifController } from './tarif.controller.js';
import { TarifService } from './tarif.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [TarifController],
  providers: [TarifService],
})
export class TarifModule { }
