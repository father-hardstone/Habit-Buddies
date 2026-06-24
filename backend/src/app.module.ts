import { existsSync } from 'fs';
import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DataModule } from './data/data.module';
import { createTypeOrmOptions } from './database/typeorm.config';
import { InviteModule } from './invite/invite.module';
import { CallsModule } from './calls/calls.module';
import { RealtimeModule } from './realtime/realtime.module';
import { StorageModule } from './storage/storage.module';
import { UsersModule } from './users/users.module';

const backendEnvPath = [join(process.cwd(), '.env'), join(process.cwd(), 'backend', '.env')].find(
  (path) => existsSync(path),
);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: backendEnvPath,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        createTypeOrmOptions(configService),
    }),
    UsersModule,
    StorageModule,
    RealtimeModule,
    DataModule,
    CallsModule,
    AuthModule,
    AdminModule,
    InviteModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
