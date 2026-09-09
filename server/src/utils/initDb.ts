import prisma from './prisma';
import { execSync } from 'child_process';
import path from 'path';

export async function initDatabase() {
  try {
    // Check if database tables exist by counting users
    await prisma.user.count();

    // Ensure Ketan exists so the user can search for him!
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('password123', 10);
    await prisma.user.upsert({
      where: { email: 'ketan@shield.com' },
      update: {},
      create: {
        name: 'Ketan Gehlot',
        email: 'ketan@shield.com',
        phone: '9999999999',
        passwordHash: hashedPassword,
        avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=ketan'
      }
    });

    // Ensure Peter exists!
    await prisma.user.upsert({
      where: { email: 'peter@shield.com' },
      update: {},
      create: {
        name: 'Peter Parker',
        email: 'peter@shield.com',
        phone: '8888888888',
        passwordHash: hashedPassword,
        avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=peter'
      }
    });

  } catch (error) {
    console.log('📦 Database not initialized or tables missing. Running database setup...');
    try {
      if (!process.env.VERCEL) {
        const serverDir = path.resolve(__dirname, '../..');
        execSync('npx prisma db push --accept-data-loss', { cwd: serverDir, stdio: 'inherit' });
        console.log('🌱 Seeding database with initial love notes, demo users, and draws...');
        execSync('npx ts-node src/seed/seed.ts', { cwd: serverDir, stdio: 'inherit' });
        console.log('✅ Auto database setup & seed completed!');
      } else {
        console.log('⚠️ Skipping auto database setup on Vercel. SQLite is read-only and ephemeral here.');
      }
    } catch (cmdErr) {
      console.error('⚠️ Auto database setup warning:', cmdErr);
    }
  }
}
