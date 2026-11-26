import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Menjalankan Seeder Parkir-Bozz...');

    // 1. SEED AKUN ADMIN
    const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'obatkuat1234';
    const existingAdmin = await prisma.user.findUnique({
        where: { username: 'admin' },
    });

    if (!existingAdmin) {
        const hashedAdminPassword = await bcrypt.hash(adminPassword, 12);
        await prisma.user.create({
            data: {
                nama_lengkap: 'Administrator Parkir',
                username: 'admin',
                password: hashedAdminPassword,
                role: Role.admin,
                status_aktif: true,
            },
        });
        console.log('✅ Admin berhasil dibuat: admin / ' + adminPassword);
    } else {
        console.log('ℹ️ Admin sudah tersedia.');
    }

    // 2. SEED AKUN PETUGAS (Gate & Kasir)
    const petugasPassword = 'PasswordPetugas123';
    const existingPetugas = await prisma.user.findUnique({
        where: { username: 'petugas01' },
    });

    if (!existingPetugas) {
        const hashedPetugasPassword = await bcrypt.hash(petugasPassword, 12);
        await prisma.user.create({
            data: {
                nama_lengkap: 'Petugas Gerbang 01',
                username: 'petugas01',
                password: hashedPetugasPassword,
                role: Role.petugas,
                status_aktif: true,
            },
        });
        console.log('✅ Petugas berhasil dibuat: petugas01 / ' + petugasPassword);
    } else {
        console.log('ℹ️ Petugas 01 sudah tersedia.');
    }

    // 2b. SEED AKUN OWNER (Pemilik Usaha)
    const ownerPassword = 'PasswordOwner123';
    const existingOwner = await prisma.user.findUnique({
        where: { username: 'owner' },
    });

    if (!existingOwner) {
        const hashedOwnerPassword = await bcrypt.hash(ownerPassword, 12);
        await prisma.user.create({
            data: {
                nama_lengkap: 'Owner Parkir-Bozz',
                username: 'owner',
                password: hashedOwnerPassword,
                role: Role.owner,
                status_aktif: true,
            },
        });
        console.log('✅ Owner berhasil dibuat: owner / ' + ownerPassword);
    } else {
        console.log('ℹ️ Owner sudah tersedia.');
    }

    // 3. SEED JENIS KENDARAAN & TARIF AWAL
    const motor = await prisma.jenisKendaraan.upsert({
        where: { nama_jenis: 'Motor' },
        update: {},
        create: { nama_jenis: 'Motor' },
    });

    const mobil = await prisma.jenisKendaraan.upsert({
        where: { nama_jenis: 'Mobil' },
        update: {},
        create: { nama_jenis: 'Mobil' },
    });

    await prisma.tarif.upsert({
        where: { id_jenis: motor.id_jenis },
        update: { tarif_per_jam: 2000 },
        create: { id_jenis: motor.id_jenis, tarif_per_jam: 2000 },
    });

    await prisma.tarif.upsert({
        where: { id_jenis: mobil.id_jenis },
        update: { tarif_per_jam: 5000 },
        create: { id_jenis: mobil.id_jenis, tarif_per_jam: 5000 },
    });
    console.log('✅ Jenis Kendaraan & Tarif awal berhasil disinkronkan.');

    // 4. SEED AREA PARKIR AWAL
    const areaMotor = await prisma.areaParkir.findFirst({
        where: { nama_area: 'Area Motor Gedung A' },
    });
    if (!areaMotor) {
        await prisma.areaParkir.create({
            data: {
                nama_area: 'Area Motor Gedung A',
                kapasitas: 50,
                terisi: 0,
                status_aktif: true,
            },
        });
    }

    const areaMobil = await prisma.areaParkir.findFirst({
        where: { nama_area: 'Area Mobil Gedung B' },
    });
    if (!areaMobil) {
        await prisma.areaParkir.create({
            data: {
                nama_area: 'Area Mobil Gedung B',
                kapasitas: 30,
                terisi: 0,
                status_aktif: true,
            },
        });
    }
    console.log('✅ Area Parkir awal berhasil disinkronkan.');

    console.log('🎉 Seeder selesai dengan sukses!');
}

main()
    .catch((error) => {
        console.error('❌ Seeder gagal:', error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
