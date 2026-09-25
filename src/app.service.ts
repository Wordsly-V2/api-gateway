import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type ServiceHealth = {
    name: string;
    status: 'healthy' | 'unhealthy';
    message: string;
};

export type ServiceWake = {
    name: string;
    state: 'awake' | 'down';
    /** How long this service took to answer, in ms. */
    ms: number;
};

export type WakeResult = {
    /** True only when every service answered. */
    ready: boolean;
    services: ServiceWake[];
};

const SERVICES: { name: string; configKey: string }[] = [
    { name: 'Auth Service', configKey: 'authService.host' },
    { name: 'Vocabulary Service', configKey: 'vocabularyService.host' },
    { name: 'Learning Service', configKey: 'learningService.host' },
    { name: 'Curriculum Service', configKey: 'curriculumService.host' },
];

/**
 * How long a wake fan-out may run before answering with what it has.
 *
 * Deliberately shorter than the browser's own timeout on `/wake`: this gateway
 * may itself have been asleep when the request arrived, and the platform's boot
 * time is spent before a single line here runs. Leaving headroom means the
 * caller gets a real answer and can call again, rather than having its socket
 * time out mid-fan-out with nothing to show.
 */
const WAKE_BUDGET_MS = 45_000;
/** One attempt. Long enough for a cold boot, short enough to leave retries. */
const WAKE_ATTEMPT_TIMEOUT_MS = 20_000;
const WAKE_RETRY_DELAY_MS = 2_000;

const sleep = (ms: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Aggregated health of the services behind the gateway, plus the wake fan-out
 * the frontend's bootstrap uses to boot them.
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

    /**
     * The in-flight fan-out, shared by every concurrent caller.
     *
     * Several tabs opening at once — or one tab retrying — must not each start
     * their own storm of probes against a service that is already booting.
     */
    private wakeInFlight: Promise<WakeResult> | null = null;

    constructor(private readonly configService: ConfigService) {}

    async getHealth(): Promise<ServiceHealth[]> {
        return Promise.all(
            SERVICES.map(({ name, configKey }) =>
                this.probe(name, this.configService.get<string>(configKey)),
            ),
        );
    }

    /**
     * Boot every service and answer once they are up or the budget runs out.
     *
     * `/ping` cannot do this job: it probes `/ready` once with a five-second
     * abort, which on a suspended free-tier instance expires long before the
     * container has started — it reports "unreachable" for a service it has in
     * fact just woken, and never looks again. This retries until the service
     * actually answers, which is the difference between nudging a service awake
     * and knowing that it is.
     */
    wake(): Promise<WakeResult> {
        if (this.wakeInFlight) return this.wakeInFlight;

        const deadline = Date.now() + WAKE_BUDGET_MS;

        this.wakeInFlight = Promise.all(
            SERVICES.map(({ name, configKey }) =>
                this.wakeOne(
                    name,
                    this.configService.get<string>(configKey),
                    deadline,
                ),
            ),
        )
            .then((services) => ({
                ready: services.every((service) => service.state === 'awake'),
                services,
            }))
            .finally(() => {
                this.wakeInFlight = null;
            });

        return this.wakeInFlight;
    }

    /**
     * Fire-and-forget wake, for the proxy to call when a request fails in a way
     * that looks like a sleeping downstream. The learner's failed request is
     * already lost; this makes sure their retry lands on something that is at
     * least booting.
     */
    wakeInBackground(): void {
        void this.wake().catch(() => undefined);
    }

    private async wakeOne(
        name: string,
        host: string | undefined,
        deadline: number,
    ): Promise<ServiceWake> {
        const startedAt = Date.now();

        if (!host) return { name, state: 'down', ms: 0 };

        // `/health` rather than `/ready`: liveness answers without touching
        // Postgres, so a service whose pool is still connecting still counts as
        // awake — and waking the container is the whole point here. Readiness is
        // `/ping`'s question.
        const url = `${host}/health`;

        for (let attempt = 1; ; attempt++) {
            try {
                const response = await fetch(url, {
                    signal: AbortSignal.timeout(
                        // Never overrun the shared budget, even mid-attempt.
                        Math.min(
                            WAKE_ATTEMPT_TIMEOUT_MS,
                            Math.max(deadline - Date.now(), 1),
                        ),
                    ),
                });

                if (response.ok) {
                    const ms = Date.now() - startedAt;
                    if (attempt > 1) {
                        this.logger.log(`${name} woke after ${ms}ms`);
                    }
                    return { name, state: 'awake', ms };
                }
            } catch {
                // Expected while the instance boots — an abort, a refused
                // connection or a reset all mean "not up yet". The host it
                // failed to reach is internal, so nothing is returned about it.
            }

            if (Date.now() + WAKE_RETRY_DELAY_MS >= deadline) {
                this.logger.warn(
                    `${name} did not wake within ${WAKE_BUDGET_MS}ms`,
                );
                return { name, state: 'down', ms: Date.now() - startedAt };
            }

            await sleep(WAKE_RETRY_DELAY_MS);
        }
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
