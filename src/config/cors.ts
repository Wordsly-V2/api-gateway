import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export function parseCorsOrigins(raw: string | undefined): string[] {
    return (raw ?? '')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);
}

/**
 * Always returns options — never undefined.
 *
 * It used to return undefined for an empty origin list, and the caller then
 * skipped enableCors altogether, so a blank CORS_ENABLED_ORIGINS silently
 * disabled CORS rather than locking it down. The variable is now required at
 * boot, and an empty list here means "allow nothing cross-origin", which is the
 * safe reading.
 */
export function buildCorsOptions(
    corsEnabledOrigins: string | undefined,
): CorsOptions {
    const allowedOrigins = parseCorsOrigins(corsEnabledOrigins);

    return {
        origin: (origin, callback) => {
            if (!origin) {
                callback(null, true);
                return;
            }

            if (allowedOrigins.includes(origin)) {
                callback(null, origin);
                return;
            }

            // Answer without CORS headers rather than with an error: an Error
            // here went to Express's default handler as a 500 (with a stack
            // trace outside production). The browser blocks the response either
            // way; this just stops a foreign origin looking like our outage.
            callback(null, false);
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'Cookie',
            'x-refresh-token',
        ],
        // Headers the frontend must be able to read: Retry-After and the
        // RateLimit pair drive its backoff, x-request-id ties a failure report
        // to server logs.
        exposedHeaders: [
            'Retry-After',
            'RateLimit',
            'RateLimit-Policy',
            'x-request-id',
        ],
        // Cache preflights for 10 minutes. Every request carries Authorization,
        // so without this each one costs an extra round trip — painful on slow
        // mobile links and doubled during a cold start.
        maxAge: 600,
    };
}
