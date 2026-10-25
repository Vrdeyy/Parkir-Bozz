import { IsInt, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateTarifDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    id_jenis?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 0 })
    @Min(0)
    tarif_per_jam?: number;
}
