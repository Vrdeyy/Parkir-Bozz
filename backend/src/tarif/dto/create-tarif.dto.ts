import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTarifDto {
    @ApiProperty({ example: 1, description: 'ID jenis kendaraan' })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    id_jenis!: number;

    @ApiProperty({ example: 3000, description: 'Tarif per jam (rupiah)' })
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 0 })
    @Min(0)
    tarif_per_jam!: number;
}
