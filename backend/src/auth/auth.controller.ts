import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';
import { Roles } from './decorators/roles.decorator.js';
import { Role } from '@prisma/client';

type AuthenticatedRequest = Request & {
  user: {
    id_user: number;
    username: string;
    nama_lengkap: string;
    role: Role;
  };
};

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Login user untuk mendapatkan JWT Access Token' })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mendapatkan profil user yang sedang login' })
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: AuthenticatedRequest) {
    return req.user;
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Test endpoint khusus role Admin' })
  @Get('admin-only')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  adminOnly() {
    return {
      message: 'Akses admin berhasil',
    };
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Test endpoint khusus role Petugas' })
  @Get('petugas-only')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.petugas)
  petugasOnly() {
    return {
      message: 'Akses petugas berhasil',
    };
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Test endpoint khusus role Owner' })
  @Get('owner-only')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.owner)
  ownerOnly() {
    return {
      message: 'Akses owner berhasil',
    };
  }
}