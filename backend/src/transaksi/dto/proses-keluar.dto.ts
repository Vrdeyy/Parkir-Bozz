import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class ProsesKeluarDto {
  @ApiPropertyOptional({
    example: 'f8c9b1a2e3d4c5b6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0',
    description: 'QR Token (64 karakter hex) ATAU Kode Transaksi (misal: PKR-...)',
  })
  @IsOptional()
  @IsString()
  @Length(5, 64)
  qr_token?: string;

  @ApiPropertyOptional({
    example: 'PKR-17316749-A1B2C3D4',
    description: 'Kode Transaksi unik alternatif',
  })
  @IsOptional()
  @IsString()
  @Length(5, 64)
  kode_transaksi?: string;

  @ApiPropertyOptional({
    example: 'PKR-17316749-A1B2C3D4',
    description: 'Identitas tiket hasil scan kamera (bisa berupa qr_token atau kode_transaksi)',
  })
  @IsOptional()
  @IsString()
  @Length(5, 64)
  identitas_tiket?: string;
}