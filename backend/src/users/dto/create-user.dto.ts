
import {
    IsBoolean,
    IsEnum,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    nama_lengkap!: string;

    @IsString()
    @MinLength(3)
    @MaxLength(50)
    username!: string;

    @IsString()
    @MinLength(8)
    @MaxLength(72)
    password!: string;

    @IsEnum(Role)
    role!: Role;

    @IsBoolean()
    status_aktif!: boolean;
}
