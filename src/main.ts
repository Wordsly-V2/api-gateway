import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const appPort = configService.get<number>('port');

  await app.listen(appPort as number);
  console.log(`API Gateway is running on port ${appPort}`);
}
bootstrap();
