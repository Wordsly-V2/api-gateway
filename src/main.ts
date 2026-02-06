import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

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
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
        }),
    );

    const appPort = configService.get<number>('port');
    await app.listen(appPort as number);
    console.log(`API Gateway is running on port ${appPort}`);
    console.log(`Frontend base URL: ${frontendBaseUrl}`);
}
void bootstrap();
