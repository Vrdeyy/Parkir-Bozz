
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
    IsDateString,
    IsIn,
    IsInt,
    IsOptional,
    IsString,
    Max,
    MaxLength,
    Min,
} from 'class-validator';

export class FilterTransaksiDto {
    @ApiPropertyOptional({ enum: ['masuk', 'keluar'], description: 'Filter berdasarkan status kendaraan' })
    @IsOptional()
    @IsIn(['masuk', 'keluar'])
    status?: 'masuk' | 'keluar';

    @ApiPropertyOptional({ example: 'B 1234 XYZ', description: 'Filter pencarian plat nomor' })
    @IsOptional()
    @Transform(({ value }) =>
        typeof value === 'string'
            ? value.trim().toUpperCase()
            : value,
    )
    @IsString()
    @MaxLength(15)
    plat_nomor?: string;

    @ApiPropertyOptional({ example: '2026-11-01', description: 'Filter tanggal mulai (ISO Date format)' })
    @IsOptional()
    @IsDateString()
    tanggal_mulai?: string;

    @ApiPropertyOptional({ example: '2026-11-30', description: 'Filter tanggal selesai (ISO Date format)' })
    @IsOptional()
    @IsDateString()
    tanggal_selesai?: string;

    @ApiPropertyOptional({ example: 1, default: 1, description: 'Halaman data (pagination)' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page: number = 1;

    @ApiPropertyOptional({ example: 10, default: 10, description: 'Batas jumlah data per halaman' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit: number = 10;
}
