import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsBoolean,
    IsEnum,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
    @ApiProperty({ example: 'Petugas Parkir 01', description: 'Nama lengkap pengguna' })
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    nama_lengkap!: string;

    @ApiProperty({ example: 'petugas01', description: 'Username unik' })
    @IsString()
    @MinLength(3)
    @MaxLength(50)
    username!: string;

    @ApiProperty({ example: 'PasswordPetugas123', description: 'Password minimal 12 karakter' })
    @IsString()
    @MinLength(12)
    @MaxLength(72)
    password!: string;

    @ApiProperty({ enum: Role, example: Role.petugas, description: 'Peran pengguna (admin, petugas, owner)' })
    @IsEnum(Role)
    role!: Role;

    @ApiPropertyOptional({ example: true, description: 'Status aktif akun', default: true })
    @IsOptional()
    @IsBoolean()
    status_aktif?: boolean;
}