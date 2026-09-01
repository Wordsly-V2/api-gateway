/**
 * Fail-fast validation of required environment variables at boot.
 * Wired into ConfigModule.forRoot({ validate }). Throwing here aborts startup
 * instead of letting the service run with missing/insecure defaults.
 */
const REQUIRED_ENV_VARS = [
    // Required, not optional: an empty value used to make buildCorsOptions
    // return undefined and enableCors be skipped entirely, so a misconfiguration
    // silently disabled CORS instead of failing.
    'CORS_ENABLED_ORIGINS',
    'AUTH_SERVICE_HOST',
    'VOCABULARY_SERVICE_HOST',
    'LEARNING_SERVICE_HOST',
] as const;

export function validateEnv(
    config: Record<string, unknown>,
): Record<string, unknown> {
    const missing = REQUIRED_ENV_VARS.filter(
        (key) => !config[key] || String(config[key] ?? '').trim() === '',
    );

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(', ')}`,
        );
    }

    return config;
}
