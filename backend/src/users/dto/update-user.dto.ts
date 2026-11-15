import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from '@prisma/client';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Petugas Parkir Updated', description: 'Nama lengkap baru' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  nama_lengkap?: string;

  @ApiPropertyOptional({ example: 'petugas01_edit', description: 'Username baru' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username?: string;

  @ApiPropertyOptional({ example: 'PasswordBaru123', description: 'Password baru minimal 12 karakter' })
  @IsOptional()
  @IsString()
  @MinLength(12)
  @MaxLength(72)
  password?: string;

  @ApiPropertyOptional({ enum: Role, example: Role.petugas, description: 'Role pengguna' })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({ example: true, description: 'Status aktif pengguna' })
  @IsOptional()
  @IsBoolean()
  status_aktif?: boolean;
}