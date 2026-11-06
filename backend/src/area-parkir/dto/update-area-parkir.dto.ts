import {
    IsInt,
    IsOptional,
    IsString,
    Length,
    Matches,
    Min,
} from 'class-validator';

export class UpdateAreaParkirDto {
    @IsOptional()
    @IsString()
    @Length(1, 50)
    @Matches(/\S/)
    nama_area?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    kapasitas?: number;
}