import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule, ObserveInstrument } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('API Parkir-Bos')
    .setDescription('Dokumentasi API Sistem Manajemen Parkir (Parkir-Bos)')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Masukkan JWT Token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'Autentikasi & Login Pengguna')
    .addTag('Manajemen User', 'Manajemen Pengguna & Hak Akses (Khusus Admin)')
    .addTag('Jenis Kendaraan', 'Master Data Jenis Kendaraan (Khusus Admin)')
    .addTag('Tarif Parkir', 'Master Data Tarif Parkir (Khusus Admin)')
    .addTag('Area Parkir', 'Master Data Area Parkir (Khusus Admin)')
    .addTag('Master Kendaraan', 'Master Data Kendaraan (Khusus Admin)')
    .addTag('Transaksi Parkir', 'Operasional Transaksi Masuk, Keluar, dan Pembayaran (Petugas & Admin)')
    .addTag('Dashboard & Laporan', 'Dashboard Analitik & Rekap Pendapatan (Owner & Admin)')
    .addTag('Log Aktivitas', 'Audit Trail Aktivitas Sistem (Khusus Admin)')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Aplikasi berjalan di: http://localhost:${port}`);
  console.log(`📚 Swagger UI tersedia di: http://localhost:${port}/api/docs`);
}

void bootstrap();