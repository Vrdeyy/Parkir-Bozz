import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsInt,
    IsOptional,
    IsString,
    Length,
    MaxLength,
    Min,
} from 'class-validator';

export class CreateTransaksiDto {
    @ApiProperty({ example: 'B 1234 XYZ', description: 'Plat nomor kendaraan' })
    @Transform(({ value }) =>
        typeof value === 'string' ? value.trim().toUpperCase() : value,
    )
    @IsString()
    @Length(1, 15)
    plat_nomor!: string;

    @ApiProperty({ example: 1, description: 'ID jenis kendaraan (1: Motor, 2: Mobil)' })
    @IsInt()
    @Min(1)
    id_jenis!: number;

    @ApiPropertyOptional({ example: 'Hitam', description: 'Warna kendaraan' })
    @IsOptional()
    @IsString()
    @MaxLength(20)
    warna?: string;

    @ApiPropertyOptional({ example: 'Ahmad', description: 'Nama pemilik kendaraan' })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    pemilik?: string;

    @ApiProperty({ example: 1, description: 'ID area parkir yang dituju' })
    @IsInt()
    @Min(1)
    id_area!: number;
}