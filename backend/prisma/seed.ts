
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const username = 'admin';
    const password = process.env.ADMIN_INITIAL_PASSWORD;

    if (!password || password.length < 12) {
        throw new Error(
            'ADMIN_INITIAL_PASSWORD wajib diisi dan minimal 12 karakter.',
        );
    }

    const existingAdmin = await prisma.user.findUnique({
        where: { username },
    });

    if (existingAdmin) {
        console.log('Admin sudah tersedia. Tidak ada perubahan.');
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.create({
        data: {
            nama_lengkap: 'Administrator Parkir',
            username,
            password: hashedPassword,
            role: Role.admin,
            status_aktif: true,
        },
    });

    console.log('Seeder admin berhasil.');
    console.log('Username: admin');
}

main()
    .catch((error) => {
        console.error('Seeder admin gagal:', error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
