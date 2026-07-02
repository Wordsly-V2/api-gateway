import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { buildCorsOptions, parseCorsOrigins } from '@/config/cors';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    const corsEnabledOrigins = configService.get<string>('corsEnabledOrigins');

    const corsOptions = buildCorsOptions(corsEnabledOrigins);
    if (corsOptions) {
        app.enableCors(corsOptions);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    app.use(cookieParser());

    app.use(compression());
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
        }),
    );

    const appPort = configService.get<number>('port');
    await app.listen(appPort as number);
    console.log(`API Gateway is running on port ${appPort}`);
    console.log(
        `CORS enabled origins: ${parseCorsOrigins(corsEnabledOrigins).join(', ') || 'none'}`,
    );
}
void bootstrap();
