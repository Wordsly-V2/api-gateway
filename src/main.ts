import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { buildCorsOptions, parseCorsOrigins } from '@/config/cors';
import { registerProxyRoutes } from '@/proxy/proxy.middleware';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        // No body parsing anywhere in this process. The gateway streams request
        // bodies straight through; parsing them here would consume the stream,
        // break uploads, and force every payload to be re-serialised for no
        // reason — it never looks inside a body.
        bodyParser: false,
    });
    const configService = app.get(ConfigService);

    // CORS is answered once, at the edge, before anything is forwarded — which
    // is also why the proxy strips any Access-Control-* a service sends back.
    const corsEnabledOrigins = configService.get<string>('corsEnabledOrigins');
    app.enableCors(buildCorsOptions(corsEnabledOrigins));

    registerProxyRoutes(app.getHttpAdapter().getInstance(), configService);

    const appPort = configService.get<number>('port');
    await app.listen(appPort as number);
    console.log(`API Gateway is running on port ${appPort}`);
    console.log(
        `CORS enabled origins: ${parseCorsOrigins(corsEnabledOrigins).join(', ')}`,
    );
}
void bootstrap();
