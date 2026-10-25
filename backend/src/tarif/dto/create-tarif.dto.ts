import { IsInt, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTarifDto {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    id_jenis!: number;

    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 0 })
    @Min(0)
    tarif_per_jam!: number;
}
