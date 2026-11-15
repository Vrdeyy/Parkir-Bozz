import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateTarifDto {
    @ApiPropertyOptional({ example: 1, description: 'ID jenis kendaraan' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    id_jenis?: number;

    @ApiPropertyOptional({ example: 4000, description: 'Tarif per jam baru (rupiah)' })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 0 })
    @Min(0)
    tarif_per_jam?: number;
}
