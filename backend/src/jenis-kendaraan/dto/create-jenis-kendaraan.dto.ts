import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class CreateJenisKendaraanDto {
    @ApiProperty({ example: 'Motor', description: 'Nama jenis kendaraan (unik)' })
    @IsString()
    @Length(1, 30)
    nama_jenis: string;
}
