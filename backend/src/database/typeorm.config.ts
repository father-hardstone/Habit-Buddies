import { ConfigService } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';
import { entities } from './entities';

export function createTypeOrmOptions(
  configService: ConfigService,
): DataSourceOptions {
  const databaseUrl = configService.get<string>('DATABASE_URL');

  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL is required. Configure Supabase Postgres in backend/.env',
    );
  }

  return {
    type: 'postgres',
    url: databaseUrl,
    ssl: { rejectUnauthorized: false },
    entities,
    synchronize: configService.get('NODE_ENV', 'development') !== 'production',
  };
}
