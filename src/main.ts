import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { buildCorsOptions, parseCorsOrigins } from '@/config/cors';
import { requestIdMiddleware } from '@/common/request-id.middleware';
import { registerEdgeProtection } from '@/proxy/edge-protection';
import { registerProxyRoutes } from '@/proxy/proxy.middleware';
import helmet from 'helmet';
import { Logger } from '@nestjs/common';
import { RequestContextLogger } from '@/common/request-context-logger';

const bootLogger = new Logger('Bootstrap');

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        // No body parsing anywhere in this process. The gateway streams request
        // bodies straight through; parsing them here would consume the stream,
        // break uploads, and force every payload to be re-serialised for no
        // reason — it never looks inside a body.
        bodyParser: false,
    });

    app.useLogger(app.get(RequestContextLogger));
    // Baseline security headers (HSTS, nosniff, frameguard, referrer policy).
    app.use(helmet());

    const configService = app.get(ConfigService);

    // CORS is answered once, at the edge, before anything is forwarded — which
    // is also why the proxy strips any Access-Control-* a service sends back.
    const corsEnabledOrigins = configService.get<string>('corsEnabledOrigins');
    app.enableCors(buildCorsOptions(corsEnabledOrigins));

    const expressApp = app.getHttpAdapter().getInstance();

    // Must precede the rate limiter: it keys on req.ip, which is the balancer's
    // address until Express is told how many proxies sit in front.
    const trustProxyHops = configService.get<number>('trustProxyHops') ?? 0;
    if (trustProxyHops > 0) {
        expressApp.set('trust proxy', trustProxyHops);
    }

    // Ahead of everything else so a rate-limit rejection and a proxy error
    // carry the same id the downstream service would have logged.
    expressApp.use(requestIdMiddleware);

    // Before the proxy: a proxied request is answered by Express middleware and
    // never reaches Nest's router, so anything that must apply to forwarded
    // traffic has to be mounted ahead of it.
    registerEdgeProtection(expressApp);

    registerProxyRoutes(expressApp, configService);

    const appPort = configService.get<number>('port');
    await app.listen(appPort as number);
    bootLogger.log(`API Gateway is running on port ${appPort}`);
    bootLogger.log(
        `CORS enabled origins: ${parseCorsOrigins(corsEnabledOrigins).join(', ')}`,
    );
}
void bootstrap();
