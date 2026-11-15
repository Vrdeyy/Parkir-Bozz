import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsDateString,
    IsIn,
    IsInt,
    IsOptional,
    Max,
    Min,
} from 'class-validator';

export class FilterLaporanDto {
    @ApiPropertyOptional({
        example: '2026-11-01',
        description: 'Filter tanggal mulai (ISO Date)',
    })
    @IsOptional()
    @IsDateString()
    tanggal_mulai?: string;

    @ApiPropertyOptional({
        example: '2026-11-30',
        description: 'Filter tanggal selesai (ISO Date)',
    })
    @IsOptional()
    @IsDateString()
    tanggal_selesai?: string;

    @ApiPropertyOptional({
        enum: ['tunai', 'non_tunai'],
        description: 'Filter berdasarkan metode pembayaran',
    })
    @IsOptional()
    @IsIn(['tunai', 'non_tunai'])
    metode_pembayaran?: 'tunai' | 'non_tunai';

    @ApiPropertyOptional({
        example: 1,
        description: 'Filter berdasarkan ID area parkir',
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    id_area?: number;

    @ApiPropertyOptional({ example: 1, default: 1, description: 'Halaman pagination' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page: number = 1;

    @ApiPropertyOptional({
        example: 20,
        default: 20,
        description: 'Jumlah data per halaman',
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit: number = 20;
}

export class FilterGrafikDto {
    @ApiPropertyOptional({ example: '2026-11-01', description: 'Tanggal mulai grafik' })
    @IsOptional()
    @IsDateString()
    tanggal_mulai?: string;

    @ApiPropertyOptional({ example: '2026-11-30', description: 'Tanggal selesai grafik' })
    @IsOptional()
    @IsDateString()
    tanggal_selesai?: string;

    @ApiPropertyOptional({ enum: ['harian', 'bulanan'], default: 'harian' })
    @IsOptional()
    @IsIn(['harian', 'bulanan'])
    interval: 'harian' | 'bulanan' = 'harian';

    @ApiPropertyOptional({ example: 1, description: 'Filter area parkir' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    id_area?: number;
}
