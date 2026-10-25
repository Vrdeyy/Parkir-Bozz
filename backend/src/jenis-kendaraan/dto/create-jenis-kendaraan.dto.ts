import { IsString, Length } from 'class-validator';

export class CreateJenisKendaraanDto {
    @IsString()
    @Length(1, 30)
    nama_jenis: string;
}
