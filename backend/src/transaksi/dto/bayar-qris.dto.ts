import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProsesKeluarDto } from './proses-keluar.dto.js';

export class BayarQrisDto extends ProsesKeluarDto {
  @ApiPropertyOptional({
    example: 'gopay',
    description: 'Acquirer QRIS (default: gopay)',
    default: 'gopay',
  })
  acquirer?: string;
}
