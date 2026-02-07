export default () => ({
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: parseInt(process.env.PORT ?? '3000', 10) ?? 3000,
    authService: {
        host: process.env.AUTH_SERVICE_HOST ?? 'http://localhost:3001',
        internalToken: process.env.AUTH_SERVICE_INTERNAL_TOKEN ?? '1234567890',
        httpTimeout: process.env.AUTH_SERVICE_HTTP_TIMEOUT,
    },
    vocabularyService: {
        host: process.env.VOCABULARY_SERVICE_HOST ?? 'http://localhost:3002',
        internalToken:
            process.env.VOCABULARY_SERVICE_INTERNAL_TOKEN ?? '1234567890',
        httpTimeout: process.env.VOCABULARY_SERVICE_HTTP_TIMEOUT,
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
    frontendBaseUrls: process.env.FRONTEND_BASE_URLS ?? 'http://localhost:4000',
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
        refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN ?? '30d',
    },
});
