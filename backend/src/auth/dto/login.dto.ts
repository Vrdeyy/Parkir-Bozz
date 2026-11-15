import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
    @ApiProperty({ example: 'admin', description: 'Username pengguna' })
    @IsString()
    @MinLength(1)
    @MaxLength(50)
    username: string;

    @ApiProperty({ example: 'obatkuat1234', description: 'Password pengguna' })
    @IsString()
    @MinLength(1)
    @MaxLength(50)
    password: string;
}