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
    @Transform(({ value }) =>
        typeof value === 'string' ? value.trim().toUpperCase() : value,
    )
    @IsString()
    @Length(1, 15)
    plat_nomor!: string;

    @IsInt()
    @Min(1)
    id_jenis!: number;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    warna?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    pemilik?: string;

    @IsInt()
    @Min(1)
    id_area!: number;
}