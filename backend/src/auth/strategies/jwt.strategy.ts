import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        config: ConfigService,
        private readonly prisma: PrismaService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
        });
    }

    async validate(payload: { sub: number }) {
        const user = await this.prisma.user.findUnique({
            where: { id_user: payload.sub },
            select: {
                id_user: true,
                username: true,
                nama_lengkap: true,
                role: true,
                status_aktif: true,
            },
        });

        if (!user || !user.status_aktif) {
            throw new UnauthorizedException('Akun tidak aktif atau tidak ditemukan');
        }

        return {
            id_user: user.id_user,
            username: user.username,
            nama_lengkap: user.nama_lengkap,
            role: user.role,
        };
    }
}