export default () => ({
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: parseInt(process.env.PORT ?? '3000', 10) ?? 3000,
    authService: {
        host: process.env.AUTH_SERVICE_HOST ?? 'http://localhost:3001',
        internalToken: process.env.AUTH_SERVICE_INTERNAL_TOKEN,
        httpTimeout: process.env.AUTH_SERVICE_HTTP_TIMEOUT,
    },
    vocabularyService: {
        host: process.env.VOCABULARY_SERVICE_HOST ?? 'http://localhost:3002',
        internalToken: process.env.VOCABULARY_SERVICE_INTERNAL_TOKEN,
        httpTimeout: process.env.VOCABULARY_SERVICE_HTTP_TIMEOUT,
    },
    learningService: {
        host: process.env.LEARNING_SERVICE_HOST ?? 'http://localhost:3003',
        internalToken: process.env.LEARNING_SERVICE_INTERNAL_TOKEN,
        httpTimeout: process.env.LEARNING_SERVICE_HTTP_TIMEOUT,
    },
    googleOAuth: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,

        // web hook url for google oauth login
        redirectUri: process.env.GOOGLE_REDIRECT_URI,

        // frontend redirect url after google oauth login
        frontendRedirectUrl:
            process.env.GOOGLE_FRONTEND_REDIRECT_URL ??
            'http://localhost:4000/auth/redirect',
    },
    corsEnabledOrigins: process.env.CORS_ENABLED_ORIGINS,
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
    },
    kafka: {
        brokers: process.env.KAFKA_BROKERS ?? '',
        ca: process.env.KAFKA_CA ?? '',
        cert: process.env.KAFKA_CERT ?? '',
        key: process.env.KAFKA_KEY ?? '',
    },
    // How the refresh token is delivered to / read from the client:
    // - 'cookie' (default): stored in an http cookie (requires a correct domain/subdomain
    //   setup, otherwise the browser may block it cross-site).
    // - 'body': returned in the response body / redirect URL so the frontend can keep it in
    //   localStorage and send it back via the `x-refresh-token` header when refreshing.
    refreshTokenDelivery: (process.env.REFRESH_TOKEN_DELIVERY as
        | 'cookie'
        | 'body') ?? 'cookie',
    // For Render (API and frontend on different origins): set REFRESH_TOKEN_COOKIE_SAME_SITE=none
    // (secure is forced to true when sameSite is 'none').
    refreshTokenCookieOptions: {
        path: process.env.REFRESH_TOKEN_COOKIE_PATH ?? '/auth',
        httpOnly: process.env.REFRESH_TOKEN_COOKIE_HTTP_ONLY === 'true',
        secure: process.env.REFRESH_TOKEN_COOKIE_SECURE === 'true',
        maxAge: process.env.REFRESH_TOKEN_COOKIE_MAX_AGE ?? '30d',
        sameSite:
            (process.env.REFRESH_TOKEN_COOKIE_SAME_SITE as
                | 'lax'
                | 'strict'
                | 'none') ?? 'lax',
    },
});
