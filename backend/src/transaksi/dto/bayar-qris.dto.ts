import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { ProsesKeluarDto } from './proses-keluar.dto.js';

export class BayarQrisDto extends ProsesKeluarDto {
  @ApiPropertyOptional({
    example: 'gopay',
    description: 'Acquirer QRIS (default: gopay)',
    default: 'gopay',
  })
  @IsOptional()
  @IsString()
  acquirer?: string;
}
