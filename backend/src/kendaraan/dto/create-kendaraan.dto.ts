
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsInt,
    IsOptional,
    IsString,
    Length,
    MaxLength,
    Min,
} from 'class-validator';

export class CreateKendaraanDto {
    @ApiProperty({ example: 'B 1234 ABC', description: 'Plat nomor unik kendaraan' })
    @IsString()
    @Length(1, 15)
    plat_nomor: string;

    @ApiProperty({ example: 1, description: 'ID jenis kendaraan (Motor/Mobil)' })
    @IsInt()
    @Min(1)
    id_jenis: number;

    @ApiPropertyOptional({ example: 'Hitam', description: 'Warna kendaraan' })
    @IsOptional()
    @IsString()
    @MaxLength(20)
    warna?: string;

    @ApiPropertyOptional({ example: 'Budi Santoso', description: 'Nama pemilik kendaraan' })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    pemilik?: string;

    @ApiPropertyOptional({ example: 1, description: 'ID User pemilik (jika terdaftar sebagai user)' })
    @IsOptional()
    @IsInt()
    @Min(1)
    id_user?: number;
}
