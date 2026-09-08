import prisma from './prisma';
import { execSync } from 'child_process';
import path from 'path';

export async function initDatabase() {
  try {
    // Check if database tables exist by counting users
    await prisma.user.count();
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
