import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    const frontendBaseUrls = (
        configService.get<string>('frontendBaseUrls') ?? ''
    ).split(',');

    app.enableCors({
        origin: frontendBaseUrls,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
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
    console.log(`Frontend base URLs: ${frontendBaseUrls.join(', ')}`);
}
void bootstrap();
