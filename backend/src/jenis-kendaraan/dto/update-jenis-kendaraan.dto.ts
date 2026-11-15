import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateJenisKendaraanDto {
    @ApiPropertyOptional({ example: 'Sepeda Motor', description: 'Nama jenis kendaraan baru' })
    @IsOptional()
    @IsString()
    @Length(1, 30)
    nama_jenis?: string;
}
