import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
    IsDateString,
    IsInt,
    IsOptional,
    IsString,
    Max,
    Min,
} from 'class-validator';

export class FilterLogDto {
    @ApiPropertyOptional({ example: 1, description: 'Filter berdasarkan ID user pelaku' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    id_user?: number;

    @ApiPropertyOptional({ example: 'login', description: 'Pencarian kata kunci aktivitas' })
    @IsOptional()
    @Transform(({ value }) =>
        typeof value === 'string' ? value.trim() : value,
    )
    @IsString()
    aktivitas?: string;

    @ApiPropertyOptional({ example: '2026-11-01', description: 'Filter tanggal mulai' })
    @IsOptional()
    @IsDateString()
    tanggal_mulai?: string;

    @ApiPropertyOptional({ example: '2026-11-30', description: 'Filter tanggal selesai' })
    @IsOptional()
    @IsDateString()
    tanggal_selesai?: string;

    @ApiPropertyOptional({ example: 1, default: 1, description: 'Halaman pagination' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page: number = 1;

    @ApiPropertyOptional({ example: 20, default: 20, description: 'Jumlah data per halaman' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit: number = 20;
}
