// Without a timeout a hung downstream service blocks a request forever.
//
// The default has to clear a cold start, not just a healthy round trip. On a
// suspended free-tier instance the platform holds the connection while the
// container boots, which routinely takes 30-60s; at the old 15s default every
// request during that window was cut off as a 504, so the first page load after
// an idle period reliably came up empty. A hung service is still bounded, just
// generously enough that booting is not mistaken for hanging.
const parseHttpTimeout = (value: string | undefined): number =>
    parseInt(value ?? '', 10) || 60000;

/**
 * The gateway needs to know only where to send traffic.
 *
 * It deliberately holds no JWT key, no Google client secret and no internal
 * service token: it neither verifies tokens (each service does that against
 * auth-service's published key set) nor authenticates to its peers (it forwards
 * the caller's own credentials and strips any internal header it is handed).
 */
export default () => ({
    nodeEnv: process.env.NODE_ENV ?? 'development',
    // Hops between this gateway and the client. Behind a platform load balancer
    // every request otherwise carries the balancer's IP, which would make the
    // edge rate limiter throttle the entire user base as a single caller.
    trustProxyHops: parseInt(process.env.TRUST_PROXY_HOPS ?? '0', 10) || 0,
    // `||`, not `??`: parseInt yields NaN (never null) for a bad value.
    port: parseInt(process.env.PORT ?? '3000', 10) || 3000,
    authService: {
        host: process.env.AUTH_SERVICE_HOST ?? 'http://localhost:3001',
        httpTimeout: parseHttpTimeout(process.env.AUTH_SERVICE_HTTP_TIMEOUT),
    },
    vocabularyService: {
        host: process.env.VOCABULARY_SERVICE_HOST ?? 'http://localhost:3002',
        httpTimeout: parseHttpTimeout(
            process.env.VOCABULARY_SERVICE_HTTP_TIMEOUT,
        ),
    },
    learningService: {
        host: process.env.LEARNING_SERVICE_HOST ?? 'http://localhost:3003',
        httpTimeout: parseHttpTimeout(
            process.env.LEARNING_SERVICE_HTTP_TIMEOUT,
        ),
    },
    curriculumService: {
        host: process.env.CURRICULUM_SERVICE_HOST ?? 'http://localhost:3004',
        httpTimeout: parseHttpTimeout(
            process.env.CURRICULUM_SERVICE_HTTP_TIMEOUT,
        ),
    },
    corsEnabledOrigins: process.env.CORS_ENABLED_ORIGINS,
});
