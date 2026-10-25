import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateJenisKendaraanDto {
    @IsOptional()
    @IsString()
    @Length(1, 30)
    nama_jenis?: string;
}
