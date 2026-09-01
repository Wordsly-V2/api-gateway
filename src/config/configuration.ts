// Without a timeout a hung downstream service blocks a request forever.
const parseHttpTimeout = (value: string | undefined): number =>
    parseInt(value ?? '', 10) || 15000;

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
    port: parseInt(process.env.PORT ?? '3000', 10) ?? 3000,
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
    corsEnabledOrigins: process.env.CORS_ENABLED_ORIGINS,
});
