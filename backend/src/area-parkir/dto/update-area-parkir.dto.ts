import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsInt,
    IsOptional,
    IsString,
    Length,
    Matches,
    Min,
} from 'class-validator';

export class UpdateAreaParkirDto {
    @ApiPropertyOptional({ example: 'Area Gedung A Baru', description: 'Nama area parkir baru' })
    @IsOptional()
    @IsString()
    @Length(1, 50)
    @Matches(/\S/)
    nama_area?: string;

    @ApiPropertyOptional({ example: 60, description: 'Kapasitas baru (tidak boleh kurang dari jumlah terisi)' })
    @IsOptional()
    @IsInt()
    @Min(1)
    kapasitas?: number;
}