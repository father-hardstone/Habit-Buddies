import { ConfigService } from '@nestjs/config';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { entities } from './entities';

export function createTypeOrmOptions(
  configService: ConfigService,
): TypeOrmModuleOptions {
  const databaseUrl = configService.get<string>('DATABASE_URL');

  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL is required. Configure Supabase Postgres in backend/.env',
    );
  }

  const isProduction = configService.get('NODE_ENV') === 'production';

  return {
    type: 'postgres',
    url: databaseUrl,
    ssl: { rejectUnauthorized: false },
    entities,
    synchronize: !isProduction,
    logging: !isProduction,
    // Fail fast on serverless so bad credentials don't burn the function
    // timeout or trip Supabase's auth circuit breaker with repeated retries.
    retryAttempts: isProduction ? 1 : 10,
    retryDelay: 1000,
  };
}
