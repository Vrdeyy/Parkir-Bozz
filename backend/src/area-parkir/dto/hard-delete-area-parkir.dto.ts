import { Equals } from 'class-validator';

export class HardDeleteAreaParkirDto {
    @Equals('HAPUS_PERMANEN')
    konfirmasi: string;
}