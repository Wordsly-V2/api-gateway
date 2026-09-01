import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import configuration from '@/config/configuration';
import { validateEnv } from '@/config/validate-env';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

/**
 * The gateway is a reverse proxy, not an API.
 *
 * It used to be a hand-wired facade: every downstream endpoint had a matching
 * controller, service and typed axios call here, so adding a service endpoint
 * meant adding a gateway endpoint too. Routing now lives in one declarative
 * table (`src/proxy/routes.ts`) and is applied as Express middleware in
 * `main.ts`, before Nest sees the request.
 *
 * The only route this process still answers itself is the health check, which
 * is operational rather than business logic and is what the frontend's
 * bootstrap depends on.
 */
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [configuration],
            validate: validateEnv,
        }),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
