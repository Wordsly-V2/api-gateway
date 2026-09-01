import { Injectable } from '@nestjs/common';
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
            const response = await fetch(`${host}/health`, {
                // A health check must never be the thing that hangs.
                signal: AbortSignal.timeout(5_000),
            });

            if (!response.ok) {
                return {
                    name,
                    status: 'unhealthy',
                    message: `HTTP ${response.status}`,
                };
            }

            return { name, status: 'healthy', message: await response.text() };
        } catch (error) {
            return {
                name,
                status: 'unhealthy',
                message: `error: ${String(error)}`,
            };
        }
    }
}
