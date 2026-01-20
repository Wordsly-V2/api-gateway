export default () => ({
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

    // avatar url for google oauth when user does not have a profile picture
    defaultAvatarUrl:
      process.env.GOOGLE_DEFAULT_AVATAR_URL ??
      'https://static.vecteezy.com/system/resources/previews/009/292/244/original/default-avatar-icon-of-social-media-user-vector.jpg',

    // frontend redirect url after google oauth login
    frontendRedirectUrl:
      process.env.FRONTEND_REDIRECT_URL ??
      'http://localhost:8000/auth/google/redirect',
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
});
