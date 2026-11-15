import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { ProsesKeluarDto } from './proses-keluar.dto.js';

export class PembayaranTunaiDto extends ProsesKeluarDto {
    @ApiProperty({ example: 50000, description: 'Jumlah uang tunai yang diserahkan pemarkir' })
    @IsInt()
    @Min(0)
    jumlah_bayar!: number;
}