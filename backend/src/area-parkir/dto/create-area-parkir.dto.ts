import {
    IsInt,
    IsString,
    Length,
    Matches,
    Min,
} from 'class-validator';

export class CreateAreaParkirDto {
    @IsString()
    @Length(1, 50)
    @Matches(/\S/)
    nama_area: string;

    @IsInt()
    @Min(1)
    kapasitas: number;
}