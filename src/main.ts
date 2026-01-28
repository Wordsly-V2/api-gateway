import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const frontendBaseUrl = configService.get<string>('frontendBaseUrl');
  app.enableCors({
    origin: [frontendBaseUrl],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  });

  app.use(cookieParser());

  const appPort = configService.get<number>('port');
  await app.listen(appPort as number);
  console.log(`API Gateway is running on port ${appPort}`);
  console.log(`Frontend base URL: ${frontendBaseUrl}`);
}
bootstrap();
