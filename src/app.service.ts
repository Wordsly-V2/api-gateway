import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type ServiceHealth = {
    name: string;
    status: 'healthy' | 'unhealthy';
    message: string;
};

const SERVICES: { name: string; configKey: string }[] = [
    { name: 'Auth Service', configKey: 'authService.host' },
    { name: 'Vocabulary Service', configKey: 'vocabularyService.host' },
    { name: 'Learning Service', configKey: 'learningService.host' },
];

/**
 * Aggregated health of the services behind the gateway.
 *
 * The documented exception to "the gateway proxies and nothing else": the
 * frontend's bootstrap reads it, and the alternative — letting the browser probe
 * each service directly — would mean exposing all three service ports publicly.
 *
 * Uses global fetch rather than an axios client so the gateway carries no HTTP
 * client, no downstream credentials, and no dependency on the deleted
 * http-clients module.
 */
@Injectable()
export class AppService {
    private readonly logger = new Logger(AppService.name);

    constructor(private readonly configService: ConfigService) {}

    async getHealth(): Promise<ServiceHealth[]> {
        return Promise.all(
            SERVICES.map(({ name, configKey }) =>
                this.probe(name, this.configService.get<string>(configKey)),
            ),
        );
    }

    private async probe(
        name: string,
        host: string | undefined,
    ): Promise<ServiceHealth> {
        if (!host) {
            return { name, status: 'unhealthy', message: 'no host configured' };
        }

        try {
            // `/ready`, not `/health`: the latter is a liveness endpoint that
            // answers without touching a dependency, so aggregating it reported
            // every service healthy with their databases down.
            const response = await fetch(`${host}/ready`, {
                // A health check must never be the thing that hangs.
                signal: AbortSignal.timeout(5_000),
            });

            // Deliberately does not forward the downstream body. `/ready`
            // answers with the reason it is not ready — which names hosts,
            // ports and driver errors — and this endpoint is reachable from a
            // browser. The status is what a caller needs; the detail belongs in
            // the service's own logs.
            if (!response.ok) {
                return {
                    name,
                    status: 'unhealthy',
                    message: `HTTP ${response.status}`,
                };
            }

            return { name, status: 'healthy', message: 'ready' };
        } catch {
            // Same reasoning: the error names the internal host it failed to
            // reach, so it is logged rather than returned.
            this.logger.warn(`${name} readiness probe failed`);
            return {
                name,
                status: 'unhealthy',
                message: 'unreachable',
            };
        }
    }
}
