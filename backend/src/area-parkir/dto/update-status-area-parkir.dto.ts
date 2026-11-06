import { IsBoolean } from 'class-validator';

export class UpdateStatusAreaParkirDto {
    @IsBoolean()
    status_aktif: boolean;
}