import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    const corsEnabledOrigins = (
        configService.get<string>('corsEnabledOrigins') ?? ''
    ).split(',');

    app.enableCors({
        origin: corsEnabledOrigins,
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
    console.log(`CORS enabled origins: ${corsEnabledOrigins.join(', ')}`);

    const maxAge = configService.get<string>(
        'refreshTokenCookieOptions.maxAge',
    );
    const isSecure = configService.get<boolean>(
        'refreshTokenCookieOptions.secure',
    );
    const sameSite = configService.get<string>(
        'refreshTokenCookieOptions.sameSite',
    );
    const httpOnly = configService.get<boolean>(
        'refreshTokenCookieOptions.httpOnly',
    );
    const path = configService.get<string>('refreshTokenCookieOptions.path');

    console.log('refresh token options', {
        maxAge,
        isSecure,
        sameSite,
        httpOnly,
        path,
    });
}
void bootstrap();
