import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateStatusAreaParkirDto {
    @ApiProperty({ example: false, description: 'Status aktif area parkir (true = aktif, false = nonaktif)' })
    @IsBoolean()
    status_aktif: boolean;
}