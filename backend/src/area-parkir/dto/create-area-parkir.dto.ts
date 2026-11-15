import { ApiProperty } from '@nestjs/swagger';
import {
    IsInt,
    IsString,
    Length,
    Matches,
    Min,
} from 'class-validator';

export class CreateAreaParkirDto {
    @ApiProperty({ example: 'Area Gedung A', description: 'Nama area parkir' })
    @IsString()
    @Length(1, 50)
    @Matches(/\S/)
    nama_area: string;

    @ApiProperty({ example: 50, description: 'Kapasitas maksimal kendaraan' })
    @IsInt()
    @Min(1)
    kapasitas: number;
}