import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { LogAktivitasService } from './log-aktivitas.service.js';

/**
 * Interceptor global yang otomatis mencatat setiap mutasi (POST, PATCH, DELETE)
 * ke tabel tb_log_aktivitas setelah request berhasil.
 */
@Injectable()
export class LogAktivitasInterceptor implements NestInterceptor {
    constructor(
        private readonly logAktivitasService: LogAktivitasService,
    ) {}

    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<unknown> {
        const request = context.switchToHttp().getRequest();
        const method: string = request.method;

        // Hanya log mutasi: POST, PATCH, PUT, DELETE
        const mutasiMethods = ['POST', 'PATCH', 'PUT', 'DELETE'];
        if (!mutasiMethods.includes(method.toUpperCase())) {
            return next.handle();
        }

        // Skip endpoint publik yang tidak punya user (e.g. webhook Midtrans)
        const user = request.user;
        if (!user || !user.id_user) {
            return next.handle();
        }

        const path: string = request.route?.path ?? request.url;
        const controllerName =
            context.getClass().name.replace('Controller', '') ?? '';

        return next.handle().pipe(
            tap({
                next: () => {
                    // Buat deskripsi aktivitas yang ringkas
                    const aktivitas =
                        `${method} ${path} [${controllerName}]`.substring(
                            0,
                            100,
                        );

                    // Fire-and-forget: jangan blokir respons
                    this.logAktivitasService
                        .create(user.id_user, aktivitas)
                        .catch(() => {
                            // Gagal logging tidak boleh menggagalkan request
                        });
                },
            }),
        );
    }
}
