import { ApiProperty } from '@nestjs/swagger';
import { Equals } from 'class-validator';

export class HardDeleteAreaParkirDto {
    @ApiProperty({ example: 'HAPUS_PERMANEN', description: 'Konfirmasi string harus sama persis dengan HAPUS_PERMANEN' })
    @Equals('HAPUS_PERMANEN')
    konfirmasi: string;
}