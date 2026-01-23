export default () => ({
  env: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10) ?? 3000,
  authService: {
    host: process.env.AUTH_SERVICE_HOST ?? 'auth-service',
    port: parseInt(process.env.AUTH_SERVICE_TCP_PORT ?? '3002', 10) ?? 3002,
  },
  googleOAuth: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,

    // web hook url for google oauth login
    redirectUri: process.env.GOOGLE_REDIRECT_URI,

    // frontend redirect url after google oauth login
    frontendRedirectUrl:
      process.env.FRONTEND_REDIRECT_URL ??
      'http://localhost:4000/auth/redirect',
  },
  frontendBaseUrl: process.env.FRONTEND_BASE_URL ?? 'http://localhost:4000',
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
});
