import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { INestApplication } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import { AppModule } from './app.module';

async function configureApp(app: NestExpressApplication) {
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const frontendUrl = configService.get<string>(
    'FRONTEND_URL',
    'http://localhost:3000',
  );
  const isProduction = process.env.NODE_ENV === 'production';

  app.enableCors({
    origin: isProduction
      ? [frontendUrl].filter(Boolean)
      : (origin, callback) => {
          if (
            !origin ||
            /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
          ) {
            callback(null, true);
            return;
          }

          callback(null, origin === frontendUrl);
        },
    credentials: true,
  });
}

let app: INestApplication | undefined;

async function initApp() {
  if (!app) {
    const nestApp = await NestFactory.create<NestExpressApplication>(AppModule);
    await configureApp(nestApp);
    await nestApp.init();
    app = nestApp;
  }

  return app;
}

async function bootstrap() {
  const nestApp = await initApp();
  const configService = nestApp.get(ConfigService);
  const port = Number(configService.get('PORT', 3001));

  await nestApp.listen(port);

  console.log(`API listening on http://localhost:${port}/api`);
}

export default async function vercelHandler(req: Request, res: Response) {
  const nestApp = await initApp();
  const handler = nestApp.getHttpAdapter().getInstance();
  return handler(req, res);
}

if (!process.env.VERCEL) {
  void bootstrap();
}
