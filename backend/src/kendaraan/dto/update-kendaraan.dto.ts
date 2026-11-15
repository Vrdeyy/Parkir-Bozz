
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsInt,
    IsOptional,
    IsString,
    Length,
    MaxLength,
    Min,
} from 'class-validator';

export class UpdateKendaraanDto {
    @ApiPropertyOptional({ example: 'B 1234 XYZ', description: 'Plat nomor baru' })
    @IsOptional()
    @IsString()
    @Length(1, 15)
    plat_nomor?: string;

    @ApiPropertyOptional({ example: 2, description: 'ID jenis kendaraan baru' })
    @IsOptional()
    @IsInt()
    @Min(1)
    id_jenis?: number;

    @ApiPropertyOptional({ example: 'Putih', description: 'Warna kendaraan baru' })
    @IsOptional()
    @IsString()
    @MaxLength(20)
    warna?: string;

    @ApiPropertyOptional({ example: 'Joko', description: 'Nama pemilik baru' })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    pemilik?: string;

    @ApiPropertyOptional({ example: 2, description: 'ID User pemilik baru' })
    @IsOptional()
    @IsInt()
    @Min(1)
    id_user?: number;
}
