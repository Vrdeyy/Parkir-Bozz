import { IsInt, Min } from 'class-validator';
import { ProsesKeluarDto } from './proses-keluar.dto.js';

export class PembayaranTunaiDto extends ProsesKeluarDto {
    @IsInt()
    @Min(0)
    jumlah_bayar!: number;
}