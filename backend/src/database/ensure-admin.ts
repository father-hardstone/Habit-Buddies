import 'reflect-metadata';
import { existsSync } from 'fs';
import { join } from 'path';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { UserRole } from '../common/enums/user-role.enum';
import { User } from '../users/user.entity';
import { entities } from './entities';

const backendEnvPath = [
  join(process.cwd(), 'backend', '.env'),
  join(process.cwd(), '.env'),
  join(__dirname, '../../.env'),
].find((path) => existsSync(path));

if (backendEnvPath) {
  config({ path: backendEnvPath });
}

async function ensureAdmin() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }

  const adminEmail = (process.env.ADMIN_EMAIL ?? 'admin@habitbuddies.com').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Password';

  const dataSource = new DataSource({
    type: 'postgres',
    url: databaseUrl,
    ssl: { rejectUnauthorized: false },
    entities,
    synchronize: false,
  });

  await dataSource.initialize();

  const userRepo = dataSource.getRepository(User);

  const existingAdmins = await userRepo.find({
    where: { role: UserRole.ADMIN },
  });

  const adminByEmail = await userRepo.findOne({ where: { email: adminEmail } });

  if (adminByEmail) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    const updates: Partial<User> = { passwordHash };

    if (adminByEmail.role !== UserRole.ADMIN) {
      updates.role = UserRole.ADMIN;
    }

    await userRepo.save({ ...adminByEmail, ...updates });
    console.log(`Admin ready: ${adminEmail} (password synced from ADMIN_PASSWORD)`);
    await dataSource.destroy();
    return;
  }

  if (existingAdmins.length > 0) {
    console.log(
      `Admin account(s) already exist: ${existingAdmins.map((user) => user.email).join(', ')}`,
    );
    await dataSource.destroy();
    return;
  }

  await userRepo.save(
    userRepo.create({
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      name: 'Admin',
      avatarUrl: null,
      role: UserRole.ADMIN,
    }),
  );

  console.log(`Created admin user: ${adminEmail}`);
  await dataSource.destroy();
}

ensureAdmin().catch((error) => {
  console.error(error);
  process.exit(1);
});
