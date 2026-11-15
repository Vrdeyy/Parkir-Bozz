import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateUserStatusDto {
  @ApiProperty({ example: false, description: 'Status aktif user (true = aktif, false = nonaktif)' })
  @IsBoolean()
  status_aktif!: boolean;
}
