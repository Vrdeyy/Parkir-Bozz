
import {
    IsInt,
    IsOptional,
    IsString,
    Length,
    MaxLength,
    Min,
} from 'class-validator';

export class CreateKendaraanDto {
    @IsString()
    @Length(1, 15)
    plat_nomor: string;

    @IsInt()
    @Min(1)
    id_jenis: number;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    warna?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    pemilik?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    id_user?: number;
}
